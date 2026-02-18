/**
 * Stock Data Service
 * 
 * Orchestrates stock data fetching with caching.
 * Pure Node.js - NO Next.js imports (uses CacheInterface for caching).
 * 
 * @module services/stockData/stockDataService
 */

import type { StockDataResult } from '../../types/dto/StockDataDTO';
import type { CacheInterface } from '../cache/cacheInterface';
import { fetchHistoricalData } from './yahooFinanceAdapter';
import { filterValidPrices, sortReverseChronological } from '../../domain/stock/transformer';
import type { StockPrice } from '../../domain/stock/transformer';

/**
 * Fetch stock data for a single ticker with caching
 * 
 * @param ticker - Stock ticker symbol
 * @param cache - Cache implementation (injected dependency)
 * @returns StockDataResult with historical data or error
 */
export async function fetchSingleStock(
    ticker: string,
    cache?: CacheInterface
): Promise<StockDataResult> {
    const fetchFn = async (): Promise<StockDataResult> => {
        const historicalData = await fetchHistoricalData(ticker);

        if (historicalData.length === 0) {
            return {
                ticker,
                historicalData: [],
                daysCount: 0,
                error: `No data available for ${ticker}`
            };
        }

        // Use domain transformers for filtering and sorting
        const stockPrices: StockPrice[] = historicalData.map(d => ({
            date: d.date,
            close: d.close,
            open: d.open,
            high: d.high,
            low: d.low,
            volume: d.volume
        }));

        const validPrices = filterValidPrices(stockPrices);
        const sortedPrices = sortReverseChronological(validPrices);

        return {
            ticker,
            historicalData: sortedPrices,
            daysCount: sortedPrices.length
        };
    };

    // If cache provided, use it; otherwise fetch directly
    if (cache) {
        return cache.getCached(fetchFn, {
            key: ['stock-data', ticker],
            tags: ['stock-data', `stock-${ticker}`],
            revalidate: 3600 // 1 hour
        });
    }

    return fetchFn();
}

/**
 * Fetch stock data for multiple tickers
 * 
 * @param tickers - Array of stock ticker symbols
 * @param cache - Cache implementation (optional)
 * @returns Array of StockDataResult
 */
export async function fetchMultipleStocks(
    tickers: string[],
    cache?: CacheInterface
): Promise<StockDataResult[]> {
    const promises = tickers.map(ticker =>
        fetchSingleStock(ticker, cache)
    );

    return Promise.all(promises);
}
