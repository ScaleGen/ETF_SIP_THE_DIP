import { BellIcon, LockIcon, UserIcon } from "@/components/icons";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/button";
import { Card, CardHeader } from "@/components/card";
import { Disclaimer } from "@/components/disclaimer";
import { PageHeading } from "@/components/page-heading";
import { settings } from "@/data/mock-data";

export default function SettingsPage() {
  return (
    <AppShell>
      <PageHeading
        eyebrow="Settings"
        title="Preferences and safeguards"
        description="Manage profile defaults, notification preferences, educational-use acknowledgements, and future integration readiness."
      />

      <div className="grid gap-6 lg:grid-cols-[.8fr_1.2fr]">
        <Card>
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-ink-900 text-white">
              <UserIcon className="h-9 w-9" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-xl font-black text-ink-900">Demo Investor</h2>
              <p className="text-sm text-ink-500">demo@sipthedip.example</p>
            </div>
          </div>
          <div className="mt-6 space-y-3">
            <Button className="w-full">Save preferences</Button>
            <Button variant="secondary" className="w-full">Export mock data</Button>
          </div>
        </Card>

        <Card>
          <CardHeader eyebrow="Account" title="Safety-first defaults" />
          <div className="divide-y divide-ink-100 overflow-hidden rounded-2xl border border-ink-100 bg-white">
            {settings.map((item) => (
              <div key={item.label} className="grid gap-2 p-4 sm:grid-cols-[.75fr_1fr] sm:items-center">
                <div>
                  <p className="font-black text-ink-900">{item.label}</p>
                  <p className="mt-1 text-sm leading-6 text-ink-500">{item.helper}</p>
                </div>
                <p className="rounded-2xl bg-ink-50 px-4 py-3 text-sm font-bold text-ink-800">{item.value}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader eyebrow="Notifications" title="Channel preferences" action={<BellIcon className="h-5 w-5 text-ink-400" />} />
          <div className="space-y-3">
            {[
              ["Email alerts", "Enabled for detected conditions"],
              ["In-app alerts", "Always available in alert history"],
              ["SMS alerts", "Placeholder only until a provider is connected"],
              ["WhatsApp alerts", "Placeholder only until a provider is connected"],
            ].map(([title, detail]) => (
              <label key={title} className="flex cursor-pointer items-center justify-between gap-4 rounded-2xl bg-ink-50 p-4">
                <span>
                  <span className="block font-bold text-ink-900">{title}</span>
                  <span className="text-sm text-ink-500">{detail}</span>
                </span>
                <input type="checkbox" defaultChecked={title === "Email alerts" || title === "In-app alerts"} className="h-5 w-5 rounded border-ink-300 text-mint-600 focus:ring-mint-500" />
              </label>
            ))}
          </div>
        </Card>
        <Card>
          <CardHeader eyebrow="Security" title="Data and integration posture" action={<LockIcon className="h-5 w-5 text-ink-400" />} />
          <ul className="space-y-3 text-sm leading-6 text-ink-600">
            <li className="rounded-2xl bg-ink-50 p-4"><strong className="text-ink-900">Manual-first:</strong> No broker account is connected in this UI.</li>
            <li className="rounded-2xl bg-ink-50 p-4"><strong className="text-ink-900">Explainable:</strong> Alert and backtest assumptions are shown before results.</li>
            <li className="rounded-2xl bg-ink-50 p-4"><strong className="text-ink-900">Private by design:</strong> Future integrations should use OAuth and read-only scopes first.</li>
          </ul>
        </Card>
      </div>
      <div className="mt-6"><Disclaimer /></div>
    </AppShell>
  );
}
