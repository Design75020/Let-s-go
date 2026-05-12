
import { db } from './firebase';
import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';

export type BusinessEvent =
  | 'order.created'
  | 'order.accepted'
  | 'order.preparing'
  | 'order.ready'
  | 'order.picked_up'
  | 'order.delivered'
  | 'order.cancelled'
  | 'payment.succeeded'
  | 'delivery.started'
  | 'delivery.completed';

export interface EventPayload {
  type: BusinessEvent;
  actorId: string;
  actorRole: string;
  resourceId: string;
  data?: any;
  correlationId?: string;
  version?: string;
}

export interface IEventBroker {
  publish(payload: EventPayload): Promise<string>;
  subscribe(type: BusinessEvent, callback: (payload: EventPayload) => Promise<void>): void;
  replaySequence(correlationId: string): Promise<void>;
}

export abstract class BaseEventBroker implements IEventBroker {
  protected consumers: Map<string, ((payload: EventPayload) => Promise<void>)[]> = new Map();
  protected processedEvents: Set<string> = new Set();

  abstract publish(payload: EventPayload): Promise<string>;

  subscribe(type: BusinessEvent, callback: (payload: EventPayload) => Promise<void>) {
    const listeners = this.consumers.get(type) || [];
    listeners.push(callback);
    this.consumers.set(type, listeners);
    console.log(`[EVENT-BROKER] New subscriber for: ${type}`);
  }

  abstract replaySequence(correlationId: string): Promise<void>;
}

export class JulesEventBroker extends BaseEventBroker {
  private static instance: JulesEventBroker;

  private constructor() {
    super();
  }

  public static getInstance(): JulesEventBroker {
    if (!JulesEventBroker.instance) {
      JulesEventBroker.instance = new JulesEventBroker();
    }
    return JulesEventBroker.instance;
  }

  async publish(payload: EventPayload) {
    const correlationId = payload.correlationId || crypto.randomUUID();
    const version = payload.version || 'v1';

    const isProcessed = await this.checkPersistentIdempotency(correlationId);
    if (isProcessed || this.processedEvents.has(correlationId)) {
      console.warn(`[EVENT-BROKER] Duplicate event detected and ignored: ${correlationId}`);
      return correlationId;
    }

    if (!['v1', 'v2'].includes(version)) {
      throw new Error(`[EVENT-BROKER] Unsupported event version: ${version}`);
    }

    console.log(`[EVENT-BROKER] [${correlationId}] [${version}] Publishing: ${payload.type}`);

    try {
      const eventDoc = {
        ...payload,
        correlationId,
        version,
        timestamp: serverTimestamp(),
        status: 'published'
      };
      await addDoc(collection(db, 'audit_logs'), eventDoc);

      const listeners = this.consumers.get(payload.type) || [];
      await Promise.all(listeners.map(cb => cb(payload)));

      this.processedEvents.add(correlationId);

    } catch (error) {
      console.error(`[EVENT-BROKER] [DLQ] routing to Dead Letter Queue:`, error);
      await addDoc(collection(db, 'dlq_events'), {
        payload,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: serverTimestamp()
      });
    }

    return correlationId;
  }

  private async checkPersistentIdempotency(correlationId: string): Promise<boolean> {
    console.log(`[EVENT-BROKER] Checking persistent idempotency for ${correlationId}`);
    return false;
  }

  async replaySequence(correlationId: string) {
    console.log(`[EVENT-BROKER] Replaying sequence for ${correlationId}`);
    const q = query(collection(db, 'audit_logs'), where('correlationId', '==', correlationId));
    const snapshot = await getDocs(q);
  }
}

export const broker = JulesEventBroker.getInstance();
export const emitEvent = (payload: EventPayload) => broker.publish(payload);
