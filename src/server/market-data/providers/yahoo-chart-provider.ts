import { MarketDataError } from "../errors";
import type { HistoricalBar, MarketDataProvider, MarketDataRange, MarketInstrument, MarketQuote } from "../types";

const YAHOO_CHART_BASE_URL = "https://query1.finance.yahoo.com/v8/finance/chart";

type YahooChartResult = {
  meta?: {
    regularMarketPrice?: number;
    previousClose?: number;
    chartPreviousClose?: number;
    currency?: string;
    regularMarketTime?: number;
  };
  timestamp?: number[];
  indicators?: {
    quote?: Array<{ close?: Array<number | null> }>;
  };
};

type YahooChartResponse = {
  chart?: {
    result?: YahooChartResult[];
    error?: { description?: string } | null;
  };
};

export class YahooChartProvider implements MarketDataProvider {
  readonly name = "yahoo_chart" as const;

  supports(instrument: MarketInstrument): boolean {
    return Boolean(instrument.providerSymbols.yahoo_chart);
  }

  async getQuote(instrument: MarketInstrument, signal?: AbortSignal): Promise<MarketQuote> {
    const result = await this.fetchChart(instrument, "5d", signal);
    const meta = result.meta;
    const price = meta?.regularMarketPrice ?? getLastClose(result);
    const previousClose = meta?.previousClose ?? meta?.chartPreviousClose ?? getPreviousClose(result);

    if (!Number.isFinite(price) || !Number.isFinite(previousClose)) {
      throw new MarketDataError(`Yahoo chart response did not include usable quote data for ${instrument.symbol}.`, this.name);
    }

    return {
      instrumentId: instrument.id,
      symbol: instrument.symbol,
      provider: this.name,
      price,
      previousClose,
      currency: "INR",
      asOf: meta?.regularMarketTime ? new Date(meta.regularMarketTime * 1000) : new Date(),
      isFallback: false,
    };
  }

  async getHistory(instrument: MarketInstrument, range: MarketDataRange, signal?: AbortSignal): Promise<HistoricalBar[]> {
    const result = await this.fetchChart(instrument, range, signal);
    const timestamps = result.timestamp ?? [];
    const closes = result.indicators?.quote?.[0]?.close ?? [];

    return timestamps
      .map((timestamp, index) => ({
        date: new Date(timestamp * 1000).toISOString().slice(0, 10),
        close: closes[index],
      }))
      .filter((bar): bar is HistoricalBar => Number.isFinite(bar.close));
  }

  private async fetchChart(instrument: MarketInstrument, range: MarketDataRange | "5d", signal?: AbortSignal) {
    const providerSymbol = instrument.providerSymbols.yahoo_chart;
    if (!providerSymbol) {
      throw new MarketDataError(`Yahoo chart symbol is not configured for ${instrument.symbol}.`, this.name, false);
    }

    const url = new URL(`${YAHOO_CHART_BASE_URL}/${encodeURIComponent(providerSymbol)}`);
    url.searchParams.set("range", range);
    url.searchParams.set("interval", "1d");
    url.searchParams.set("includePrePost", "false");

    const response = await fetch(url, {
      signal,
      headers: {
        Accept: "application/json",
        "User-Agent": "SipTheDip/0.1 market-data-service",
      },
    });

    if (!response.ok) {
      throw new MarketDataError(`Yahoo chart request failed for ${instrument.symbol} with HTTP ${response.status}.`, this.name);
    }

    const payload = (await response.json()) as YahooChartResponse;
    const result = payload.chart?.result?.[0];
    if (!result || payload.chart?.error) {
      throw new MarketDataError(payload.chart?.error?.description ?? `Yahoo chart returned no data for ${instrument.symbol}.`, this.name);
    }

    return result;
  }
}

function getLastClose(result: YahooChartResult): number {
  const closes = result.indicators?.quote?.[0]?.close?.filter((close: number | null): close is number => Number.isFinite(close)) ?? [];
  return closes.at(-1) ?? Number.NaN;
}

function getPreviousClose(result: YahooChartResult): number {
  const closes = result.indicators?.quote?.[0]?.close?.filter((close: number | null): close is number => Number.isFinite(close)) ?? [];
  return closes.at(-2) ?? Number.NaN;
}
