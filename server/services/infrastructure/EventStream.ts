
import { redis } from './RedisClient';
import { v4 as uuidv4 } from 'uuid';
import { logger, HealthMonitor, contextStorage } from './Observability';
import { Security } from './Security';

export interface AppEvent {
  id: string;
  type: string;
  payload: any;
  timestamp: string;
  correlationId?: string;
  retryCount?: number;
  signature?: string;
}

export enum EventDomain {
  ECONOMY = 'letsgo:stream:economy',
  ANOMALY = 'letsgo:stream:anomaly',
  COST = 'letsgo:stream:cost',
  ORDERS = 'letsgo:stream:orders',
  BI = 'letsgo:stream:bi',
  MARKETPLACE = 'letsgo:stream:marketplace'
}

export class EventStream {
  private static GROUP_NAME = 'bi_worker_group';
  private static DLQ_STREAM = 'letsgo:stream:dlq';

  public async publish(domain: EventDomain, type: string, payload: any): Promise<string> {
    const context = contextStorage.getStore();
    
    // Sign the payload for integrity
    const signature = Security.signPayload(payload);

    const event: AppEvent = {
       id: uuidv4(),
       type,
       payload,
       timestamp: new Date().toISOString(),
       correlationId: context?.correlationId,
       retryCount: 0,
       signature
    };

    try {
      await redis.xadd(domain, '*', 'data', JSON.stringify(event));
      logger.debug({ domain, type, eventId: event.id }, 'Event Stream: Published');
      return event.id;
    } catch (err) {
      logger.error(err, 'Event Stream: Failed to publish');
      throw err;
    }
  }

  public async consume(domain: EventDomain, groupName: string, consumerName: string, handler: (event: AppEvent) => Promise<void>) {
    try {
      try {
        await redis.xgroup('CREATE', domain, groupName, '0', 'MKSTREAM');
      } catch (e) {}

      const poll = async () => {
        try {
          const result = await redis.xreadgroup(
            'GROUP', groupName, consumerName,
            'COUNT', '5', 'BLOCK', '2000',
            'STREAMS', domain, '>'
          );

          if (result && result.length > 0) {
            const [_stream, messages] = result[0];
            for (const [id, [_field, data]] of messages) {
              const event: AppEvent = JSON.parse(data);
              
              const start = Date.now();
              try {
                await contextStorage.run({ correlationId: event.correlationId || 'none' }, async () => {
                   await handler(event);
                });
                
                await redis.xack(domain, groupName, id);
              } catch (handlerErr) {
                logger.error(handlerErr, 'Event Stream: Handler failed');
              }
            }
          }
        } catch (err) {
          logger.error(err, 'Event Stream: Polling error');
        }
        setTimeout(poll, 100);
      };

      poll();
    } catch (err) {
      logger.error(err, 'Event Stream: Failed to start consumer');
    }
  }

  private async quarantineEvent(domain: string, msgId: string, event: AppEvent, reason: string) {
    const key = `letsgo:quarantine:${reason}`;
    await redis.xadd(key, '*', 'data', JSON.stringify({ ...event, originalDomain: domain }));
    await redis.xack(domain, EventStream.GROUP_NAME, msgId);
  }

  private async handleError(domain: string, msgId: string, event: AppEvent, error: any) {
    const retries = (event.retryCount || 0) + 1;
    logger.error({ error, eventId: event.id, retries }, 'Event Stream: Handler failed');

    if (retries > 3) {
      logger.fatal({ eventId: event.id }, 'Event Stream: Moving to DLQ after max retries');
      await redis.xadd(EventStream.DLQ_STREAM, '*', 'data', JSON.stringify({ ...event, error: String(error) }));
      await redis.xack(domain, EventStream.GROUP_NAME, msgId);
    } else {
      // Re-publish with incremented retry count
      const updatedEvent = { ...event, retryCount: retries };
      await redis.xadd(domain, '*', 'data', JSON.stringify(updatedEvent));
      await redis.xack(domain, EventStream.GROUP_NAME, msgId);
    }
  }

  public async getStreamInfo(domain: EventDomain) {
    const info: any = await redis.xinfo('STREAM', domain).catch(() => null);
    return {
      length: info?.length || 0,
      groups: info?.['groups-count'] || 0,
      lastId: info?.['last-generated-id']
    };
  }
}

export const eventStream = new EventStream();
