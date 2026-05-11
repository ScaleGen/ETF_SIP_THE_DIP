import {
  buyUnits,
  calculateCagrPercent,
  calculateDrawdownPercent,
  getBacktestWindow,
  getMaxDrawdown,
  isDipOpportunity,
  formatCurveLabel,
} from "./calculations";
import { mockHistoricalEtfData } from "./mock-history";
import type { BacktestResult, BacktestStrategyConfig, EquityCurvePoint, HistoricalPriceBar, SimulatedTrade } from "./types";

export const defaultBacktestConfig: BacktestStrategyConfig = {
  symbol: "SPY",
  dipThresholdPercentFromPreviousClose: 5,
  recurringContribution: 500,
  startingCash: 0,
  feePercent: 0.1,
  cooldownPeriods: 1,
};

export function runMockBacktest(config: Partial<BacktestStrategyConfig> = {}): BacktestResult {
  return runBacktest(mockHistoricalEtfData, { ...defaultBacktestConfig, ...config });
}

export function runBacktest(priceBars: HistoricalPriceBar[], config: BacktestStrategyConfig): BacktestResult {
  assertValidBacktestInput(priceBars, config);

  let dipCash = config.startingCash ?? 0;
  let sipCash = config.startingCash ?? 0;
  let dipUnits = 0;
  let sipUnits = 0;
  let totalInvested = config.startingCash ?? 0;
  let dipOpportunities = 0;
  let lastDipBuyIndex = Number.NEGATIVE_INFINITY;
  let dipPeak = 0;
  let sipPeak = 0;
  const trades: SimulatedTrade[] = [];
  const equityCurve: EquityCurvePoint[] = [];

  priceBars.forEach((bar, index) => {
    dipCash += config.recurringContribution;
    sipCash += config.recurringContribution;
    totalInvested += config.recurringContribution;

    trades.push(buildContributionTrade(bar, "dip", config.recurringContribution));
    trades.push(buildContributionTrade(bar, "sip", config.recurringContribution));

    const sipBuy = buyUnits(sipCash, bar.close, config.feePercent);
    sipUnits += sipBuy.units;
    trades.push({
      date: bar.date,
      strategy: "sip",
      action: "buy",
      price: bar.close,
      cashAmount: sipBuy.totalCost,
      units: sipBuy.units,
      reason: "Regular SIP contribution invested on schedule.",
    });
    sipCash = 0;

    const previousBar = priceBars[index - 1];
    const isDip = previousBar ? isDipOpportunity(bar.close, previousBar.close, config.dipThresholdPercentFromPreviousClose) : false;
    const canBuyDip = index - lastDipBuyIndex > (config.cooldownPeriods ?? 0);

    if (isDip) {
      dipOpportunities += 1;
    }

    if (isDip && canBuyDip && dipCash > 0) {
      const dipBuy = buyUnits(dipCash, bar.close, config.feePercent);
      dipUnits += dipBuy.units;
      trades.push({
        date: bar.date,
        strategy: "dip",
        action: "buy",
        price: bar.close,
        cashAmount: dipBuy.totalCost,
        units: dipBuy.units,
        reason: `${config.symbol} fell at least ${config.dipThresholdPercentFromPreviousClose}% from the previous close.`,
      });
      dipCash = 0;
      lastDipBuyIndex = index;
    }

    const dipValue = dipUnits * bar.close + dipCash;
    const sipValue = sipUnits * bar.close + sipCash;
    dipPeak = Math.max(dipPeak, dipValue);
    sipPeak = Math.max(sipPeak, sipValue);

    equityCurve.push({
      date: bar.date,
      label: formatCurveLabel(bar.date),
      dipValue,
      sipValue,
      dipDrawdownPercent: calculateDrawdownPercent(dipValue, dipPeak),
      sipDrawdownPercent: calculateDrawdownPercent(sipValue, sipPeak),
    });
  });

  const { startDate, endDate, periods } = getBacktestWindow(priceBars);
  const finalBar = priceBars.at(-1);
  const finalPrice = finalBar?.close ?? 0;
  const dipFinalValue = dipUnits * finalPrice + dipCash;
  const sipFinalValue = sipUnits * finalPrice + sipCash;

  return {
    symbol: config.symbol,
    startDate,
    endDate,
    assumptions: config,
    dipOpportunities,
    dip: {
      totalInvested,
      unitsAccumulated: dipUnits,
      finalPortfolioValue: dipFinalValue,
      cashRemaining: dipCash,
      cagrPercent: calculateCagrPercent(dipFinalValue, totalInvested, periods),
      maxDrawdownPercent: getMaxDrawdown(equityCurve, "dipDrawdownPercent"),
    },
    sip: {
      totalInvested,
      unitsAccumulated: sipUnits,
      finalPortfolioValue: sipFinalValue,
      cashRemaining: sipCash,
      cagrPercent: calculateCagrPercent(sipFinalValue, totalInvested, periods),
      maxDrawdownPercent: getMaxDrawdown(equityCurve, "sipDrawdownPercent"),
    },
    trades,
    equityCurve,
    algorithm: [
      "Add the recurring contribution to both strategies at each historical period.",
      "Regular SIP invests available cash every period at that period's close.",
      "Dip strategy waits until the close falls by the configured threshold from the previous close.",
      "When a dip rule fires outside cooldown, the dip strategy invests all accumulated cash.",
      "Final value includes invested units marked to the last close plus any remaining cash.",
    ],
    disclaimer: "Backtests are hypothetical simulations using mock historical data. They are not predictions, guarantees, or investment advice.",
  };
}

function buildContributionTrade(bar: HistoricalPriceBar, strategy: "dip" | "sip", amount: number): SimulatedTrade {
  return {
    date: bar.date,
    strategy,
    action: "contribution",
    price: bar.close,
    cashAmount: amount,
    units: 0,
    reason: "Recurring contribution added to strategy cash.",
  };
}

function assertValidBacktestInput(priceBars: HistoricalPriceBar[], config: BacktestStrategyConfig): void {
  if (priceBars.length < 2) {
    throw new Error("Backtest requires at least two historical price bars.");
  }

  if (!config.symbol.trim()) {
    throw new Error("Backtest requires a symbol.");
  }

  if (!Number.isFinite(config.recurringContribution) || config.recurringContribution <= 0) {
    throw new Error("Backtest requires a positive recurringContribution.");
  }

  if (!Number.isFinite(config.dipThresholdPercentFromPreviousClose) || config.dipThresholdPercentFromPreviousClose <= 0) {
    throw new Error("Backtest requires a positive dipThresholdPercentFromPreviousClose.");
  }

  priceBars.forEach((bar) => {
    if (!bar.date || !Number.isFinite(bar.close) || bar.close <= 0) {
      throw new Error("Every historical bar requires a date and positive close price.");
    }
  });
}
