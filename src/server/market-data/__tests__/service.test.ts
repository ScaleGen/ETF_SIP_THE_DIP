import assert from "node:assert/strict";
import test from "node:test";
import { MockFallbackProvider } from "../providers/mock-fallback-provider";
import { MarketDataService } from "../service";
import type { MarketDataProvider, MarketInstrument, MarketQuote } from "../types";

class FailingProvider implements MarketDataProvider {
  readonly name = "yahoo_chart" as const;
  calls = 0;

  supports(): boolean {
    return true;
  }

  async getQuote(): Promise<MarketQuote> {
    this.calls += 1;
    throw new Error("upstream unavailable");
  }

  async getHistory() {
    this.calls += 1;
    throw new Error("upstream unavailable");
  }
}

class CountingProvider implements MarketDataProvider {
  readonly name = "yahoo_chart" as const;
  calls = 0;

  supports(): boolean {
    return true;
  }

  async getQuote(instrument: MarketInstrument): Promise<MarketQuote> {
    this.calls += 1;
    return {
      instrumentId: instrument.id,
      symbol: instrument.symbol,
      provider: this.name,
      price: 100,
      previousClose: 101,
      currency: "INR",
      asOf: new Date("2026-05-11T10:00:00.000Z"),
      isFallback: false,
    };
  }

  async getHistory() {
    this.calls += 1;
    return [{ date: "2026-05-11", close: 100 }];
  }
}

test("falls back to deterministic data when primary provider fails", async () => {
  const failingProvider = new FailingProvider();
  const service = new MarketDataService({ providers: [failingProvider, new MockFallbackProvider()] });

  const quote = await service.getQuote("NIFTYBEES");

  assert.equal(failingProvider.calls, 1);
  assert.equal(quote.provider, "mock_fallback");
  assert.equal(quote.isFallback, true);
});

test("caches quotes to protect provider rate limits", async () => {
  const provider = new CountingProvider();
  const service = new MarketDataService({ providers: [provider], cacheTtlMs: 60_000 });

  const first = await service.getQuote("NIFTYBEES");
  const second = await service.getQuote("NIFTYBEES");

  assert.equal(provider.calls, 1);
  assert.equal(first.price, second.price);
});
