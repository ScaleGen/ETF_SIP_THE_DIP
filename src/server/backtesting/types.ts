export type HistoricalPriceBar = {
  date: string;
  close: number;
};

export type BacktestStrategyConfig = {
  symbol: string;
  dipThresholdPercentFromPreviousClose: number;
  recurringContribution: number;
  startingCash?: number;
  feePercent?: number;
  cooldownPeriods?: number;
};

export type SimulatedTrade = {
  date: string;
  strategy: "dip" | "sip";
  action: "contribution" | "buy";
  price: number;
  cashAmount: number;
  units: number;
  reason: string;
};

export type EquityCurvePoint = {
  date: string;
  label: string;
  dipValue: number;
  sipValue: number;
  dipDrawdownPercent: number;
  sipDrawdownPercent: number;
};

export type StrategyMetrics = {
  totalInvested: number;
  unitsAccumulated: number;
  finalPortfolioValue: number;
  cashRemaining: number;
  cagrPercent: number;
  maxDrawdownPercent: number;
};

export type BacktestResult = {
  symbol: string;
  startDate: string;
  endDate: string;
  assumptions: BacktestStrategyConfig;
  dipOpportunities: number;
  dip: StrategyMetrics;
  sip: StrategyMetrics;
  trades: SimulatedTrade[];
  equityCurve: EquityCurvePoint[];
  algorithm: string[];
  disclaimer: string;
};
