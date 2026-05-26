
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
  contextStorage: {
    getStore: vi.fn().mockReturnValue({ correlationId: 'test-correlation-id' }),
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
      'letsgo:stream:economy',
      'order.created',
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
