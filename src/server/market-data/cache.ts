import type { CacheEntry } from "./types";

export class MarketDataCache {
  private readonly entries = new Map<string, CacheEntry<unknown>>();

  get<T>(key: string, now = new Date()): T | undefined {
    const entry = this.entries.get(key) as CacheEntry<T> | undefined;
    if (!entry || entry.expiresAt.getTime() <= now.getTime()) {
      return undefined;
    }

    return entry.value;
  }

  getStale<T>(key: string, maxAgeMs: number, now = new Date()): T | undefined {
    const entry = this.entries.get(key) as CacheEntry<T> | undefined;
    if (!entry || now.getTime() - entry.storedAt.getTime() > maxAgeMs) {
      return undefined;
    }

    return entry.value;
  }

  set<T>(key: string, value: T, ttlMs: number, now = new Date()): void {
    this.entries.set(key, {
      value,
      storedAt: now,
      expiresAt: new Date(now.getTime() + ttlMs),
    });
  }

  clear(): void {
    this.entries.clear();
  }
}
