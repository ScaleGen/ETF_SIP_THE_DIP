export class MarketDataError extends Error {
  constructor(message: string, readonly provider?: string, readonly retryable = true) {
    super(message);
    this.name = "MarketDataError";
  }
}

export class RateLimitExceededError extends MarketDataError {
  constructor(provider: string) {
    super(`Rate limit exceeded for ${provider}.`, provider, true);
    this.name = "RateLimitExceededError";
  }
}
