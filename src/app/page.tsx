import { ArrowRightIcon, BellIcon } from "@/components/icons";
import { ButtonLink } from "@/components/button";
import { Card } from "@/components/card";
import { Disclaimer } from "@/components/disclaimer";
import { educationCards, etfs } from "@/data/mock-data";

export default function LandingPage() {
  return (
    <main className="min-h-screen overflow-hidden">
      <section className="mx-auto grid min-h-screen w-full max-w-7xl px-4 py-6 sm:px-6 lg:grid-cols-[1.05fr_.95fr] lg:items-center lg:gap-12 lg:px-8">
        <div className="py-10 lg:py-20">
          <div className="inline-flex items-center gap-2 rounded-full border border-mint-200 bg-white/80 px-3 py-2 text-sm font-semibold text-mint-800 shadow-sm">
            <span className="h-2 w-2 rounded-full bg-mint-500" />
            Beginner-friendly ETF dip tracking
          </div>
          <h1 className="mt-6 text-5xl font-black tracking-tight text-ink-900 sm:text-6xl lg:text-7xl">
            Watch ETF dips without the noise.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-ink-600">
            Sip the Dip helps you define neutral market conditions, receive explainable alerts, log manual purchases, and compare hypothetical dip-buying strategies with clear assumptions.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href="/dashboard" className="gap-2">
              Open dashboard <ArrowRightIcon className="h-4 w-4" />
            </ButtonLink>
            <ButtonLink href="/backtesting" variant="secondary">
              Try mock backtest
            </ButtonLink>
          </div>
          <div className="mt-8 max-w-2xl">
            <Disclaimer compact />
          </div>
        </div>

        <div className="relative pb-10 lg:pb-0">
          <div className="absolute -right-20 top-10 h-72 w-72 rounded-full bg-mint-300/30 blur-3xl" />
          <Card className="card-grid relative p-5 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-ink-500">Today&apos;s watch</p>
                <h2 className="mt-1 text-2xl font-black text-ink-900">Dip conditions</h2>
              </div>
              <div className="rounded-2xl bg-ink-900 p-3 text-white">
                <BellIcon className="h-6 w-6" aria-hidden="true" />
              </div>
            </div>
            <div className="mt-6 space-y-3">
              {etfs.slice(0, 3).map((etf) => (
                <div key={etf.symbol} className="rounded-3xl bg-white p-4 shadow-sm">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-black text-ink-900">{etf.symbol}</p>
                      <p className="text-sm text-ink-500">{etf.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-ink-900">{etf.dipFromHighPct}%</p>
                      <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">from high</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {educationCards.map((card) => (
            <Card key={card.title} className="shadow-sm">
              <card.icon className="h-8 w-8 text-mint-700" aria-hidden="true" />
              <h3 className="mt-4 text-base font-black text-ink-900">{card.title}</h3>
              <p className="mt-2 text-sm leading-6 text-ink-600">{card.description}</p>
            </Card>
          ))}
        </div>
      </section>
    </main>
  );
}
