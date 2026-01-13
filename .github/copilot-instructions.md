# Fire Dashboard - Copilot Instructions

## Project Overview
Fire Dashboard is a Next.js 16+ stock market data visualization app. It fetches historical stock data via Yahoo Finance API and displays it in a responsive, dark-themed UI with automatic 1-hour caching.

**Core stack**: Next.js 16, React 19, TypeScript, Tailwind CSS 4, Radix UI, Yahoo Finance2 library

## Architecture

### Data Flow
1. **Client** (`app/page.tsx`) - 'use client' component with form input for ticker symbols
2. **API Route** (`app/api/stock/route.ts`) - POST endpoint that validates & delegates to stock service
3. **Cache Layer** (`lib/stockData.ts`) - Uses Next.js `unstable_cache` with 3600s (1hr) revalidation
4. **External API** - Yahoo Finance2 library queries 100 days of OHLCV data

Limitation: Max 10 tickers per request (enforced in API route).

### Component Structure
- **UI Components** (`components/ui/`) - Unstyled Radix UI primitives wrapped with Tailwind styling (Card, Button, Input, Skeleton, Table)
- **Page Component** - Handles state (tickerInput, loading, results, error), renders skeleton loaders during fetch, displays data in responsive tables
- **Styling** - Dark theme (slate-900/950 background) with blue accent (#blue-600). Skeleton loaders show while data loads.

## Key Patterns & Conventions

### Client Components
- All interactive pages use `'use client'` at the top
- React 19 with built-in compiler (`reactCompiler: true` in next.config.ts)
- State management: useState only, no external state libs

### API Routes
- Validate input first, reject early with 400/500 status codes
- Errors in service layer are caught and returned as data fields (not thrown)
- Use `NextRequest`/`NextResponse` from `next/server`

### Caching Strategy
- `unstable_cache()` from `next/cache` wraps expensive operations
- Cache key: `['stock-data']`, tags: `['stock-data']`, revalidate: `3600`
- Error handling: Cache failures return error object with ticker & message, never crash the page

### Type Safety
- All interfaces defined where used (in stockData.ts and page.tsx)
- StockDataResult interface includes optional `error` field for graceful fallbacks
- Use TypeScript strict mode (tsconfig.json)

### Styling & CSS
- Tailwind CSS 4 with PostCSS
- `cn()` utility (lib/utils.ts) combines clsx + tailwind-merge for conditional classes
- Dark mode hardcoded (no light theme variant)
- Responsive: max-w-6xl container on page, overflow-x-auto for tables on small screens

## Build & Development

**Commands**:
- `npm run dev` - Start dev server (localhost:3000)
- `npm run build` - Production build
- `npm start` - Run production server
- `npm run lint` - Run ESLint

**Path aliases**: `@/*` maps to workspace root (e.g., `@/components` = `./components`)

## Common Tasks

### Adding a New Stock Feature
1. Add fields to `HistoricalData` interface in [lib/stockData.ts](lib/stockData.ts)
2. Update `yahooFinance.historical()` mapping to include new fields
3. Update table columns & display in [app/page.tsx](app/page.tsx)
4. Type all new fields in `StockDataResult`

### Modifying Cache Behavior
- Change revalidate time in [lib/stockData.ts](lib/stockData.ts) line 32 (currently 3600s)
- Cache tags allow selective revalidation: consider adding tag per ticker if needed later

### Adding a New API Endpoint
- Create in `app/api/[route]/route.ts` following POST pattern in [app/api/stock/route.ts](app/api/stock/route.ts)
- Always validate input before calling service functions
- Return `NextResponse.json()` with appropriate status codes

## Testing & Debugging

- No test suite configured; add Jest/Vitest if needed
- ESLint config: `eslint-config-next` (v16)
- Development uses React Compiler for optimization
- Yahoo Finance API may rate-limit or return partial data; errors are per-ticker, not fatal

## Deployment Notes
- Vercel-ready (`vercel.json` present)
- Next.js 16 App Router with React 19
- Streaming/suspense not used; simple client-side loading states
- External API calls add latency; consider aggressive caching for production
