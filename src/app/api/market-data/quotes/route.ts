import { MarketDataError, MarketDataService } from "@/server/market-data";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const symbols = (url.searchParams.get("symbols") ?? "NIFTYBEES,NIFTY 50")
    .split(",")
    .map((symbol) => symbol.trim())
    .filter(Boolean);

  const service = new MarketDataService();

  try {
    const quotes = await service.getQuotes(symbols);
    return Response.json({ quotes });
  } catch (error) {
    const status = error instanceof MarketDataError && !error.retryable ? 400 : 503;
    return Response.json(
      {
        error: error instanceof Error ? error.message : "Unknown market data error.",
      },
      { status },
    );
  }
}
