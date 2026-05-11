import type { ReactNode } from "react";

export function PageHeading({ eyebrow, title, description, action }: { eyebrow?: string; title: string; description: string; action?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-3xl">
        {eyebrow ? <p className="text-xs font-semibold uppercase tracking-[0.24em] text-mint-700">{eyebrow}</p> : null}
        <h1 className="mt-2 text-3xl font-black tracking-tight text-ink-900 sm:text-4xl">{title}</h1>
        <p className="mt-3 text-base leading-7 text-ink-600">{description}</p>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
