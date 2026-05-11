import type { ReactNode } from "react";
import { BottomNav } from "@/components/bottom-nav";
import { DesktopNav } from "@/components/desktop-nav";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen pb-24 lg:pb-0">
      <DesktopNav />
      <main className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 lg:px-8 lg:py-8">{children}</main>
      <BottomNav />
    </div>
  );
}
