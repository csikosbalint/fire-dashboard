/**
 * Domain Constants
 * 
 * Framework-agnostic constants for business logic calculations.
 * NO React, NO Next.js, NO Node.js APIs - Pure JavaScript only.
 */

// Trading days constants
export const TRADING_DAYS_YEAR = 250;
export const TRADING_DAYS_SEMESTER = 125;
export const TRADING_DAYS_QUARTER = 63;
export const TRADING_DAYS_MONTH = 21;
export const TRADING_DAYS_WEEK = 5;

// Lookback period constraints
export const LOOKBACK_MIN = 1;
export const LOOKBACK_MAX = 1000;

// Default lookback periods (in trading days)
export const DEFAULT_LOOKBACK_PERIODS = [62, 125, 250, 500] as const;

// Ticker validation
export const MAX_TICKERS_PER_REQUEST = 10;
export const TICKER_REGEX = /^[A-Z]{1,5}$/;

// Date constants
export const HISTORICAL_DATA_YEARS = 3;

// Risk-free rate (annual) - used in Sharpe ratio calculations
export const RISK_FREE_RATE_ANNUAL = 0.0; // 0% for simplified Sharpe
