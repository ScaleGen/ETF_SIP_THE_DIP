# Market Data Integration

Sip the Dip uses a provider-adapter architecture for Indian ETF and index market data.

## Providers

- `YahooChartProvider`: real HTTP chart endpoint for Indian symbols such as `NIFTYBEES.NS`, `BANKBEES.NS`, `^NSEI`, and `^NSEBANK`.
- `NseIndiaProvider`: official NSE quote endpoints for Indian ETFs and indices. This is intended as a direct exchange-source adapter, with scheduled EOD archive ingestion added behind the same interface.
- `MockFallbackProvider`: deterministic fallback quotes/history so dip detection, backtests, and UI flows remain available if upstream providers are unavailable.

## Resilience

- `MarketDataCache` keeps short-lived fresh data and longer stale data for provider outages.
- `TokenBucketRateLimiter` protects upstream providers from request bursts.
- `MarketDataService` tries providers in priority order and returns stale/fallback data when needed.
- `buildMarketDataUpdatePlan` defines India-market schedules for intraday refreshes, end-of-day refreshes, and fallback staleness checks.

## Production path

For production, replace or augment the default adapters with a licensed vendor or official NSE data subscription where required. The service API and provider contract stay the same.
