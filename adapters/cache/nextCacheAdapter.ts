/**
 * Next.js Cache Adapter
 * 
 * Implements CacheInterface using Next.js unstable_cache.
 * Next.js-specific - uses platform features.
 * 
 * @module adapters/cache/nextCacheAdapter
 */

import { unstable_cache } from 'next/cache';
import type { CacheInterface, CacheOptions } from '../../services/cache/cacheInterface';

/**
 * Next.js implementation of CacheInterface
 */
export class NextCacheAdapter implements CacheInterface {
    /**
     * Get cached value using Next.js unstable_cache
     */
    async getCached<T>(
        fn: () => Promise<T>,
        options: CacheOptions
    ): Promise<T> {
        // Convert key to array format
        const keyArray = Array.isArray(options.key)
            ? options.key
            : [options.key];

        // Create cached version of function
        const cachedFn = unstable_cache(
            fn,
            keyArray,
            {
                tags: options.tags || [],
                revalidate: options.revalidate
            }
        );

        return cachedFn();
    }

    /**
     * Invalidate cache by tag
     * Note: This is a no-op in the adapter. Cache invalidation in Next.js
     * requires Server Actions context. Use revalidateTag directly in Server Actions.
     */
    async invalidate(tag: string): Promise<void> {
        // No-op: revalidateTag must be called from Server Actions context
        // Callers should use revalidateTag directly in their Server Actions
        return Promise.resolve();
    }
}

/**
 * Singleton instance of Next.js cache adapter
 */
export const nextCache = new NextCacheAdapter();
