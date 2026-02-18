/**
 * Authentication Middleware
 * 
 * Handles authentication and authorization.
 * Includes cron secret validation for scheduled tasks.
 * Next.js-specific middleware.
 * 
 * @module lib/middleware/auth
 */

import { NextRequest } from 'next/server';

/**
 * Authentication result
 */
export interface AuthResult {
    authenticated: boolean;
    userId?: string;
    error?: string;
}

/**
 * Validate shared secret for cron jobs
 * Checks Authorization header against CRON_SECRET environment variable
 * 
 * @param authHeader - Authorization header value (e.g., "Bearer secret123")
 * @returns true if valid, false otherwise
 */
export function validateSharedSecret(authHeader: string | null): boolean {
    if (!authHeader) {
        return false;
    }

    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret) {
        // If no secret configured, reject all cron requests
        return false;
    }

    // Expected format: "Bearer <secret>"
    const expectedHeader = `Bearer ${cronSecret}`;

    return authHeader === expectedHeader;
}

/**
 * Middleware wrapper that requires cron authentication
 * Use this to wrap cron endpoint handlers
 * 
 * @param handler - API route handler function
 * @returns Wrapped handler that checks cron auth
 */
export function requireCronAuth(
    handler: (request: NextRequest) => Promise<Response>
) {
    return async (request: NextRequest): Promise<Response> => {
        const authHeader = request.headers.get('Authorization');

        if (!validateSharedSecret(authHeader)) {
            return new Response(
                JSON.stringify({ error: 'Unauthorized' }),
                {
                    status: 401,
                    headers: { 'Content-Type': 'application/json' }
                }
            );
        }

        return handler(request);
    };
}

/**
 * Auth middleware (placeholder for future user authentication)
 * Currently returns unauthenticated for all requests
 * 
 * @param request - Next.js request object
 * @returns AuthResult (currently always unauthenticated)
 */
export function authMiddleware(request: NextRequest): AuthResult {
    // Placeholder for future authentication implementation
    // Could check cookies, JWT tokens, session, etc.

    return {
        authenticated: false
    };
}

/**
 * Extract user ID from request (placeholder)
 * 
 * @param request - Next.js request object
 * @returns User ID or null if not authenticated
 */
export function getUserId(request: NextRequest): string | null {
    // Placeholder for future implementation
    // Could extract from JWT token, session cookie, etc.

    return null;
}

/**
 * Check if request has valid API key (placeholder)
 * 
 * @param request - Next.js request object
 * @returns true if valid API key, false otherwise
 */
export function validateApiKey(request: NextRequest): boolean {
    // Placeholder for future API key validation
    const apiKey = request.headers.get('X-API-Key');

    if (!apiKey) {
        return false;
    }

    // TODO: Implement actual API key validation
    return false;
}
