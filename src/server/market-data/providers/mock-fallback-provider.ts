import type { HistoricalBar, MarketDataProvider, MarketDataRange, MarketInstrument, MarketQuote } from "../types";

const fallbackPrices: Record<string, { price: number; previousClose: number }> = {
  NIFTYBEES: { price: 270.45, previousClose: 274.2 },
  BANKBEES: { price: 515.1, previousClose: 522.6 },
  "NIFTY 50": { price: 22585.3, previousClose: 22810.15 },
  "NIFTY BANK": { price: 48120.5, previousClose: 48740.8 },
};

export class MockFallbackProvider implements MarketDataProvider {
  readonly name = "mock_fallback" as const;

  supports(): boolean {
    return true;
  }

  async getQuote(instrument: MarketInstrument): Promise<MarketQuote> {
    const fallback = fallbackPrices[instrument.symbol] ?? { price: 100, previousClose: 101 };
    return {
      instrumentId: instrument.id,
      symbol: instrument.symbol,
      provider: this.name,
      price: fallback.price,
      previousClose: fallback.previousClose,
      currency: "INR",
      asOf: new Date("2026-05-11T10:00:00.000Z"),
      isFallback: true,
    };
  }

  async getHistory(instrument: MarketInstrument, _range: MarketDataRange): Promise<HistoricalBar[]> {
    const base = fallbackPrices[instrument.symbol]?.previousClose ?? 100;
    return Array.from({ length: 12 }, (_, index) => ({
      date: new Date(Date.UTC(2025, index, 28)).toISOString().slice(0, 10),
      close: Number((base * (0.94 + index * 0.012 + (index % 3) * 0.01)).toFixed(2)),
    }));
  }
}
