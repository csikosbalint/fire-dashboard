import { CalculationPeriod, HistoricalData, SharpeResult } from '@/types';
import { calculateStandardDeviation } from '@railpath/finance-toolkit';

const DEFAULT_LOOKBACK = 250; // Trading days in a year

function enhanceWithSimpleSharpe({
  historicalData,
  period = CalculationPeriod.Y1,
  ticker,
  lookback = DEFAULT_LOOKBACK,
}: {
  historicalData: HistoricalData[];
  period?: CalculationPeriod;
  ticker?: string;
  lookback?: number;
}): void {
  let firstT = true;
  let firstS = true;
  console.log(`${ticker} Historical data length `, historicalData.length);
  console.log(`${ticker} Oldest first ${historicalData[0].date} close ${historicalData[0].close}`);
  historicalData.forEach((quote, index) => {
    const isEnoughPrice = index >= lookback; // we need 1 period of price data to calculate trailing(period) return
    if (!isEnoughPrice) return; // first trailing(period) return calculation
    if (firstT) {
      console.log(`${ticker} trailing return`, index, quote.date, quote.close);
      firstT = false;
    }
    quote.trailingReturn1Y = isEnoughPrice ? Number((((quote.close - historicalData[index - lookback].close) / historicalData[index - lookback].close) * 100).toFixed(2)) : undefined;
    const isDataEnough = index >= 2 * lookback; // we need +1 period of trailing returns to calculate stddev(period) from trailing returns
    if (!isDataEnough) return; // first stddev(period)
    quote.stdDev1Y = isDataEnough ? Number(
      calculateStandardDeviation(
        historicalData.slice(index - lookback, index)
          .map(d => Number(d.trailingReturn1Y))
      ).toFixed(2))
      : undefined;
    // my simplified sharpe ratio = trailingReturn(period) / stddev(period)
    quote.sharpeRatio1Y = isDataEnough ? Number((quote.trailingReturn1Y! / quote.stdDev1Y!).toFixed(2)) : undefined;
    if (firstS) {
      console.log(`${ticker} trailing return, stddev, sharpe`, index, quote.date, quote.close, quote.trailingReturn1Y, quote.stdDev1Y, quote.sharpeRatio1Y);
      firstS = false;
    }
    if (index === historicalData.length - 1) {
      console.log(`${ticker} today `, index, quote.date, quote.close, quote.trailingReturn1Y, quote.stdDev1Y, quote.sharpeRatio1Y);
    }
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

function calculateSharpeFromData(
  historicalData: HistoricalData[],
  ticker?: string,
  lookback: number = DEFAULT_LOOKBACK
): Omit<SharpeResult, 'ticker' | 'loading'> {
  try {
    enhanceWithSimpleSharpe({ historicalData, ticker, lookback });

    return {
      yesterday: `${historicalData[historicalData.length - 1].date}${historicalData[historicalData.length - 1].trailingReturn1Y}/${historicalData[historicalData.length - 1].stdDev1Y}=${historicalData[historicalData.length - 1].sharpeRatio1Y}`,
      lastWeek: `${historicalData[historicalData.length - 5].date}: ${historicalData[historicalData.length - 5].trailingReturn1Y}/${historicalData[historicalData.length - 5].stdDev1Y}=${historicalData[historicalData.length - 5].sharpeRatio1Y}`,
      lastMonth: `${historicalData[historicalData.length - Math.round(lookback / 12)].date}: ${historicalData[historicalData.length - Math.round(lookback / 12)].trailingReturn1Y}/${historicalData[historicalData.length - Math.round(lookback / 12)].stdDev1Y}=${historicalData[historicalData.length - Math.round(lookback / 12)].sharpeRatio1Y}`,
      lastQuarter: `${historicalData[historicalData.length - Math.round(lookback / 4)].date}: ${historicalData[historicalData.length - Math.round(lookback / 4)].trailingReturn1Y}/${historicalData[historicalData.length - Math.round(lookback / 4)].stdDev1Y}=${historicalData[historicalData.length - Math.round(lookback / 4)].sharpeRatio1Y}`,
      lastSemester: `${historicalData[historicalData.length - Math.round(lookback / 2)].date}: ${historicalData[historicalData.length - Math.round(lookback / 2)].trailingReturn1Y}/${historicalData[historicalData.length - Math.round(lookback / 2)].stdDev1Y}=${historicalData[historicalData.length - Math.round(lookback / 2)].sharpeRatio1Y}`,
      lastYear: `${historicalData[historicalData.length - Math.round(lookback)].date}: ${historicalData[historicalData.length - Math.round(lookback)].trailingReturn1Y}/${historicalData[historicalData.length - Math.round(lookback)].stdDev1Y}=${historicalData[historicalData.length - Math.round(lookback)].sharpeRatio1Y}`,
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

async function calculateSharpe(
  tickers: string[],
  lookback: number = DEFAULT_LOOKBACK
): Promise<SharpeResult[]> {
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
        error: data.error,
      };
    }

    const calculations = calculateSharpeFromData(
      data.historicalData.slice(data.historicalData.length - 3 * lookback),
      data.ticker,
      lookback
    );
    return {
      ticker: data.ticker,
      ...calculations,
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