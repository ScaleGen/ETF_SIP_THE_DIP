import { etfs } from "@/data/mock-data";

export function AllocationBars() {
  return (
    <div className="space-y-4">
      {etfs.map((etf) => (
        <div key={etf.symbol}>
          <div className="flex items-center justify-between text-sm">
            <span className="font-bold text-ink-800">{etf.symbol}</span>
            <span className="font-semibold text-ink-500">{etf.allocation}% mock allocation</span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-ink-100">
            <div className="h-full rounded-full bg-mint-500" style={{ width: `${etf.allocation}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}
