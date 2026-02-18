/**
 * Date Utilities
 * 
 * Pure functions for date formatting and manipulation.
 * Framework-agnostic - NO React, NO Next.js, NO Node.js APIs
 * 
 * @module lib/utils/dateUtils
 * @pure
 */

/**
 * Format date to YYYY-MM-DD
 * 
 * @pure
 * @param date - Date object or string
 * @returns Formatted date string
 */
export function formatDate(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date;

    if (isNaN(d.getTime())) {
        return '';
    }

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}

/**
 * Parse date string to Date object
 * 
 * @pure
 * @param dateStr - Date string in various formats
 * @returns Date object or null if invalid
 */
export function parseDate(dateStr: string): Date | null {
    if (!dateStr) {
        return null;
    }

    const date = new Date(dateStr);

    if (isNaN(date.getTime())) {
        return null;
    }

    return date;
}

/**
 * Check if date string is valid
 * 
 * @pure
 * @param dateStr - Date string to validate
 * @returns true if valid date, false otherwise
 */
export function isValidDate(dateStr: string): boolean {
    return parseDate(dateStr) !== null;
}

/**
 * Get date N trading days ago
 * Note: This is an approximation (assumes 5-day weeks, no holidays)
 * 
 * @pure
 * @param days - Number of trading days
 * @param from - Starting date (defaults to today)
 * @returns Date object
 */
export function getTradingDaysAgo(days: number, from: Date = new Date()): Date {
    // Approximate: 5 trading days per week = 7 calendar days per 5 trading days
    const calendarDays = Math.ceil((days / 5) * 7);
    const result = new Date(from);
    result.setDate(result.getDate() - calendarDays);

    return result;
}

/**
 * Get date N years ago
 * 
 * @pure
 * @param years - Number of years
 * @param from - Starting date (defaults to today)
 * @returns Date object
 */
export function getYearsAgo(years: number, from: Date = new Date()): Date {
    const result = new Date(from);
    result.setFullYear(result.getFullYear() - years);

    return result;
}

/**
 * Format date to MM/DD/YYYY
 * 
 * @pure
 * @param date - Date object or string
 * @returns Formatted date string
 */
export function formatDateUS(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date;

    if (isNaN(d.getTime())) {
        return '';
    }

    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const year = d.getFullYear();

    return `${month}/${day}/${year}`;
}

/**
 * Get number of days between two dates
 * 
 * @pure
 * @param date1 - First date
 * @param date2 - Second date
 * @returns Number of days (absolute value)
 */
export function daysBetween(date1: Date | string, date2: Date | string): number {
    const d1 = typeof date1 === 'string' ? new Date(date1) : date1;
    const d2 = typeof date2 === 'string' ? new Date(date2) : date2;

    const diffTime = Math.abs(d2.getTime() - d1.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
}
