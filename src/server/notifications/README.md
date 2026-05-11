# Notification System

The notification module is a provider-ready architecture for delivering Sip the Dip alerts when dip rules activate.

## Channels

- `push`: mock browser/push adapter today; ready for Web Push or FCM later.
- `email`: mock email adapter today; ready for SES, Resend, Postmark, or SendGrid later.
- `sms`: placeholder adapter only; no paid SMS API is integrated.
- `whatsapp`: placeholder adapter only; no paid WhatsApp API is integrated.

## Flow

1. Dip detection returns `DipAlertCandidate[]` when rules reach `Rule Triggered`.
2. `createNotificationJobsFromDipAlerts` expands each alert into channel-specific jobs based on user preferences.
3. Jobs can be placed on `NotificationQueue`; the in-memory queue is for local development/tests and can be replaced with SQS, BullMQ, or another durable queue.
4. `NotificationService.dispatchQueued` sends jobs through registered channel adapters.
5. Adapters return delivery records with `sent`, `skipped`, or `failed` status.

All templates use informational language and avoid recommendations, guarantees, or trading instructions.
