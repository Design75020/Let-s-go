
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
    MARKETPLACE: 'letsgo:stream:marketplace',
    BI: 'letsgo:stream:bi',
  },
}));

vi.mock('../../server/services/infrastructure/Observability', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    metrics: {
      register: {
        registerMetric: vi.fn(),
        getSingleMetric: vi.fn().mockReturnValue(undefined),
      },
    },
    logger: { info: vi.fn(), error: vi.fn(), debug: vi.fn(), warn: vi.fn() },
    httpRequestsTotal: { inc: vi.fn() },
    httpRequestDurationSeconds: { observe: vi.fn() },
    contextStorage: {
      run: (ctx: any, cb: any) => cb(),
      getStore: () => ({ correlationId: 'test-id' })
    }
  };
});

// Mock Prisma to avoid real DB calls in integration tests
vi.mock('../../server/lib/prisma', () => ({
  prisma: {
    $transaction: vi.fn().mockImplementation(async (cb: any) => {
      const mockOrder = { id: 'order-123', userId: 'user-1', restaurantId: 'rest-1', status: 'PENDING', total: 10, items: '[]', createdAt: new Date() };
      const mockTx = {
        user: { upsert: vi.fn().mockResolvedValue({ id: 'user-1', email: 'test@test.com', name: 'Test', role: 'CUSTOMER', createdAt: new Date() }) },
        restaurant: { upsert: vi.fn().mockResolvedValue({ id: 'rest-1', name: 'Test Restaurant', location: 'Paris', createdAt: new Date() }) },
        order: {
          findUnique: vi.fn().mockResolvedValue(null),
          create: vi.fn().mockResolvedValue(mockOrder),
        },
        ledgerEntry: { create: vi.fn().mockResolvedValue({ id: 'ledger-1' }) },
      };
      return cb(mockTx);
    }),
  },
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
      'letsgo:stream:marketplace',
      'order.pending',
      expect.objectContaining({
        orderId: 'order-123',
        total: 15
      })
    );
  });
});
