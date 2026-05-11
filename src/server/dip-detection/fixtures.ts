import type { AssetPriceSnapshot, DipRule } from "./types";

export const sampleAssetSnapshots: AssetPriceSnapshot[] = [
  {
    assetId: "asset-spy",
    symbol: "SPY",
    currentPrice: 95,
    previousClose: 100,
    observedAt: new Date("2026-05-11T20:00:00.000Z"),
    source: "mock-provider",
  },
  {
    assetId: "asset-qqq",
    symbol: "QQQ",
    currentPrice: 198,
    previousClose: 200,
    observedAt: new Date("2026-05-11T20:00:00.000Z"),
    source: "mock-provider",
  },
];

export const sampleDipRules: DipRule[] = [
  {
    id: "rule-spy-5pct",
    userId: "user-demo",
    assetId: "asset-spy",
    thresholdPercentFromPreviousClose: 5,
    enabled: true,
    cooldownMinutes: 60,
    notificationChannels: ["email", "in_app"],
  },
  {
    id: "rule-qqq-3pct",
    userId: "user-demo",
    assetId: "asset-qqq",
    thresholdPercentFromPreviousClose: 3,
    enabled: true,
    cooldownMinutes: 60,
    notificationChannels: ["in_app"],
  },
];
