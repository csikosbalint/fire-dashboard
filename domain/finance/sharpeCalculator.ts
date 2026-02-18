/**
 * Sharpe Ratio Calculator
 * 
 * Pure functions for calculating Sharpe ratios from price data.
 * Framework-agnostic - NO React, NO Next.js, NO Node.js APIs
 * All functions are immutable and side-effect free.
 * 
 * @module domain/finance/sharpeCalculator
 * @pure
 * @immutable
 */

import { calculateTrailingReturn, calculateReturns } from './returns';
import { calculateStandardDeviation } from './statistics';
import { TRADING_DAYS_YEAR, TRADING_DAYS_WEEK, TRADING_DAYS_MONTH, TRADING_DAYS_QUARTER, TRADING_DAYS_SEMESTER } from '../constants';

/**
 * Sharpe metrics for a specific time period
 */
export interface SharpeMetrics {
    sharpeRatio: number;
    trailingReturn: number;
    stdDev: number;
    periodDays: number;
}

/**
 * Historical price point with Sharpe metrics
 */
export interface PriceWithSharpe {
    date: string;
    close: number;
    open: number;
    high: number;
    low: number;
    volume: number;
    sharpeRatio1Y?: number;
    trailingReturn1Y?: number;
    stdDev1Y?: number;
}

/**
 * Sharpe ratio data for multiple time periods
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
 * Calculate Sharpe ratio from trailing return and standard deviation
 * 
 * @pure
 * @param trailingReturn - Return percentage for the period
 * @param stdDev - Standard deviation of returns
 * @param riskFreeRate - Risk-free rate (default 0)
 * @returns Sharpe ratio
 */
export function calculateSharpeRatio(
    trailingReturn: number,
    stdDev: number,
    riskFreeRate: number = 0
): number {
    if (stdDev === 0) {
        return 0;
    }

    return (trailingReturn - riskFreeRate) / stdDev;
}

/**
 * Calculate Sharpe metrics for a specific lookback period
 * 
 * @pure
 * @param prices - Array of closing prices in chronological order (oldest first)
 * @param lookbackDays - Number of trading days to look back
 * @returns SharpeMetrics or null if insufficient data
 */
export function calculateSharpeForPeriod(
    prices: number[],
    lookbackDays: number
): SharpeMetrics | null {
    // Need at least 2x lookback period for meaningful standard deviation
    const requiredLength = lookbackDays * 2;

    if (prices.length < requiredLength) {
        return null;
    }

    // Get the most recent prices for this period
    const currentPrice = prices[prices.length - 1];
    const pastPrice = prices[prices.length - 1 - lookbackDays];

    // Calculate trailing return
    const trailingReturn = calculateTrailingReturn(currentPrice, pastPrice);

    // Calculate returns array for standard deviation
    const relevantPrices = prices.slice(-(lookbackDays + 1));
    const returns = calculateReturns(relevantPrices);

    // Calculate standard deviation
    const stdDev = calculateStandardDeviation(returns);

    // Calculate Sharpe ratio
    const sharpeRatio = calculateSharpeRatio(trailingReturn, stdDev);

    return {
        sharpeRatio,
        trailingReturn,
        stdDev,
        periodDays: lookbackDays
    };
}

/**
 * Enhance historical data with Sharpe metrics for a specific lookback period
 * Returns NEW array with Sharpe metrics added - does NOT mutate input
 * 
 * @pure
 * @immutable
 * @param historicalData - Array of price data in chronological order (oldest first)
 * @param lookback - Lookback period in trading days
 * @returns New array with Sharpe metrics added to each data point
 */
export function enhanceWithSharpeMetrics(
    historicalData: PriceWithSharpe[],
    lookback: number
): PriceWithSharpe[] {
    const prices = historicalData.map(d => d.close);
    const requiredLength = lookback * 2;

    return historicalData.map((dataPoint, index) => {
        // Need enough historical data for calculation
        if (index < requiredLength - 1) {
            return { ...dataPoint };
        }

        // Get prices up to this point
        const pricesUpToNow = prices.slice(0, index + 1);

        // Calculate Sharpe for this point
        const metrics = calculateSharpeForPeriod(pricesUpToNow, lookback);

        if (!metrics) {
            return { ...dataPoint };
        }

        // Return NEW object with Sharpe metrics
        return {
            ...dataPoint,
            sharpeRatio1Y: metrics.sharpeRatio,
            trailingReturn1Y: metrics.trailingReturn,
            stdDev1Y: metrics.stdDev
        };
    });
}

/**
 * Calculate Sharpe ratios for multiple standard time periods
 * 
 * @pure
 * @param prices - Array of closing prices in chronological order (oldest first)
 * @param ticker - Stock ticker symbol
 * @returns SharpeRatioData with metrics for each period
 */
export function calculateMultiPeriodSharpe(
    prices: number[],
    ticker: string
): SharpeRatioData {
    return {
        ticker,
        yesterday: prices.length >= 2 ? calculateSharpeForPeriod(prices, 1) : null,
        lastWeek: calculateSharpeForPeriod(prices, TRADING_DAYS_WEEK),
        lastMonth: calculateSharpeForPeriod(prices, TRADING_DAYS_MONTH),
        lastQuarter: calculateSharpeForPeriod(prices, TRADING_DAYS_QUARTER),
        lastSemester: calculateSharpeForPeriod(prices, TRADING_DAYS_SEMESTER),
        lastYear: calculateSharpeForPeriod(prices, TRADING_DAYS_YEAR)
    };
}

/**
 * Extract price array from historical data
 * 
 * @pure
 * @param historicalData - Array of price data
 * @returns Array of closing prices
 */
export function extractPrices(historicalData: Array<{ close: number }>): number[] {
    return historicalData.map(d => d.close);
}
