/**
 * Request Validation Middleware
 * 
 * Validates API request payloads using Zod schemas.
 * Next.js-specific middleware.
 * 
 * @module lib/middleware/validation
 */

import { z } from 'zod';
import type { ValidationResult } from '../../domain/stock/validator';
import { MAX_TICKERS_PER_REQUEST, LOOKBACK_MIN, LOOKBACK_MAX } from '../../domain/constants';

/**
 * Zod schema for stock request
 */
export const stockRequestSchema = z.object({
    tickers: z.array(z.string())
        .min(1, 'At least one ticker is required')
        .max(MAX_TICKERS_PER_REQUEST, `Maximum ${MAX_TICKERS_PER_REQUEST} tickers allowed`)
});

/**
 * Zod schema for Sharpe request
 */
export const sharpeRequestSchema = z.object({
    tickers: z.array(z.string())
        .min(1, 'At least one ticker is required')
        .max(MAX_TICKERS_PER_REQUEST, `Maximum ${MAX_TICKERS_PER_REQUEST} tickers allowed`),
    lookback: z.number()
        .int('Lookback must be an integer')
        .min(LOOKBACK_MIN, `Lookback must be at least ${LOOKBACK_MIN}`)
        .max(LOOKBACK_MAX, `Lookback cannot exceed ${LOOKBACK_MAX}`)
});

/**
 * Validate stock request body
 * 
 * @param body - Request body (unknown type)
 * @returns ValidationResult with parsed data or error
 */
export function validateStockRequest(body: unknown): ValidationResult<{ tickers: string[] }> {
    try {
        const parsed = stockRequestSchema.parse(body);

        return {
            valid: true,
            data: parsed
        };
    } catch (error) {
        if (error instanceof z.ZodError) {
            return {
                valid: false,
                error: error.issues[0]?.message || 'Validation failed'
            };
        }

        return {
            valid: false,
            error: 'Invalid request format'
        };
    }
}

/**
 * Validate Sharpe request body
 * 
 * @param body - Request body (unknown type)
 * @returns ValidationResult with parsed data or error
 */
export function validateSharpeRequest(
    body: unknown
): ValidationResult<{ tickers: string[]; lookback: number }> {
    try {
        const parsed = sharpeRequestSchema.parse(body);

        return {
            valid: true,
            data: parsed
        };
    } catch (error) {
        if (error instanceof z.ZodError) {
            return {
                valid: false,
                error: error.issues[0]?.message || 'Validation failed'
            };
        }

        return {
            valid: false,
            error: 'Invalid request format'
        };
    }
}

/**
 * Parse and validate request body
 * Helper function for API routes
 * 
 * @param request - Request object with json() method
 * @returns Parsed body or null on error
 */
export async function parseRequestBody<T>(
    request: { json: () => Promise<unknown> }
): Promise<T | null> {
    try {
        const body = await request.json();
        return body as T;
    } catch (error) {
        return null;
    }
}
