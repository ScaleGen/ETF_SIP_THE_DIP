import { BellIcon, MailIcon, MoonIcon } from "@/components/icons";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/button";
import { Card, CardHeader } from "@/components/card";
import { Disclaimer } from "@/components/disclaimer";
import { MetricCard } from "@/components/metric-card";
import { PageHeading } from "@/components/page-heading";
import { StatusPill } from "@/components/status-pill";
import { alerts, etfs } from "@/data/mock-data";

export default function AlertsPage() {
  return (
    <AppShell>
      <PageHeading
        eyebrow="Alerts"
        title="Neutral alerts for your rules"
        description="Every alert explains the condition that was detected, the calculation context, and delivery status without telling you what action to take."
        action={<Button variant="secondary" className="w-full sm:w-auto">Test notification</Button>}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <MetricCard label="Delivery channels" value="2" helper="Email and in-app enabled" icon={<MailIcon className="h-5 w-5" />} />
        <MetricCard label="Quiet hours" value="On" helper="9:00 PM – 7:00 AM" icon={<MoonIcon className="h-5 w-5" />} />
        <MetricCard label="Cooldowns" value="48h" helper="Default duplicate protection" icon={<BellIcon className="h-5 w-5" />} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.05fr_.95fr]">
        <Card>
          <CardHeader eyebrow="History" title="Recent alert events" />
          <div className="space-y-4">
            {alerts.map((alert) => (
              <article key={`${alert.symbol}-${alert.time}`} className="rounded-3xl border border-ink-100 bg-white p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-ink-900 font-black text-white">{alert.symbol}</span>
                    <div>
                      <h2 className="font-black text-ink-900">{alert.title}</h2>
                      <p className="text-sm text-ink-500">{alert.time}</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-mint-50 px-3 py-1 text-xs font-bold text-mint-700">{alert.channel}</span>
                </div>
                <p className="mt-4 text-sm leading-6 text-ink-600">{alert.detail}</p>
              </article>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader eyebrow="Active rules" title="Signal monitoring" />
          <div className="space-y-3">
            {etfs.map((etf) => (
              <div key={etf.symbol} className="rounded-2xl bg-ink-50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-black text-ink-900">{etf.symbol}</p>
                    <p className="text-sm text-ink-500">60-day high, {Math.abs(etf.thresholdPct)}% threshold</p>
                  </div>
                  <StatusPill status={etf.status === "Watching" ? "On" : etf.status} />
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-white">
                  <div className="h-full rounded-full bg-mint-500" style={{ width: `${Math.min(Math.abs(etf.dipFromHighPct / etf.thresholdPct) * 100, 100)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
      <div className="mt-6"><Disclaimer /></div>
    </AppShell>
  );
}
