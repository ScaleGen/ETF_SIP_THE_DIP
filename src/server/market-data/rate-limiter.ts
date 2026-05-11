import { RateLimitExceededError } from "./errors";

export class TokenBucketRateLimiter {
  private tokens: number;
  private lastRefillAt: number;

  constructor(
    private readonly provider: string,
    private readonly capacity: number,
    private readonly refillPerMinute: number,
  ) {
    this.tokens = capacity;
    this.lastRefillAt = Date.now();
  }

  consume(now = Date.now()): void {
    this.refill(now);

    if (this.tokens < 1) {
      throw new RateLimitExceededError(this.provider);
    }

    this.tokens -= 1;
  }

  private refill(now: number): void {
    const elapsedMinutes = (now - this.lastRefillAt) / 60_000;
    const refillAmount = elapsedMinutes * this.refillPerMinute;

    if (refillAmount <= 0) {
      return;
    }

    this.tokens = Math.min(this.capacity, this.tokens + refillAmount);
    this.lastRefillAt = now;
  }
}
