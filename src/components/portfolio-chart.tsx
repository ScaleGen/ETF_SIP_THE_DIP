import { dashboardSeries } from "@/data/mock-data";
import { formatCurrency } from "@/lib/utils";

export function PortfolioChart() {
  const values = dashboardSeries.map((point) => point.value);
  const min = Math.min(...values) - 700;
  const max = Math.max(...values) + 700;
  const points = dashboardSeries
    .map((point, index) => {
      const x = 24 + (index / (dashboardSeries.length - 1)) * 312;
      const y = 212 - ((point.value - min) / (max - min)) * 172;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div className="w-full">
      <svg className="h-72 w-full" viewBox="0 0 360 240" role="img" aria-label="Mock portfolio value line chart">
        <defs>
          <linearGradient id="portfolioFill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[52, 92, 132, 172, 212].map((y) => (
          <line key={y} x1="24" x2="336" y1={y} y2={y} stroke="#e5e7eb" strokeDasharray="4 5" />
        ))}
        <polygon points={`24,212 ${points} 336,212`} fill="url(#portfolioFill)" />
        <polyline points={points} fill="none" stroke="#059669" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        {dashboardSeries.map((point, index) => {
          const x = 24 + (index / (dashboardSeries.length - 1)) * 312;
          return (
            <g key={point.label}>
              <text x={x} y="232" textAnchor="middle" className="fill-ink-500 text-[10px] font-semibold">{point.label}</text>
            </g>
          );
        })}
      </svg>
      <div className="sr-only">
        {dashboardSeries.map((point) => `${point.label}: ${formatCurrency(point.value)}. `)}
      </div>
    </div>
  );
}
