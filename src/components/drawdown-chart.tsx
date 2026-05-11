import type { EquityCurvePoint } from "@/server/backtesting";
import { formatPercent } from "@/lib/utils";

export function DrawdownChart({ data }: { data: EquityCurvePoint[] }) {
  const visiblePoints = data.filter((_, index) => index % Math.ceil(data.length / 12) === 0 || index === data.length - 1);

  return (
    <div className="space-y-3">
      {visiblePoints.map((point) => (
        <div key={point.date} className="grid grid-cols-[3rem_1fr] items-center gap-3 text-sm">
          <span className="font-semibold text-ink-500">{point.label}</span>
          <div className="space-y-1.5">
            <div className="h-2 overflow-hidden rounded-full bg-ink-100">
              <div className="h-full rounded-full bg-mint-500" style={{ width: `${Math.min(Math.abs(point.dipDrawdownPercent) * 6, 100)}%` }} />
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-ink-100">
              <div className="h-full rounded-full bg-ink-300" style={{ width: `${Math.min(Math.abs(point.sipDrawdownPercent) * 6, 100)}%` }} />
            </div>
          </div>
        </div>
      ))}
      <div className="flex flex-wrap gap-4 text-xs font-semibold text-ink-500">
        <span className="inline-flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-mint-500" /> Dip drawdown</span>
        <span className="inline-flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-ink-300" /> SIP drawdown</span>
      </div>
      <p className="text-xs leading-5 text-ink-500">Bars show drawdown magnitude from each strategy&apos;s prior portfolio peak. Latest dip drawdown: {formatPercent(data.at(-1)?.dipDrawdownPercent ?? 0)}.</p>
    </div>
  );
}
