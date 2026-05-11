import { calculateDip } from "./calculations";
import {
  type AssetPriceSnapshot,
  type BatchDipEvaluationResult,
  type DipAlertCandidate,
  type DipEvaluation,
  type DipEvaluationContext,
  type DipEvaluationInput,
  type DipRule,
  DipTriggerStatus,
} from "./types";
import { assertValidAssetSnapshot, assertValidDipRule } from "./validation";

export function evaluateDipRule(asset: AssetPriceSnapshot, rule: DipRule, context: DipEvaluationContext = {}): DipEvaluation {
  assertValidAssetSnapshot(asset);
  assertValidDipRule(rule);

  if (asset.assetId !== rule.assetId) {
    throw new Error(`Dip rule ${rule.id} targets ${rule.assetId}, but asset snapshot is ${asset.assetId}.`);
  }

  const evaluatedAt = context.evaluatedAt ?? new Date();
  const calculation = calculateDip(asset, rule);
  const crossedThreshold = calculation.declinePercentFromPreviousClose >= calculation.thresholdPercentFromPreviousClose;
  const hasAnyDip = calculation.declinePercentFromPreviousClose > 0;
  const cooldownActive = isCooldownActive(rule, evaluatedAt);

  if (!hasAnyDip) {
    return buildEvaluation({
      asset,
      rule,
      status: DipTriggerStatus.NoDip,
      shouldTriggerAlert: false,
      reason: `${asset.symbol} is not below its previous close.`,
      calculation,
      evaluatedAt,
    });
  }

  if (!crossedThreshold) {
    return buildEvaluation({
      asset,
      rule,
      status: DipTriggerStatus.DipDetected,
      shouldTriggerAlert: false,
      reason: `${asset.symbol} is down ${calculation.declinePercentFromPreviousClose.toFixed(2)}%, which is below the ${calculation.thresholdPercentFromPreviousClose.toFixed(2)}% alert threshold.`,
      calculation,
      evaluatedAt,
    });
  }

  if (!rule.enabled) {
    return buildEvaluation({
      asset,
      rule,
      status: DipTriggerStatus.DipDetected,
      shouldTriggerAlert: false,
      reason: `${asset.symbol} crossed the threshold, but rule ${rule.id} is disabled.`,
      calculation,
      evaluatedAt,
    });
  }

  if (cooldownActive) {
    return buildEvaluation({
      asset,
      rule,
      status: DipTriggerStatus.DipDetected,
      shouldTriggerAlert: false,
      reason: `${asset.symbol} crossed the threshold, but rule ${rule.id} is still in cooldown.`,
      calculation,
      evaluatedAt,
    });
  }

  const alert = buildAlertCandidate(asset, rule, calculation, evaluatedAt);

  return buildEvaluation({
    asset,
    rule,
    status: DipTriggerStatus.RuleTriggered,
    shouldTriggerAlert: true,
    reason: `${asset.symbol} fell ${calculation.declinePercentFromPreviousClose.toFixed(2)}% from its previous close and met the ${calculation.thresholdPercentFromPreviousClose.toFixed(2)}% user-defined threshold.`,
    calculation,
    evaluatedAt,
    alert,
  });
}

export function evaluateAssetDips(input: DipEvaluationInput, context: DipEvaluationContext = {}): DipEvaluation[] {
  const rulesForAsset = input.rules.filter((rule) => rule.assetId === input.asset.assetId);
  return rulesForAsset.map((rule) => evaluateDipRule(input.asset, rule, context));
}

export function evaluateDipRulesForAssets(
  assets: AssetPriceSnapshot[],
  rules: DipRule[],
  context: DipEvaluationContext = {},
): BatchDipEvaluationResult {
  const rulesByAssetId = groupRulesByAssetId(rules);
  const evaluations = assets.flatMap((asset) => evaluateAssetDips({ asset, rules: rulesByAssetId.get(asset.assetId) ?? [] }, context));
  const alerts = evaluations.flatMap((evaluation) => (evaluation.alert ? [evaluation.alert] : []));

  return {
    evaluations,
    alerts,
    summary: {
      assetsEvaluated: assets.length,
      rulesEvaluated: evaluations.length,
      noDip: countByStatus(evaluations, DipTriggerStatus.NoDip),
      dipDetected: countByStatus(evaluations, DipTriggerStatus.DipDetected),
      ruleTriggered: countByStatus(evaluations, DipTriggerStatus.RuleTriggered),
    },
  };
}

function buildEvaluation({
  asset,
  rule,
  status,
  shouldTriggerAlert,
  reason,
  calculation,
  evaluatedAt,
  alert,
}: Omit<DipEvaluation, "ruleId" | "userId" | "assetId" | "symbol" | "observedAt"> & {
  asset: AssetPriceSnapshot;
  rule: DipRule;
}): DipEvaluation {
  return {
    ruleId: rule.id,
    userId: rule.userId,
    assetId: asset.assetId,
    symbol: asset.symbol,
    status,
    shouldTriggerAlert,
    reason,
    calculation,
    evaluatedAt,
    observedAt: asset.observedAt,
    alert,
  };
}

function buildAlertCandidate(
  asset: AssetPriceSnapshot,
  rule: DipRule,
  calculation: DipEvaluation["calculation"],
  evaluatedAt: Date,
): DipAlertCandidate {
  return {
    ruleId: rule.id,
    userId: rule.userId,
    assetId: asset.assetId,
    symbol: asset.symbol,
    status: DipTriggerStatus.RuleTriggered,
    message: `${asset.symbol} met your configured dip condition: ${calculation.declinePercentFromPreviousClose.toFixed(2)}% below previous close. This is an informational alert, not investment advice.`,
    idempotencyKey: buildAlertIdempotencyKey(rule, asset, evaluatedAt),
    metadata: {
      currentPrice: asset.currentPrice,
      previousClose: asset.previousClose,
      priceChangePercent: calculation.priceChangePercent,
      thresholdPercentFromPreviousClose: calculation.thresholdPercentFromPreviousClose,
      observedAt: asset.observedAt.toISOString(),
      evaluatedAt: evaluatedAt.toISOString(),
      source: asset.source,
    },
  };
}

function isCooldownActive(rule: DipRule, evaluatedAt: Date): boolean {
  if (!rule.cooldownMinutes || !rule.lastTriggeredAt) {
    return false;
  }

  const cooldownMs = rule.cooldownMinutes * 60 * 1000;
  return evaluatedAt.getTime() - rule.lastTriggeredAt.getTime() < cooldownMs;
}

function groupRulesByAssetId(rules: DipRule[]): Map<string, DipRule[]> {
  return rules.reduce((accumulator, rule) => {
    const existingRules = accumulator.get(rule.assetId) ?? [];
    existingRules.push(rule);
    accumulator.set(rule.assetId, existingRules);
    return accumulator;
  }, new Map<string, DipRule[]>());
}

function countByStatus(evaluations: DipEvaluation[], status: DipTriggerStatus): number {
  return evaluations.filter((evaluation) => evaluation.status === status).length;
}

function buildAlertIdempotencyKey(rule: DipRule, asset: AssetPriceSnapshot, evaluatedAt: Date): string {
  const evaluationBucket = evaluatedAt.toISOString().slice(0, 16);
  return [rule.userId, rule.id, asset.assetId, asset.observedAt.toISOString(), evaluationBucket].join(":");
}
