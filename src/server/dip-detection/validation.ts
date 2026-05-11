import type { AssetPriceSnapshot, DipRule } from "./types";

export function assertValidAssetSnapshot(asset: AssetPriceSnapshot): void {
  if (!asset.assetId.trim()) {
    throw new Error("Asset snapshot requires assetId.");
  }

  if (!asset.symbol.trim()) {
    throw new Error(`Asset ${asset.assetId} requires symbol.`);
  }

  if (!Number.isFinite(asset.currentPrice) || asset.currentPrice <= 0) {
    throw new Error(`Asset ${asset.symbol} requires a positive currentPrice.`);
  }

  if (!Number.isFinite(asset.previousClose) || asset.previousClose <= 0) {
    throw new Error(`Asset ${asset.symbol} requires a positive previousClose.`);
  }

  if (!(asset.observedAt instanceof Date) || Number.isNaN(asset.observedAt.getTime())) {
    throw new Error(`Asset ${asset.symbol} requires a valid observedAt date.`);
  }
}

export function assertValidDipRule(rule: DipRule): void {
  if (!rule.id.trim()) {
    throw new Error("Dip rule requires id.");
  }

  if (!rule.userId.trim()) {
    throw new Error(`Dip rule ${rule.id} requires userId.`);
  }

  if (!rule.assetId.trim()) {
    throw new Error(`Dip rule ${rule.id} requires assetId.`);
  }

  if (!Number.isFinite(rule.thresholdPercentFromPreviousClose) || rule.thresholdPercentFromPreviousClose === 0) {
    throw new Error(`Dip rule ${rule.id} requires a non-zero thresholdPercentFromPreviousClose.`);
  }

  if (rule.cooldownMinutes !== undefined && (!Number.isFinite(rule.cooldownMinutes) || rule.cooldownMinutes < 0)) {
    throw new Error(`Dip rule ${rule.id} requires cooldownMinutes to be zero or greater.`);
  }

  if (rule.lastTriggeredAt !== undefined && (!(rule.lastTriggeredAt instanceof Date) || Number.isNaN(rule.lastTriggeredAt.getTime()))) {
    throw new Error(`Dip rule ${rule.id} requires a valid lastTriggeredAt date when provided.`);
  }
}
