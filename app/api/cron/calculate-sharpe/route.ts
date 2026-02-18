/**
 * Cron Job: Calculate Sharpe Ratios
 * 
 * Pre-calculates Sharpe ratios for popular tickers on schedule.
 * Requires shared secret authentication.
 */

import { NextRequest } from 'next/server';
import { requireCronAuth } from '@/lib/middleware/auth';
import { createSuccessResponse, createErrorResponse } from '@/adapters/api/routeHandlers';
import { fetchMultipleStocks } from '@/services/stockData/stockDataService';
import { nextCache } from '@/adapters/cache/nextCacheAdapter';
import { sortChronological, extractClosingPrices } from '@/domain/stock/transformer';
import { calculateMultiPeriodSharpe } from '@/domain/finance/sharpeCalculator';

// Popular tickers to pre-calculate
const POPULAR_TICKERS = ['AAPL', 'GOOGL', 'MSFT', 'AMZN', 'TSLA', 'NVDA', 'META', 'SPY', 'QQQ', 'VOO'];

async function handler(request: NextRequest) {
    try {
        // Fetch stock data for popular tickers
        const stockDataResults = await fetchMultipleStocks(POPULAR_TICKERS, nextCache);

        const calculated: string[] = [];
        const errors: string[] = [];

        // Calculate Sharpe ratios for each
        for (const stockResult of stockDataResults) {
            if (stockResult.error || stockResult.historicalData.length === 0) {
                errors.push(`${stockResult.ticker}: ${stockResult.error || 'No data'}`);
                continue;
            }

            try {
                const chronologicalData = sortChronological(stockResult.historicalData);
                const prices = extractClosingPrices(chronologicalData);

                // Calculate (results are implicitly cached)
                calculateMultiPeriodSharpe(prices, stockResult.ticker);

                calculated.push(stockResult.ticker);
            } catch (error) {
                errors.push(`${stockResult.ticker}: Calculation failed`);
            }
        }

        return createSuccessResponse({
            success: true,
            calculated,
            errors: errors.length > 0 ? errors : undefined,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        return createErrorResponse('Failed to calculate Sharpe ratios', 500);
    }
}

// Export with cron auth wrapper
export const GET = requireCronAuth(handler);
export const POST = requireCronAuth(handler);
