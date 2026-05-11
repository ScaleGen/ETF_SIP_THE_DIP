export type MarketDataAssetType = "indian_etf" | "indian_index";

export type MarketDataProviderName = "yahoo_chart" | "nse_india" | "mock_fallback";

export type MarketInstrument = {
  id: string;
  symbol: string;
  name: string;
  assetType: MarketDataAssetType;
  exchange: "NSE" | "NSE_INDICES";
  currency: "INR";
  providerSymbols: Partial<Record<MarketDataProviderName, string>>;
};

export type MarketQuote = {
  instrumentId: string;
  symbol: string;
  provider: MarketDataProviderName;
  price: number;
  previousClose: number;
  currency: "INR";
  asOf: Date;
  isFallback: boolean;
};

export type HistoricalBar = {
  date: string;
  close: number;
};

export type MarketDataProvider = {
  name: MarketDataProviderName;
  supports(instrument: MarketInstrument): boolean;
  getQuote(instrument: MarketInstrument, signal?: AbortSignal): Promise<MarketQuote>;
  getHistory(instrument: MarketInstrument, range: MarketDataRange, signal?: AbortSignal): Promise<HistoricalBar[]>;
};

export type MarketDataRange = "1mo" | "6mo" | "1y" | "5y";

export type CacheEntry<T> = {
  value: T;
  storedAt: Date;
  expiresAt: Date;
};

export type MarketDataServiceOptions = {
  providers?: MarketDataProvider[];
  cacheTtlMs?: number;
  staleTtlMs?: number;
  requestTimeoutMs?: number;
};
