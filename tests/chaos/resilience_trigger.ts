
import { logger } from '../../server/services/infrastructure/Observability';
import { redis } from '../../server/services/infrastructure/RedisClient';

/**
 * LetsGoFood Chaos Utility
 * Used to simulate production failures in a controlled way.
 */
export class ChaosEngine {
  
  /**
   * Simulate Redis Overload
   */
  public static async simulateRedisBacklog(count: number) {
    logger.warn({ count }, 'CHAOS: Injecting massive event backlog');
    for (let i = 0; i < count; i++) {
        await redis.xadd('letsgo:stream:economy', '*', 'data', JSON.stringify({
            id: `chaos-${i}`,
            type: 'order.created',
            payload: { junk: 'filler' },
            timestamp: new Date().toISOString()
        }));
    }
  }

  /**
   * Simulate AI Provider Latency
   * We can do this if we control a mock or a delay middleware.
   */
  public static simulateProviderLatency() {
    logger.warn('CHAOS: Injecting 5s latency into external provider calls');
    // Implementation: This would toggle a global flag that our services check
    process.env.SIMULATE_LATENCY = 'true';
  }

  /**
   * Reset Chaos
   */
  public static reset() {
    process.env.SIMULATE_LATENCY = 'false';
    logger.info('CHAOS: All simulations reset');
  }
}
