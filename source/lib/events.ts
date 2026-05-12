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
}

export const emitEvent = async (payload: EventPayload) => {
  const correlationId = payload.correlationId || crypto.randomUUID();
  const timestamp = new Date().toISOString();

  console.log(`[EVENT] [${correlationId}] ${payload.type} by ${payload.actorId}`);

  try {
    // Audit Log in Firestore
    await addDoc(collection(db, 'audit_logs'), {
      ...payload,
      correlationId,
      timestamp: serverTimestamp(),
    });

    // Future: Dispatch to JULES agent router
    // await julesRouter.handle(payload);

  } catch (error) {
    console.error(`[EVENT] Error emitting event ${payload.type}:`, error);
  }

  return correlationId;
};
