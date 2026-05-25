
export class Cache {
  private static instance: Cache;
  private store: Map<string, any> = new Map();

  private constructor() {}

  public static getInstance(): Cache {
    if (!Cache.instance) {
      Cache.instance = new Cache();
    }
    return Cache.instance;
  }

  public set(key: string, value: any, ttl?: number) {
    this.store.set(key, {
      value,
      expiry: ttl ? Date.now() + ttl : null
    });
  }

  public get(key: string): any {
    const data = this.store.get(key);
    if (!data) return null;
    if (data.expiry && data.expiry < Date.now()) {
      this.store.delete(key);
      return null;
    }
    return data.value;
  }

  public delete(key: string) {
    this.store.delete(key);
  }

  public clear() {
    this.store.clear();
  }
}
