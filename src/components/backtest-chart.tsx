import type { EquityCurvePoint } from "@/server/backtesting";
import { formatCurrency } from "@/lib/utils";

type BacktestChartProps = {
  data: EquityCurvePoint[];
};

function makePoints(data: EquityCurvePoint[], key: "dipValue" | "sipValue") {
  const allValues = data.flatMap((point) => [point.dipValue, point.sipValue]);
  const min = Math.min(...allValues) * 0.96;
  const max = Math.max(...allValues) * 1.04;
  return data
    .map((point, index) => {
      const x = 24 + (index / Math.max(data.length - 1, 1)) * 312;
      const y = 212 - ((point[key] - min) / Math.max(max - min, 1)) * 172;
      return `${x},${y}`;
    })
    .join(" ");
}

export function BacktestChart({ data }: BacktestChartProps) {
  const dipPoints = makePoints(data, "dipValue");
  const sipPoints = makePoints(data, "sipValue");
  const labelEvery = Math.ceil(data.length / 6);

  return (
    <div className="w-full">
      <div className="mb-4 flex flex-wrap items-center gap-4 text-sm font-semibold">
        <span className="inline-flex items-center gap-2 text-mint-700"><span className="h-2.5 w-2.5 rounded-full bg-mint-600" /> Dip strategy</span>
        <span className="inline-flex items-center gap-2 text-ink-500"><span className="h-2.5 w-2.5 rounded-full bg-ink-300" /> Regular SIP</span>
      </div>
      <svg className="h-72 w-full" viewBox="0 0 360 240" role="img" aria-label="Backtest comparison line chart">
        {[52, 92, 132, 172, 212].map((y) => (
          <line key={y} x1="24" x2="336" y1={y} y2={y} stroke="#e5e7eb" strokeDasharray="4 5" />
        ))}
        <polyline points={sipPoints} fill="none" stroke="#94a3b8" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        <polyline points={dipPoints} fill="none" stroke="#059669" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        {data.map((point, index) => {
          if (index % labelEvery !== 0 && index !== data.length - 1) {
            return null;
          }

          const x = 24 + (index / Math.max(data.length - 1, 1)) * 312;
          return <text key={point.date} x={x} y="232" textAnchor="middle" className="fill-ink-500 text-[10px] font-semibold">{point.label}</text>;
        })}
      </svg>
      <div className="sr-only">
        {data.map((point) => `${point.date}: dip strategy ${formatCurrency(point.dipValue)}, regular SIP ${formatCurrency(point.sipValue)}. `)}
      </div>
    </div>
  );
}
