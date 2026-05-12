import { db } from './firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

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

export const emitEvent = async (payload: EventPayload) => {
  const correlationId = payload.correlationId || crypto.randomUUID();
  const version = payload.version || 'v1';
  const timestamp = new Date().toISOString();

  console.log(`[EVENT-BUS] [${correlationId}] [${version}] Publishing: ${payload.type}`);

  try {
    // Audit Log in Firestore (Event Store)
    const eventDoc = {
      ...payload,
      correlationId,
      version,
      timestamp: serverTimestamp(),
      status: 'published'
    };

    await addDoc(collection(db, 'audit_logs'), eventDoc);

    // Dispatch to JULES SDK Runtime
    // In a real industrial system, this would be a Redis Stream or Kafka consumer
    // runtime.handleEvent({ id: crypto.randomUUID(), ...eventDoc });

  } catch (error) {
    console.error(`[EVENT-BUS] [DLQ] Routing failed event to Dead Letter Queue:`, error);
    await addDoc(collection(db, 'dlq_events'), {
      payload,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: serverTimestamp()
    });
  }

  return correlationId;
};

export const replayEvents = async (correlationId: string) => {
  console.log(`[EVENT-BUS] Replaying sequence for correlationId: ${correlationId}`);
  // Logic to query Firestore audit_logs and re-process
};
