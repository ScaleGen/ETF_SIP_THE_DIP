import type { NotificationChannel, NotificationChannelAdapter, NotificationDelivery, NotificationJob } from "../types";

function createDelivery(job: NotificationJob, provider: string, status: NotificationDelivery["status"], reason?: string): NotificationDelivery {
  return {
    jobId: job.id,
    idempotencyKey: job.idempotencyKey,
    userId: job.userId,
    channel: job.channel,
    status,
    provider,
    providerMessageId: status === "sent" ? `${provider}-${job.id}` : undefined,
    reason,
    sentAt: status === "sent" ? new Date() : undefined,
  };
}

export function createMockAdapter(channel: NotificationChannel, providerName = `${channel}-mock-provider`): NotificationChannelAdapter {
  return {
    channel,
    providerName,
    async send(job: NotificationJob) {
      if ((channel === "sms" || channel === "whatsapp") && !job.destination) {
        return createDelivery(job, providerName, "skipped", `${channel.toUpperCase()} placeholder requires an explicit destination before provider integration.`);
      }

      return createDelivery(job, providerName, "sent");
    },
  };
}

export function createDefaultMockAdapters(): Record<NotificationChannel, NotificationChannelAdapter> {
  return {
    push: createMockAdapter("push"),
    email: createMockAdapter("email"),
    sms: createMockAdapter("sms", "sms-placeholder"),
    whatsapp: createMockAdapter("whatsapp", "whatsapp-placeholder"),
  };
}
