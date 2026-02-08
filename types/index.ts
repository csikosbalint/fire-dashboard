// Stock-related types
export interface HistoricalData {
  date: string;
  close: number;
  volume: number;
  open: number;
  high: number;
  low: number;
  sharpeRatio1Y?: number;
  trailingReturn1Y?: number;
  stdDev1Y?: number;
}

export interface StockDataResult {
  ticker: string;
  historicalData: HistoricalData[];
  daysCount: number;
  error?: string;
}

// Sharpe calculation types
export interface SharpeResult {
  ticker: string | null;
  yesterday: string | null;
  lastWeek: string | null;
  lastMonth: string | null;
  lastQuarter: string | null;
  lastSemester: string | null;
  lastYear: string | null;
  loading?: boolean;
  error?: string;
}

// Zustand store types
export interface SharpeStore {
  tickers: string[];
  addTicker: (ticker: string) => void;
  removeTicker: (ticker: string) => void;
  clearTickers: () => void;
}

export enum CalculationPeriod {
  Y1 = '1y',
}