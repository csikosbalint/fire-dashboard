import type { HistoricalData, SharpeResult } from '@/types';

const YEAR = 253; // Trading days in a year

// Calculate annualized Sharpe ratio
function calculateSharpeRatio({
  annualReturn,
  deviation,
  riskFreeRate = 0.045
}: {
  annualReturn: number;
  deviation: number;
  riskFreeRate?: number;
}): number | null {
  if (deviation === 0) return null;
  return (annualReturn - riskFreeRate) / deviation;
}

// Calculate annual deviation
function calcualteAnnualDeviation({ 
  data, 
  withDailyReturnCalculation 
}: { 
  data: HistoricalData[]; 
  withDailyReturnCalculation: boolean; 
}): number {
  if (data.length < 2) throw new Error("Insufficient data length for annual deviation calculation");

  let returns: number[];

  if (withDailyReturnCalculation) {
    // Calculate daily returns from the data
    returns = [];
    for (let i = 1; i < data.length; i++) {
      const pastPrice = data[i - 1].close;
      const currentPrice = data[i].close;
      const dailyReturn = (currentPrice - pastPrice) / pastPrice;
      returns.push(dailyReturn);
    }
  } else {
    // Assume data already contains returns
    returns = data.filter(d => d.return !== undefined).map(d => d.return);
  }

  if (returns.length === 0) throw new Error("Insufficient returns data for annual deviation calculation");

  // Calculate average return
  const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;

  // Calculate variance
  const variance = returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length;

  // Calculate standard deviation
  const stdDev = Math.sqrt(variance);

  // Annualize the standard deviation
  const annualizedStdDev = stdDev * Math.sqrt(YEAR);

  return annualizedStdDev;
}

// Calculate annual return over the past year
function calculateAnnualReturn({data}: {data: HistoricalData[]}): number {
  if (data.length < YEAR + 1) throw new Error("Insufficient data length for annual return calculation");
  
  const latestPrice = data[0].close;
  const yearAgoPrice = data[YEAR-1].close;
  
  return (latestPrice - yearAgoPrice) / yearAgoPrice;
}

async function calculateSharpe(tickers: string[]): Promise<SharpeResult[]> {

    if (tickers.length === 0) {
      return [];
    }

    // Add loading states for new tickers
    let results: SharpeResult[] = tickers.map((ticker) => ({
      ticker,
      yesterday: null,
      lastWeek: null,
      lastMonth: null,
      lastQuarter: null,
      lastSemester: null,
      lastYear: null,
      loading: true,
    }));

    // Fetch and calculate for new tickers only
    const fetchAndCalculate = async (tickersToFetch: string[]) => {
      const promises = tickersToFetch.map(async (ticker) => {
        return new Promise<SharpeResult>(async (resolve, reject) => {
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

            const historicalData = stockData.historicalData.slice(1); // Remove the most recent day to avoid incomplete data
            const yesterdayReturns = calculateAnnualReturn({data: historicalData});
            const lastWeekReturns = calculateAnnualReturn({data: historicalData.slice(Math.ceil(YEAR / 52))});
            const lastMonthReturns = calculateAnnualReturn({data: historicalData.slice(Math.ceil(YEAR / 12))});
            const lastQuarterReturns = calculateAnnualReturn({data: historicalData.slice(Math.ceil(YEAR / 4))});
            const lastSemesterReturns = calculateAnnualReturn({data: historicalData.slice(Math.ceil(YEAR / 2))});
            const lastYearReturns = calculateAnnualReturn({data: historicalData.slice(YEAR)});
            const yesterdayDeviation = calcualteAnnualDeviation({ data: historicalData, withDailyReturnCalculation: true });
            const lastWeekDeviation = calcualteAnnualDeviation({ data: historicalData.slice(Math.ceil(YEAR / 52)), withDailyReturnCalculation: true });
            const lastMonthDeviation = calcualteAnnualDeviation({ data: historicalData.slice(Math.ceil(YEAR / 12)), withDailyReturnCalculation: true });
            const lastQuarterDeviation = calcualteAnnualDeviation({ data: historicalData.slice(Math.ceil(YEAR / 4)), withDailyReturnCalculation: true });
            const lastSemesterDeviation = calcualteAnnualDeviation({ data: historicalData.slice(Math.ceil(YEAR / 2)), withDailyReturnCalculation: true });
            const lastYearDeviation = calcualteAnnualDeviation({ data: historicalData.slice(YEAR), withDailyReturnCalculation: true });
            const result: SharpeResult = {
              ticker,
              yesterday: calculateSharpeRatio({annualReturn: yesterdayReturns, deviation: yesterdayDeviation}),
              lastWeek: calculateSharpeRatio({annualReturn: lastWeekReturns, deviation: lastWeekDeviation}),
              lastMonth: calculateSharpeRatio({annualReturn: lastMonthReturns, deviation: lastMonthDeviation}),
              lastQuarter: calculateSharpeRatio({annualReturn: lastQuarterReturns, deviation: lastQuarterDeviation}),
              lastSemester: calculateSharpeRatio({annualReturn: lastSemesterReturns, deviation: lastSemesterDeviation}),
              lastYear: calculateSharpeRatio({annualReturn: lastYearReturns, deviation: lastYearDeviation}),
              loading: false,
            };
            resolve(result);
          } catch (error) {
            const errorResult: SharpeResult = {
              ticker,
              yesterday: null,
              lastWeek: null,
              lastMonth: null,
              lastQuarter: null,
              lastSemester: null,
              lastYear: null,
              loading: false,
              error: error instanceof Error ? error.message : 'Unknown error',
            };
            reject(errorResult);
          }
        });
      });
      return Promise.allSettled(promises).then((settledResults) => {
        return settledResults.map((res) => {
          if (res.status === 'fulfilled') {
            return res.value;
          } else {
            return res.reason;
          }
        });
      });
    };

    results = await fetchAndCalculate(tickers);

  return results;
}

export function useSharpeRatios() {
  return {
    calculateSharpe
  };
}