/**
 * Yahoo Finance Adapter
 * 
 * Wraps yahoo-finance2 library for stock data fetching.
 * Pure Node.js - NO React, NO Next.js cache (uses cache interface).
 * 
 * @module services/stockData/yahooFinanceAdapter
 */

import yahooFinance from 'yahoo-finance2';
import type { HistoricalData } from '../../types/dto/StockDataDTO';
import { HISTORICAL_DATA_YEARS } from '../../domain/constants';
import { getYearsAgo } from '../../lib/utils/dateUtils';

/**
 * Raw quote data from Yahoo Finance
 */
interface RawQuote {
    date: Date;
    close: number;
    open: number;
    high: number;
    low: number;
    volume: number;
}

/**
 * Fetch historical stock  data from Yahoo Finance
 * 
 * @param ticker - Stock ticker symbol
 * @param startDate - Start date for historical data
 * @param endDate - End date for historical data
 * @returns Array of historical data points
 */
export async function fetchHistoricalData(
    ticker: string,
    startDate?: Date,
    endDate?: Date
): Promise<HistoricalData[]> {
    try {
        const end = endDate || new Date();
        const start = startDate || getYearsAgo(HISTORICAL_DATA_YEARS, end);

        const result = await yahooFinance.historical(ticker, {
            period1: start,
            period2: end,
            interval: '1d'
        });

        // Transform to HistoricalData format
        // Type assertion needed due to yahoo-finance2 types
        const historicalData: HistoricalData[] = (result as any[]).map((quote: any) => ({
            date: quote.date.toISOString ? quote.date.toISOString().split('T')[0] : quote.date,
            close: quote.close || 0,
            open: quote.open || 0,
            high: quote.high || 0,
            low: quote.low || 0,
            volume: quote.volume || 0
        }));

        return historicalData;
    } catch (error) {
        // Return empty array on error - caller handles errors
        return [];
    }
}

/**
 * Fetch quote for a single ticker (current data)
 * 
 * @param ticker - Stock ticker symbol
 * @returns Current quote data or null on error
 */
export async function fetchQuote(ticker: string): Promise<RawQuote | null> {
    try {
        const quote: any = await yahooFinance.quote(ticker);

        if (!quote || !quote.regularMarketPrice) {
            return null;
        }

        return {
            date: new Date(),
            close: quote.regularMarketPrice,
            open: quote.regularMarketOpen || quote.regularMarketPrice,
            high: quote.regularMarketDayHigh || quote.regularMarketPrice,
            low: quote.regularMarketDayLow || quote.regularMarketPrice,
            volume: quote.regularMarketVolume || 0
        };
    } catch (error) {
        return null;
    }
}
