import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return <section className={cn("rounded-3xl border border-white/70 bg-white/85 p-5 shadow-soft backdrop-blur", className)}>{children}</section>;
}

export function CardHeader({ eyebrow, title, action }: { eyebrow?: string; title: string; action?: ReactNode }) {
  return (
    <div className="mb-4 flex items-start justify-between gap-4">
      <div>
        {eyebrow ? <p className="text-xs font-semibold uppercase tracking-[0.22em] text-mint-700">{eyebrow}</p> : null}
        <h2 className="mt-1 text-lg font-bold text-ink-900">{title}</h2>
      </div>
      {action}
    </div>
  );
}
