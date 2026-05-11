import type { DipAlertCandidate, UserId } from "../dip-detection";
import { buildDipAlertTemplate } from "./templates";
import type {
  NotificationChannel,
  NotificationChannelAdapter,
  NotificationDelivery,
  NotificationDispatchResult,
  NotificationJob,
  NotificationPreference,
} from "./types";

const DEFAULT_CHANNELS: NotificationChannel[] = ["push", "email"];

export function createNotificationJobsFromDipAlerts(
  alerts: DipAlertCandidate[],
  preferences: NotificationPreference[],
  createdAt = new Date(),
): NotificationJob[] {
  return alerts.flatMap((alert) => {
    const userPreferences = preferences.filter((preference) => preference.userId === alert.userId && preference.enabled);
    const enabledPreferences = userPreferences.length > 0 ? userPreferences : createDefaultPreferences(alert.userId);
    const template = buildDipAlertTemplate(alert);

    return enabledPreferences.map((preference) => ({
      id: buildNotificationJobId(alert, preference.channel),
      idempotencyKey: `${alert.idempotencyKey}:${preference.channel}`,
      userId: alert.userId,
      channel: preference.channel,
      destination: preference.destination,
      template,
      source: {
        type: "dip_rule_triggered",
        alert,
      },
      createdAt,
    }));
  });
}

export async function dispatchNotificationJobs(
  jobs: NotificationJob[],
  adapters: Record<NotificationChannel, NotificationChannelAdapter>,
): Promise<NotificationDispatchResult> {
  const seen = new Set<string>();
  const deliveries: NotificationDelivery[] = [];

  for (const job of jobs) {
    if (seen.has(job.idempotencyKey)) {
      deliveries.push({
        jobId: job.id,
        idempotencyKey: job.idempotencyKey,
        userId: job.userId,
        channel: job.channel,
        status: "skipped",
        provider: "notification-orchestrator",
        reason: "Duplicate idempotency key skipped before provider dispatch.",
      });
      continue;
    }

    seen.add(job.idempotencyKey);
    const adapter = adapters[job.channel];

    if (!adapter) {
      deliveries.push({
        jobId: job.id,
        idempotencyKey: job.idempotencyKey,
        userId: job.userId,
        channel: job.channel,
        status: "failed",
        provider: "notification-orchestrator",
        reason: `No adapter registered for ${job.channel}.`,
      });
      continue;
    }

    try {
      deliveries.push(await adapter.send(job));
    } catch (error) {
      deliveries.push({
        jobId: job.id,
        idempotencyKey: job.idempotencyKey,
        userId: job.userId,
        channel: job.channel,
        status: "failed",
        provider: adapter.providerName,
        reason: error instanceof Error ? error.message : "Unknown notification provider failure.",
      });
    }
  }

  return {
    deliveries,
    summary: {
      queued: jobs.length,
      sent: countDeliveries(deliveries, "sent"),
      skipped: countDeliveries(deliveries, "skipped"),
      failed: countDeliveries(deliveries, "failed"),
    },
  };
}

function createDefaultPreferences(userId: UserId): NotificationPreference[] {
  return DEFAULT_CHANNELS.map((channel) => ({
    userId,
    channel,
    enabled: true,
  }));
}

function buildNotificationJobId(alert: DipAlertCandidate, channel: NotificationChannel): string {
  return `notification:${alert.ruleId}:${alert.assetId}:${channel}:${alert.metadata.evaluatedAt}`;
}

function countDeliveries(deliveries: NotificationDelivery[], status: NotificationDelivery["status"]): number {
  return deliveries.filter((delivery) => delivery.status === status).length;
}
