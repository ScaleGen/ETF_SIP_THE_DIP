import type { MarketInstrument } from "./types";

export const indianMarketInstruments: MarketInstrument[] = [
  {
    id: "nse-etf-niftybees",
    symbol: "NIFTYBEES",
    name: "Nippon India ETF Nifty 50 BeES",
    assetType: "indian_etf",
    exchange: "NSE",
    currency: "INR",
    providerSymbols: {
      yahoo_chart: "NIFTYBEES.NS",
      nse_india: "NIFTYBEES",
      mock_fallback: "NIFTYBEES",
    },
  },
  {
    id: "nse-etf-bankbees",
    symbol: "BANKBEES",
    name: "Nippon India ETF Bank BeES",
    assetType: "indian_etf",
    exchange: "NSE",
    currency: "INR",
    providerSymbols: {
      yahoo_chart: "BANKBEES.NS",
      nse_india: "BANKBEES",
      mock_fallback: "BANKBEES",
    },
  },
  {
    id: "nse-index-nifty-50",
    symbol: "NIFTY 50",
    name: "NIFTY 50 Index",
    assetType: "indian_index",
    exchange: "NSE_INDICES",
    currency: "INR",
    providerSymbols: {
      yahoo_chart: "^NSEI",
      nse_india: "NIFTY 50",
      mock_fallback: "NIFTY 50",
    },
  },
  {
    id: "nse-index-nifty-bank",
    symbol: "NIFTY BANK",
    name: "NIFTY Bank Index",
    assetType: "indian_index",
    exchange: "NSE_INDICES",
    currency: "INR",
    providerSymbols: {
      yahoo_chart: "^NSEBANK",
      nse_india: "NIFTY BANK",
      mock_fallback: "NIFTY BANK",
    },
  },
];

export function findIndianInstrument(symbolOrId: string): MarketInstrument | undefined {
  const normalized = symbolOrId.trim().toUpperCase();
  return indianMarketInstruments.find(
    (instrument) =>
      instrument.id.toUpperCase() === normalized ||
      instrument.symbol.toUpperCase() === normalized ||
      Object.values(instrument.providerSymbols).some((symbol) => symbol?.toUpperCase() === normalized),
  );
}
