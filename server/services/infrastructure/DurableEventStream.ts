
import { v4 as uuidv4 } from 'uuid';
import { redis } from './RedisClient';
import pino from 'pino';

const logger = pino({ name: 'DurableEventStream' });

export interface AppEvent {
  id: string;
  type: string;
  payload: any;
  timestamp: number;
  correlationId?: string;
}

export class DurableEventStream {
  private static STREAM_NAME = 'letsgo:bi:events';
  private static GROUP_NAME = 'bi_processor_group';

  public async publish(type: string, payload: any, correlationId?: string): Promise<string> {
    if (process.env.MIGRATION_MODE === 'PHASE_3_CUTOVER' || process.env.MIGRATION_MODE === 'PHASE_4_FREEZE') {
      logger.fatal({ type }, 'DurableEventStream: BLOCKING write attempt to legacy stream post-cutover.');
      throw new Error('Critical: Event system cutover in progress/complete. Use EventStream instead.');
    }
    const event: AppEvent = {
      id: uuidv4(),
      type,
      payload,
      timestamp: Date.now(),
      correlationId
    };

    try {
      const result = await redis.xadd(
        DurableEventStream.STREAM_NAME,
        '*',
        'data',
        JSON.stringify(event)
      );
      logger.info({ type, eventId: event.id }, 'Event Published');
      return event.id;
    } catch (error) {
      logger.error({ error, type }, 'Failed to publish event');
      throw error;
    }
  }

  // Simplified consumer loop for production demo
  public async listen(handler: (event: AppEvent) => Promise<void>) {
    logger.info('Starting durable event listener...');
    
    // In a real environment, we would use xreadgroup with a long poll
    // For this prototype, we'll simulate the consumer loop
    setInterval(async () => {
      try {
        // This is where we would read from Redis Stream
        // For the mock/sim, we'll just check if anything is "ready"
      } catch (error) {
        logger.error(error, 'Consumer group error');
      }
    }, 5000);
  }
}

export const eventStream = new DurableEventStream();
