'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
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
import { useSharpeStore } from '@/hooks/useSharpeStore';
import { useSharpeCalculations } from '@/hooks/useSharpeCalculations';

export default function SharpePage() {
  const [tickerInput, setTickerInput] = useState('');
  const [mounted, setMounted] = useState(false);
  const { tickers, addTicker, removeTicker } = useSharpeStore();
  const results = useSharpeCalculations(tickers);

  // Prevent hydration mismatch by only rendering after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  // Log errors to console
  useEffect(() => {
    results.forEach((result) => {
      if (result.error) {
        console.warn(`[Sharpe Calculator] Error for ${result.ticker}:`, result.error);
      }
    });
  }, [results]);

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tickerInput.trim()) {
      addTicker(tickerInput);
      setTickerInput('');
    }
  };

  const formatSharpeValue = (value: number | null): string => {
    if (value === null) return '-';
    return value.toFixed(2);
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-900 p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Sharpe Ratio Calculator
          </h1>
          <p className="text-slate-400">
            Track Sharpe ratios across different time periods (Risk-free rate: 4.5%)
          </p>
        </div>

        {/* Input and Table Card */}
        <Card className="border-slate-700 bg-slate-800">
          <CardHeader>
            <CardTitle className="text-white">Ticker Performance</CardTitle>
            <CardDescription>
              Enter ticker symbols to calculate their Sharpe ratios
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Input Field */}
            <div className="mb-6">
              <Input
                placeholder="Enter ticker (e.g., AAPL) and press Enter"
                value={tickerInput}
                onChange={(e) => setTickerInput(e.target.value)}
                onKeyPress={handleKeyPress}
                className="max-w-sm bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
              />
            </div>

            {/* Table */}
            {tickers.length > 0 ? (
              <div className="overflow-x-auto">
                <Table className="table-fixed">
                  <TableHeader>
                    <TableRow className="border-slate-700 hover:bg-slate-700">
                      <TableHead className="text-slate-300 font-semibold w-40">
                        Ticker
                      </TableHead>
                      <TableHead className="text-slate-300 font-semibold text-right w-24">
                        Today
                      </TableHead>
                      <TableHead className="text-slate-400 text-right w-24">
                        W
                      </TableHead>
                      <TableHead className="text-slate-400 text-right w-24">
                        M
                      </TableHead>
                      <TableHead className="text-slate-400 text-right w-24">
                        Q
                      </TableHead>
                      <TableHead className="text-slate-400 text-right w-24">
                        S
                      </TableHead>
                      <TableHead className="text-slate-400 text-right w-24">
                        Y
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {results.map((result) => (
                      <TableRow
                        key={result.ticker}
                        className="border-slate-700 hover:bg-slate-700"
                      >
                        <TableCell className="font-medium text-slate-200">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => removeTicker(result.ticker)}
                              className="text-slate-400 hover:text-red-400 transition-colors"
                              aria-label={`Remove ${result.ticker}`}
                            >
                              <X className="h-4 w-4" />
                            </button>
                            <span>{result.ticker}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          {result.loading ? (
                            <Skeleton className="h-5 w-full bg-slate-700" />
                          ) : result.error ? (
                            <span className="text-red-400 text-xs">Error</span>
                          ) : (
                            <span className="text-slate-200 font-semibold">
                              {formatSharpeValue(result.today)}
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {result.loading ? (
                            <Skeleton className="h-5 w-full bg-slate-700" />
                          ) : (
                            <span className="text-slate-300">
                              {formatSharpeValue(result.week)}
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {result.loading ? (
                            <Skeleton className="h-5 w-full bg-slate-700" />
                          ) : (
                            <span className="text-slate-300">
                              {formatSharpeValue(result.month)}
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {result.loading ? (
                            <Skeleton className="h-5 w-full bg-slate-700" />
                          ) : (
                            <span className="text-slate-300">
                              {formatSharpeValue(result.quarter)}
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {result.loading ? (
                            <Skeleton className="h-5 w-full bg-slate-700" />
                          ) : (
                            <span className="text-slate-300">
                              {formatSharpeValue(result.semiAnnual)}
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {result.loading ? (
                            <Skeleton className="h-5 w-full bg-slate-700" />
                          ) : (
                            <span className="text-slate-300">
                              {formatSharpeValue(result.year)}
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-slate-400">
                  Enter a ticker symbol above to get started
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
