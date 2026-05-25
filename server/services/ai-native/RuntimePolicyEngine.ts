/**
 * LetsGoFood V15 Runtime Policy Engine (Policy-as-Code)
 * Verifies business transaction laws, transactional invariants,
 * refund thresholds, and state transition correctness at runtime.
 */

import { logger } from '../infrastructure/Observability';

export interface OrderStateBundle {
  id: string;
  status: 'CREATED' | 'ACCEPTED' | 'PREPARING' | 'READY' | 'PICKED_UP' | 'DELIVERED' | 'CANCELLED';
  restaurantId: string;
  driverId?: string;
  capturedAmountEur: number;
  totalRefundedAmountEur: number;
  isLocked: boolean;
}

export class RuntimePolicyEngine {
  /**
   * Enforced Policy: Safe Refund Transition Verification
   * Refunds must never exceed the captured transaction limits.
   */
  public static canRefundOrder(
    order: OrderStateBundle,
    proposedRefundAmount: number
  ): { valid: boolean; reason: string } {
    const totalPendingRefund = order.totalRefundedAmountEur + proposedRefundAmount;
    
    if (totalPendingRefund > order.capturedAmountEur) {
      return {
        valid: false,
        reason: `Policy Denied: Total requested refund [${totalPendingRefund} EUR] exceeds order captured limit [${order.capturedAmountEur} EUR].`
      };
    }

    if (proposedRefundAmount > 150) {
      return {
        valid: false,
        reason: 'Policy Denied: Single transaction autonomous Refund limit (150.00 EUR) exceeded. Requires SRE supervisor override.'
      };
    }

    return { valid: true, reason: 'Refund within permissible limits.' };
  }

  /**
   * Enforced Policy: Delivery Transition Validation
   * Ensures drivers follow sequential order stages (no premature delivery completion).
   */
  public static validateDriverTransition(
    order: OrderStateBundle,
    targetState: 'PICKED_UP' | 'DELIVERED',
    driverId: string
  ): { allowed: boolean; reason: string } {
    if (order.driverId && order.driverId !== driverId) {
      return {
        allowed: false,
        reason: 'Policy Denied: Action caller ID does not match current assigned logistics partner.'
      };
    }

    if (targetState === 'DELIVERED' && order.status !== 'PICKED_UP') {
      return {
        allowed: false,
        reason: 'Policy Denied: Logistics violation. Cannot complete order delivery before transitioning state to [PICKED_UP] state.'
      };
    }

    return { allowed: true, reason: 'Driver state transition complies with lifecycle invariants.' };
  }

  /**
   * Enforced Policy: Restaurant Write Mutation Guard
   * Prevents merchant nodes from altering order configurations once preparation locks or dispatching are active.
   */
  public static isRestaurantChangeAllowed(
    order: OrderStateBundle,
    merchantId: string
  ): { allowed: boolean; reason: string } {
    if (order.isLocked || ['PREPARING', 'READY', 'PICKED_UP', 'DELIVERED'].includes(order.status)) {
      return {
        allowed: false,
        reason: `Policy Denied: Lifecycle Lock active. Restaurant ${merchantId} cannot edit order state in state "${order.status}".`
      };
    }

    return { allowed: true, reason: 'Configuration is modify-safe.' };
  }
}
