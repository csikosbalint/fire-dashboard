/**
 * Stock Data API Route
 * 
 * POST endpoint for fetching historical stock data.
 * Uses layered architecture: Middleware → Adapters → Services → Domain
 */

import { NextRequest } from 'next/server';
import { validateStockRequest, parseRequestBody } from '@/lib/middleware/validation';
import { handleStockDataRequest, createErrorResponse } from '@/adapters/api/routeHandlers';

export async function POST(request: NextRequest) {
  // Parse request body
  const body = await parseRequestBody(request);

  if (!body) {
    return createErrorResponse('Invalid request body', 400);
  }

  // Validate request using middleware
  const validation = validateStockRequest(body);

  if (!validation.valid) {
    return createErrorResponse(validation.error || 'Validation failed', 400);
  }

  // Handle request using adapter
  return handleStockDataRequest(validation.data!.tickers);
}
