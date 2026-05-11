import type { DipAlertCandidate } from "../dip-detection";
import type { NotificationTemplate } from "./types";

export function buildDipAlertTemplate(alert: DipAlertCandidate): NotificationTemplate {
  return {
    title: `${alert.symbol} dip condition detected`,
    body: [
      `${alert.symbol} met your configured dip rule at ${Math.abs(alert.metadata.priceChangePercent).toFixed(2)}% below the previous close.`,
      `Threshold: ${alert.metadata.thresholdPercentFromPreviousClose.toFixed(2)}%.`,
      "This is an informational alert based on your settings, not investment advice.",
    ].join(" "),
    callToActionLabel: "Review alert",
    callToActionUrl: `/alerts?symbol=${encodeURIComponent(alert.symbol)}`,
  };
}
