import type { NotificationPreference } from "./types";

export const sampleNotificationPreferences: NotificationPreference[] = [
  {
    userId: "user-demo",
    channel: "push",
    enabled: true,
    destination: "browser-subscription-demo",
  },
  {
    userId: "user-demo",
    channel: "email",
    enabled: true,
    destination: "demo@sipthedip.example",
  },
  {
    userId: "user-demo",
    channel: "sms",
    enabled: false,
    destination: "+15555550123",
  },
  {
    userId: "user-demo",
    channel: "whatsapp",
    enabled: false,
    destination: "whatsapp:+15555550123",
  },
];
