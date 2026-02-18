/**
 * Domain Types - Stock
 * 
 * Pure domain types for stock data.
 * These represent the business domain, not API contracts or UI state.
 * 
 * @module types/domain/Stock
 */

/**
 * Basic stock price data point
 */
export interface StockPrice {
    date: string;
    close: number;
    open: number;
    high: number;
    low: number;
    volume: number;
}

/**
 * Historical price data for a single stock
 */
export interface PriceHistory {
    ticker: string;
    prices: StockPrice[];
}

/**
 * Sharpe ratio metrics for a specific period
 */
export interface SharpeMetrics {
    sharpeRatio: number;
    trailingReturn: number;
    stdDev: number;
    periodDays: number;
}

/**
 * Complete Sharpe ratio data across multiple time periods
 */
export interface SharpeRatioData {
    ticker: string;
    yesterday: SharpeMetrics | null;
    lastWeek: SharpeMetrics | null;
    lastMonth: SharpeMetrics | null;
    lastQuarter: SharpeMetrics | null;
    lastSemester: SharpeMetrics | null;
    lastYear: SharpeMetrics | null;
}

/**
 * Stock price with optional Sharpe metrics
 * Used for enhanced historical data
 */
export interface StockPriceWithSharpe extends StockPrice {
    sharpeRatio1Y?: number;
    trailingReturn1Y?: number;
    stdDev1Y?: number;
}
