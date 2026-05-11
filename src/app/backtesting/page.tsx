import { CalculatorIcon, ChartIcon, DollarIcon, WarningIcon } from "@/components/icons";
import { AppShell } from "@/components/app-shell";
import { BacktestChart } from "@/components/backtest-chart";
import { Button } from "@/components/button";
import { Card, CardHeader } from "@/components/card";
import { Disclaimer } from "@/components/disclaimer";
import { DrawdownChart } from "@/components/drawdown-chart";
import { MetricCard } from "@/components/metric-card";
import { PageHeading } from "@/components/page-heading";
import { formatCurrency, formatPercent } from "@/lib/utils";
import { runMockBacktest } from "@/server/backtesting";

export default function BacktestingPage() {
  const result = runMockBacktest();
  const dipAdvantage = result.dip.finalPortfolioValue - result.sip.finalPortfolioValue;

  return (
    <AppShell>
      <PageHeading
        eyebrow="Backtesting"
        title="Explore hypothetical strategies"
        description="Compare a user-defined dip investing rule against regular SIP using mock historical ETF data, transparent assumptions, and beginner-friendly explanations."
        action={<Button className="w-full sm:w-auto">Run mock test</Button>}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Dip final value" value={formatCurrency(result.dip.finalPortfolioValue)} helper={`${formatCurrency(dipAdvantage)} vs regular SIP`} tone={dipAdvantage >= 0 ? "positive" : "warning"} icon={<DollarIcon className="h-5 w-5" />} />
        <MetricCard label="Regular SIP value" value={formatCurrency(result.sip.finalPortfolioValue)} helper={`${formatCurrency(result.sip.totalInvested)} total invested`} icon={<CalculatorIcon className="h-5 w-5" />} />
        <MetricCard label="Dip opportunities" value={String(result.dipOpportunities)} helper={`${result.assumptions.dipThresholdPercentFromPreviousClose}% below previous close`} tone="warning" icon={<WarningIcon className="h-5 w-5" />} />
        <MetricCard label="Dip CAGR" value={formatPercent(result.dip.cagrPercent)} helper={`SIP CAGR ${formatPercent(result.sip.cagrPercent)}`} tone="positive" icon={<ChartIcon className="h-5 w-5" />} />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.25fr_.75fr]">
        <Card>
          <CardHeader eyebrow="Result" title="Dip strategy vs regular SIP" />
          <BacktestChart data={result.equityCurve} />
        </Card>
        <Card>
          <CardHeader eyebrow="Drawdowns" title="Peak-to-trough risk view" />
          <DrawdownChart data={result.equityCurve} />
        </Card>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[.9fr_1.1fr]">
        <Card>
          <CardHeader eyebrow="Metrics" title="Strategy comparison" />
          <div className="overflow-hidden rounded-2xl border border-ink-100 bg-white">
            {[
              ["Total invested", formatCurrency(result.dip.totalInvested), formatCurrency(result.sip.totalInvested)],
              ["Units accumulated", result.dip.unitsAccumulated.toFixed(4), result.sip.unitsAccumulated.toFixed(4)],
              ["Final portfolio value", formatCurrency(result.dip.finalPortfolioValue), formatCurrency(result.sip.finalPortfolioValue)],
              ["Cash remaining", formatCurrency(result.dip.cashRemaining), formatCurrency(result.sip.cashRemaining)],
              ["CAGR", formatPercent(result.dip.cagrPercent), formatPercent(result.sip.cagrPercent)],
              ["Max drawdown", formatPercent(result.dip.maxDrawdownPercent), formatPercent(result.sip.maxDrawdownPercent)],
            ].map(([label, dip, sip]) => (
              <div key={label} className="grid grid-cols-[1fr_.7fr_.7fr] gap-3 border-b border-ink-100 p-4 text-sm last:border-b-0">
                <p className="font-semibold text-ink-500">{label}</p>
                <p className="text-right font-black text-mint-700">{dip}</p>
                <p className="text-right font-black text-ink-700">{sip}</p>
              </div>
            ))}
          </div>
          <div className="mt-3 grid grid-cols-[1fr_.7fr_.7fr] gap-3 px-4 text-xs font-bold uppercase tracking-wide text-ink-400">
            <span />
            <span className="text-right">Dip</span>
            <span className="text-right">SIP</span>
          </div>
        </Card>

        <Card>
          <CardHeader eyebrow="Algorithm" title="How this mock test runs" />
          <ol className="space-y-3">
            {result.algorithm.map((step, index) => (
              <li key={step} className="flex gap-3 rounded-2xl bg-ink-50 p-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-sm font-black text-mint-700">{index + 1}</span>
                <p className="text-sm leading-6 text-ink-700">{step}</p>
              </li>
            ))}
          </ol>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[.75fr_1.25fr]">
        <Card>
          <CardHeader eyebrow="Assumptions" title="Simulation setup" />
          <div className="space-y-3">
            {[
              ["Instrument", `${result.symbol} mock close data`],
              ["Dip rule", `${result.assumptions.dipThresholdPercentFromPreviousClose}% below previous close`],
              ["Contribution", `${formatCurrency(result.assumptions.recurringContribution)} per period`],
              ["Cooldown", `${result.assumptions.cooldownPeriods ?? 0} period(s)`],
              ["Fees/slippage", `${result.assumptions.feePercent ?? 0}% estimated cost`],
              ["Window", `${result.startDate} to ${result.endDate}`],
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between gap-4 rounded-2xl bg-ink-50 p-4">
                <p className="text-sm font-semibold text-ink-500">{label}</p>
                <p className="text-right text-sm font-black text-ink-900">{value}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader eyebrow="Recent simulated trades" title="Dip buys and SIP buys" />
          <div className="grid gap-3 sm:grid-cols-2">
            {result.trades.filter((trade) => trade.action === "buy").slice(-6).map((trade) => (
              <div key={`${trade.strategy}-${trade.date}-${trade.cashAmount}`} className="rounded-2xl bg-ink-50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-black uppercase text-ink-900">{trade.strategy}</p>
                  <p className="text-xs font-semibold text-ink-500">{trade.date}</p>
                </div>
                <p className="mt-2 text-sm text-ink-600">Bought {trade.units.toFixed(4)} units at {formatCurrency(trade.price)}.</p>
                <p className="mt-1 text-xs leading-5 text-ink-500">{trade.reason}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {[
          ["Mock data only", "Historical prices are sample ETF/index data for product simulation and UI validation."],
          ["Assumptions matter", "Taxes, spreads, liquidity, cash drag, and provider data quality can materially change outcomes."],
          ["No recommendations", result.disclaimer],
        ].map(([title, copy]) => (
          <Card key={title} className="shadow-sm">
            <h2 className="font-black text-ink-900">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-ink-600">{copy}</p>
          </Card>
        ))}
      </div>
      <div className="mt-6"><Disclaimer /></div>
    </AppShell>
  );
}
