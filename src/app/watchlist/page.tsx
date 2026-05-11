import { PlusIcon } from "@/components/icons";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/button";
import { Card, CardHeader } from "@/components/card";
import { Disclaimer } from "@/components/disclaimer";
import { EtfCard } from "@/components/etf-card";
import { PageHeading } from "@/components/page-heading";
import { StatusPill } from "@/components/status-pill";
import { etfs } from "@/data/mock-data";

export default function WatchlistPage() {
  return (
    <AppShell>
      <PageHeading
        eyebrow="Watchlist"
        title="Track ETFs your way"
        description="Mock watchlist cards show latest prices, seven-point trend sketches, threshold status, and user-defined dip rules."
        action={<Button className="w-full gap-2 sm:w-auto"><PlusIcon className="h-4 w-4" /> Add ETF</Button>}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {etfs.map((etf) => (
          <EtfCard key={etf.symbol} etf={etf} />
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[.85fr_1.15fr]">
        <Card>
          <CardHeader eyebrow="Rule builder" title="Beginner-friendly setup" />
          <div className="space-y-4">
            {[
              ["1", "Choose an ETF or index", "Start with a symbol you already understand."],
              ["2", "Pick a dip definition", "Example: percent below a recent high."],
              ["3", "Set a cooldown", "Avoid repeated alerts for the same condition."],
            ].map(([step, title, copy]) => (
              <div key={step} className="flex gap-3 rounded-2xl bg-ink-50 p-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-sm font-black text-mint-700">{step}</span>
                <div>
                  <p className="font-bold text-ink-900">{title}</p>
                  <p className="mt-1 text-sm leading-6 text-ink-600">{copy}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <CardHeader eyebrow="Rules" title="Mock alert rules" />
          <div className="overflow-hidden rounded-2xl border border-ink-100">
            {etfs.map((etf) => (
              <div key={etf.symbol} className="grid grid-cols-[1fr_auto] gap-3 border-b border-ink-100 bg-white p-4 last:border-b-0 sm:grid-cols-[.7fr_.8fr_auto]">
                <div>
                  <p className="font-black text-ink-900">{etf.symbol}</p>
                  <p className="text-sm text-ink-500">60-day high rule</p>
                </div>
                <p className="hidden text-sm font-semibold text-ink-700 sm:block">Alert at {etf.thresholdPct}% from high</p>
                <StatusPill status={etf.status} />
              </div>
            ))}
          </div>
        </Card>
      </div>
      <div className="mt-6"><Disclaimer compact /></div>
    </AppShell>
  );
}
