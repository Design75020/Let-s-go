import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Prisma BEFORE imports that use it
vi.mock('../../server/lib/prisma', () => {
  const mockTx = {
    user: {
      upsert: vi.fn().mockResolvedValue({ id: 'user-1' }),
      findUnique: vi.fn().mockResolvedValue(null),
    },
    restaurant: {
      upsert: vi.fn().mockResolvedValue({ id: 'rest-1' }),
    },
    order: {
      create: vi.fn().mockResolvedValue({
        id: 'order-uuid-123',
        userId: 'user-1',
        restaurantId: 'rest-1',
        items: [{ id: 'item-1', price: 10 }],
        total: 10,
        status: 'PENDING',
        createdAt: new Date(),
      }),
      findUnique: vi.fn().mockResolvedValue(null),
    },
    ledgerEntry: {
      create: vi.fn().mockResolvedValue({ id: 'ledger-1' }),
    },
  };
  return {
    prisma: {
      $transaction: vi.fn().mockImplementation((fn: any) => fn(mockTx)),
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
    publish: vi.fn().mockResolvedValue('event-id-123'),
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
  contextStorage: {
    getStore: vi.fn().mockReturnValue({ correlationId: 'test-correlation-id' }),
  },
  httpRequestsTotal: { inc: vi.fn() },
  activeOrdersGauge: { set: vi.fn() },
  dispatchLatencyGauge: { set: vi.fn() },
}));

import { OrderService } from '../../server/services/OrderService';
import { eventStream } from '../../server/services/infrastructure/EventStream';
import { prisma } from '../../server/lib/prisma';

describe('OrderService', () => {
  let orderService: OrderService;

  beforeEach(() => {
    vi.clearAllMocks();
    // Réinitialiser les mocks après clearAllMocks
    vi.mocked(prisma.$transaction).mockImplementation((fn: any) => fn({
      user: {
        upsert: vi.fn().mockResolvedValue({ id: 'user-1' }),
        findUnique: vi.fn().mockResolvedValue(null),
      },
      restaurant: {
        upsert: vi.fn().mockResolvedValue({ id: 'rest-1' }),
      },
      order: {
        create: vi.fn().mockResolvedValue({
          id: 'order-uuid-123',
          userId: 'user-1',
          restaurantId: 'rest-1',
          items: [{ id: 'item-1', price: 10 }],
          total: 10,
          status: 'PENDING',
          createdAt: new Date(),
        }),
        findUnique: vi.fn().mockResolvedValue(null),
      },
      ledgerEntry: {
        create: vi.fn().mockResolvedValue({ id: 'ledger-1' }),
      },
    }));
    vi.mocked(eventStream.publish).mockResolvedValue('event-id-123');
    orderService = new OrderService();
  });

  it('should create an order and publish an event', async () => {
    const orderData = {
      userId: 'user-1',
      restaurantId: 'rest-1',
      items: [{ id: 'item-1', price: 10 }],
      total: 10,
    };

    const order = await orderService.createOrder(orderData);

    expect(order).toBeDefined();
    expect(order.id).toBeTypeOf('string');
    expect(order.status).toBe('PENDING');

    expect(eventStream.publish).toHaveBeenCalledWith(
      'letsgo:stream:marketplace',
      'order.pending',
      expect.objectContaining({
        orderId: order.id,
        total: 10,
      })
    );
  });

  it('should fail if event publishing fails', async () => {
    vi.mocked(eventStream.publish).mockRejectedValueOnce(new Error('Publish failed'));

    const orderData = {
      userId: 'user-1',
      restaurantId: 'rest-1',
      items: [],
      total: 0,
    };

    await expect(orderService.createOrder(orderData)).rejects.toThrow('Publish failed');
  });
});
