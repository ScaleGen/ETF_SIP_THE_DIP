/**
 * Domain types for the Sip the Dip dip-detection engine.
 *
 * The engine is deliberately framework-agnostic: callers can use it from an
 * API route, queue worker, cron job, or future broker/data-provider adapter.
 */
export type AssetId = string;
export type RuleId = string;
export type UserId = string;

export enum DipTriggerStatus {
  NoDip = "No Dip",
  DipDetected = "Dip Detected",
  RuleTriggered = "Rule Triggered",
}

export type AssetPriceSnapshot = {
  assetId: AssetId;
  symbol: string;
  currentPrice: number;
  previousClose: number;
  currency?: string;
  observedAt: Date;
  source?: string;
};

export type DipRule = {
  id: RuleId;
  userId: UserId;
  assetId: AssetId;
  /**
   * Positive percentage decline from previous close required to trigger.
   * Example: 5 means the rule triggers at -5.00% or lower.
   */
  thresholdPercentFromPreviousClose: number;
  enabled: boolean;
  cooldownMinutes?: number;
  lastTriggeredAt?: Date;
  notificationChannels?: Array<"email" | "push" | "sms" | "whatsapp" | "in_app" | "webhook">;
};

export type DipEvaluationInput = {
  asset: AssetPriceSnapshot;
  rules: DipRule[];
};

export type DipEvaluationContext = {
  evaluatedAt?: Date;
};

export type DipCalculation = {
  priceChange: number;
  priceChangePercent: number;
  declinePercentFromPreviousClose: number;
  thresholdPercentFromPreviousClose: number;
};

export type DipEvaluation = {
  ruleId: RuleId;
  userId: UserId;
  assetId: AssetId;
  symbol: string;
  status: DipTriggerStatus;
  shouldTriggerAlert: boolean;
  reason: string;
  calculation: DipCalculation;
  evaluatedAt: Date;
  observedAt: Date;
  alert?: DipAlertCandidate;
};

export type DipAlertCandidate = {
  ruleId: RuleId;
  userId: UserId;
  assetId: AssetId;
  symbol: string;
  status: DipTriggerStatus.RuleTriggered;
  message: string;
  idempotencyKey: string;
  metadata: {
    currentPrice: number;
    previousClose: number;
    priceChangePercent: number;
    thresholdPercentFromPreviousClose: number;
    observedAt: string;
    evaluatedAt: string;
    source?: string;
  };
};

export type BatchDipEvaluationResult = {
  evaluations: DipEvaluation[];
  alerts: DipAlertCandidate[];
  summary: {
    assetsEvaluated: number;
    rulesEvaluated: number;
    noDip: number;
    dipDetected: number;
    ruleTriggered: number;
  };
};
