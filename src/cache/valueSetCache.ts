// ValueSet Caching Utilities
interface CachedValueSet {
  expansion: any;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

class ValueSetCache {
  private cache: Map<string, CachedValueSet> = new Map();

  /**
   * Get a cached ValueSet expansion
   */
  get(url: string): any | null {
    const cached = this.cache.get(url);
    if (!cached) {
      return null;
    }

    // Check if the cache is still valid
    if (Date.now() - cached.timestamp > cached.ttl) {
      this.cache.delete(url);
      return null;
    }

    return cached.expansion;
  }

  /**
   * Set a ValueSet expansion in cache
   */
  set(url: string, expansion: any, ttl: number = 5 * 60 * 1000): void { // Default TTL: 5 minutes
    this.cache.set(url, {
      expansion,
      timestamp: Date.now(),
      ttl
    });
  }

  /**
   * Clear the cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Remove expired entries
   */
  cleanExpired(): void {
    const now = Date.now();
    for (const [url, cached] of this.cache.entries()) {
      if (now - cached.timestamp > cached.ttl) {
        this.cache.delete(url);
      }
    }
  }
}

export const valueSetCache = new ValueSetCache();