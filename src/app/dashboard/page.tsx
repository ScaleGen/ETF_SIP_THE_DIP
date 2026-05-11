import { BellIcon, PieIcon, DollarIcon, ChartIcon } from "@/components/icons";
import { AllocationBars } from "@/components/allocation-bars";
import { AppShell } from "@/components/app-shell";
import { Card, CardHeader } from "@/components/card";
import { Disclaimer } from "@/components/disclaimer";
import { EtfCard } from "@/components/etf-card";
import { MetricCard } from "@/components/metric-card";
import { PageHeading } from "@/components/page-heading";
import { PortfolioChart } from "@/components/portfolio-chart";
import { alerts, etfs } from "@/data/mock-data";
import { formatCurrency } from "@/lib/utils";

export default function DashboardPage() {
  return (
    <AppShell>
      <PageHeading
        eyebrow="Dashboard"
        title="Your dip command center"
        description="Monitor mock ETF conditions, recent neutral alerts, and manually tracked activity from one mobile-first workspace."
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Mock portfolio" value={formatCurrency(100350)} helper="For UI demonstration only" icon={<DollarIcon className="h-5 w-5" />} />
        <MetricCard label="Active rules" value="8" helper="Across 4 ETFs" tone="positive" icon={<BellIcon className="h-5 w-5" />} />
        <MetricCard label="Detected dips" value="2" helper="User-defined conditions" tone="warning" icon={<ChartIcon className="h-5 w-5" />} />
        <MetricCard label="Manual logs" value="12" helper="No broker connected" icon={<PieIcon className="h-5 w-5" />} />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.35fr_.65fr]">
        <Card>
          <CardHeader eyebrow="Trend" title="Mock portfolio path" />
          <PortfolioChart />
        </Card>
        <Card>
          <CardHeader eyebrow="Allocation" title="Tracked ETF mix" />
          <AllocationBars />
        </Card>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_.8fr]">
        <div>
          <CardHeader eyebrow="Watchlist" title="Top ETF conditions" />
          <div className="grid gap-4 sm:grid-cols-2">
            {etfs.slice(0, 4).map((etf) => (
              <EtfCard key={etf.symbol} etf={etf} />
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <Card>
            <CardHeader eyebrow="Recent" title="Latest neutral alerts" />
            <div className="space-y-3">
              {alerts.slice(0, 3).map((alert) => (
                <div key={`${alert.symbol}-${alert.time}`} className="rounded-2xl bg-ink-50 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-black text-ink-900">{alert.symbol}</p>
                    <p className="text-xs font-semibold text-ink-500">{alert.time}</p>
                  </div>
                  <p className="mt-1 text-sm font-semibold text-ink-800">{alert.title}</p>
                  <p className="mt-1 text-sm leading-6 text-ink-600">{alert.detail}</p>
                </div>
              ))}
            </div>
          </Card>
          <Disclaimer compact />
        </div>
      </div>
    </AppShell>
  );
}
