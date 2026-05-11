import { MarketDataCache } from "./cache";
import { MarketDataError } from "./errors";
import { findIndianInstrument } from "./instruments";
import { TokenBucketRateLimiter } from "./rate-limiter";
import { MockFallbackProvider } from "./providers/mock-fallback-provider";
import { NseIndiaProvider } from "./providers/nse-india-provider";
import { YahooChartProvider } from "./providers/yahoo-chart-provider";
import type { HistoricalBar, MarketDataProvider, MarketDataRange, MarketDataServiceOptions, MarketQuote } from "./types";

const DEFAULT_CACHE_TTL_MS = 60_000;
const DEFAULT_STALE_TTL_MS = 60 * 60_000;
const DEFAULT_TIMEOUT_MS = 8_000;

export class MarketDataService {
  private readonly cache = new MarketDataCache();
  private readonly providers: MarketDataProvider[];
  private readonly cacheTtlMs: number;
  private readonly staleTtlMs: number;
  private readonly requestTimeoutMs: number;
  private readonly limiters = new Map<string, TokenBucketRateLimiter>();

  constructor(options: MarketDataServiceOptions = {}) {
    this.providers = options.providers ?? [new YahooChartProvider(), new NseIndiaProvider(), new MockFallbackProvider()];
    this.cacheTtlMs = options.cacheTtlMs ?? DEFAULT_CACHE_TTL_MS;
    this.staleTtlMs = options.staleTtlMs ?? DEFAULT_STALE_TTL_MS;
    this.requestTimeoutMs = options.requestTimeoutMs ?? DEFAULT_TIMEOUT_MS;
  }

  async getQuote(symbolOrId: string): Promise<MarketQuote> {
    const instrument = findIndianInstrument(symbolOrId);
    if (!instrument) {
      throw new MarketDataError(`Unsupported Indian ETF/index symbol: ${symbolOrId}.`, undefined, false);
    }

    const cacheKey = `quote:${instrument.id}`;
    const cached = this.cache.get<MarketQuote>(cacheKey);
    if (cached) {
      return cached;
    }

    const providers = this.providers.filter((provider) => provider.supports(instrument));
    const errors: Error[] = [];

    for (const provider of providers) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), this.requestTimeoutMs);

      try {
        this.getLimiter(provider.name).consume();
        const quote = await provider.getQuote(instrument, controller.signal);
        this.cache.set(cacheKey, quote, this.cacheTtlMs);
        return quote;
      } catch (error) {
        errors.push(error instanceof Error ? error : new Error("Unknown market data error."));
        const stale = this.cache.getStale<MarketQuote>(cacheKey, this.staleTtlMs);
        if (stale) {
          return { ...stale, isFallback: true };
        }
      } finally {
        clearTimeout(timeout);
      }
    }

    throw new MarketDataError(`All market data providers failed for ${instrument.symbol}: ${errors.map((error) => error.message).join(" | ")}`);
  }

  async getQuotes(symbolsOrIds: string[]): Promise<MarketQuote[]> {
    return Promise.all(symbolsOrIds.map((symbol) => this.getQuote(symbol)));
  }

  async getHistory(symbolOrId: string, range: MarketDataRange = "1y"): Promise<HistoricalBar[]> {
    const instrument = findIndianInstrument(symbolOrId);
    if (!instrument) {
      throw new MarketDataError(`Unsupported Indian ETF/index symbol: ${symbolOrId}.`, undefined, false);
    }

    const cacheKey = `history:${instrument.id}:${range}`;
    const cached = this.cache.get<HistoricalBar[]>(cacheKey);
    if (cached) {
      return cached;
    }

    const providers = this.providers.filter((provider) => provider.supports(instrument));
    const errors: Error[] = [];

    for (const provider of providers) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), this.requestTimeoutMs);

      try {
        this.getLimiter(provider.name).consume();
        const history = await provider.getHistory(instrument, range, controller.signal);
        if (history.length === 0) {
          throw new MarketDataError(`${provider.name} returned empty history for ${instrument.symbol}.`, provider.name);
        }
        this.cache.set(cacheKey, history, this.cacheTtlMs * 10);
        return history;
      } catch (error) {
        errors.push(error instanceof Error ? error : new Error("Unknown market data error."));
        const stale = this.cache.getStale<HistoricalBar[]>(cacheKey, this.staleTtlMs);
        if (stale) {
          return stale;
        }
      } finally {
        clearTimeout(timeout);
      }
    }

    throw new MarketDataError(`All historical data providers failed for ${instrument.symbol}: ${errors.map((error) => error.message).join(" | ")}`);
  }

  private getLimiter(provider: string): TokenBucketRateLimiter {
    const existing = this.limiters.get(provider);
    if (existing) {
      return existing;
    }

    const limiter = new TokenBucketRateLimiter(provider, 60, 60);
    this.limiters.set(provider, limiter);
    return limiter;
  }
}
