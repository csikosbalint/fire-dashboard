import { HistoricalData, SharpeResult } from '@/types';
import { calculateStandardDeviation } from '@railpath/finance-toolkit';

const DEFAULT_LOOKBACK = 250; // Trading days in a year

function enhanceWithSimpleSharpe({
  historicalData,
  ticker,
  lookback = DEFAULT_LOOKBACK,
}: {
  historicalData: HistoricalData[];
  ticker?: string;
  lookback?: number;
}): void {
  let firstT = true;
  let firstS = true;
  console.log(`${ticker} Historical data length `, historicalData.length);
  if (new Date(historicalData[0].date) > new Date(historicalData[historicalData.length - 1].date)) {
    console.warn(`${ticker} Historical data is not in chronological order. Please ensure the data is sorted from oldest to newest.`);
    throw new Error("Historical data is not in chronological order.");
  }
  console.log(`${ticker} Oldest first ${historicalData[0].date} close ${historicalData[0].close}`);
  historicalData.forEach((quote, index) => {
    const isEnoughPrice = index >= lookback; // we need 1 period of price data to calculate trailing(period) return
    if (!isEnoughPrice) return; // first trailing(period) return calculation
    if (firstT) {
      console.log(`${ticker} 1st: trailing return`, index, quote.date, quote.close);
      firstT = false;
    }
    quote.trailingReturn1Y = isEnoughPrice ? Number((((quote.close - historicalData[index - lookback].close) / historicalData[index - lookback].close) * 100)) : undefined;

    const isEnoughReturn = index >= 2 * lookback; // we need 1+1 period of trailing returns to calculate stddev(period) from trailing returns
    if (!isEnoughReturn) return; // first stddev(period)
    const dataSlice = historicalData.slice(index - lookback, index + 1)
    quote.stdDev1Y = Number(
      calculateStandardDeviation(
        dataSlice
          .map(d => Number(d.trailingReturn1Y))
      )
    )
    // the simplified sharpe ratio = trailingReturn(period) / stddev(period)
    quote.sharpeRatio1Y = Number(
      (quote.trailingReturn1Y! / quote.stdDev1Y!)
    )
    if (firstS) {
      console.log(`${ticker}  1st: (close1-close2)=trailing return, stddev, sharpe `, index, quote.date, quote.close, historicalData[index - lookback].close, quote.trailingReturn1Y, quote.stdDev1Y, quote.sharpeRatio1Y);
      firstS = false;
    }

    if (index === historicalData.length - 1) {
      console.log(`${ticker} last: trailing return, stddev, sharpe `, index, quote.date, quote.close, quote.trailingReturn1Y, quote.stdDev1Y, quote.sharpeRatio1Y);
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
      yesterday: `${historicalData[historicalData.length - 1].date}: ${historicalData[historicalData.length - 1].trailingReturn1Y?.toFixed(2)}/${historicalData[historicalData.length - 1].stdDev1Y?.toFixed(2)}=${historicalData[historicalData.length - 1].sharpeRatio1Y?.toFixed(2)}`,
      lastWeek: `${historicalData[historicalData.length - 5].date}: ${historicalData[historicalData.length - 5].trailingReturn1Y?.toFixed(2)}/${historicalData[historicalData.length - 5].stdDev1Y?.toFixed(2)}=${historicalData[historicalData.length - 5].sharpeRatio1Y?.toFixed(2)}`,
      lastMonth: `${historicalData[historicalData.length - Math.round(250 / 12)].date}: ${historicalData[historicalData.length - Math.round(250 / 12)].trailingReturn1Y?.toFixed(2)}/${historicalData[historicalData.length - Math.round(250 / 12)].stdDev1Y?.toFixed(2)}=${historicalData[historicalData.length - Math.round(250 / 12)].sharpeRatio1Y?.toFixed(2)}`,
      lastQuarter: `${historicalData[historicalData.length - Math.round(250 / 4)].date}: ${historicalData[historicalData.length - Math.round(250 / 4)].trailingReturn1Y?.toFixed(2)}/${historicalData[historicalData.length - Math.round(250 / 4)].stdDev1Y?.toFixed(2)}=${historicalData[historicalData.length - Math.round(250 / 4)].sharpeRatio1Y?.toFixed(2)}`,
      lastSemester: `${historicalData[historicalData.length - Math.round(250 / 2)].date}: ${historicalData[historicalData.length - Math.round(250 / 2)].trailingReturn1Y?.toFixed(2)}/${historicalData[historicalData.length - Math.round(250 / 2)].stdDev1Y?.toFixed(2)}=${historicalData[historicalData.length - Math.round(250 / 2)].sharpeRatio1Y?.toFixed(2)}`,
      lastYear: `${historicalData[historicalData.length - Math.round(250)].date}: ${historicalData[historicalData.length - Math.round(250)].trailingReturn1Y?.toFixed(2)}/${historicalData[historicalData.length - Math.round(250)].stdDev1Y?.toFixed(2)}=${historicalData[historicalData.length - Math.round(250)].sharpeRatio1Y?.toFixed(2)}`,
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