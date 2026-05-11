import { BellIcon, ChartIcon, DashboardIcon, HomeIcon, ListIcon, SettingsIcon } from "@/components/icons";

export const navItems = [
  { name: "Home", href: "/", icon: HomeIcon },
  { name: "Dashboard", href: "/dashboard", icon: DashboardIcon },
  { name: "Watchlist", href: "/watchlist", icon: ListIcon },
  { name: "Alerts", href: "/alerts", icon: BellIcon },
  { name: "Backtest", href: "/backtesting", icon: ChartIcon },
  { name: "Settings", href: "/settings", icon: SettingsIcon },
] as const;
