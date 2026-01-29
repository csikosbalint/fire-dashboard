import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { SharpeStore } from '@/types';

export const useTickers = create<SharpeStore>()(
  persist(
    (set) => ({
      tickers: [],
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
    }),
    {
      name: 'sharpe-tickers-storage',
    }
  )
);
