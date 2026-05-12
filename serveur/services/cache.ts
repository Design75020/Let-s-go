
const cacheMap = new Map();

export const Cache = {
  get: (key: string) => {
    const entry = cacheMap.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiry) {
      cacheMap.delete(key);
      return null;
    }
    return entry.value;
  },
  set: (key: string, value: any, ttlMs: number = 30000) => {
    cacheMap.set(key, { value, expiry: Date.now() + ttlMs });
  }
};
