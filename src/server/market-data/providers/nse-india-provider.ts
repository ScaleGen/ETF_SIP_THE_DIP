import { MarketDataError } from "../errors";
import type { HistoricalBar, MarketDataProvider, MarketDataRange, MarketInstrument, MarketQuote } from "../types";

const NSE_BASE_URL = "https://www.nseindia.com";

type NseQuotePayload = {
  priceInfo?: {
    lastPrice?: number;
    previousClose?: number;
  };
  metadata?: {
    lastUpdateTime?: string;
  };
};

type NseIndexPayload = {
  data?: Array<{
    index?: string;
    last?: number;
    previousClose?: number;
    lastPrice?: number;
  }>;
  timestamp?: string;
};

export class NseIndiaProvider implements MarketDataProvider {
  readonly name = "nse_india" as const;

  supports(instrument: MarketInstrument): boolean {
    return Boolean(instrument.providerSymbols.nse_india);
  }

  async getQuote(instrument: MarketInstrument, signal?: AbortSignal): Promise<MarketQuote> {
    const payload = instrument.assetType === "indian_index" ? await this.fetchIndexQuote(instrument, signal) : await this.fetchEtfQuote(instrument, signal);

    return {
      instrumentId: instrument.id,
      symbol: instrument.symbol,
      provider: this.name,
      price: payload.price,
      previousClose: payload.previousClose,
      currency: "INR",
      asOf: payload.asOf,
      isFallback: false,
    };
  }

  async getHistory(_instrument: MarketInstrument, _range: MarketDataRange): Promise<HistoricalBar[]> {
    throw new MarketDataError("NSE historical downloads should be consumed by a scheduled EOD job from official archives; use quote endpoint or another historical provider for on-demand history.", this.name, false);
  }

  private async fetchEtfQuote(instrument: MarketInstrument, signal?: AbortSignal) {
    const symbol = instrument.providerSymbols.nse_india;
    if (!symbol) {
      throw new MarketDataError(`NSE symbol is not configured for ${instrument.symbol}.`, this.name, false);
    }

    const url = `${NSE_BASE_URL}/api/quote-equity?symbol=${encodeURIComponent(symbol)}`;
    const payload = (await this.fetchJson(url, signal)) as NseQuotePayload;
    const price = payload.priceInfo?.lastPrice;
    const previousClose = payload.priceInfo?.previousClose;

    if (!Number.isFinite(price) || !Number.isFinite(previousClose)) {
      throw new MarketDataError(`NSE quote response did not include usable ETF data for ${instrument.symbol}.`, this.name);
    }

    return {
      price: price as number,
      previousClose: previousClose as number,
      asOf: payload.metadata?.lastUpdateTime ? new Date(payload.metadata.lastUpdateTime) : new Date(),
    };
  }

  private async fetchIndexQuote(instrument: MarketInstrument, signal?: AbortSignal) {
    const symbol = instrument.providerSymbols.nse_india;
    if (!symbol) {
      throw new MarketDataError(`NSE index symbol is not configured for ${instrument.symbol}.`, this.name, false);
    }

    const url = `${NSE_BASE_URL}/api/equity-stockIndices?index=${encodeURIComponent(symbol)}`;
    const payload = (await this.fetchJson(url, signal)) as NseIndexPayload;
    const row = payload.data?.find((item) => item.index?.toUpperCase() === symbol.toUpperCase()) ?? payload.data?.[0];
    const price = row?.last ?? row?.lastPrice;
    const previousClose = row?.previousClose;

    if (!Number.isFinite(price) || !Number.isFinite(previousClose)) {
      throw new MarketDataError(`NSE quote response did not include usable index data for ${instrument.symbol}.`, this.name);
    }

    return {
      price: price as number,
      previousClose: previousClose as number,
      asOf: payload.timestamp ? new Date(payload.timestamp) : new Date(),
    };
  }

  private async fetchJson(url: string, signal?: AbortSignal): Promise<unknown> {
    const response = await fetch(url, {
      signal,
      headers: {
        Accept: "application/json,text/plain,*/*",
        Referer: `${NSE_BASE_URL}/`,
        "User-Agent": "SipTheDip/0.1 market-data-service",
      },
    });

    if (!response.ok) {
      throw new MarketDataError(`NSE request failed with HTTP ${response.status}.`, this.name);
    }

    return response.json();
  }
}
