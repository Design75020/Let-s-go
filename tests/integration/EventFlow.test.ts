
import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import { orderController } from '../../server/controllers/OrderController';
import { eventStream, EventDomain } from '../../server/services/infrastructure/EventStream';

// Setup Mock App
const app = express();
app.use(express.json());
app.post('/api/orders', orderController.create);

vi.mock('../../server/services/infrastructure/EventStream', () => ({
  eventStream: {
    publish: vi.fn().mockResolvedValue('event-123'),
  },
  EventDomain: {
    ECONOMY: 'letsgo:stream:economy',
  },
}));

vi.mock('../../server/services/infrastructure/Observability', () => ({
  metrics: {
    increment: vi.fn(),
    gauge: vi.fn(),
    histogram: vi.fn(),
    timing: vi.fn(),
  },
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
  httpRequestsTotal: {
    inc: vi.fn(),
  },
  contextStorage: {
    run: (ctx: any, cb: any) => cb(),
    getStore: () => ({ correlationId: 'test-id' })
  }
}));

describe('Integration: API to Event Stream', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should publish to EventDomain.ECONOMY when an order is created', async () => {
    const payload = {
      userId: 'user-abc',
      restaurantId: 'rest-xyz',
      items: [{ id: 'burger', price: 15 }],
      total: 15
    };

    const response = await request(app)
      .post('/api/orders')
      .send(payload);

    expect(response.status).toBe(201);
    expect(response.body.id).toBeDefined();

    // Verify the integration with EventStream
    expect(eventStream.publish).toHaveBeenCalledWith(
      'letsgo:stream:economy',
      'order.created',
      expect.objectContaining({
        userId: 'user-abc',
        total: 15
      })
    );
  });
});
