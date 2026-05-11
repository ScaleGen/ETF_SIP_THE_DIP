import assert from "node:assert/strict";
import test from "node:test";
import { runBacktest, runMockBacktest } from "../engine";
import type { HistoricalPriceBar } from "../types";

const bars: HistoricalPriceBar[] = [
  { date: "2026-01-31", close: 100 },
  { date: "2026-02-28", close: 94 },
  { date: "2026-03-31", close: 96 },
  { date: "2026-04-30", close: 90 },
];

test("simulates dip strategy against regular SIP", () => {
  const result = runBacktest(bars, {
    symbol: "SPY",
    dipThresholdPercentFromPreviousClose: 5,
    recurringContribution: 100,
    feePercent: 0,
    cooldownPeriods: 0,
  });

  assert.equal(result.dipOpportunities, 2);
  assert.equal(result.dip.totalInvested, 400);
  assert.equal(result.sip.totalInvested, 400);
  assert.ok(result.dip.unitsAccumulated > 0);
  assert.ok(result.sip.unitsAccumulated > 0);
  assert.equal(result.equityCurve.length, bars.length);
  assert.ok(result.trades.some((trade) => trade.strategy === "dip" && trade.action === "buy"));
});

test("returns comparable metrics for mock ETF data", () => {
  const result = runMockBacktest();

  assert.equal(result.symbol, "SPY");
  assert.ok(result.dip.finalPortfolioValue > 0);
  assert.ok(result.sip.finalPortfolioValue > 0);
  assert.ok(result.dipOpportunities > 0);
  assert.ok(result.dip.maxDrawdownPercent <= 0);
  assert.ok(result.sip.maxDrawdownPercent <= 0);
});
