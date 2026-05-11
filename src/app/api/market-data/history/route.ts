import { MarketDataError, MarketDataService, type MarketDataRange } from "@/server/market-data";

const supportedRanges: MarketDataRange[] = ["1mo", "6mo", "1y", "5y"];

export async function GET(request: Request) {
  const url = new URL(request.url);
  const symbol = url.searchParams.get("symbol") ?? "NIFTYBEES";
  const rangeParam = url.searchParams.get("range") ?? "1y";
  const range = supportedRanges.includes(rangeParam as MarketDataRange) ? (rangeParam as MarketDataRange) : "1y";
  const service = new MarketDataService();

  try {
    const history = await service.getHistory(symbol, range);
    return Response.json({ symbol, range, history });
  } catch (error) {
    const status = error instanceof MarketDataError && !error.retryable ? 400 : 503;
    return Response.json(
      {
        error: error instanceof Error ? error.message : "Unknown historical market data error.",
      },
      { status },
    );
  }
}
