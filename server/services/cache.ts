/**
 * LetsGoFood High-Performance Cache Layer
 * Simulates Redis functionality for industrial scale.
 */

class CacheService {
  private static instance: CacheService;
  private cache: Map<string, { data: any; expiry: number }>;

  private constructor() {
    this.cache = new Map();
  }

  public static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService();
    }
    return CacheService.instance;
  }

  /**
   * Set cache with TTL (Time To Live in ms)
   */
  set(key: string, data: any, ttl: number = 300000): void { // Default 5 mins
    const expiry = Date.now() + ttl;
    this.cache.set(key, { data, expiry });
  }

  /**
   * Get data from cache. Returns null if expired or missing.
   */
  get(key: string): any | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  /**
   * Invalidate specific key or pattern
   */
  del(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Clear cache for specific domain (e.g. 'restaurants')
   */
  invalidatePattern(pattern: string): void {
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }
}

export const Cache = CacheService.getInstance();
