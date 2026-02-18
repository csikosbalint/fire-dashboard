/**
 * Cache Interface
 * 
 * Abstract cache interface for services layer.
 * Implementation-agnostic - can be implemented with Next.js cache, Redis, etc.
 * Pure Node.js - NO Next.js imports in this file.
 * 
 * @module services/cache/cacheInterface
 */

export interface CacheOptions {
    /**
     * Cache key (can be array for composite keys)
     */
    key: string | string[];

    /**
     * Cache tags for invalidation
     */
    tags?: string[];

    /**
     * Revalidation time in seconds
     */
    revalidate?: number;
}

export interface CacheInterface {
    /**
     * Get cached value or compute and cache it
     * 
     * @param fn - Function to compute value if not cached
     * @param options - Cache options
     * @returns Cached or computed value
     */
    getCached<T>(
        fn: () => Promise<T>,
        options: CacheOptions
    ): Promise<T>;

    /**
     * Invalidate cache by tag
     * 
     * @param tag - Cache tag to invalidate
     */
    invalidate(tag: string): Promise<void>;
}
