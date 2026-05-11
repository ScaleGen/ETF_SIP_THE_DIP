"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navItems } from "@/components/nav-items";
import { cn } from "@/lib/utils";

export function BottomNav() {
  const pathname = usePathname();
  const appItems = navItems.filter((item) => item.href !== "/");

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-ink-200/70 bg-white/95 px-2 pb-3 pt-2 shadow-[0_-20px_40px_-30px_rgba(15,23,42,0.5)] backdrop-blur lg:hidden" aria-label="Primary">
      <div className="mx-auto grid max-w-md grid-cols-5 gap-1">
        {appItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 rounded-2xl px-2 py-2 text-[11px] font-semibold text-ink-500 transition",
                active && "bg-mint-50 text-mint-700",
              )}
            >
              <item.icon className="h-5 w-5" aria-hidden="true" />
              <span>{item.name === "Dashboard" ? "Dash" : item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
