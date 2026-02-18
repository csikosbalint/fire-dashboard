/**
 * Statistical Calculations for Finance
 * 
 * Pure functions for statistical calculations used in financial analysis.
 * Framework-agnostic - NO React, NO Next.js, NO Node.js APIs
 * 
 * @module domain/finance/statistics
 * @pure
 */

import { calculateStandardDeviation as calcStdDev } from '@railpath/finance-toolkit';

/**
 * Calculate standard deviation of an array of numbers
 * 
 * @pure
 * @param values - Array of numeric values
 * @returns Standard deviation or 0 if insufficient data
 */
export function calculateStandardDeviation(values: number[]): number {
    if (values.length < 2) {
        return 0;
    }

    try {
        return calcStdDev(values);
    } catch (error) {
        return 0;
    }
}

/**
 * Calculate mean (average) of an array of numbers
 * 
 * @pure
 * @param values - Array of numeric values
 * @returns Mean value or 0 if empty array
 */
export function calculateMean(values: number[]): number {
    if (values.length === 0) {
        return 0;
    }

    const sum = values.reduce((acc, val) => acc + val, 0);
    return sum / values.length;
}

/**
 * Calculate variance of an array of numbers
 * 
 * @pure
 * @param values - Array of numeric values
 * @returns Variance or 0 if insufficient data
 */
export function calculateVariance(values: number[]): number {
    if (values.length < 2) {
        return 0;
    }

    const mean = calculateMean(values);
    const squaredDiffs = values.map(val => Math.pow(val - mean, 2));

    return calculateMean(squaredDiffs);
}
