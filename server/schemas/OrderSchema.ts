
import { z } from 'zod';

export const OrderSchema = z.object({
  userId: z.string().min(1),
  restaurantId: z.string().min(3),
  items: z.array(z.object({
    id: z.string(),
    price: z.number().positive(),
    quantity: z.number().int().positive().optional(),
    name: z.string().optional()
  })).min(1),
  total: z.number().positive(),
  clientName: z.string().optional(),
  restaurantName: z.string().optional(),
  // FIX BUG-001: idempotencyKey was missing from schema, causing it to be stripped
  // before reaching OrderService, breaking double-payment protection.
  idempotencyKey: z.string().optional(),
  // Allow merchantId to pass through (used by ClientApp)
  merchantId: z.string().optional(),
});

export type OrderInput = z.infer<typeof OrderSchema>;
