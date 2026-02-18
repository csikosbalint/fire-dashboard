# Fire Dashboard - Layered Architecture Documentation

## Overview

Fire Dashboard uses a **7-layer architecture** with clear separation of concerns. Each layer has specific responsibilities and dependency rules enforced by ESLint.

**Key Principle:** Dependencies flow **inward only** - outer layers depend on inner layers, never the reverse.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                     USER INTERFACE (Browser)                     │
│  🔵 Layer 1: UI Components (React, Browser APIs)                │
│     components/ui/, components/dashboard/, components/sharpe/    │
└────────────────────────────────┬────────────────────────────────┘
                                 │ calls
┌────────────────────────────────▼────────────────────────────────┐
│  🔵 Layer 2: UI Controllers (React Hooks, Browser APIs)         │
│     controllers/useStockDashboard, useSharpeCalculator          │
└────────────────────────────────┬────────────────────────────────┘
                                 │ uses business logic from
┌────────────────────────────────▼────────────────────────────────┐
│  🟢 Layer 3: Domain Logic (Pure JS - Universal)                 │
│     domain/finance/, domain/stock/, domain/constants.ts         │
│     ❌ NO React, NO Next.js, NO Node.js, NO Browser APIs       │
│     ✅ Pure functions, testable, framework-agnostic             │
└─────────────────────────────────────────────────────────────────┘
                                 │
┌────────────────────────────────▼────────────────────────────────┐
│                      SERVER SIDE (Next.js/Node)                  │
│  🟠 Layer 4A: BFF Middleware (Next.js)                          │
│     lib/middleware/auth.ts, validation.ts                       │
└─────────────────────────────────────────────────────────────────┘
                                 │
┌────────────────────────────────▼────────────────────────────────┐
│  🟠 Layer 4B: Next.js Adapters (Next.js Platform Features)      │
│     adapters/cache/nextCacheAdapter.ts, adapters/api/           │
└────────────────────────────────┬────────────────────────────────┘
                                 │ delegates to
┌────────────────────────────────▼────────────────────────────────┐
│  🟢 Layer 5: Backend Services (Pure Node.js)                    │
│     services/stockData/, services/cache/cacheInterface.ts       │
│     ❌ NO Next.js imports (uses CacheInterface abstraction)    │
│     ✅ Can run standalone, portable to other platforms         │
└────────────────────────────────┬────────────────────────────────┘
                                 │ uses utilities from
┌────────────────────────────────▼────────────────────────────────┐
│  🟢 Layer 6: Shared Libraries (Pure JS - Universal)             │
│     lib/utils/dateUtils, numberFormatters, arrayUtils          │
│     ❌ NO dependencies - fully portable                        │
│     ✅ Can be extracted to separate npm package                │
└─────────────────────────────────────────────────────────────────┘
```

---

## Layer Responsibilities

### **Layer 1: UI Components** 🔵 React

- **Location:** `components/ui/`, `components/dashboard/`, `components/sharpe/`
- **Purpose:** Pure presentation - visual elements only, no business logic
- **Dependencies:** React, JSX, Radix UI, Tailwind CSS, Layer 6 (utils)
- **Can Import:** Other UI components, utility functions from Layer 6
- **Cannot Import:** Domain logic, services, adapters, controllers
- **Runtime:** Browser only

**Examples:**

- `components/ui/button.tsx` - Radix UI primitive
- `components/dashboard/StockTable.tsx` - Displays stock data table
- `components/sharpe/SharpeTable.tsx` - Displays Sharpe ratio results

### **Layer 2: UI Controllers** 🔵 React Hooks

- **Location:** `controllers/`
- **Purpose:** Bridge between UI and backend - manages UI state, coordinates API calls, formats data for display
- **Dependencies:** React hooks (useState, useEffect), Browser APIs (fetch), Layers 3 & 6
- **Can Import:** Domain validators/constants, utility formatters
- **Cannot Import:** Services, adapters, middleware
- **Runtime:** Browser only

**Examples:**

- `controllers/useStockDashboard.ts` - Manages stock dashboard state, calls `/api/stock`
- `controllers/useSharpeCalculator.ts` - Fetches data, formats Sharpe results for UI

### **Layer 3: Domain Logic** 🟢 Pure JavaScript

- **Location:** `domain/finance/`, `domain/stock/`, `domain/constants.ts`
- **Purpose:** Core business logic - calculations, validations, transformations
- **Dependencies:** Layer 6 only (optional)
- **Can Import:** ONLY utility functions from Layer 6
- **Cannot Import:** React, Next.js, Node.js APIs, services, adapters
- **Runtime:** Universal (browser, server, CLI, tests)
- **Key Characteristic:** Framework-agnostic, pure functions, immutable operations

**Examples:**

- `domain/finance/sharpeCalculator.ts` - Sharpe ratio calculations
- `domain/stock/validator.ts` - Ticker validation rules
- `domain/constants.ts` - Magic numbers (TRADING_DAYS_YEAR = 250)

**Why This Matters:**

- ✅ Testable without React or DOM
- ✅ Reusable in different frameworks
- ✅ No side effects, predictable behavior
- ✅ Can be extracted to separate package

### **Layer 4A: BFF Middleware** 🟠 Next.js

- **Location:** `lib/middleware/`
- **Purpose:** Backend-for-frontend utilities - authentication, validation, request parsing
- **Dependencies:** Next.js (NextRequest, NextResponse), Zod, Layers 3, 5, 6
- **Can Import:** Domain logic, services, utilities
- **Cannot Import:** React, UI components
- **Runtime:** Server (Next.js API routes)

**Examples:**

- `lib/middleware/auth.ts` - Cron secret validation, auth middleware hooks
- `lib/middleware/validation.ts` - Request body validation with Zod schemas

### **Layer 4B: Next.js Adapters** 🟠 Next.js Platform

- **Location:** `adapters/cache/`, `adapters/api/`
- **Purpose:** Wraps Next.js-specific features for use by pure Node.js services
- **Dependencies:** Next.js (`unstable_cache`, etc.), Layer 5, 6
- **Can Import:** Services, utilities
- **Cannot Import:** React, domain (should go through services)
- **Runtime:** Server (Next.js)

**Examples:**

- `adapters/cache/nextCacheAdapter.ts` - Implements `CacheInterface` using Next.js cache
- `adapters/api/routeHandlers.ts` - Wraps service calls with Next.js responses

**Why Separate from Services:**
Services can run in any Node.js environment. Adapters provide Next.js integration.

### **Layer 5: Backend Services** 🟢 Pure Node.js

- **Location:** `services/stockData/`, `services/cache/`
- **Purpose:** Business orchestration, data fetching, external API integration
- **Dependencies:** Node.js packages (yahoo-finance2), Layers 3 & 6
- **Can Import:** Domain logic, utilities, abstract interfaces
- **Cannot Import:** Next.js features (uses CacheInterface abstraction), React
- **Runtime:** Server (Node.js)

**Examples:**

- `services/stockData/stockDataService.ts` - Orchestrates stock data fetching with caching
- `services/stockData/yahooFinanceAdapter.ts` - Wraps Yahoo Finance API
- `services/cache/cacheInterface.ts` - Abstract cache interface (implementation-agnostic)

**Why Pure Node.js:**

- ✅ Can run in standalone Node.js process
- ✅ Can be extracted to microservices
- ✅ Can be tested without Next.js
- ✅ Portable to other frameworks (Express, Fastify, etc.)

### **Layer 6: Shared Libraries** 🟢 Pure JavaScript

- **Location:** `lib/utils/`
- **Purpose:** Reusable utility functions - formatters, parsers, helpers
- **Dependencies:** NONE
- **Can Import:** NOTHING (fully self-contained)
- **Cannot Import:** Everything - this is the innermost layer
- **Runtime:** Universal (browser, server, CLI, tests)

**Examples:**

- `lib/utils/dateUtils.ts` - Date formatting and parsing
- `lib/utils/numberFormatters.ts` - Price, volume, percent formatting
- `lib/utils/arrayUtils.ts` - Array manipulation helpers

**Why Fully Isolated:**

- ✅ Maximum reusability
- ✅ Can be copy-pasted to other projects
- ✅ Can be published as npm package
- ✅ Zero dependencies = zero breaking changes

---

## Application Layer

### **Pages** (app/\*/page.tsx)

- **Purpose:** Page routes - composition and layout only
- **Can Use:** Layers 1, 2 (Components + Controllers)
- **Cannot Use:** Services, Adapters (use controllers instead)

**Examples:**

- `app/page.tsx` - Stock dashboard (50-100 lines after refactor)
- `app/sharpe/page.tsx` - Sharpe calculator (simplified from 2521 lines)

### **API Routes** (app/api/\*/route.ts)

- **Purpose:** HTTP endpoints
- **Can Use:** Layers 3, 4A, 4B, 5 (Domain, Middleware, Adapters, Services)
- **Cannot Use:** React, UI components

**Examples:**

- `app/api/stock/route.ts` - POST endpoint for stock data
- `app/api/sharpe/route.ts` - POST endpoint for Sharpe calculations
- `app/api/cron/refresh-cache/route.ts` - Cron job for cache refresh

---

## Dependency Rules (Enforced by ESLint)

| Layer                    | Can Import From     | 🚫 Cannot Import                        |
| ------------------------ | ------------------- | --------------------------------------- |
| **1. UI Components**     | Layers 1, 6         | Domain, Services, Adapters, Controllers |
| **2. UI Controllers**    | Layers 3, 6         | Services, Adapters, Middleware          |
| **3. Domain Logic**      | Layer 6 only        | React, Next.js, Node.js, Services       |
| **4A. BFF Middleware**   | Layers 3, 5, 6      | React, UI Components                    |
| **4B. Next.js Adapters** | Layers 5, 6         | React, Domain (use services)            |
| **5. Backend Services**  | Layers 3, 6         | Next.js (use adapters), React           |
| **6. Shared Libraries**  | **NOTHING**         | All other layers                        |
| **Pages**                | Layers 1, 2         | Services, Adapters directly             |
| **API Routes**           | Layers 3, 4A, 4B, 5 | React, UI Components                    |

### Framework Restrictions (Enforced by ESLint)

```typescript
// ❌ BLOCKED by ESLint
// In domain/, services/, lib/utils/
import { useState } from 'react';        // Error: React not allowed
import { unstable_cache } from 'next/cache';  // Error: Next.js not allowed

// In services/
import { unstable_cache } from 'next/cache';  // Error: Use adapters layer

// In controllers/, components/
import { fetchStockData } from '@/services/...';  // Error: Use API calls

// ✅ ALLOWED
// In domain/
import { formatPrice } from '@/lib/utils/numberFormatters';  // OK

// In controllers/
import { validateTicker } from '@/domain/stock/validator';  // OK
await fetch('/api/stock', { ... });  // OK - API call

// In services/
import { sortChronological } from '@/domain/stock/transformer';  // OK
```

---

## Data Flow Examples

### **Example 1: User Fetches Stock Data**

```
User clicks "Fetch" in UI
  ↓
components/dashboard/TickerInput.tsx (Layer 1)
  → emits onSubmit event
  ↓
app/page.tsx (Page)
  → calls useStockDashboard hook
  ↓
controllers/useStockDashboard.ts (Layer 2)
  → validates input with domain/stock/validator
  → calls fetch('/api/stock')
  ↓
app/api/stock/route.ts (API Route)
  → uses lib/middleware/validation (Layer 4A) to validate request
  → calls adapters/api/routeHandlers (Layer 4B)
  ↓
adapters/api/routeHandlers.ts (Layer 4B)
  → calls services/stockData/stockDataService (Layer 5)
  ↓
services/stockData/stockDataService.ts (Layer 5)
  → checks cache via CacheInterface
  → fetches from Yahoo Finance via yahooFinanceAdapter
  → filters/sorts using domain/stock/transformer (Layer 3)
  → returns data
  ↓
[Response flows back up]
  ↓
controllers/useStockDashboard.ts (Layer 2)
  → formats data using lib/utils/numberFormatters (Layer 6)
  → updates state
  ↓
components/dashboard/StockTable.tsx (Layer 1)
  → renders formatted data
```

### **Example 2: Cron Job Refreshes Cache**

```
Vercel Cron Scheduler (every 4 hours)
  ↓
app/api/cron/refresh-cache/route.ts
  → requireCronAuth wrapper (lib/middleware/auth)
  → validates Authorization: Bearer <CRON_SECRET>
  → [if valid] proceeds
  → [if invalid] returns 401
  ↓
Cache invalidation (currently no-op, pending Next.js stable API)
  ↓
Returns success response
```

---

## Type System

Types are organized by layer:

### **Domain Types** (`types/domain/`)

Pure business domain types - no strings, numbers only

```typescript
// types/domain/Stock.ts
export interface SharpeMetrics {
  sharpeRatio: number; // Not "15.23%"
  trailingReturn: number; // Not "+5.67%"
  stdDev: number; // Not "2.34%"
  periodDays: number;
}
```

### **DTO Types** (`types/dto/`)

API request/response shapes - matches HTTP contracts

```typescript
// types/dto/StockDataDTO.ts
export interface StockRequest {
  tickers: string[];
}

export interface StockResponse {
  results: StockDataResult[];
}
```

### **UI Types** (`types/ui/`)

UI-specific types with pre-formatted strings

```typescript
// types/ui/SharpeDisplay.ts
export interface SharpeDisplayResult {
  ticker: string;
  yesterday: string | null; // "SR: 1.23, Return: +5.67%, StdDev: 2.34%"
  lastWeek: string | null;
  // ...
}
```

---

## ESLint Enforcement

### **Setup**

```bash
npm install -D eslint-plugin-boundaries
```

Configured in `eslint.config.mjs` with:

- **boundaries plugin**: Enforces cross-layer import rules
- **no-restricted-imports**: Blocks React/Next.js in pure layers

### **Testing Enforcement**

```bash
npm run lint
```

**Try violating a rule:**

```typescript
// In domain/finance/sharpeCalculator.ts
import { useState } from "react"; // ❌ ESLint error

// In controllers/useStockDashboard.ts
import { fetchStockData } from "@/services/..."; // ❌ ESLint error
```

---

## Benefits of This Architecture

### **1. Testability**

- Domain logic is pure JavaScript → test without React/DOM
- Services are pure Node.js → test without Next.js
- Mock dependencies at layer boundaries

### **2. Portability**

- Domain logic can be used in Vue, Angular, CLI tools
- Services can run in Express, Fastify, AWS Lambda
- Utilities can be copy-pasted anywhere

### **3. Maintainability**

- Clear responsibilities → know where to make changes
- Single Responsibility Principle enforced by layers
- 2521-line file becomes 10+ focused files

### **4. Performance**

- Server-side calculations reduce client bundle size
- Caching at service layer (reusable across routes)
- Pure functions enable memoization

### **5. Team Scalability**

- Junior devs work on UI components (Layer 1)
- Mid-level devs work on controllers (Layer 2)
- Senior devs work on domain logic and services (Layers 3-5)
- Clear boundaries prevent merge conflicts

### **6. Future-Proofing**

- Easy to migrate to Next.js 17, 18, etc. (only Layer 4B changes)
- Easy to add Vue/Svelte UI (reuse Layers 3-6)
- Easy to extract services to microservices (already pure Node.js)

---

## Adding New Features

### **Adding a New Calculation**

1. **Domain logic** (Layer 3): `domain/finance/newCalculation.ts`
   - Pure function, no side effects
   - Write unit tests with Jest

2. **Service** (Layer 5): `services/calculationService.ts`
   - Orchestrates data fetching if needed
   - Uses domain logic

3. **API Route**: `app/api/new-calculation/route.ts`
   - Validates request (Layer 4A)
   - Calls service (Layer 5)
   - Returns response

4. **Controller** (Layer 2): `controllers/useNewCalculation.ts`
   - React hook for UI state
   - Calls API endpoint
   - Formats results using Layer 6 utils

5. **Components** (Layer 1): `components/calculation/`
   - Pure UI for data display
   - Uses formatted data from controller

### **Adding External API Integration**

1. **Adapter** (Layer 5): `services/newApi/newApiAdapter.ts`
   - Wraps external library
   - Pure Node.js, no Next.js

2. **Service** (Layer 5): `services/newApi/newApiService.ts`
   - Business orchestration
   - Uses cache (via CacheInterface)
   - Uses domain transformers

3. **Continue steps 3-5 above**

---

## Verification Checklist

After refactoring, verify:

- [ ] **Build:** `npm run build` succeeds
- [ ] **Linting:** `npm run lint` passes with 0 errors
- [ ] **Type Safety:** `npx tsc --noEmit` passes
- [ ] **Domain Purity:** `grep -r "from 'react'" domain/` returns nothing
- [ ] **Domain Purity:** `grep -r "from 'next'" domain/` returns nothing
- [ ] **Services Purity:** `grep -r "from 'next/cache'" services/` returns nothing
- [ ] **Functionality:** Pages load and work identically to before
- [ ] **Caching:** Second identical request is instant (cache hit)
- [ ] **Cron Auth:** Endpoint rejects requests without `CRON_SECRET`

---

## Environment Variables

Copy `.env.local.example` to `.env.local`:

```bash
cp .env.local.example .env.local
```

Required variables:

- `CRON_SECRET`: Shared secret for cron job authentication

Generate secure secret:

```bash
openssl rand -base64 32
```

---

## Cron Jobs

Configured in `vercel.json`:

- **Cache Refresh:** `/api/cron/refresh-cache` - Every 4 hours
- **Sharpe Pre-calculation:** `/api/cron/calculate-sharpe` - Daily at 8 AM

Test locally:

```bash
curl -H "Authorization: Bearer YOUR_SECRET" http://localhost:3000/api/cron/refresh-cache
```

---

## Next Steps

### **Remaining Refactors (Not Yet Implemented)**

- [ ] Extract UI components from `app/page.tsx`
- [ ] Split `app/sharpe/page.tsx` (2521 lines) into Layer 1 components
- [ ] Move test data to `components/sharpe/TestDataPanel.tsx`
- [ ] Update pages to use new controllers

### **Future Enhancements**

- [ ] User authentication (implement in Layer 4A)
- [ ] Real-time data subscriptions
- [ ] Performance monitoring
- [ ] Extract services to separate npm package
- [ ] Add integration tests per layer

---

## Questions?

**Q: Why can't controllers import services directly?**  
A: Controllers run in the browser and can't access server-side code. Use API routes as the boundary.

**Q: Why separate adapters from services?**  
A: Services should be framework-agnostic. Adapters provide Next.js integration without coupling services to Next.js.

**Q: Can domain logic use external libraries?**  
A: Yes, but only framework-agnostic ones (e.g., `date-fns`, `lodash`). NO React, Next.js, or browser-specific APIs.

**Q: What if I need Node.js APIs in services?**  
A: Minimize usage for portability. Use dependency injection where possible (like `CacheInterface`).

**Q: How do I know which layer my code belongs in?**  
A: Ask: "Does this logic work without React/Next.js?" → Domain/Services. "Does it manage UI state?" → Controller. "Does it render?" → Component.

---

## File Structure Summary

```
fire-dashboard/
├── adapters/              # Layer 4B: Next.js adapters
├── app/                   # Next.js App Router (pages & API routes)
├── components/            # Layer 1: UI components
├── controllers/           # Layer 2: UI controllers
├── domain/                # Layer 3: Pure business logic ⭐
├── hooks/                 # Zustand store (uses Layer 3 validators)
├── lib/
│   ├── middleware/        # Layer 4A: BFF middleware
│   └── utils/             # Layer 6: Shared utilities ⭐
├── services/              # Layer 5: Backend services (pure Node.js) ⭐
├── types/
│   ├── domain/            # Pure domain types
│   ├── dto/               # API contracts
│   └── ui/                # UI-specific types
├── .env.local.example     # Environment variables template
├── eslint.config.mjs      # ESLint with boundaries enforcement
├── README-ARCHITECTURE.md # This file
└── vercel.json            # Cron job configuration

⭐ = Framework-agnostic (can run anywhere)
```

---

**Last Updated:** February 18, 2026  
**Next.js Version:** 16.1.1  
**Architecture Version:** 1.0
