/**
 * Sharpe Ratio API Route
 * 
 * POST endpoint for calculating Sharpe ratios server-side.
 * Uses layered architecture: Middleware → Services → Domain
 */

import { NextRequest } from 'next/server';
import { validateSharpeRequest, parseRequestBody } from '@/lib/middleware/validation';
import { createErrorResponse, createSuccessResponse } from '@/adapters/api/routeHandlers';
import { fetchMultipleStocks } from '@/services/stockData/stockDataService';
import { nextCache } from '@/adapters/cache/nextCacheAdapter';
import { sortChronological, extractClosingPrices } from '@/domain/stock/transformer';
import { calculateMultiPeriodSharpe } from '@/domain/finance/sharpeCalculator';
import type { SharpeApiResult } from '@/types/dto/StockDataDTO';

export async function POST(request: NextRequest) {
    // Parse request body
    const body = await parseRequestBody(request);

    if (!body) {
        return createErrorResponse('Invalid request body', 400);
    }

    // Validate request using middleware
    const validation = validateSharpeRequest(body);

    if (!validation.valid) {
        return createErrorResponse(validation.error || 'Validation failed', 400);
    }

    const { tickers, lookback } = validation.data!;

    try {
        // Fetch stock data using service layer
        const stockDataResults = await fetchMultipleStocks(tickers, nextCache);

        // Calculate Sharpe ratios for each ticker using domain logic
        const results: SharpeApiResult[] = stockDataResults.map(stockResult => {
            if (stockResult.error || stockResult.historicalData.length === 0) {
                return {
                    ticker: stockResult.ticker,
                    yesterday: null,
                    lastWeek: null,
                    lastMonth: null,
                    lastQuarter: null,
                    lastSemester: null,
                    lastYear: null,
                    error: stockResult.error || 'No data available'
                };
            }

            // Transform data for calculation (needs chronological order)
            const chronologicalData = sortChronological(stockResult.historicalData);
            const prices = extractClosingPrices(chronologicalData);

            // Calculate multi-period Sharpe ratios using domain logic
            const sharpeData = calculateMultiPeriodSharpe(prices, stockResult.ticker);

            return {
                ticker: sharpeData.ticker,
                yesterday: sharpeData.yesterday,
                lastWeek: sharpeData.lastWeek,
                lastMonth: sharpeData.lastMonth,
                lastQuarter: sharpeData.lastQuarter,
                lastSemester: sharpeData.lastSemester,
                lastYear: sharpeData.lastYear
            };
        });

        return createSuccessResponse({ results });
    } catch (error) {
        return createErrorResponse('Failed to calculate Sharpe ratios', 500);
    }
}
