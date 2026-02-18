/**
 * Data Transfer Objects (DTOs)
 * 
 * Types for API requests and responses.
 * These match the current API contracts.
 * 
 * @module types/dto/StockDataDTO
 */

/**
 * Historical data point (API format)
 * Compatible with existing API structure
 */
export interface HistoricalData {
    date: string;
    close: number;
    volume: number;
    open: number;
    high: number;
    low: number;
}

/**
 * Stock data result from API
 */
export interface StockDataResult {
    ticker: string;
    historicalData: HistoricalData[];
    daysCount: number;
    error?: string;
}

/**
 * Request body for /api/stock endpoint
 */
export interface StockRequest {
    tickers: string[];
}

/**
 * Response from /api/stock endpoint
 */
export interface StockResponse {
    results: StockDataResult[];
}

/**
 * Request body for /api/sharpe endpoint
 */
export interface SharpeRequest {
    tickers: string[];
    lookback: number;
}

/**
 * Sharpe calculation result from API
 */
export interface SharpeApiResult {
    ticker: string;
    yesterday: {
        sharpeRatio: number;
        trailingReturn: number;
        stdDev: number;
    } | null;
    lastWeek: {
        sharpeRatio: number;
        trailingReturn: number;
        stdDev: number;
    } | null;
    lastMonth: {
        sharpeRatio: number;
        trailingReturn: number;
        stdDev: number;
    } | null;
    lastQuarter: {
        sharpeRatio: number;
        trailingReturn: number;
        stdDev: number;
    } | null;
    lastSemester: {
        sharpeRatio: number;
        trailingReturn: number;
        stdDev: number;
    } | null;
    lastYear: {
        sharpeRatio: number;
        trailingReturn: number;
        stdDev: number;
    } | null;
    error?: string;
}

/**
 * Response from /api/sharpe endpoint
 */
export interface SharpeResponse {
    results: SharpeApiResult[];
}
