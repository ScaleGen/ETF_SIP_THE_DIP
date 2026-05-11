import { indianMarketInstruments } from "./instruments";
import { MarketDataService } from "./service";
import type { MarketQuote } from "./types";

export type MarketDataUpdatePlan = {
  timezone: "Asia/Kolkata";
  jobs: Array<{
    name: string;
    cron: string;
    description: string;
  }>;
};

export function buildMarketDataUpdatePlan(): MarketDataUpdatePlan {
  return {
    timezone: "Asia/Kolkata",
    jobs: [
      {
        name: "intraday-indian-market-quotes",
        cron: "*/15 9-15 * * 1-5",
        description: "Refresh tracked Indian ETFs and indices every 15 minutes during NSE market hours.",
      },
      {
        name: "eod-indian-market-prices",
        cron: "30 18 * * 1-5",
        description: "Refresh end-of-day prices after close and run dip detection/notification workflows.",
      },
      {
        name: "fallback-staleness-check",
        cron: "0 8 * * 1-5",
        description: "Check stale cache coverage before market open and mark instruments using fallback data.",
      },
    ],
  };
}

export async function refreshTrackedIndianMarketData(service = new MarketDataService()): Promise<MarketQuote[]> {
  return service.getQuotes(indianMarketInstruments.map((instrument) => instrument.id));
}
