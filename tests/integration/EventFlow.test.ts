
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Prisma BEFORE imports
vi.mock('../../server/lib/prisma', () => {
  return {
    prisma: {
      $transaction: vi.fn().mockImplementation((fn: any) => fn({
        user: {
          upsert: vi.fn().mockResolvedValue({ id: 'user-abc' }),
          findUnique: vi.fn().mockResolvedValue(null),
        },
        restaurant: {
          upsert: vi.fn().mockResolvedValue({ id: 'rest-xyz' }),
        },
        order: {
          create: vi.fn().mockResolvedValue({
            id: 'order-integration-123',
            userId: 'user-abc',
            restaurantId: 'rest-xyz',
            items: [{ id: 'burger', price: 15 }],
            total: 15,
            status: 'PENDING',
            createdAt: new Date(),
          }),
          findUnique: vi.fn().mockResolvedValue(null),
        },
        ledgerEntry: {
          create: vi.fn().mockResolvedValue({ id: 'ledger-1' }),
        },
      })),
      order: {
        findUnique: vi.fn().mockResolvedValue(null),
        findMany: vi.fn().mockResolvedValue([]),
        update: vi.fn().mockResolvedValue({ id: 'order-1', status: 'ACCEPTED' }),
      },
      ledgerEntry: {
        updateMany: vi.fn().mockResolvedValue({ count: 0 }),
      },
    },
  };
});

vi.mock('../../server/services/infrastructure/EventStream', () => ({
  eventStream: {
    publish: vi.fn().mockResolvedValue('event-123'),
  },
  EventDomain: {
    ECONOMY: 'letsgo:stream:economy',
    MARKETPLACE: 'letsgo:stream:marketplace',
  },
}));

vi.mock('../../server/services/infrastructure/Observability', () => ({
  metrics: {
    register: {
      registerMetric: vi.fn(),
    },
    getMetrics: vi.fn().mockResolvedValue(''),
    increment: vi.fn(),
    gauge: vi.fn(),
    histogram: vi.fn(),
    timing: vi.fn(),
  },
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
  },
  httpRequestsTotal: { inc: vi.fn() },
  activeOrdersGauge: { set: vi.fn() },
  dispatchLatencyGauge: { set: vi.fn() },
  contextStorage: {
    run: (_ctx: any, cb: any) => cb(),
    getStore: () => ({ correlationId: 'test-id' }),
  },
}));

import request from 'supertest';
import express from 'express';
import { orderController } from '../../server/controllers/OrderController';
import { eventStream } from '../../server/services/infrastructure/EventStream';
import { prisma } from '../../server/lib/prisma';

// Setup Mock App
const app = express();
app.use(express.json());
app.post('/api/orders', orderController.create);

describe('Integration: API to Event Stream', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Réinitialiser les mocks après clearAllMocks
    vi.mocked(prisma.$transaction).mockImplementation((fn: any) => fn({
      user: {
        upsert: vi.fn().mockResolvedValue({ id: 'user-abc' }),
        findUnique: vi.fn().mockResolvedValue(null),
      },
      restaurant: {
        upsert: vi.fn().mockResolvedValue({ id: 'rest-xyz' }),
      },
      order: {
        create: vi.fn().mockResolvedValue({
          id: 'order-integration-123',
          userId: 'user-abc',
          restaurantId: 'rest-xyz',
          items: [{ id: 'burger', price: 15 }],
          total: 15,
          status: 'PENDING',
          createdAt: new Date(),
        }),
        findUnique: vi.fn().mockResolvedValue(null),
      },
      ledgerEntry: {
        create: vi.fn().mockResolvedValue({ id: 'ledger-1' }),
      },
    }));
    vi.mocked(eventStream.publish).mockResolvedValue('event-123');
  });

  it('should publish to EventDomain.ECONOMY when an order is created', async () => {
    const payload = {
      userId: 'user-abc',
      restaurantId: 'rest-xyz',
      items: [{ id: 'burger', price: 15 }],
      total: 15,
    };

    const response = await request(app)
      .post('/api/orders')
      .send(payload);

    expect(response.status).toBe(201);
    expect(response.body.id).toBeDefined();

    expect(eventStream.publish).toHaveBeenCalledWith(
      'letsgo:stream:marketplace',
      'order.pending',
      expect.objectContaining({
        orderId: expect.any(String),
        total: 15,
      })
    );
  });
});
