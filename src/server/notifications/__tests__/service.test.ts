import assert from "node:assert/strict";
import test from "node:test";
import { evaluateDipRulesForAssets, sampleAssetSnapshots, sampleDipRules } from "../../dip-detection";
import { createNotificationJobsFromDipAlerts, NotificationService, sampleNotificationPreferences } from "../index";

test("creates channel-specific notification jobs from triggered dip alerts", () => {
  const dipResult = evaluateDipRulesForAssets(sampleAssetSnapshots, sampleDipRules, {
    evaluatedAt: new Date("2026-05-11T20:05:00.000Z"),
  });

  const jobs = createNotificationJobsFromDipAlerts(dipResult.alerts, sampleNotificationPreferences, new Date("2026-05-11T20:06:00.000Z"));

  assert.equal(dipResult.alerts.length, 1);
  assert.equal(jobs.length, 2);
  assert.deepEqual(jobs.map((job) => job.channel).sort(), ["email", "push"]);
  assert.ok(jobs.every((job) => job.template.body.includes("not investment advice")));
});

test("dispatches queued mock notifications without paid provider integrations", async () => {
  const dipResult = evaluateDipRulesForAssets(sampleAssetSnapshots, sampleDipRules, {
    evaluatedAt: new Date("2026-05-11T20:05:00.000Z"),
  });
  const service = new NotificationService();

  const result = await service.notifyDipAlerts(dipResult.alerts, sampleNotificationPreferences);

  assert.equal(result.summary.queued, 2);
  assert.equal(result.summary.sent, 2);
  assert.equal(result.summary.failed, 0);
});
