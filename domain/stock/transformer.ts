/**
 * Stock Data Transformers
 * 
 * Pure functions for transforming and filtering stock data.
 * Framework-agnostic - NO React, NO Next.js, NO Node.js APIs
 * All functions are immutable - return new arrays/objects.
 * 
 * @module domain/stock/transformer
 * @pure
 * @immutable
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
 * Sort stock prices in chronological order (oldest first)
 * 
 * @pure
 * @immutable
 * @param data - Array of stock prices
 * @returns New sorted array (oldest first)
 */
export function sortChronological(data: StockPrice[]): StockPrice[] {
    return [...data].sort((a, b) => {
        return new Date(a.date).getTime() - new Date(b.date).getTime();
    });
}

/**
 * Sort stock prices in reverse chronological order (newest first)
 * 
 * @pure
 * @immutable
 * @param data - Array of stock prices
 * @returns New sorted array (newest first)
 */
export function sortReverseChronological(data: StockPrice[]): StockPrice[] {
    return [...data].sort((a, b) => {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
}

/**
 * Filter out invalid stock prices
 * Valid = close > 0, open > 0, volume >= 0
 * 
 * @pure
 * @immutable
 * @param data - Array of stock prices
 * @returns New filtered array
 */
export function filterValidPrices(data: StockPrice[]): StockPrice[] {
    return data.filter(price => {
        return price.close > 0 &&
            price.open > 0 &&
            price.volume >= 0 &&
            !isNaN(price.close) &&
            !isNaN(price.open);
    });
}

/**
 * Extract array of closing prices from stock data
 * 
 * @pure
 * @param data - Array of stock prices
 * @returns Array of closing prices
 */
export function extractClosingPrices(data: StockPrice[]): number[] {
    return data.map(d => d.close);
}

/**
 * Extract array of dates from stock data
 * 
 * @pure
 * @param data - Array of stock prices
 * @returns Array of date strings
 */
export function extractDates(data: StockPrice[]): string[] {
    return data.map(d => d.date);
}

/**
 * Reverse array order (non-mutating)
 * 
 * @pure
 * @immutable
 * @param data - Array to reverse
 * @returns New reversed array
 */
export function reverseArray<T>(data: T[]): T[] {
    return [...data].reverse();
}

/**
 * Check if data is in chronological order (oldest first)
 * 
 * @pure
 * @param data - Array of stock prices
 * @returns true if chronological, false otherwise
 */
export function isChronological(data: StockPrice[]): boolean {
    if (data.length < 2) {
        return true;
    }

    for (let i = 1; i < data.length; i++) {
        const prevTime = new Date(data[i - 1].date).getTime();
        const currTime = new Date(data[i].date).getTime();

        if (prevTime > currTime) {
            return false;
        }
    }

    return true;
}

/**
 * Ensure data is in chronological order
 * If already chronological, returns original array (no copy)
 * If not chronological, returns new sorted array
 * 
 * @pure
 * @param data - Array of stock prices
 * @returns Chronologically sorted array
 */
export function ensureChronological(data: StockPrice[]): StockPrice[] {
    if (isChronological(data)) {
        return data;
    }
    return sortChronological(data);
}

/**
 * Slice array safely (non-mutating)
 * 
 * @pure
 * @immutable
 * @param data - Array to slice
 * @param start - Start index
 * @param end - End index (optional)
 * @returns New sliced array
 */
export function safeSlice<T>(data: T[], start: number, end?: number): T[] {
    return data.slice(start, end);
}
