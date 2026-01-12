import { unstable_cache } from 'next/cache';
import YahooFinance from 'yahoo-finance2';

const yahooFinance = new YahooFinance();

interface HistoricalData {
  date: string;
  close: number;
  volume: number;
  open: number;
  high: number;
  low: number;
}

export interface StockDataResult {
  ticker: string;
  historicalData: HistoricalData[];
  daysCount: number;
  error?: string;
}

// Helper function to format date as YYYY-MM-DD
function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

// Create a cached version of the fetch function
// This will cache for 1 hour (3600 seconds)
const getCachedStockData = unstable_cache(
  async (ticker: string): Promise<HistoricalData[]> => {
    try {
      // Fetch last 100 days of historical data
      const endDate = new Date();
      const startDate = new Date(endDate.getTime() - 100 * 24 * 60 * 60 * 1000);

      const quotes = await yahooFinance.historical(ticker, {
        period1: startDate,
        period2: endDate,
      });

      const historicalData: HistoricalData[] = (quotes as any[])
        .map((quote: any) => ({
          date: formatDate(quote.date),
          close: quote.close || 0,
          volume: quote.volume || 0,
          open: quote.open || 0,
          high: quote.high || 0,
          low: quote.low || 0,
        }))
        .filter((data) => data.close > 0)
        .reverse(); // Most recent first

      return historicalData;
    } catch (error) {
      console.error(`Error fetching data for ${ticker}:`, error);
      throw new Error(`Failed to fetch data for ticker ${ticker}`);
    }
  },
  ['stock-data'], // Cache key base
  { tags: ['stock-data'], revalidate: 3600 } // 1 hour cache
);

export async function fetchStockData(
  ticker: string
): Promise<StockDataResult> {
  try {
    const historicalData = await getCachedStockData(ticker);

    return {
      ticker: ticker.toUpperCase(),
      historicalData,
      daysCount: historicalData.length,
    };
  } catch (error) {
    return {
      ticker: ticker.toUpperCase(),
      historicalData: [],
      daysCount: 0,
      error:
        error instanceof Error
          ? error.message
          : 'Unknown error occurred',
    };
  }
}

export async function fetchMultipleStocks(
  tickers: string[]
): Promise<StockDataResult[]> {
  const results = await Promise.all(
    tickers.map((ticker) => fetchStockData(ticker.trim()))
  );
  return results;
}
