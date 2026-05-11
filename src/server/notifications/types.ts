import type { DipAlertCandidate, UserId } from "../dip-detection";

export type NotificationChannel = "push" | "email" | "sms" | "whatsapp";

export type NotificationPreference = {
  userId: UserId;
  channel: NotificationChannel;
  enabled: boolean;
  destination?: string;
  quietHours?: {
    startHour: number;
    endHour: number;
    timezone: string;
  };
};

export type NotificationTemplate = {
  title: string;
  body: string;
  callToActionLabel?: string;
  callToActionUrl?: string;
};

export type NotificationJob = {
  id: string;
  idempotencyKey: string;
  userId: UserId;
  channel: NotificationChannel;
  destination?: string;
  template: NotificationTemplate;
  source: {
    type: "dip_rule_triggered";
    alert: DipAlertCandidate;
  };
  createdAt: Date;
};

export type NotificationDeliveryStatus = "queued" | "sent" | "skipped" | "failed";

export type NotificationDelivery = {
  jobId: string;
  idempotencyKey: string;
  userId: UserId;
  channel: NotificationChannel;
  status: NotificationDeliveryStatus;
  provider: string;
  providerMessageId?: string;
  reason?: string;
  sentAt?: Date;
};

export type NotificationDispatchResult = {
  deliveries: NotificationDelivery[];
  summary: {
    queued: number;
    sent: number;
    skipped: number;
    failed: number;
  };
};

export type NotificationChannelAdapter = {
  channel: NotificationChannel;
  providerName: string;
  send(job: NotificationJob): Promise<NotificationDelivery>;
};
