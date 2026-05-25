/**
 * LetsGoFood V15 AI Constitution Layer
 * Defines immutable operational laws, safety priorities, confidence thresholds,
 * governance structures, and manual/human approval overrides.
 */

export enum GovernancePriority {
  FINANCIAL_SAFETY = 'FINANCIAL_SAFETY',       // Law 1: Absolute non-negotiable financial audit parity
  MARKETPLACE_INTEGRITY = 'MARKETPLACE_INTEGRITY', // Law 2: Zero driver double-claiming or corrupted routing states
  DATA_DURABILITY = 'DATA_DURABILITY',         // Law 3: PostgreSQL SSoT protection; Firestore read-only
  PLATFORM_LATENCY = 'PLATFORM_LATENCY',       // Law 4: SLO latency and throughput guarantees
  AUTONOMOUS_SCALING = 'AUTONOMOUS_SCALING'     // Law 5: Autoscaling operations
}

export interface GovernancePolicy {
  key: string;
  lawIndex: number;
  priority: GovernancePriority;
  description: string;
  requiresHumanOverride: boolean;
  minConfidenceThreshold: number; // 0.0 to 1.0
}

export class AIConstitution {
  private static policies: Map<string, GovernancePolicy> = new Map([
    ['PAYMENT_REFUND_LIMIT', {
      key: 'PAYMENT_REFUND_LIMIT',
      lawIndex: 1,
      priority: GovernancePriority.FINANCIAL_SAFETY,
      description: 'AI agents cannot issue autonomous customer refunds exceeding 50.00 EUR without manual SRE signature.',
      requiresHumanOverride: true,
      minConfidenceThreshold: 0.99
    }],
    ['DISPATCH_RACE_PREVENTION', {
      key: 'DISPATCH_RACE_PREVENTION',
      lawIndex: 2,
      priority: GovernancePriority.MARKETPLACE_INTEGRITY,
      description: 'AI-driven driver routing optimization must use pessimistic lock bounds on state transitions.',
      requiresHumanOverride: false,
      minConfidenceThreshold: 0.95
    }],
    ['SCHEMA_ALTERATION_PROHIBITION', {
      key: 'SCHEMA_ALTERATION_PROHIBITION',
      lawIndex: 3,
      priority: GovernancePriority.DATA_DURABILITY,
      description: 'AI agents are strictly forbidden from performing autonomous DB schema updates or index removals.',
      requiresHumanOverride: true,
      minConfidenceThreshold: 1.0
    }],
    ['AUTONOMOUS_TRAFFIC_SHIFT', {
      key: 'AUTONOMOUS_TRAFFIC_SHIFT',
      lawIndex: 4,
      priority: GovernancePriority.PLATFORM_LATENCY,
      description: 'AI agents can adjust canary routing weights up to 20% autonomously if P95 latency is stable.',
      requiresHumanOverride: false,
      minConfidenceThreshold: 0.90
    }]
  ]);

  /**
   * Evaluate if an autonomous agent action complies with the AI Constitution laws.
   */
  public static evaluateAction(
    actionKey: string,
    confidence: number,
    metadata: Record<string, any>
  ): { allowed: boolean; reason: string; requiresEscalation: boolean } {
    const policy = this.policies.get(actionKey);
    if (!policy) {
      return {
        allowed: false,
        reason: 'Violation: The requested action key is undocumented within the AI Constitution.',
        requiresEscalation: true
      };
    }

    if (confidence < policy.minConfidenceThreshold) {
      return {
        allowed: false,
        reason: `Violation: Action confidence (${confidence}) falls below the required threshold of (${policy.minConfidenceThreshold}) for policy ${actionKey}.`,
        requiresEscalation: true
      };
    }

    if (policy.requiresHumanOverride && !metadata.manualApprovalToken) {
      return {
        allowed: false,
        reason: `Violation: Action ${actionKey} triggers Governance Law Index ${policy.lawIndex} [${policy.priority}] and requires an authorized manual approval token.`,
        requiresEscalation: true
      };
    }

    return {
      allowed: true,
      reason: `Action ${actionKey} successfully verified against Constitution constraints.`,
      requiresEscalation: false
    };
  }

  /**
   * Safe Fallback Policy when the system detects a governance loop lock.
   */
  public static triggerEmergencyMute() {
    process.env.AI_AUTONOMOUS_MUTED = 'true';
    console.error('CONSTITUTION_ABRT: Autonomous modifications set to READ-ONLY globally due to validation drift.');
  }
}
