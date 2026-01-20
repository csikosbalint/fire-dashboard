import { CalculationPeriod, HistoricalData, SharpeResult } from '@/types';
import { calculateStandardDeviation } from '@railpath/finance-toolkit';
const FISC_YEAR_DAYS = 250; // Trading days in a year

function enhanceWithSimpleSharpe({ historicalData, period = CalculationPeriod.Y1 }: { historicalData: HistoricalData[]; period?: CalculationPeriod }): void {
  historicalData.forEach((quote, index) => {
    const isEnoughPrice = index >= FISC_YEAR_DAYS;
    if (!isEnoughPrice) return;
    quote.trailingReturn1Y = isEnoughPrice ? Number((((quote.close - historicalData[index - FISC_YEAR_DAYS].close) / historicalData[index - FISC_YEAR_DAYS].close) * 100).toFixed(2)) : undefined;
    const isDataEnough = quote.trailingReturn1Y !== undefined && index >= 2 * FISC_YEAR_DAYS;
    if (!isDataEnough) return;
    quote.stdDev1Y = isDataEnough ? Number(calculateStandardDeviation(historicalData.slice(index - FISC_YEAR_DAYS, index + 1).map(d => Number(d.trailingReturn1Y))).toFixed(2)) : undefined;
    quote.sharpeRatio1Y = isDataEnough ? Number((quote.trailingReturn1Y! / quote.stdDev1Y!).toFixed(2)) : undefined;
  });
}

async function fetchStockData(tickers: string[]): Promise<{ ticker: string; historicalData: HistoricalData[] | null; error?: string }[]> {
  const promises = tickers.map(async (ticker) => {
    try {
      const response = await fetch('/api/stock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tickers: [ticker] }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }

      const data = await response.json();
      const stockData = data[0];

      if (stockData.error || !stockData.historicalData) {
        throw new Error(stockData.error || 'No data available');
      }

      const historicalData = stockData.historicalData.slice(1).reverse() as HistoricalData[];
      return { ticker, historicalData };
    } catch (error) {
      return {
        ticker,
        historicalData: null,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  });

  return Promise.all(promises);
}

function calculateSharpeFromData(historicalData: HistoricalData[], ticker?: string): Omit<SharpeResult, 'ticker' | 'loading'> {
  try {
    enhanceWithSimpleSharpe({ historicalData });

    return {
      yesterday: historicalData[historicalData.length - 1].sharpeRatio1Y || null,
      lastWeek: historicalData[historicalData.length - Math.round(FISC_YEAR_DAYS / 52)]?.sharpeRatio1Y || null,
      lastMonth: historicalData[historicalData.length - Math.round(FISC_YEAR_DAYS / 12)]?.sharpeRatio1Y || null,
      lastQuarter: historicalData[historicalData.length - Math.round(FISC_YEAR_DAYS / 4)]?.sharpeRatio1Y || null,
      lastSemester: historicalData[historicalData.length - Math.round(FISC_YEAR_DAYS / 2)]?.sharpeRatio1Y || null,
      lastYear: historicalData[historicalData.length - Math.round(FISC_YEAR_DAYS)]?.sharpeRatio1Y || null,
    };
  } catch (error) {
    return {
      yesterday: null,
      lastWeek: null,
      lastMonth: null,
      lastQuarter: null,
      lastSemester: null,
      lastYear: null,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

async function calculateSharpe(tickers: string[]): Promise<SharpeResult[]> {
  if (tickers.length === 0) {
    return [];
  }

  const fetchedData = await fetchStockData(tickers);

  return fetchedData.map((data) => {
    if (!data.historicalData || data.error) {
      return {
        ticker: data.ticker,
        yesterday: null,
        lastWeek: null,
        lastMonth: null,
        lastQuarter: null,
        lastSemester: null,
        lastYear: null,
        loading: false,
        error: data.error,
      };
    }

    const calculations = calculateSharpeFromData(data.historicalData, data.ticker);
    return {
      ticker: data.ticker,
      ...calculations,
      loading: false,
    };
  });
}

export function useSharpeRatios() {
  return {
    calculateSharpe,
    calculateSharpeFromData,
    fetchStockData,
  };
}