import type { NotificationJob } from "./types";

export type NotificationQueue = {
  enqueue(job: NotificationJob): Promise<void>;
  enqueueMany(jobs: NotificationJob[]): Promise<void>;
  drain(): Promise<NotificationJob[]>;
};

export class InMemoryNotificationQueue implements NotificationQueue {
  private readonly jobs: NotificationJob[] = [];

  async enqueue(job: NotificationJob): Promise<void> {
    this.jobs.push(job);
  }

  async enqueueMany(jobs: NotificationJob[]): Promise<void> {
    this.jobs.push(...jobs);
  }

  async drain(): Promise<NotificationJob[]> {
    return this.jobs.splice(0, this.jobs.length);
  }
}
