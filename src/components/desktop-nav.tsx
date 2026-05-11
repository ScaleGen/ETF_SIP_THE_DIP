"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navItems } from "@/components/nav-items";
import { cn } from "@/lib/utils";

export function DesktopNav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 hidden border-b border-white/60 bg-white/80 backdrop-blur lg:block">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-8 py-4">
        <Link href="/" className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-ink-900 text-lg font-black text-white">S</span>
          <span className="text-base font-black tracking-tight text-ink-900">Sip the Dip</span>
        </Link>
        <nav className="flex items-center gap-1" aria-label="Primary">
          {navItems.slice(1).map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-semibold text-ink-600 transition hover:bg-ink-100 hover:text-ink-900",
                  active && "bg-ink-900 text-white hover:bg-ink-900 hover:text-white",
                )}
              >
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
