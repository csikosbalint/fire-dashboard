/**
 * UI Display Types
 * 
 * Types specifically for UI components.
 * Include formatted strings ready for display.
 * 
 * @module types/ui/SharpeDisplay
 */

/**
 * Sharpe result formatted for display
 * All values are pre-formatted strings
 */
export interface SharpeDisplayResult {
    ticker: string;
    yesterday: string | null;
    lastWeek: string | null;
    lastMonth: string | null;
    lastQuarter: string | null;
    lastSemester: string | null;
    lastYear: string | null;
    loading?: boolean;
    error?: string;
}

/**
 * Stock table row data (UI-ready)
 */
export interface StockTableRow {
    date: string;
    open: string;
    high: string;
    low: string;
    close: string;
    volume: string;
}

/**
 * Stock card summary (UI-ready)
 */
export interface StockCardData {
    ticker: string;
    latestPrice: string;
    daysCount: number;
    error?: string;
}
