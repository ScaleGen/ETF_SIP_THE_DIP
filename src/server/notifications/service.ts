import type { DipAlertCandidate } from "../dip-detection";
import { createDefaultMockAdapters } from "./channels/mock-adapters";
import { InMemoryNotificationQueue, type NotificationQueue } from "./queue";
import { createNotificationJobsFromDipAlerts, dispatchNotificationJobs } from "./orchestrator";
import type { NotificationChannel, NotificationChannelAdapter, NotificationDispatchResult, NotificationJob, NotificationPreference } from "./types";

export type NotificationServiceOptions = {
  queue?: NotificationQueue;
  adapters?: Record<NotificationChannel, NotificationChannelAdapter>;
};

export class NotificationService {
  private readonly queue: NotificationQueue;
  private readonly adapters: Record<NotificationChannel, NotificationChannelAdapter>;

  constructor(options: NotificationServiceOptions = {}) {
    this.queue = options.queue ?? new InMemoryNotificationQueue();
    this.adapters = options.adapters ?? createDefaultMockAdapters();
  }

  async enqueueDipAlerts(alerts: DipAlertCandidate[], preferences: NotificationPreference[]): Promise<NotificationJob[]> {
    const jobs = createNotificationJobsFromDipAlerts(alerts, preferences);
    await this.queue.enqueueMany(jobs);
    return jobs;
  }

  async dispatchQueued(): Promise<NotificationDispatchResult> {
    const jobs = await this.queue.drain();
    return dispatchNotificationJobs(jobs, this.adapters);
  }

  async notifyDipAlerts(alerts: DipAlertCandidate[], preferences: NotificationPreference[]): Promise<NotificationDispatchResult> {
    await this.enqueueDipAlerts(alerts, preferences);
    return this.dispatchQueued();
  }
}
