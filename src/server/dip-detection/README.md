# Dip Detection Engine

Framework-agnostic TypeScript domain code for evaluating Sip the Dip alert rules.

## Rule semantics

A rule evaluates the latest price snapshot for one asset against its previous close:

```text
declinePercentFromPreviousClose = max(0, ((previousClose - currentPrice) / previousClose) * 100)
```

Statuses:

- `No Dip`: current price is at or above previous close.
- `Dip Detected`: current price is below previous close, but the alert should not fire because the threshold was not reached, the rule is disabled, or cooldown is active.
- `Rule Triggered`: the decline met or exceeded the user's enabled threshold and an alert candidate should be queued.

## Usage

```ts
import { evaluateDipRulesForAssets } from "@/server/dip-detection";

const result = evaluateDipRulesForAssets(assetSnapshots, userRules, {
  evaluatedAt: new Date(),
});

// Queue result.alerts with the notification service.
```

The engine is pure and side-effect free. It does not write to the database or send notifications; workers or API services should persist evaluations and enqueue `alerts` separately.
