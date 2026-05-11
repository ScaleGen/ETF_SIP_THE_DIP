import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function MetricCard({ label, value, helper, tone = "neutral", icon }: { label: string; value: string; helper: string; tone?: "neutral" | "positive" | "warning"; icon?: ReactNode }) {
  return (
    <div className="rounded-3xl border border-white/70 bg-white/85 p-5 shadow-soft">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-semibold text-ink-500">{label}</p>
        {icon ? <div className="text-ink-400">{icon}</div> : null}
      </div>
      <p className="mt-3 text-2xl font-black tracking-tight text-ink-900">{value}</p>
      <p className={cn("mt-2 text-sm leading-6", tone === "positive" && "text-mint-700", tone === "warning" && "text-amber-700", tone === "neutral" && "text-ink-500")}>{helper}</p>
    </div>
  );
}
