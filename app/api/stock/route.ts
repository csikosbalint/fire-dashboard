import { NextRequest, NextResponse } from 'next/server';
import { fetchMultipleStocks } from '@/lib/stockData';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tickers } = body;

    // Validate input
    if (!tickers || !Array.isArray(tickers) || tickers.length === 0) {
      return NextResponse.json(
        { error: 'Invalid tickers array' },
        { status: 400 }
      );
    }

    // Limit to 10 tickers per request
    const limitedTickers = tickers.slice(0, 10);

    // Fetch data for all tickers
    const results = await fetchMultipleStocks(limitedTickers);

    return NextResponse.json(results);
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
