/**
 * Financial Returns Calculations
 * 
 * Pure functions for calculating returns from price data.
 * Framework-agnostic - NO React, NO Next.js, NO Node.js APIs
 * 
 * @module domain/finance/returns
 * @pure
 */

/**
 * Calculate trailing return percentage between two prices
 * 
 * @pure
 * @param currentPrice - The current/recent price
 * @param pastPrice - The historical price to compare against
 * @returns Return as percentage (e.g., 15.5 for 15.5% gain)
 */
export function calculateTrailingReturn(
    currentPrice: number,
    pastPrice: number
): number {
    if (pastPrice <= 0) {
        return 0;
    }

    return ((currentPrice - pastPrice) / pastPrice) * 100;
}

/**
 * Calculate array of returns from price array
 * 
 * @pure
 * @immutable
 * @param prices - Array of prices in chronological order
 * @returns Array of returns (length = prices.length - 1)
 */
export function calculateReturns(prices: number[]): number[] {
    if (prices.length < 2) {
        return [];
    }

    const returns: number[] = [];
    for (let i = 1; i < prices.length; i++) {
        returns.push(calculateTrailingReturn(prices[i], prices[i - 1]));
    }

    return returns;
}

/**
 * Calculate trailing return for a specific lookback period
 * 
 * @pure
 * @param prices - Array of prices in chronological order (oldest first)
 * @param lookbackDays - Number of days to look back
 * @returns Trailing return percentage or 0 if insufficient data
 */
export function calculateLookbackReturn(
    prices: number[],
    lookbackDays: number
): number {
    if (prices.length < lookbackDays + 1) {
        return 0;
    }

    const currentPrice = prices[prices.length - 1];
    const pastPrice = prices[prices.length - 1 - lookbackDays];

    return calculateTrailingReturn(currentPrice, pastPrice);
}
