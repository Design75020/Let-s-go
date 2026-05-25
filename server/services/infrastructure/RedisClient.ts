
import Redis from 'ioredis';
import pino from 'pino';

const logger = pino({ name: 'RedisClient' });

class RedisManager {
  private static instance: RedisManager;
  private client: Redis | null = null;
  private isMock: boolean = false;

  private constructor() {
    this.init();
  }

  public static getInstance(): RedisManager {
    if (!RedisManager.instance) {
      RedisManager.instance = new RedisManager();
    }
    return RedisManager.instance;
  }

  private init() {
    const url = process.env.REDIS_URL;
    if (url) {
      try {
        this.client = new Redis(url, {
          retryStrategy: (times) => Math.min(times * 100, 3000),
          maxRetriesPerRequest: 3
        });
        this.client.on('error', (err) => logger.error({ err }, 'Redis Error'));
        this.client.on('connect', () => logger.info('Redis Connected'));
      } catch (e) {
        logger.warn('Failed to connect to Redis, falling back to Mock');
        this.isMock = true;
      }
    } else {
      logger.info('No REDIS_URL provided, using Mock Infrastructure');
      this.isMock = true;
    }
  }

  public getClient(): any {
    if (this.isMock || !this.client) {
      return this.getMockClient();
    }
    return this.client;
  }

  private getMockClient(): any {
    // Simple mock for development
    return {
      get: async () => null,
      set: async () => 'OK',
      setex: async () => 'OK',
      xadd: async () => 'stream-id',
      xreadgroup: async () => [],
      xack: async () => 1,
      incr: async () => 1,
      expire: async () => 1,
      hset: async () => 1,
      hget: async () => null,
      hdel: async () => 1
    };
  }
}

export const redis = RedisManager.getInstance().getClient();
