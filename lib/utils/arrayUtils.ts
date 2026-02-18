/**
 * Array Utilities
 * 
 * Pure functions for array operations.
 * Framework-agnostic - NO React, NO Next.js, NO Node.js APIs
 * All functions are immutable.
 * 
 * @module lib/utils/arrayUtils
 * @pure
 * @immutable
 */

/**
 * Safely slice an array (non-mutating)
 * 
 * @pure
 * @immutable
 * @param arr - Array to slice
 * @param start - Start index
 * @param end - End index (optional)
 * @returns New sliced array
 */
export function safeSlice<T>(arr: T[], start: number, end?: number): T[] {
    if (!Array.isArray(arr)) {
        return [];
    }

    return arr.slice(start, end);
}

/**
 * Chunk array into smaller arrays of specified size
 * 
 * @pure
 * @immutable
 * @param arr - Array to chunk
 * @param size - Size of each chunk
 * @returns Array of chunks
 */
export function chunk<T>(arr: T[], size: number): T[][] {
    if (!Array.isArray(arr) || size <= 0) {
        return [];
    }

    const chunks: T[][] = [];

    for (let i = 0; i < arr.length; i += size) {
        chunks.push(arr.slice(i, i + size));
    }

    return chunks;
}

/**
 * Group array elements by a key
 * 
 * @pure
 * @immutable
 * @param arr - Array to group
 * @param key - Key to group by
 * @returns Object with grouped elements
 */
export function groupBy<T>(arr: T[], key: keyof T): Record<string, T[]> {
    if (!Array.isArray(arr)) {
        return {};
    }

    return arr.reduce((acc, item) => {
        const groupKey = String(item[key]);

        if (!acc[groupKey]) {
            acc[groupKey] = [];
        }

        acc[groupKey].push(item);

        return acc;
    }, {} as Record<string, T[]>);
}

/**
 * Remove duplicates from array
 * 
 * @pure
 * @immutable
 * @param arr - Array with potential duplicates
 * @returns New array with duplicates removed
 */
export function unique<T>(arr: T[]): T[] {
    if (!Array.isArray(arr)) {
        return [];
    }

    return Array.from(new Set(arr));
}

/**
 * Flatten nested array one level deep
 * 
 * @pure
 * @immutable
 * @param arr - Nested array
 * @returns Flattened array
 */
export function flatten<T>(arr: T[][]): T[] {
    if (!Array.isArray(arr)) {
        return [];
    }

    return arr.flat();
}

/**
 * Get last N elements from array
 * 
 * @pure
 * @immutable
 * @param arr - Array
 * @param n - Number of elements to get
 * @returns New array with last n elements
 */
export function takeLast<T>(arr: T[], n: number): T[] {
    if (!Array.isArray(arr) || n <= 0) {
        return [];
    }

    return arr.slice(-n);
}

/**
 * Get first N elements from array
 * 
 * @pure
 * @immutable
 * @param arr - Array
 * @param n - Number of elements to get
 * @returns New array with first n elements
 */
export function takeFirst<T>(arr: T[], n: number): T[] {
    if (!Array.isArray(arr) || n <= 0) {
        return [];
    }

    return arr.slice(0, n);
}

/**
 * Check if array is empty
 * 
 * @pure
 * @param arr - Array to check
 * @returns true if array is empty or not an array
 */
export function isEmpty<T>(arr: T[]): boolean {
    return !Array.isArray(arr) || arr.length === 0;
}

/**
 * Sum all numbers in array
 * 
 * @pure
 * @param arr - Array of numbers
 * @returns Sum of all elements
 */
export function sum(arr: number[]): number {
    if (!Array.isArray(arr)) {
        return 0;
    }

    return arr.reduce((acc, val) => acc + val, 0);
}
