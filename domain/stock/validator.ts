/**
 * Stock Data Validators
 * 
 * Pure validation functions for stock-related data.
 * Framework-agnostic - NO React, NO Next.js, NO Node.js APIs
 * 
 * @module domain/stock/validator
 * @pure
 */

import { MAX_TICKERS_PER_REQUEST, TICKER_REGEX, LOOKBACK_MIN, LOOKBACK_MAX } from '../constants';

export interface ValidationResult<T = unknown> {
    valid: boolean;
    data?: T;
    error?: string;
}

/**
 * Validate a single ticker symbol
 * Rules: 1-5 uppercase letters
 * 
 * @pure
 * @param ticker - Ticker symbol to validate
 * @returns true if valid, false otherwise
 */
export function validateTicker(ticker: string): boolean {
    if (!ticker || typeof ticker !== 'string') {
        return false;
    }

    return TICKER_REGEX.test(ticker);
}

/**
 * Validate an array of ticker symbols
 * 
 * @pure
 * @param tickers - Array of ticker symbols
 * @param maxCount - Maximum allowed tickers (default from constants)
 * @returns ValidationResult with validated tickers or error
 */
export function validateTickerArray(
    tickers: string[],
    maxCount: number = MAX_TICKERS_PER_REQUEST
): ValidationResult<string[]> {
    if (!Array.isArray(tickers)) {
        return {
            valid: false,
            error: 'Tickers must be an array'
        };
    }

    if (tickers.length === 0) {
        return {
            valid: false,
            error: 'At least one ticker is required'
        };
    }

    if (tickers.length > maxCount) {
        return {
            valid: false,
            error: `Maximum ${maxCount} tickers allowed`
        };
    }

    const invalidTickers = tickers.filter(t => !validateTicker(t));

    if (invalidTickers.length > 0) {
        return {
            valid: false,
            error: `Invalid ticker symbols: ${invalidTickers.join(', ')}`
        };
    }

    return {
        valid: true,
        data: tickers
    };
}

/**
 * Parse comma-separated ticker input string
 * Trims whitespace, converts to uppercase, removes duplicates
 * 
 * @pure
 * @param input - Comma-separated ticker string (e.g., "aapl, googl, msft")
 * @returns Array of cleaned ticker symbols
 */
export function parseTickerInput(input: string): string[] {
    if (!input || typeof input !== 'string') {
        return [];
    }

    const tickers = input
        .split(',')
        .map(t => t.trim().toUpperCase())
        .filter(t => t.length > 0);

    // Remove duplicates
    return Array.from(new Set(tickers));
}

/**
 * Validate lookback period
 * 
 * @pure
 * @param lookback - Number of trading days to look back
 * @returns ValidationResult with validated lookback or error
 */
export function validateLookback(lookback: number): ValidationResult<number> {
    if (typeof lookback !== 'number' || isNaN(lookback)) {
        return {
            valid: false,
            error: 'Lookback must be a number'
        };
    }

    if (lookback < LOOKBACK_MIN) {
        return {
            valid: false,
            error: `Lookback must be at least ${LOOKBACK_MIN}`
        };
    }

    if (lookback > LOOKBACK_MAX) {
        return {
            valid: false,
            error: `Lookback cannot exceed ${LOOKBACK_MAX}`
        };
    }

    return {
        valid: true,
        data: Math.floor(lookback)
    };
}

/**
 * Validate and parse ticker input string
 * Combines parsing and validation in one call
 * 
 * @pure
 * @param input - Comma-separated ticker string
 * @param maxCount - Maximum allowed tickers
 * @returns ValidationResult with array of tickers or error
 */
export function validateAndParseTickerInput(
    input: string,
    maxCount: number = MAX_TICKERS_PER_REQUEST
): ValidationResult<string[]> {
    const tickers = parseTickerInput(input);
    return validateTickerArray(tickers, maxCount);
}
