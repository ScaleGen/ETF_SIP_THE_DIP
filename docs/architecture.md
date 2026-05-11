# Sip the Dip Architecture

## 1. Full App Architecture

Sip the Dip is a mobile-first responsive web application for tracking ETFs and indices, detecting market dips, sending alerts, logging manual dip investments, and backtesting dip-buying strategies. The product should use safe finance language throughout: it can provide tracking, education, simulations, and user-defined alerts, but must not present recommendations, guarantees, personalized investment advice, or promises of returns.

### Core product principles

- **User-defined rules:** Users configure watchlists, dip thresholds, schedules, and simulation assumptions.
- **No advice positioning:** Alerts should say that a condition was detected, not that the user should buy.
- **Explainability:** Every dip signal should show the source price, lookback window, benchmark, calculation method, and timestamp.
- **Manual-first MVP:** Initial investment tracking is user-entered; broker integrations are isolated behind future-ready interfaces.
- **Auditability:** Store alert decisions, price snapshots, and backtest inputs so users can understand historical behavior.

### High-level system components

```text
Mobile/Web Browser
  |
  | HTTPS
  v
Next.js App
  - App Router UI
  - Server Components for read-heavy pages
  - Client Components for interactive charts/forms
  - API route handlers or BFF layer for MVP
  |
  | Internal API / service calls
  v
Node.js Backend Services
  - Auth and user service
  - Instrument/watchlist service
  - Market data ingestion service
  - Dip detection service
  - Portfolio journal service
  - Backtesting service
  - Notification orchestration service
  |
  | SQL / queues / external APIs
  v
PostgreSQL + Redis/Queue + Market Data Providers + Notification Providers
```

### Frontend architecture

- **Framework:** Next.js using the App Router.
- **Styling:** Tailwind CSS with Tailwind UI components adapted into a local design system.
- **Rendering approach:**
  - Server-render dashboard summaries, settings, and history lists.
  - Client-render interactive charts, threshold builders, and backtest configuration forms.
  - Use route-level loading, error, and empty states.
- **Mobile-first information architecture:**
  - Bottom navigation for Dashboard, Watchlist, Alerts, Backtests, and Journal.
  - Progressive disclosure for advanced settings.
  - Compact cards for current dip status, recent alerts, and manual investment logs.
- **Charting:** Use a client-side chart library with responsive SVG/canvas rendering and accessible tabular fallbacks.

### Backend architecture

- **Runtime:** Node.js with TypeScript.
- **API style:** REST for the MVP, with typed request/response contracts and room to add GraphQL or tRPC only if product complexity warrants it.
- **Service boundaries:** Start as a modular monolith, separating domain modules by package/folder. Promote heavy ingestion, alerts, and backtesting workloads to separate workers as scale grows.
- **Background processing:** Use a durable job queue for market data ingestion, dip checks, notification fanout, and long-running backtests.
- **Database:** PostgreSQL as the source of truth for users, instruments, prices, alerts, journal entries, backtests, and audit logs.
- **Cache:** Redis for queue backing, rate limits, short-lived market-data cache, idempotency keys, and notification cooldown locks.

### Domain modules

| Module | Responsibilities |
| --- | --- |
| Identity | Users, sessions, OAuth, preferences, consent records |
| Instruments | ETFs, indices, aliases, exchanges, provider symbols, metadata |
| Market Data | Provider adapters, ingestion, normalization, daily/intraday bars |
| Dip Detection | User thresholds, benchmark calculations, signal persistence |
| Alerts | Alert rules, alert events, notification preferences, cooldowns |
| Journal | Manual dip investment entries, notes, tags, cost basis inputs |
| Backtesting | Strategy definitions, historical data access, simulation engine, result storage |
| Notifications | Email, push, SMS abstraction, templates, delivery logs |
| Compliance/Safety | Disclaimers, risk copy, audit logs, content policy checks |

## 2. Database Schema

Use PostgreSQL with UUID primary keys, `created_at`, `updated_at`, and soft-delete fields where user-facing records may need recovery. Prices and events should be append-only where possible.

### Entity overview

```text
users 1--many watchlists
users 1--many alert_rules
users 1--many investment_journal_entries
users 1--many backtest_runs
instruments 1--many market_prices
instruments 1--many watchlist_items
alert_rules 1--many alert_events
backtest_runs 1--many backtest_trades
notification_deliveries many--1 alert_events
```

### Core tables

#### `users`

| Column | Type | Notes |
| --- | --- | --- |
| `id` | uuid pk | User identifier |
| `email` | citext unique not null | Login and email notifications |
| `display_name` | text | Optional |
| `timezone` | text not null default `'UTC'` | Alert scheduling |
| `base_currency` | char(3) default `'USD'` | Display currency |
| `risk_disclaimer_accepted_at` | timestamptz | Required before alerts/backtests |
| `created_at` | timestamptz | Audit |
| `updated_at` | timestamptz | Audit |
| `deleted_at` | timestamptz | Soft delete |

#### `user_notification_preferences`

| Column | Type | Notes |
| --- | --- | --- |
| `id` | uuid pk | Preference identifier |
| `user_id` | uuid fk users | Owner |
| `channel` | enum(`email`, `push`, `sms`, `webhook`) | Channel |
| `enabled` | boolean | User-level toggle |
| `destination` | text | Email, phone, endpoint, or push token reference |
| `quiet_hours_start` | time | Optional local quiet hours |
| `quiet_hours_end` | time | Optional local quiet hours |
| `created_at` | timestamptz | Audit |
| `updated_at` | timestamptz | Audit |

#### `instruments`

| Column | Type | Notes |
| --- | --- | --- |
| `id` | uuid pk | Instrument identifier |
| `symbol` | text not null | Canonical symbol, e.g. `SPY` |
| `name` | text not null | Display name |
| `instrument_type` | enum(`etf`, `index`) | Product type |
| `exchange` | text | Exchange or index provider |
| `currency` | char(3) | Price currency |
| `provider` | text | Primary market data provider |
| `provider_symbol` | text | Provider-specific symbol |
| `active` | boolean | Delisting/deprecation support |
| `created_at` | timestamptz | Audit |
| `updated_at` | timestamptz | Audit |

Indexes:

- Unique index on `(provider, provider_symbol)`.
- Search index on `symbol` and `name`.

#### `market_prices`

| Column | Type | Notes |
| --- | --- | --- |
| `id` | bigserial pk | Storage-efficient price row |
| `instrument_id` | uuid fk instruments | Instrument |
| `timeframe` | enum(`1d`, `1h`, `15m`, `5m`) | Bar granularity |
| `price_time` | timestamptz | Bar timestamp |
| `open` | numeric(18,6) | OHLC |
| `high` | numeric(18,6) | OHLC |
| `low` | numeric(18,6) | OHLC |
| `close` | numeric(18,6) | OHLC |
| `adjusted_close` | numeric(18,6) | Split/dividend-adjusted close when available |
| `volume` | numeric(24,4) | Optional for indices |
| `source` | text | Provider |
| `ingested_at` | timestamptz | Ingestion timestamp |

Indexes:

- Unique index on `(instrument_id, timeframe, price_time, source)`.
- Composite index on `(instrument_id, timeframe, price_time desc)`.
- Consider time-based partitioning for production.

#### `watchlists`

| Column | Type | Notes |
| --- | --- | --- |
| `id` | uuid pk | Watchlist identifier |
| `user_id` | uuid fk users | Owner |
| `name` | text not null | Example: Core ETFs |
| `is_default` | boolean | Default list |
| `created_at` | timestamptz | Audit |
| `updated_at` | timestamptz | Audit |

#### `watchlist_items`

| Column | Type | Notes |
| --- | --- | --- |
| `id` | uuid pk | Item identifier |
| `watchlist_id` | uuid fk watchlists | Parent |
| `instrument_id` | uuid fk instruments | Tracked instrument |
| `sort_order` | int | UI order |
| `notes` | text | Optional user note |
| `created_at` | timestamptz | Audit |

Unique index on `(watchlist_id, instrument_id)`.

#### `alert_rules`

| Column | Type | Notes |
| --- | --- | --- |
| `id` | uuid pk | Rule identifier |
| `user_id` | uuid fk users | Owner |
| `instrument_id` | uuid fk instruments | Target |
| `rule_type` | enum(`percent_from_high`, `percent_from_moving_average`, `rsi_threshold`, `daily_drop`, `custom`) | Dip logic |
| `threshold_value` | numeric(12,6) | Example: `5.0` for 5% dip |
| `lookback_days` | int | Window for highs/averages |
| `timeframe` | enum(`1d`, `1h`, `15m`) | Evaluation granularity |
| `enabled` | boolean | Toggle |
| `cooldown_hours` | int | Prevent repeated alerts |
| `last_triggered_at` | timestamptz | Last alert condition |
| `created_at` | timestamptz | Audit |
| `updated_at` | timestamptz | Audit |

#### `alert_events`

| Column | Type | Notes |
| --- | --- | --- |
| `id` | uuid pk | Event identifier |
| `alert_rule_id` | uuid fk alert_rules | Triggered rule |
| `user_id` | uuid fk users | Denormalized for queries |
| `instrument_id` | uuid fk instruments | Denormalized for queries |
| `event_time` | timestamptz | Detection timestamp |
| `market_price_id` | bigint fk market_prices | Price used for signal |
| `signal_value` | numeric(12,6) | Calculated dip metric |
| `threshold_value` | numeric(12,6) | Rule threshold at detection |
| `message_summary` | text | Safe, non-advisory display copy |
| `metadata` | jsonb | Calculation details and provider metadata |
| `created_at` | timestamptz | Audit |

#### `notification_deliveries`

| Column | Type | Notes |
| --- | --- | --- |
| `id` | uuid pk | Delivery identifier |
| `user_id` | uuid fk users | Recipient |
| `alert_event_id` | uuid fk alert_events nullable | Source event |
| `channel` | enum(`email`, `push`, `sms`, `webhook`) | Delivery type |
| `provider` | text | SES, SendGrid, Twilio, FCM, etc. |
| `status` | enum(`queued`, `sent`, `failed`, `suppressed`) | Delivery status |
| `failure_reason` | text | Failure detail |
| `idempotency_key` | text unique | Duplicate prevention |
| `sent_at` | timestamptz | Provider accepted time |
| `created_at` | timestamptz | Audit |

#### `investment_journal_entries`

| Column | Type | Notes |
| --- | --- | --- |
| `id` | uuid pk | Entry identifier |
| `user_id` | uuid fk users | Owner |
| `instrument_id` | uuid fk instruments | Instrument bought/tracked |
| `alert_event_id` | uuid fk alert_events nullable | Optional link to detected dip |
| `trade_date` | date not null | User-entered date |
| `quantity` | numeric(24,8) | Optional for partial shares |
| `price` | numeric(18,6) | Execution or estimated price |
| `fees` | numeric(18,6) default 0 | Optional |
| `currency` | char(3) | Entry currency |
| `source` | enum(`manual`, `import`, `broker`) | Future broker support |
| `notes` | text | User notes |
| `created_at` | timestamptz | Audit |
| `updated_at` | timestamptz | Audit |

#### `backtest_strategies`

| Column | Type | Notes |
| --- | --- | --- |
| `id` | uuid pk | Saved strategy identifier |
| `user_id` | uuid fk users nullable | Null for system templates |
| `name` | text | Strategy name |
| `description` | text | Safe educational description |
| `parameters` | jsonb | Thresholds, contribution schedule, cooldowns |
| `created_at` | timestamptz | Audit |
| `updated_at` | timestamptz | Audit |

#### `backtest_runs`

| Column | Type | Notes |
| --- | --- | --- |
| `id` | uuid pk | Run identifier |
| `user_id` | uuid fk users | Owner |
| `strategy_id` | uuid fk backtest_strategies nullable | Optional saved strategy |
| `instrument_id` | uuid fk instruments | Target instrument |
| `start_date` | date | Historical start |
| `end_date` | date | Historical end |
| `initial_cash` | numeric(18,2) | Simulation input |
| `recurring_contribution` | numeric(18,2) | Simulation input |
| `parameters` | jsonb | Frozen run inputs |
| `status` | enum(`queued`, `running`, `completed`, `failed`, `cancelled`) | Job status |
| `summary_metrics` | jsonb | CAGR, max drawdown, volatility, final value, cash deployed |
| `error_message` | text | Failure detail |
| `created_at` | timestamptz | Audit |
| `completed_at` | timestamptz | Completion |

#### `backtest_trades`

| Column | Type | Notes |
| --- | --- | --- |
| `id` | uuid pk | Simulated trade identifier |
| `backtest_run_id` | uuid fk backtest_runs | Run |
| `trade_date` | date | Simulated date |
| `action` | enum(`buy`, `sell`, `hold`, `contribution`) | Usually buy/hold for MVP |
| `quantity` | numeric(24,8) | Simulated units |
| `price` | numeric(18,6) | Simulated execution price |
| `cash_before` | numeric(18,2) | Audit |
| `cash_after` | numeric(18,2) | Audit |
| `reason` | text | Rule explanation |
| `metadata` | jsonb | Metrics at decision point |

#### `audit_logs`

| Column | Type | Notes |
| --- | --- | --- |
| `id` | uuid pk | Audit identifier |
| `user_id` | uuid fk users nullable | Actor |
| `action` | text | Example: `alert_rule.created` |
| `entity_type` | text | Entity |
| `entity_id` | text | ID as text for flexibility |
| `ip_hash` | text | Privacy-preserving trace |
| `user_agent_hash` | text | Privacy-preserving trace |
| `metadata` | jsonb | Minimal details |
| `created_at` | timestamptz | Audit time |

## 3. Folder Structure

Start with a monorepo so frontend, backend, workers, shared types, and infrastructure evolve together.

```text
sip-the-dip/
  apps/
    web/
      src/
        app/
          (auth)/
          (dashboard)/
          api/
        components/
          ui/
          charts/
          forms/
          layout/
        features/
          alerts/
          backtests/
          instruments/
          journal/
          watchlists/
        lib/
          api-client/
          auth/
          formatting/
          validation/
        stores/
        styles/
      public/
      next.config.ts
      tailwind.config.ts
    api/
      src/
        modules/
          auth/
          users/
          instruments/
          market-data/
          dip-detection/
          alerts/
          journal/
          backtesting/
          notifications/
          compliance/
        platform/
          config/
          database/
          queue/
          logger/
          metrics/
          errors/
        routes/
        server.ts
      package.json
    workers/
      src/
        jobs/
          ingest-market-data.job.ts
          evaluate-dips.job.ts
          send-notifications.job.ts
          run-backtest.job.ts
        processors/
        scheduler.ts
  packages/
    config/
    database/
      migrations/
      seeds/
      schema/
    domain/
      instruments/
      alerts/
      backtesting/
      finance-math/
    eslint-config/
    tsconfig/
    ui/
    validation/
  infra/
    docker/
    terraform/
    fly/
    vercel/
  docs/
    architecture.md
    api.md
    safety-language.md
  scripts/
    db-migrate.ts
    seed-instruments.ts
    import-market-data.ts
  package.json
  pnpm-workspace.yaml
```

### Modular monolith conventions

Each backend module should contain:

```text
module-name/
  module.ts
  controller.ts
  service.ts
  repository.ts
  schemas.ts
  types.ts
  __tests__/
```

Keep domain calculations in pure functions under `packages/domain` so they can be reused by API services, workers, and tests.

## 4. API Structure

### API design principles

- Use REST endpoints with versioned paths: `/v1/...`.
- Use JSON request/response bodies.
- Validate requests with shared schemas.
- Return safe, explanatory finance language.
- Include server-generated IDs and timestamps.
- Make writes idempotent where duplicate submissions are likely.
- Separate public marketing content from authenticated app APIs.

### Authentication and users

| Method | Path | Purpose |
| --- | --- | --- |
| `POST` | `/v1/auth/register` | Create account |
| `POST` | `/v1/auth/login` | Start session |
| `POST` | `/v1/auth/logout` | End session |
| `GET` | `/v1/me` | Current user profile |
| `PATCH` | `/v1/me` | Update timezone, display preferences |
| `POST` | `/v1/me/risk-disclaimer` | Record acceptance of educational/risk disclaimer |

### Instruments and prices

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/v1/instruments` | Search ETFs and indices |
| `GET` | `/v1/instruments/:id` | Instrument details |
| `GET` | `/v1/instruments/:id/prices` | Historical prices by timeframe/date range |
| `GET` | `/v1/instruments/:id/dip-status` | Current dip metrics for default/user-selected rules |

### Watchlists

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/v1/watchlists` | List user watchlists |
| `POST` | `/v1/watchlists` | Create watchlist |
| `GET` | `/v1/watchlists/:id` | Watchlist with items and latest dip status |
| `PATCH` | `/v1/watchlists/:id` | Rename or update default flag |
| `DELETE` | `/v1/watchlists/:id` | Remove watchlist |
| `POST` | `/v1/watchlists/:id/items` | Add instrument |
| `DELETE` | `/v1/watchlists/:id/items/:itemId` | Remove instrument |

### Alerts

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/v1/alert-rules` | List user alert rules |
| `POST` | `/v1/alert-rules` | Create alert rule |
| `GET` | `/v1/alert-rules/:id` | Rule detail |
| `PATCH` | `/v1/alert-rules/:id` | Update thresholds, cooldowns, enabled state |
| `DELETE` | `/v1/alert-rules/:id` | Delete rule |
| `GET` | `/v1/alert-events` | Alert history |
| `GET` | `/v1/alert-events/:id` | Alert details and calculation explanation |
| `POST` | `/v1/alert-rules/:id/test` | Preview rule using latest or sample historical data |

### Journal

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/v1/journal-entries` | List manual investment entries |
| `POST` | `/v1/journal-entries` | Create manual entry |
| `GET` | `/v1/journal-entries/:id` | Entry detail |
| `PATCH` | `/v1/journal-entries/:id` | Update entry |
| `DELETE` | `/v1/journal-entries/:id` | Delete entry |
| `GET` | `/v1/journal-summary` | Aggregated user-entered activity summary |

### Backtesting

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/v1/backtest-strategies` | Saved and template strategies |
| `POST` | `/v1/backtest-strategies` | Save reusable strategy |
| `POST` | `/v1/backtest-runs` | Queue a backtest run |
| `GET` | `/v1/backtest-runs` | List runs |
| `GET` | `/v1/backtest-runs/:id` | Run status and results |
| `GET` | `/v1/backtest-runs/:id/trades` | Simulated trades |
| `POST` | `/v1/backtest-runs/:id/cancel` | Cancel queued/running run |

### Notifications

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/v1/notification-preferences` | User notification settings |
| `PATCH` | `/v1/notification-preferences` | Update channels and quiet hours |
| `GET` | `/v1/notification-deliveries` | Delivery history |
| `POST` | `/v1/notification-preferences/test` | Send test notification |

## 5. State Management Recommendation

Use a layered state strategy rather than a single global store.

### Recommended tools

- **Server state:** TanStack Query for authenticated API data, caching, retries, pagination, and background refresh.
- **URL state:** Next.js search params for filters, selected tabs, chart ranges, and backtest result views.
- **Local form state:** React Hook Form plus schema validation for alert setup, journal entries, and backtest forms.
- **Small client state:** Zustand for cross-page UI state such as mobile navigation state, active watchlist, dismissed banners, and ephemeral compare selections.
- **Server Components:** Use Next.js Server Components for low-interactivity data reads where possible.

### State boundaries

| State type | Owner | Examples |
| --- | --- | --- |
| Durable user data | PostgreSQL/API | Alert rules, journal entries, backtest runs |
| Cached server data | TanStack Query | Watchlists, latest prices, alert history |
| Shareable navigation state | URL | Selected instrument, date range, backtest tab |
| Form draft state | React Hook Form | New alert rule, manual purchase entry |
| UI-only state | Zustand/component state | Modal visibility, mobile nav, onboarding tooltip |

## 6. Backtesting Engine Architecture

### Goals

- Deterministic and reproducible simulations.
- Explicit inputs and assumptions.
- Clear separation between historical data access, strategy logic, simulation execution, and result reporting.
- No claims that past performance predicts future results.

### Engine components

```text
Backtest API
  |
  | creates backtest_runs row + queues job
  v
Backtest Worker
  |
  +-- Input Validator
  +-- Historical Data Loader
  +-- Strategy Evaluator
  +-- Execution Simulator
  +-- Portfolio Ledger
  +-- Metrics Calculator
  +-- Result Persister
```

### Strategy interface

Each strategy should implement a common interface:

```text
StrategyInput:
  - instrument
  - current bar
  - historical window
  - portfolio state
  - parameters

StrategyDecision:
  - action: buy | hold | sell
  - cash_amount or quantity
  - reason
  - metrics snapshot
```

### MVP strategies

- **Percent from recent high:** Buy when price is at least X% below N-day high.
- **Daily drawdown:** Buy when daily close is down at least X% from prior close.
- **Moving-average dip:** Buy when price is X% below N-day moving average.
- **Scheduled baseline:** Dollar-cost averaging baseline for comparison.

### Simulation assumptions

- Use adjusted close for daily backtests unless the user selects another basis.
- Model fees, slippage, fractional-share support, contribution schedule, and maximum buy frequency as explicit inputs.
- Use a deterministic event loop over historical bars.
- Persist all parameter values with the run so results remain reproducible after strategy templates change.
- Include warnings for survivorship bias, data quality limitations, dividends, taxes, inflation, and provider coverage.

### Metrics

- Final portfolio value.
- Cash deployed and remaining cash.
- Total return and annualized return.
- Maximum drawdown.
- Volatility.
- Number of simulated buys.
- Average purchase price.
- Comparison against scheduled investing baseline.
- Time in market and missed-signal count.

### Scaling backtests

- Queue long-running backtests.
- Cache normalized historical data by instrument/timeframe.
- Store run outputs incrementally for progress updates.
- Add cancellation checks between simulation chunks.
- Move computationally heavy analytics into a dedicated worker pool when usage grows.

## 7. Notification Architecture

### Notification flow

```text
Market Data Ingestion Job
  |
  v
Price Normalization + Persistence
  |
  v
Dip Evaluation Job
  |
  +-- Load active alert rules by instrument/timeframe
  +-- Compute signal values
  +-- Apply cooldowns, quiet hours, and idempotency checks
  +-- Persist alert_events
  |
  v
Notification Fanout Job
  |
  +-- Render safe template
  +-- Select enabled channels
  +-- Send via provider adapter
  +-- Persist delivery status
```

### Design details

- **Queue:** BullMQ or a cloud-native queue such as SQS, depending on deployment target.
- **Scheduling:** Use a scheduler for market-open polling, daily close jobs, and retry sweeps.
- **Provider adapters:** Abstract email, push, SMS, and webhook providers behind a common interface.
- **Idempotency:** Generate one idempotency key per user, alert rule, signal bucket, and channel.
- **Cooldowns:** Enforce at database and cache levels to prevent duplicate alerts.
- **Quiet hours:** Suppress or delay notifications based on the user's timezone and preferences.
- **Safe templates:** Alerts should use language like “Your configured condition was detected for SPY” instead of “Buy SPY now.”
- **Delivery audit:** Store provider status, timestamps, failure reasons, and retry counts.

### Notification channels by phase

| Phase | Channels |
| --- | --- |
| MVP | Email and in-app alert history |
| V1 | Web push and mobile push via PWA support |
| V2 | SMS for premium users with explicit consent |
| V3 | Webhooks and broker/workflow integrations |

## 8. Deployment Strategy

### MVP deployment

- **Frontend:** Vercel for Next.js hosting, preview deployments, and edge caching.
- **Backend API:** Render, Fly.io, Railway, or AWS ECS/Fargate running the Node.js API.
- **Workers:** Separate Node.js worker process on the same platform as the API.
- **Database:** Managed PostgreSQL such as Neon, Supabase, RDS, or Crunchy Bridge.
- **Queue/cache:** Managed Redis such as Upstash, Redis Cloud, or ElastiCache.
- **Email:** Resend, Postmark, SendGrid, or AWS SES.
- **Monitoring:** Sentry for application errors and OpenTelemetry-compatible metrics/logs.

### Production deployment

```text
CDN/WAF
  |
  +-- Vercel/Next.js frontend
  |
  +-- API load balancer
        |
        +-- Node.js API containers
        +-- Worker containers
        +-- Scheduler container
        |
        +-- PostgreSQL primary + read replica
        +-- Redis/queue
        +-- Object storage for exports/reports
```

### Environments

- `local`: Docker Compose for PostgreSQL, Redis, API, workers, and web.
- `preview`: Ephemeral frontend deployments with isolated API/database branch when practical.
- `staging`: Production-like data shape with sanitized data.
- `production`: Locked-down secrets, observability, backups, and runbooks.

### CI/CD

- Typecheck, lint, tests, and migration checks on every pull request.
- Build frontend, API, and workers separately.
- Run database migrations with backward-compatible expand/contract patterns.
- Use feature flags for alerts, paid features, provider changes, and broker integrations.

## 9. Security Considerations

### Application security

- Use secure, HTTP-only session cookies or a proven auth provider.
- Enforce CSRF protection for cookie-based authenticated mutations.
- Validate all inputs at API boundaries with shared schemas.
- Use row-level authorization checks for all user-owned data.
- Rate-limit login, registration, alert testing, and notification test endpoints.
- Protect against SSRF in future webhook or broker callback features.
- Use strict Content Security Policy headers.
- Store secrets in a managed secret store, never in source control.

### Data protection

- Encrypt data in transit with TLS and at rest via managed database/storage encryption.
- Hash or tokenize sensitive audit metadata such as IP addresses.
- Minimize PII collection; avoid storing unnecessary broker account data.
- Store notification destinations securely and verify email/phone ownership before sending.
- Add data export and deletion workflows for privacy compliance.
- Keep market data provider licenses and retention limits documented.

### Financial safety and compliance positioning

- Do not use phrases such as “guaranteed,” “risk-free,” “should buy,” or “recommended allocation.”
- Label backtests as hypothetical simulations using historical data.
- Show assumptions and limitations next to performance metrics.
- Require acceptance of educational-use and risk disclaimers before enabling alerts or backtests.
- Provide neutral alert copy and avoid personalized advice.
- Maintain audit logs for disclaimer acceptance and rule creation.
- Involve qualified legal/compliance counsel before broker integrations, order placement, or personalized recommendations.

### Broker integration readiness

- Isolate future broker features behind a `broker-adapters` module.
- Use OAuth where available; never store broker passwords.
- Encrypt access and refresh tokens with envelope encryption.
- Use read-only scopes first for holdings/import features.
- Require explicit confirmation and additional compliance review before any trade execution feature.

## 10. MVP vs Scalable Production Architecture

### MVP architecture

| Area | MVP choice | Rationale |
| --- | --- | --- |
| App architecture | Monorepo modular monolith | Fast iteration with clean boundaries |
| Frontend | Next.js + Tailwind CSS | Mobile-first responsive web app |
| API | Node.js REST API | Simple contracts and broad ecosystem support |
| Database | Managed PostgreSQL | Reliable relational source of truth |
| Queue | Redis-backed queue | Enough for ingestion, alerts, and backtests |
| Market data | One primary provider | Reduce normalization complexity |
| Notifications | Email + in-app history | Lower consent and delivery complexity |
| Backtesting | Async worker jobs | Avoid blocking API requests |
| Auth | Managed auth or session-based auth | Reduce security risk |
| Observability | Sentry + structured logs | Debuggability from day one |

### MVP feature scope

- User registration and login.
- ETF/index search.
- Watchlist creation.
- Basic daily price ingestion.
- User-configured dip alert rules.
- Email and in-app alert history.
- Manual journal entries for dip purchases.
- Daily backtests for percent-from-high and scheduled baseline strategies.
- Safe educational disclaimers and neutral copy.

### Scalable production architecture

| Area | Production evolution |
| --- | --- |
| Services | Split high-load modules into separate services: ingestion, notification, backtesting |
| Data | Partition market prices, add read replicas, introduce warehouse/analytics storage |
| Events | Use event bus for `price.ingested`, `dip.detected`, `notification.sent`, `backtest.completed` |
| Notifications | Multi-channel provider failover, templates, suppression rules, preference center |
| Market data | Multi-provider normalization, fallback providers, data quality scoring |
| Backtesting | Dedicated worker pool, cached factor data, parallel simulations, result exports |
| Security | Advanced threat monitoring, SOC 2 controls, SSO for internal tools |
| Compliance | Formal review workflows, retention policies, broker integration controls |
| Broker readiness | Read-only account import, reconciliation, and eventually execution only after compliance approval |

### Suggested build phases

1. **Foundation:** Monorepo, design system, auth, database migrations, instruments, market data ingestion.
2. **Tracking MVP:** Watchlists, dip status cards, manual journal entries, safe copy system.
3. **Alerts MVP:** Alert rules, daily dip checks, email/in-app notifications, delivery audit logs.
4. **Backtesting MVP:** Async backtest jobs, two strategies, result dashboards, assumptions panel.
5. **Scale hardening:** Redis queue tuning, rate limits, observability, data quality checks, provider abstraction.
6. **Integration readiness:** Public API structure, webhook notifications, broker-adapter interfaces, stronger compliance workflows.
