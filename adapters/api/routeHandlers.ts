/**
 * API Route Handlers
 * 
 * Wraps services for  use in Next.js API routes.
 * Provides consistent response formatting.
 * 
 * @module adapters/api/routeHandlers
 */

import { NextResponse } from 'next/server';
import type { StockDataResult } from '../../types/dto/StockDataDTO';
import { fetchMultipleStocks } from '../../services/stockData/stockDataService';
import { nextCache } from '../cache/nextCacheAdapter';

/**
 * Handle stock data request
 * Wraps service call with Next.js response formatting
 * 
 * @param tickers - Array of ticker symbols
 * @returns NextResponse with stock data
 */
export async function handleStockDataRequest(
    tickers: string[]
): Promise<NextResponse> {
    try {
        const results = await fetchMultipleStocks(tickers, nextCache);

        return NextResponse.json({ results }, { status: 200 });
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to fetch stock data' },
            { status: 500 }
        );
    }
}

/**
 * Handle cache invalidation request
 * 
 * @param tag - Cache tag to invalidate
 * @returns NextResponse with success status
 */
export async function handleCacheInvalidation(
    tag: string
): Promise<NextResponse> {
    try {
        await nextCache.invalidate(tag);

        return NextResponse.json(
            { success: true, tag },
            { status: 200 }
        );
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to invalidate cache' },
            { status: 500 }
        );
    }
}

/**
 * Create error response
 * 
 * @param message - Error message
 * @param status - HTTP status code
 * @returns NextResponse with error
 */
export function createErrorResponse(
    message: string,
    status: number = 400
): NextResponse {
    return NextResponse.json(
        { error: message },
        { status }
    );
}

/**
 * Create success response
 * 
 * @param data - Response data
 * @param status - HTTP status code
 * @returns NextResponse with data
 */
export function createSuccessResponse<T>(
    data: T,
    status: number = 200
): NextResponse {
    return NextResponse.json(data, { status });
}
