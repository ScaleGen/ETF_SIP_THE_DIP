import assert from "node:assert/strict";
import test from "node:test";
import { evaluateDipRule, evaluateDipRulesForAssets } from "../evaluator";
import { DipTriggerStatus, type AssetPriceSnapshot, type DipRule } from "../types";

const evaluatedAt = new Date("2026-05-11T20:05:00.000Z");

const baseAsset: AssetPriceSnapshot = {
  assetId: "asset-spy",
  symbol: "SPY",
  currentPrice: 95,
  previousClose: 100,
  observedAt: new Date("2026-05-11T20:00:00.000Z"),
};

const baseRule: DipRule = {
  id: "rule-spy-5pct",
  userId: "user-demo",
  assetId: "asset-spy",
  thresholdPercentFromPreviousClose: 5,
  enabled: true,
};

test("returns Rule Triggered when current price crosses the threshold from previous close", () => {
  const evaluation = evaluateDipRule(baseAsset, baseRule, { evaluatedAt });

  assert.equal(evaluation.status, DipTriggerStatus.RuleTriggered);
  assert.equal(evaluation.shouldTriggerAlert, true);
  assert.equal(evaluation.calculation.declinePercentFromPreviousClose, 5);
  assert.ok(evaluation.alert);
});

test("returns Dip Detected when price is down but below the configured threshold", () => {
  const evaluation = evaluateDipRule(
    { ...baseAsset, currentPrice: 98 },
    { ...baseRule, thresholdPercentFromPreviousClose: 5 },
    { evaluatedAt },
  );

  assert.equal(evaluation.status, DipTriggerStatus.DipDetected);
  assert.equal(evaluation.shouldTriggerAlert, false);
  assert.equal(evaluation.alert, undefined);
});

test("returns No Dip when current price is at or above previous close", () => {
  const evaluation = evaluateDipRule({ ...baseAsset, currentPrice: 101 }, baseRule, { evaluatedAt });

  assert.equal(evaluation.status, DipTriggerStatus.NoDip);
  assert.equal(evaluation.shouldTriggerAlert, false);
});

test("evaluates multiple assets and returns alert candidates separately", () => {
  const result = evaluateDipRulesForAssets(
    [baseAsset, { ...baseAsset, assetId: "asset-qqq", symbol: "QQQ", currentPrice: 198, previousClose: 200 }],
    [baseRule, { ...baseRule, id: "rule-qqq-3pct", assetId: "asset-qqq", thresholdPercentFromPreviousClose: 3 }],
    { evaluatedAt },
  );

  assert.equal(result.summary.assetsEvaluated, 2);
  assert.equal(result.summary.rulesEvaluated, 2);
  assert.equal(result.summary.ruleTriggered, 1);
  assert.equal(result.summary.dipDetected, 1);
  assert.equal(result.alerts.length, 1);
});
