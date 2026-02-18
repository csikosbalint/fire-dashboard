/**
 * Zustand Store for Sharpe Calculator
 * 
 * Persistent state management with localStorage.
 * Uses domain validators for data integrity.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { SharpeStore } from '@/types';
import { validateTicker } from '@/domain/stock/validator';
import { validateLookback } from '@/domain/stock/validator';
import { LOOKBACK_MIN, LOOKBACK_MAX } from '@/domain/constants';

export const useTickers = create<SharpeStore>()(
  persist(
    (set) => ({
      tickers: [],
      lookback: 250,
      addTicker: (ticker) =>
        set((state) => {
          const upperTicker = ticker.toUpperCase().trim();

          // Validate ticker using domain validator
          if (!validateTicker(upperTicker)) {
            return state; // Invalid ticker, don't add
          }

          // Check for duplicates
          if (state.tickers.includes(upperTicker)) {
            return state;
          }

          return { tickers: [...state.tickers, upperTicker] };
        }),
      removeTicker: (ticker) =>
        set((state) => ({
          tickers: state.tickers.filter((t) => t !== ticker),
        })),
      clearTickers: () => set({ tickers: [] }),
      setLookback: (lookback) =>
        set((state) => {
          // Validate lookback using domain validator
          const validation = validateLookback(lookback);

          if (!validation.valid || !validation.data) {
            return state; // Invalid lookback, don't update
          }

          return { lookback: validation.data };
        }),
    }),
    {
      name: 'sharpe-tickers-storage',
    }
  )
);
