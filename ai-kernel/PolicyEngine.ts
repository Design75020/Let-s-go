/**
 * LetsGoFood V15 AI Operating System Kernel - Policy Enforcement & Invariants Engine
 * Standardizes runtime policies (Policy-as-Code), executes transaction checks,
 * protects order lifecycles, and blocks double refund payloads.
 */

import { PolicyRule, OrderState } from './types';
import { logger } from '../server/services/infrastructure/Observability';

export class PolicyEnforcementEngine {
  private static rules: PolicyRule[] = [];

  /**
   * Initialize standard operating invariants for LetsGoFood V15
   */
  public static initializeKernelRules() {
    this.rules = [
      {
        policyId: 'RULE_REFUND_CAP',
        invariantName: 'No Refund Over Capture Value',
        assertion: (obj: { order: OrderState; proposedAmountCents: number }) => {
          const totalAfterRefund = obj.order.refundedCents + obj.proposedAmountCents;
          const limit = obj.order.subtotalCents + obj.order.deliveryFeeCents;
          if (totalAfterRefund > limit) {
            return {
              passed: false,
              errorText: `Transaction validation failed: Proposed total refund of [${totalAfterRefund} cents] exceeds captured maximum of [${limit} cents] on Order ${obj.order.orderId}`
            };
          }
          return { passed: true };
        },
        actionOnViolation: 'ABORT_TRANSACTION'
      },
      {
        policyId: 'RULE_SEQUENTIAL_DELIVERY',
        invariantName: 'Delivery Sequence Lifecycle Integrity',
        assertion: (obj: { order: OrderState; proposedStatus: string }) => {
          if (obj.proposedStatus === 'DELIVERED' && obj.order.status !== 'PICKED_UP') {
            return {
              passed: false,
              errorText: `Lifecycle Exception: Cannot mark Order ${obj.order.orderId} as [DELIVERED] without a transition sequence to [PICKED_UP] first.`
            };
          }
          return { passed: true };
        },
        actionOnViolation: 'ABORT_TRANSACTION'
      },
      {
        policyId: 'RULE_RESTAURANT_LOCKED_MUTATION',
        invariantName: 'Restaurant Locked Order Mutation Barrier',
        assertion: (obj: { order: OrderState }) => {
          const lockedStatuses = ['PREPARING', 'READY', 'PICKED_UP', 'DELIVERED'];
          if (lockedStatuses.includes(obj.order.status)) {
            return {
              passed: false,
              errorText: `Write Blocked: Merchant cannot modify order parameters once preparation or dispatch has commenced. (Current State: ${obj.order.status})`
            };
          }
          return { passed: true };
        },
        actionOnViolation: 'ABORT_TRANSACTION'
      }
    ];

    logger.info({ count: this.rules.length }, 'POLICY_ENGINE_INIT: System invariants successfully bootstrapped into Operating Kernel.');
  }

  /**
   * Evaluate runtime commands against the registered policies.
   */
  public static assertPolicy(policyId: string, payload: any): { passed: boolean; errorText?: string } {
    const rule = this.rules.find(r => r.policyId === policyId);
    if (!rule) {
      logger.warn({ policyId }, 'POLICY_ENGINE_WARN: Policy checkpoint requested without active rule registration. Permised conditionally.');
      return { passed: true };
    }

    try {
      const result = rule.assertion(payload, null);
      if (!result.passed) {
        logger.error({ policyId, error: result.errorText }, 'POLICY_VIOLATION_TRIGGERED: Runtime action blocked!');
        return { passed: false, errorText: result.errorText };
      }
      return { passed: true };
    } catch (err: any) {
      logger.fatal({ policyId, criticalError: err.message }, 'POLICY_ENGINE_FATAL: Crash in invariant evaluator context!');
      return { passed: false, errorText: `Evaluator crash: ${err.message}` };
    }
  }
}
