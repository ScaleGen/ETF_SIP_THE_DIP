import type { EquityCurvePoint, HistoricalPriceBar } from "./types";

const MONTHS_PER_YEAR = 12;
const PERCENT = 100;

export function calculatePercentChange(currentPrice: number, previousPrice: number): number {
  return ((currentPrice - previousPrice) / previousPrice) * PERCENT;
}

export function isDipOpportunity(currentPrice: number, previousClose: number, thresholdPercent: number): boolean {
  return calculatePercentChange(currentPrice, previousClose) <= -Math.abs(thresholdPercent);
}

export function buyUnits(cashAvailable: number, price: number, feePercent = 0): { units: number; totalCost: number; feeAmount: number } {
  const feeRate = Math.max(feePercent, 0) / PERCENT;
  const effectivePrice = price * (1 + feeRate);
  const units = cashAvailable / effectivePrice;

  return {
    units,
    totalCost: cashAvailable,
    feeAmount: cashAvailable - units * price,
  };
}

export function calculateCagrPercent(finalValue: number, totalInvested: number, periods: number): number {
  if (finalValue <= 0 || totalInvested <= 0 || periods <= 0) {
    return 0;
  }

  const years = periods / MONTHS_PER_YEAR;
  return (Math.pow(finalValue / totalInvested, 1 / years) - 1) * PERCENT;
}

export function calculateDrawdownPercent(currentValue: number, peakValue: number): number {
  if (peakValue <= 0) {
    return 0;
  }

  return ((currentValue - peakValue) / peakValue) * PERCENT;
}

export function formatCurveLabel(date: string): string {
  const parsed = new Date(`${date}T00:00:00.000Z`);
  return parsed.toLocaleDateString("en-US", { month: "short", timeZone: "UTC" });
}

export function getBacktestWindow(bars: HistoricalPriceBar[]): { startDate: string; endDate: string; periods: number } {
  return {
    startDate: bars[0]?.date ?? "",
    endDate: bars.at(-1)?.date ?? "",
    periods: Math.max(bars.length - 1, 1),
  };
}

export function getMaxDrawdown(points: EquityCurvePoint[], key: "dipDrawdownPercent" | "sipDrawdownPercent"): number {
  return Math.min(...points.map((point) => point[key]), 0);
}
