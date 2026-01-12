'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface StockResult {
  ticker: string;
  historicalData: Array<{
    date: string;
    close: number;
    volume: number;
    open: number;
    high: number;
    low: number;
  }>;
  daysCount: number;
  error?: string;
}

export default function StockDashboard() {
  const [tickerInput, setTickerInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<StockResult[]>([]);
  const [error, setError] = useState('');

  const handleFetchData = async () => {
    // Clear previous results
    setError('');
    setResults([]);

    // Validate input
    const tickers = tickerInput
      .split(',')
      .map((t) => t.trim().toUpperCase())
      .filter((t) => t.length > 0);

    if (tickers.length === 0) {
      setError('Please enter at least one ticker symbol');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/stock', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tickers }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch stock data');
      }

      const data: StockResult[] = await response.json();
      setResults(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'An unexpected error occurred'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleFetchData();
    }
  };

  const SkeletonLoader = () => (
    <Card className="border-slate-700 bg-slate-800">
      <CardHeader>
        <div className="space-y-2">
          <Skeleton className="h-6 w-32 bg-slate-700" />
          <Skeleton className="h-4 w-48 bg-slate-700" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="space-y-2">
            <Skeleton className="h-4 w-full bg-slate-700" />
            <Skeleton className="h-4 w-full bg-slate-700" />
            <Skeleton className="h-4 w-3/4 bg-slate-700" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-full bg-slate-700" />
            <Skeleton className="h-4 w-full bg-slate-700" />
            <Skeleton className="h-4 w-3/4 bg-slate-700" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-full bg-slate-700" />
            <Skeleton className="h-4 w-full bg-slate-700" />
            <Skeleton className="h-4 w-3/4 bg-slate-700" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-900 p-8">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            📈 Market Data Dashboard:
          </h1>
          <p className="text-slate-400">
            Fetch historical stock data with automatic 1-hour caching
          </p>
        </div>

        {/* Input Section */}
        <Card className="mb-8 border-slate-700 bg-slate-800">
          <CardHeader>
            <CardTitle className="text-white">Fetch Stock Data</CardTitle>
            <CardDescription>
              Enter one or more ticker symbols (comma-separated)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Input
                placeholder="e.g., AAPL, GOOGL, MSFT"
                value={tickerInput}
                onChange={(e) => setTickerInput(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1 bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                disabled={loading}
              />
              <Button
                onClick={handleFetchData}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {loading ? 'Loading...' : 'Fetch Data'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Error Message */}
        {error && (
          <Card className="mb-8 border-red-700 bg-red-950">
            <CardContent className="pt-6">
              <p className="text-red-200">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Results */}
        <div className="space-y-6">
          {/* Show skeleton loaders while loading */}
          {loading &&
            tickerInput
              .split(',')
              .filter((t) => t.trim().length > 0)
              .map((_, i) => <SkeletonLoader key={i} />)}

          {/* Show actual results when loaded */}
          {!loading &&
            results.map((stock) => (
              <Card
                key={stock.ticker}
                className="border-slate-700 bg-slate-800"
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-white">
                        {stock.ticker}
                      </CardTitle>
                      {stock.error ? (
                        <CardDescription className="text-red-400">
                          {stock.error}
                        </CardDescription>
                      ) : (
                        <CardDescription>
                          {stock.daysCount} days of historical data
                        </CardDescription>
                      )}
                    </div>
                  </div>
                </CardHeader>

                {!stock.error && stock.historicalData.length > 0 && (
                  <CardContent>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="border-slate-700 hover:bg-slate-700">
                            <TableHead className="text-slate-300">
                              Date
                            </TableHead>
                            <TableHead className="text-slate-300 text-right">
                              Open
                            </TableHead>
                            <TableHead className="text-slate-300 text-right">
                              High
                            </TableHead>
                            <TableHead className="text-slate-300 text-right">
                              Low
                            </TableHead>
                            <TableHead className="text-slate-300 text-right">
                              Close
                            </TableHead>
                            <TableHead className="text-slate-300 text-right">
                              Volume
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {stock.historicalData.slice(0, 10).map((data) => (
                            <TableRow
                              key={data.date}
                              className="border-slate-700 hover:bg-slate-700"
                            >
                              <TableCell className="font-medium text-slate-200">
                                {data.date}
                              </TableCell>
                              <TableCell className="text-right text-slate-300">
                                ${data.open.toFixed(2)}
                              </TableCell>
                              <TableCell className="text-right text-slate-300">
                                ${data.high.toFixed(2)}
                              </TableCell>
                              <TableCell className="text-right text-slate-300">
                                ${data.low.toFixed(2)}
                              </TableCell>
                              <TableCell className="text-right font-semibold text-blue-400">
                                ${data.close.toFixed(2)}
                              </TableCell>
                              <TableCell className="text-right text-slate-400">
                                {(data.volume / 1000000).toFixed(2)}M
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                    {stock.historicalData.length > 10 && (
                      <p className="mt-4 text-sm text-slate-400">
                        Showing 10 of {stock.historicalData.length} days
                      </p>
                    )}
                  </CardContent>
                )}
              </Card>
            ))}
        </div>

        {/* Empty State */}
        {results.length === 0 && !error && !loading && (
          <Card className="border-slate-700 bg-slate-800">
            <CardContent className="pt-12 pb-12 text-center">
              <p className="text-slate-400">
                Enter ticker symbols and click "Fetch Data" to get started
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
