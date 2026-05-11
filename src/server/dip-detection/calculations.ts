import type { AssetPriceSnapshot, DipCalculation, DipRule } from "./types";

const PERCENT_MULTIPLIER = 100;
const DECIMAL_PLACES = 6;

export function roundPercent(value: number): number {
  return Number(value.toFixed(DECIMAL_PLACES));
}

export function calculatePriceChange(currentPrice: number, previousClose: number): number {
  return currentPrice - previousClose;
}

export function calculatePriceChangePercent(currentPrice: number, previousClose: number): number {
  return roundPercent(((currentPrice - previousClose) / previousClose) * PERCENT_MULTIPLIER);
}

export function calculateDeclinePercentFromPreviousClose(currentPrice: number, previousClose: number): number {
  const percentChange = calculatePriceChangePercent(currentPrice, previousClose);
  return percentChange < 0 ? Math.abs(percentChange) : 0;
}

export function normalizeThresholdPercent(thresholdPercentFromPreviousClose: number): number {
  return Math.abs(thresholdPercentFromPreviousClose);
}

export function calculateDip(asset: AssetPriceSnapshot, rule: DipRule): DipCalculation {
  return {
    priceChange: calculatePriceChange(asset.currentPrice, asset.previousClose),
    priceChangePercent: calculatePriceChangePercent(asset.currentPrice, asset.previousClose),
    declinePercentFromPreviousClose: calculateDeclinePercentFromPreviousClose(asset.currentPrice, asset.previousClose),
    thresholdPercentFromPreviousClose: normalizeThresholdPercent(rule.thresholdPercentFromPreviousClose),
  };
}
