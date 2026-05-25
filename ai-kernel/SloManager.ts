/**
 * LetsGoFood V15 AI Operating System Kernel - SLO / Error Budget Enforcement Layer
 * Measures service metrics in real time, decrements budget thresholds, and enforces
 * degradation fallbacks (e.g. freezing promotions, disabling intensive matching computations).
 */

import { SloBudget } from './types';
import { logger } from '../server/services/infrastructure/Observability';

export class SloBudgetEnforcementLayer {
  private static budgets: Map<string, SloBudget> = new Map([
    ['BILLING_ENGINE', {
      subsystem: 'BILLING_ENGINE',
      p95LatencyLimitMs: 400,
      p99LatencyLimitMs: 800,
      errorRateThreshold: 0.005, // 0.5%
      remainingErrorBudget: 100.0,
      activeMutedFeatures: []
    }],
    ['DISPATCH_ENGINE', {
      subsystem: 'DISPATCH_ENGINE',
      p95LatencyLimitMs: 1500,
      p99LatencyLimitMs: 3000,
      errorRateThreshold: 0.02, // 2%
      remainingErrorBudget: 100.0,
      activeMutedFeatures: []
    }],
    ['REALTIME_WS_GATE', {
      subsystem: 'REALTIME_WS_GATE',
      p95LatencyLimitMs: 200,
      p99LatencyLimitMs: 500,
      errorRateThreshold: 0.01,
      remainingErrorBudget: 100.0,
      activeMutedFeatures: []
    }]
  ]);

  /**
   * Monitor metric telemetry ticks and decrease error budgets if thresholds are breached.
   */
  public static evaluateSubsystemSloTick(
    subsystem: string,
    measuredLatencyMs: number,
    isErrorOccurred: boolean
  ): { degradationTriggered: boolean; remainingBudget: number } {
    const budget = this.budgets.get(subsystem);
    if (!budget) return { degradationTriggered: false, remainingBudget: 100.0 };

    let isDegradedThisTick = false;

    // Latency SLO Evaluation
    if (measuredLatencyMs > budget.p99LatencyLimitMs) {
      budget.remainingErrorBudget -= 1.5; // High latency penalty
      isDegradedThisTick = true;
    } else if (measuredLatencyMs > budget.p95LatencyLimitMs) {
      budget.remainingErrorBudget -= 0.5; // Minor latency penalty
    }

    // Error Rate SLO Evaluation
    if (isErrorOccurred) {
      budget.remainingErrorBudget -= 3.0; // Severe error contribution penalty
      isDegradedThisTick = true;
    }

    // Clip budget values
    budget.remainingErrorBudget = Math.max(0, budget.remainingErrorBudget);

    // Apply circuit-breaking fallbacks if the Error Budget drops below 85%
    if (budget.remainingErrorBudget < 85.0 && budget.activeMutedFeatures.length === 0) {
      this.triggerFeatureDegradationState(subsystem, budget);
    }

    return {
      degradationTriggered: budget.remainingErrorBudget < 85.0,
      remainingBudget: parseFloat(budget.remainingErrorBudget.toFixed(2))
    };
  }

  /**
   * Safe operational mutes to protect high availability
   */
  private static triggerFeatureDegradationState(subsystem: string, budget: SloBudget) {
    logger.fatal(`SLO_VIOLATION_TRIGGER: Subsystem ${subsystem} error budget depleted below 85%! Initiating feature kill-switches.`);
    
    if (subsystem === 'BILLING_ENGINE') {
      budget.activeMutedFeatures.push('DYNAMIC_MARKETING_PROMOTIONS');
      logger.warn('DEGRADATION_ACTION: Freezing promotional credits loop instantly to isolate billing processing channels.');
      process.env.PROMOTIONS_LOCKED = 'true';
    } else if (subsystem === 'DISPATCH_ENGINE') {
      budget.activeMutedFeatures.push('MULTI_SEGMENT_AI_ETA_RECALC');
      logger.warn('DEGRADATION_ACTION: Temporarily disabling recursive AI ETA calculation loops. Restricting dispatcher to linear computation fallback.');
      process.env.ETA_OPTIMIZATION_BYPASS = 'true';
    } else if (subsystem === 'REALTIME_WS_GATE') {
      budget.activeMutedFeatures.push('SUB_SECOND_MAP_RIPPLES');
      logger.warn('DEGRADATION_ACTION: Reducing polling tickrate of driver visual map overlays to decrease WebSocket memory spikes.');
      process.env.WS_DENSE_TICKS_BYPASS = 'true';
    }
  }

  public static getBudgets(): SloBudget[] {
    return Array.from(this.budgets.values());
  }

  public static restoreErrorBudgets() {
    this.budgets.forEach(b => {
      b.remainingErrorBudget = 100.0;
      b.activeMutedFeatures = [];
    });
    process.env.PROMOTIONS_LOCKED = 'false';
    process.env.ETA_OPTIMIZATION_BYPASS = 'false';
    process.env.WS_DENSE_TICKS_BYPASS = 'false';
  }
}
