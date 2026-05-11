import { runMockBacktest } from "@/server/backtesting";

export function GET() {
  return Response.json(runMockBacktest());
}
