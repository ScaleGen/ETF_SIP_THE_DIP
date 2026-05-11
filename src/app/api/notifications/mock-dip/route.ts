import { evaluateDipRulesForAssets, sampleAssetSnapshots, sampleDipRules } from "@/server/dip-detection";
import { NotificationService, sampleNotificationPreferences } from "@/server/notifications";

export async function GET() {
  const dipResult = evaluateDipRulesForAssets(sampleAssetSnapshots, sampleDipRules, {
    evaluatedAt: new Date("2026-05-11T20:05:00.000Z"),
  });
  const notificationService = new NotificationService();
  const notificationResult = await notificationService.notifyDipAlerts(dipResult.alerts, sampleNotificationPreferences);

  return Response.json({
    dipSummary: dipResult.summary,
    alerts: dipResult.alerts,
    notifications: notificationResult,
  });
}
