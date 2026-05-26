
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { OrderService } from '../../server/services/OrderService';
import { eventStream, EventDomain } from '../../server/services/infrastructure/EventStream';

// Mock dependencies
vi.mock('../../server/services/infrastructure/EventStream', () => ({
  eventStream: {
    publish: vi.fn().mockResolvedValue('event-id-123'),
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
    contextStorage: {
      getStore: vi.fn().mockReturnValue({ correlationId: 'test-correlation-id' }),
    },
  };
});

// Mock Prisma to avoid real DB calls in unit tests
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


describe('OrderService', () => {
  let orderService: OrderService;

  beforeEach(() => {
    orderService = new OrderService();
    vi.clearAllMocks();
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

    // Verify event was published
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
