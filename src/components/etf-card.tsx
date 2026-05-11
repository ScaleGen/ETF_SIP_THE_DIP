import { StatusPill } from "@/components/status-pill";
import type { Etf } from "@/data/mock-data";
import { formatPercent } from "@/lib/utils";

export function EtfCard({ etf }: { etf: Etf }) {
  const min = Math.min(...etf.sparkline);
  const max = Math.max(...etf.sparkline);
  const points = etf.sparkline
    .map((value, index) => {
      const x = (index / (etf.sparkline.length - 1)) * 100;
      const y = 36 - ((value - min) / Math.max(max - min, 1)) * 28;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <article className="rounded-3xl border border-ink-100 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-soft">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-black text-ink-900">{etf.symbol}</h3>
            <StatusPill status={etf.status} />
          </div>
          <p className="mt-1 line-clamp-1 text-sm text-ink-500">{etf.name}</p>
        </div>
        <div className="text-right">
          <p className="text-base font-bold text-ink-900">${etf.price.toFixed(2)}</p>
          <p className={etf.changePct < 0 ? "text-sm font-semibold text-rose-600" : "text-sm font-semibold text-mint-700"}>{formatPercent(etf.changePct)}</p>
        </div>
      </div>
      <svg className="mt-4 h-12 w-full" viewBox="0 0 100 40" role="img" aria-label={`${etf.symbol} seven point price trend`}>
        <polyline points={points} fill="none" stroke={etf.changePct < 0 ? "#e11d48" : "#059669"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" />
      </svg>
      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-2xl bg-ink-50 p-3">
          <p className="font-semibold text-ink-500">From high</p>
          <p className="mt-1 font-black text-ink-900">{formatPercent(etf.dipFromHighPct)}</p>
        </div>
        <div className="rounded-2xl bg-ink-50 p-3">
          <p className="font-semibold text-ink-500">Your rule</p>
          <p className="mt-1 font-black text-ink-900">{formatPercent(etf.thresholdPct)}</p>
        </div>
      </div>
    </article>
  );
}
