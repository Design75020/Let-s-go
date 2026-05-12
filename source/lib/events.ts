
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

export class JulesEventBroker {
  private static instance: JulesEventBroker;
  private consumers: Map<string, ((payload: EventPayload) => Promise<void>)[]> = new Map();
  private processedEvents: Set<string> = new Set(); // Idempotency cache (Memory-based for MVP)

  private constructor() {}

  public static getInstance(): JulesEventBroker {
    if (!JulesEventBroker.instance) {
      JulesEventBroker.instance = new JulesEventBroker();
    }
    return JulesEventBroker.instance;
  }

  async publish(payload: EventPayload) {
    const correlationId = payload.correlationId || crypto.randomUUID();
    const version = payload.version || 'v1';

    // Idempotency check
    if (this.processedEvents.has(correlationId)) {
      console.warn(`[EVENT-BROKER] Duplicate event detected and ignored: ${correlationId}`);
      return correlationId;
    }

    console.log(`[EVENT-BROKER] [${correlationId}] [${version}] Publishing: ${payload.type}`);

    try {
      // 1. Persist to Event Store (Audit Log)
      const eventDoc = {
        ...payload,
        correlationId,
        version,
        timestamp: serverTimestamp(),
        status: 'published'
      };
      await addDoc(collection(db, 'audit_logs'), eventDoc);

      // 2. Dispatch to internal consumers
      const listeners = this.consumers.get(payload.type) || [];
      await Promise.all(listeners.map(cb => cb(payload)));

      // 3. Mark as processed for idempotency
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

  subscribe(type: BusinessEvent, callback: (payload: EventPayload) => Promise<void>) {
    const listeners = this.consumers.get(type) || [];
    listeners.push(callback);
    this.consumers.set(type, listeners);
    console.log(`[EVENT-BROKER] New subscriber for: ${type}`);
  }

  async replaySequence(correlationId: string) {
    console.log(`[EVENT-BROKER] Replaying sequence for ${correlationId}`);
    const q = query(collection(db, 'audit_logs'), where('correlationId', '==', correlationId));
    const snapshot = await getDocs(q);
    // Re-processing logic...
  }
}

export const broker = JulesEventBroker.getInstance();

// Legacy wrapper for compatibility
export const emitEvent = (payload: EventPayload) => broker.publish(payload);
