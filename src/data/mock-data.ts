import { BellIcon, ChartIcon, ShieldIcon, TuneIcon } from "@/components/icons";

export type Etf = {
  symbol: string;
  name: string;
  price: number;
  changePct: number;
  dipFromHighPct: number;
  thresholdPct: number;
  status: "Watching" | "Dip detected" | "Cooling down";
  sparkline: number[];
  allocation: number;
};

export const etfs: Etf[] = [
  {
    symbol: "SPY",
    name: "SPDR S&P 500 ETF Trust",
    price: 512.42,
    changePct: -1.2,
    dipFromHighPct: -6.4,
    thresholdPct: -5,
    status: "Dip detected",
    sparkline: [520, 522, 519, 516, 518, 513, 512],
    allocation: 38,
  },
  {
    symbol: "QQQ",
    name: "Invesco QQQ Trust",
    price: 438.11,
    changePct: -0.7,
    dipFromHighPct: -4.1,
    thresholdPct: -6,
    status: "Watching",
    sparkline: [446, 449, 447, 444, 443, 440, 438],
    allocation: 24,
  },
  {
    symbol: "VTI",
    name: "Vanguard Total Stock Market ETF",
    price: 249.88,
    changePct: -1.8,
    dipFromHighPct: -7.2,
    thresholdPct: -7,
    status: "Cooling down",
    sparkline: [260, 259, 257, 256, 253, 251, 250],
    allocation: 22,
  },
  {
    symbol: "IWM",
    name: "iShares Russell 2000 ETF",
    price: 201.34,
    changePct: 0.4,
    dipFromHighPct: -3.3,
    thresholdPct: -8,
    status: "Watching",
    sparkline: [198, 199, 197, 200, 202, 201, 201],
    allocation: 16,
  },
];

export const dashboardSeries = [
  { label: "Mon", value: 101200, dip: 0 },
  { label: "Tue", value: 100400, dip: -1.1 },
  { label: "Wed", value: 99250, dip: -2.4 },
  { label: "Thu", value: 98100, dip: -4.8 },
  { label: "Fri", value: 98950, dip: -3.9 },
  { label: "Sat", value: 98600, dip: -4.2 },
  { label: "Sun", value: 100350, dip: -2.5 },
];

export const alerts = [
  {
    symbol: "SPY",
    title: "5% dip condition detected",
    detail: "SPY closed 6.4% below its 60-day high. Your cooldown is set to 48 hours.",
    time: "Today, 4:08 PM",
    channel: "Email + in-app",
  },
  {
    symbol: "VTI",
    title: "7% dip condition detected",
    detail: "VTI crossed your selected threshold and was logged to alert history.",
    time: "Yesterday, 4:02 PM",
    channel: "In-app",
  },
  {
    symbol: "QQQ",
    title: "Approaching watch threshold",
    detail: "QQQ is 4.1% below its recent high. No alert was sent because your threshold is 6%.",
    time: "May 8, 4:01 PM",
    channel: "In-app",
  },
];

export const backtestResults = [
  { month: "Jan", dipBuy: 10000, scheduled: 10000 },
  { month: "Feb", dipBuy: 10250, scheduled: 10120 },
  { month: "Mar", dipBuy: 10180, scheduled: 10040 },
  { month: "Apr", dipBuy: 10890, scheduled: 10640 },
  { month: "May", dipBuy: 11420, scheduled: 11080 },
  { month: "Jun", dipBuy: 12110, scheduled: 11620 },
];

export const educationCards = [
  {
    title: "Pick a rule",
    description: "Choose a dip threshold, lookback window, and cooldown that you understand.",
    icon: TuneIcon,
  },
  {
    title: "Track conditions",
    description: "Sip the Dip watches your ETFs and explains which user-defined condition was detected.",
    icon: ChartIcon,
  },
  {
    title: "Get neutral alerts",
    description: "Alerts say what happened, not what you should buy or sell.",
    icon: BellIcon,
  },
  {
    title: "Review assumptions",
    description: "Backtests show hypothetical outcomes with fees, cooldowns, and limitations clearly labeled.",
    icon: ShieldIcon,
  },
];

export const settings = [
  { label: "Risk disclaimer", value: "Accepted", helper: "Required before enabling alerts or backtests." },
  { label: "Default timezone", value: "America/New_York", helper: "Used for market close summaries and quiet hours." },
  { label: "Notification quiet hours", value: "9:00 PM – 7:00 AM", helper: "Non-urgent alerts wait until quiet hours end." },
  { label: "Broker connections", value: "Not connected", helper: "Manual tracking only in this prototype." },
];
