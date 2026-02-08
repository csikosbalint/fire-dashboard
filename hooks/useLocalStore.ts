import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { SharpeStore } from '@/types';

export const useTickers = create<SharpeStore>()(
  persist(
    (set) => ({
      tickers: [],
      lookback: 250,
      addTicker: (ticker) =>
        set((state) => {
          const upperTicker = ticker.toUpperCase().trim();
          if (upperTicker && !state.tickers.includes(upperTicker)) {
            return { tickers: [...state.tickers, upperTicker] };
          }
          return state;
        }),
      removeTicker: (ticker) =>
        set((state) => ({
          tickers: state.tickers.filter((t) => t !== ticker),
        })),
      clearTickers: () => set({ tickers: [] }),
      setLookback: (lookback) =>
        set({
          lookback: Math.min(1000, Math.max(1, Math.round(lookback || 1))),
        }),
    }),
    {
      name: 'sharpe-tickers-storage',
    }
  )
);
