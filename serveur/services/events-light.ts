
export type BusinessEvent =
  | 'order.created'
  | 'order.accepted'
  | 'order.ready'
  | 'order.delivered'
  | 'order.cancelled';

export interface EventPayload {
  type: BusinessEvent;
  actorId: string;
  resourceId: string;
  tenantId: string;
  data?: any;
}

export const emitEventLight = (payload: EventPayload) => {
  console.log(`[EVENT-LIGHT] [${payload.tenantId}] ${payload.type} by ${payload.actorId}`);
  // In V1, we just log. In V2, we could write to a simple 'events' Firestore collection.
};
