/**
 * Stock Dashboard Controller
 * 
 * React hook for managing stock dashboard state and API calls.
 * Layer 2: UI Controller - connects UI to backend, manages state.
 * 
 * @module controllers/useStockDashboard
 */

'use client';

import { useState } from 'react';
import type { StockDataResult } from '@/types/dto/StockDataDTO';

export interface UseStockDashboardReturn {
    tickerInput: string;
    setTickerInput: (value: string) => void;
    loading: boolean;
    results: StockDataResult[];
    error: string | null;
    fetchStocks: () => Promise<void>;
}

/**
 * Hook for stock dashboard functionality
 * Manages state, validation, and API calls
 */
export function useStockDashboard(): UseStockDashboardReturn {
    const [tickerInput, setTickerInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<StockDataResult[]>([]);
    const [error, setError] = useState<string | null>(null);

    const fetchStocks = async () => {
        // Parse ticker input
        const tickers = tickerInput
            .split(',')
            .map(t => t.trim().toUpperCase())
            .filter(t => t.length > 0);

        if (tickers.length === 0) {
            setError('Please enter at least one ticker symbol');
            return;
        }

        setLoading(true);
        setError(null);
        setResults([]);

        try {
            const response = await fetch('/api/stock', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ tickers }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to fetch stock data');
            }

            const data = await response.json();
            setResults(data.results || []);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    return {
        tickerInput,
        setTickerInput,
        loading,
        results,
        error,
        fetchStocks
    };
}
