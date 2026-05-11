import { cn } from "@/lib/utils";

export function StatusPill({ status }: { status: "Watching" | "Dip detected" | "Cooling down" | "On" | "Off" }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold",
        status === "Dip detected" && "bg-rose-50 text-rose-700",
        status === "Cooling down" && "bg-amber-50 text-amber-700",
        (status === "Watching" || status === "On") && "bg-mint-50 text-mint-700",
        status === "Off" && "bg-ink-100 text-ink-500",
      )}
    >
      {status}
    </span>
  );
}
