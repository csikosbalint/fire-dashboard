/**
 * Sharpe Calculator Controller
 * 
 * React hook for managing Sharpe calculation state and API calls.
 * Layer 2: UI Controller - connects UI to backend, formats results for display.
 * 
 * @module controllers/useSharpeCalculator
 */

'use client';

import { useState, useCallback } from 'react';
import type { SharpeDisplayResult } from '@/types/ui/SharpeDisplay';
import type { SharpeApiResult } from '@/types/dto/StockDataDTO';
import { formatPercent, formatSharpe } from '@/lib/utils/numberFormatters';

export interface UseSharpeCalculatorReturn {
    loading: boolean;
    results: SharpeDisplayResult[];
    error: string | null;
    calculateSharpe: (tickers: string[], lookback: number) => Promise<void>;
}

/**
 * Format Sharpe metrics for display
 */
function formatSharpeMetrics(
    metrics: { sharpeRatio: number; trailingReturn: number; stdDev: number } | null
): string | null {
    if (!metrics) {
        return null;
    }

    return `SR: ${formatSharpe(metrics.sharpeRatio)}, Return: ${formatPercent(metrics.trailingReturn)}, StdDev: ${formatPercent(metrics.stdDev)}`;
}

/**
 * Transform API result to display result
 */
function transformToDisplayResult(apiResult: SharpeApiResult): SharpeDisplayResult {
    return {
        ticker: apiResult.ticker,
        yesterday: formatSharpeMetrics(apiResult.yesterday),
        lastWeek: formatSharpeMetrics(apiResult.lastWeek),
        lastMonth: formatSharpeMetrics(apiResult.lastMonth),
        lastQuarter: formatSharpeMetrics(apiResult.lastQuarter),
        lastSemester: formatSharpeMetrics(apiResult.lastSemester),
        lastYear: formatSharpeMetrics(apiResult.lastYear),
        error: apiResult.error
    };
}

/**
 * Hook for Sharpe ratio calculation functionality
 * Manages state, API calls, and result formatting
 */
export function useSharpeCalculator(): UseSharpeCalculatorReturn {
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<SharpeDisplayResult[]>([]);
    const [error, setError] = useState<string | null>(null);

    const calculateSharpe = useCallback(async (tickers: string[], lookback: number) => {
        if (tickers.length === 0) {
            setError('No tickers to calculate');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/sharpe', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ tickers, lookback }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to calculate Sharpe ratios');
            }

            const data = await response.json();
            const apiResults: SharpeApiResult[] = data.results || [];

            // Transform API results to display format
            const displayResults = apiResults.map(transformToDisplayResult);
            setResults(displayResults);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
            setResults([]);
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        loading,
        results,
        error,
        calculateSharpe
    };
}
