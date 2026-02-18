/**
 * Number Formatters
 * 
 * Pure functions for formatting numbers for display.
 * Framework-agnostic - NO React, NO Next.js, NO Node.js APIs
 * 
 * @module lib/utils/numberFormatters
 * @pure
 */

/**
 * Format price with fixed decimal places
 * 
 * @pure
 * @param price - Price value
 * @param decimals - Number of decimal places (default 2)
 * @returns Formatted price string
 */
export function formatPrice(price: number, decimals: number = 2): string {
    if (typeof price !== 'number' || isNaN(price)) {
        return '0.00';
    }

    return price.toFixed(decimals);
}

/**
 * Format volume in millions (e.g., "1.5M")
 * 
 * @pure
 * @param volume - Volume value
 * @param decimals - Number of decimal places (default 2)
 * @returns Formatted volume string with 'M' suffix
 */
export function formatVolume(volume: number, decimals: number = 2): string {
    if (typeof volume !== 'number' || isNaN(volume)) {
        return '0M';
    }

    const millions = volume / 1_000_000;
    return `${millions.toFixed(decimals)}M`;
}

/**
 * Format percentage with sign
 * 
 * @pure
 * @param value - Percentage value (e.g., 15.5 for 15.5%)
 * @param decimals - Number of decimal places (default 2)
 * @param includeSign - Whether to include + for positive (default true)
 * @returns Formatted percentage string with % suffix
 */
export function formatPercent(
    value: number,
    decimals: number = 2,
    includeSign: boolean = true
): string {
    if (typeof value !== 'number' || isNaN(value)) {
        return '0.00%';
    }

    const sign = includeSign && value > 0 ? '+' : '';
    return `${sign}${value.toFixed(decimals)}%`;
}

/**
 * Format Sharpe ratio
 * 
 * @pure
 * @param sharpe - Sharpe ratio value
 * @param decimals - Number of decimal places (default 2)
 * @returns Formatted Sharpe string
 */
export function formatSharpe(sharpe: number, decimals: number = 2): string {
    if (typeof sharpe !== 'number' || isNaN(sharpe)) {
        return '0.00';
    }

    return sharpe.toFixed(decimals);
}

/**
 * Format large number with K/M/B suffixes
 * 
 * @pure
 * @param value - Numeric value
 * @param decimals - Number of decimal places (default 1)
 * @returns Formatted string with suffix
 */
export function formatLargeNumber(value: number, decimals: number = 1): string {
    if (typeof value !== 'number' || isNaN(value)) {
        return '0';
    }

    const abs = Math.abs(value);
    const sign = value < 0 ? '-' : '';

    if (abs >= 1_000_000_000) {
        return `${sign}${(abs / 1_000_000_000).toFixed(decimals)}B`;
    }

    if (abs >= 1_000_000) {
        return `${sign}${(abs / 1_000_000).toFixed(decimals)}M`;
    }

    if (abs >= 1_000) {
        return `${sign}${(abs / 1_000).toFixed(decimals)}K`;
    }

    return `${sign}${abs.toFixed(decimals)}`;
}

/**
 * Format currency (USD)
 * 
 * @pure
 * @param value - Dollar amount
 * @param decimals - Number of decimal places (default 2)
 * @returns Formatted currency string with $ prefix
 */
export function formatCurrency(value: number, decimals: number = 2): string {
    if (typeof value !== 'number' || isNaN(value)) {
        return '$0.00';
    }

    return `$${value.toFixed(decimals)}`;
}

/**
 * Parse formatted number string back to number
 * Removes commas, currency symbols, percentage signs
 * 
 * @pure
 * @param str - Formatted number string
 * @returns Parsed number or NaN if invalid
 */
export function parseFormattedNumber(str: string): number {
    if (!str || typeof str !== 'string') {
        return NaN;
    }

    // Remove common formatting characters
    const cleaned = str.replace(/[$,%]/g, '');

    return parseFloat(cleaned);
}
