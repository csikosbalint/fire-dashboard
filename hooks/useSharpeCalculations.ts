import { useState, useEffect, useRef } from 'react';

interface HistoricalData {
  date: string;
  close: number;
}

interface SharpeResult {
  ticker: string;
  today: number | null;
  week: number | null;
  month: number | null;
  quarter: number | null;
  semiAnnual: number | null;
  year: number | null;
  loading: boolean;
  error?: string;
}

// Calculate annualized Sharpe ratio
function calculateSharpeRatio(
  returns: number[],
  periodsPerYear: number,
  riskFreeRate: number = 0.045
): number | null {
  if (returns.length < 2) return null;

  const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
  const variance =
    returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) /
    returns.length;
  const stdDev = Math.sqrt(variance);

  if (stdDev === 0) return null;

  // Annualize return and std dev
  const annualizedReturn = avgReturn * periodsPerYear;
  const annualizedStdDev = stdDev * Math.sqrt(periodsPerYear);

  // Sharpe ratio = (return - risk_free_rate) / std_dev
  return (annualizedReturn - riskFreeRate) / annualizedStdDev;
}

// Calculate returns for a given period
function calculatePeriodReturns(
  data: HistoricalData[],
  days: number
): number[] {
  if (data.length < days + 1) return [];

  const returns: number[] = [];
  for (let i = 0; i < data.length - days; i++) {
    const endPrice = data[i].close;
    const startPrice = data[i + days].close;
    if (startPrice > 0) {
      returns.push((endPrice - startPrice) / startPrice);
    }
  }
  return returns;
}

export function useSharpeCalculations(tickers: string[]): SharpeResult[] {
  const [results, setResults] = useState<SharpeResult[]>([]);
  const fetchedTickersRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (tickers.length === 0) {
      setResults([]);
      fetchedTickersRef.current = new Set();
      return;
    }

    // Remove results for tickers that are no longer in the list
    setResults(prev => prev.filter(r => tickers.includes(r.ticker)));
    
    // Clean up fetchedTickers ref
    const currentFetchedTickers = new Set<string>();
    fetchedTickersRef.current.forEach(ticker => {
      if (tickers.includes(ticker)) {
        currentFetchedTickers.add(ticker);
      }
    });
    fetchedTickersRef.current = currentFetchedTickers;

    // Find new tickers that haven't been fetched yet
    const newTickers = tickers.filter(
      ticker => !fetchedTickersRef.current.has(ticker)
    );

    if (newTickers.length === 0) {
      return;
    }

    // Add loading states for new tickers
    const newResults: SharpeResult[] = newTickers.map((ticker) => ({
      ticker,
      today: null,
      week: null,
      month: null,
      quarter: null,
      semiAnnual: null,
      year: null,
      loading: true,
    }));

    setResults(prev => [...prev, ...newResults]);

    // Mark these tickers as being fetched
    newTickers.forEach(ticker => fetchedTickersRef.current.add(ticker));

    // Fetch and calculate for new tickers only
    const fetchAndCalculate = async () => {
      const promises = newTickers.map(async (ticker) => {
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

          const historicalData = stockData.historicalData;

          // Calculate Sharpe ratios for different periods
          // Using more recent data for shorter periods for accuracy
          const todayReturns = calculatePeriodReturns(historicalData, 1);
          const weekReturns = calculatePeriodReturns(historicalData, 7);
          const monthReturns = calculatePeriodReturns(historicalData, 30);
          const quarterReturns = calculatePeriodReturns(historicalData, 90);
          const semiAnnualReturns = calculatePeriodReturns(historicalData, 180);
          const yearReturns = calculatePeriodReturns(historicalData, 365);

          const result: SharpeResult = {
            ticker,
            today: calculateSharpeRatio(todayReturns, 252), // 252 trading days
            week: calculateSharpeRatio(weekReturns, 52), // 52 weeks
            month: calculateSharpeRatio(monthReturns, 12), // 12 months
            quarter: calculateSharpeRatio(quarterReturns, 4), // 4 quarters
            semiAnnual: calculateSharpeRatio(semiAnnualReturns, 2), // 2 half-years
            year: calculateSharpeRatio(yearReturns, 1), // 1 year
            loading: false,
          };

          // Update result for this specific ticker
          setResults((prev) => 
            prev.map(r => r.ticker === ticker ? result : r)
          );
        } catch (error) {
          const errorResult: SharpeResult = {
            ticker,
            today: null,
            week: null,
            month: null,
            quarter: null,
            semiAnnual: null,
            year: null,
            loading: false,
            error: error instanceof Error ? error.message : 'Unknown error',
          };

          setResults((prev) => 
            prev.map(r => r.ticker === ticker ? errorResult : r)
          );
        }
      });

      await Promise.all(promises);
    };

    fetchAndCalculate();
  }, [tickers]);

  return results;
}
