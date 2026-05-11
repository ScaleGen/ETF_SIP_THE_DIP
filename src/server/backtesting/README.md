# Backtesting Engine

The Sip the Dip backtesting engine is pure TypeScript domain logic that can run in API routes, workers, scheduled jobs, or tests.

## Algorithm

1. Load historical ETF/index close prices.
2. Add the same recurring contribution to the dip strategy and regular SIP strategy each period.
3. Regular SIP invests available cash every period.
4. Dip strategy checks whether the current close is at least the configured percentage below the previous close.
5. When a dip opportunity occurs outside cooldown, the dip strategy invests accumulated cash.
6. Track units, cash, portfolio value, CAGR, dip opportunities, and drawdowns for both strategies.

The engine uses mock historical data by default and labels all output as hypothetical. It does not place orders or provide investment advice.
