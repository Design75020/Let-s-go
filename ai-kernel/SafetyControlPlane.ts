/**
 * LetsGoFood V15 OS Kernel - Global Safety Control Plane & Emergency Overrides
 * Tracks high-fidelity safety coefficients, manages module-level kill switches,
 * triggers write bypass blocks, and freezes processing models when confidence falls under thresholds.
 */

import { EmergencyControlPlane, KillSwitchStatus } from './verificationTypes';
import { GlobalKernelState } from './StateMachine';
import { SystemState, KernelAgentType } from './types';
import { logger } from '../server/services/infrastructure/Observability';

export class SafetyControlPlane {
  private static controlPlane: EmergencyControlPlane = {
    globalSystemMode: SystemState.NOMINAL,
    writeBypassActive: false,
    readOnlyFallbacksEnabled: false,
    safetyConfidenceScore: 100.0,
    activeSwitches: {
      'BILLING_SYSTEM': { subsystemKey: 'BILLING_SYSTEM', muted: false, triggerSource: 'MANUAL_OVERRIDE', lastToggledAt: new Date().toISOString() },
      'DISPATCH_CORE': { subsystemKey: 'DISPATCH_CORE', muted: false, triggerSource: 'MANUAL_OVERRIDE', lastToggledAt: new Date().toISOString() },
      'REALTIME_OVERLAYS': { subsystemKey: 'REALTIME_OVERLAYS', muted: false, triggerSource: 'MANUAL_OVERRIDE', lastToggledAt: new Date().toISOString() },
      'PROMOTIONS_ENGINE': { subsystemKey: 'PROMOTIONS_ENGINE', muted: false, triggerSource: 'MANUAL_OVERRIDE', lastToggledAt: new Date().toISOString() },
      'ROUTING_AI': { subsystemKey: 'ROUTING_AI', muted: false, triggerSource: 'MANUAL_OVERRIDE', lastToggledAt: new Date().toISOString() }
    }
  };

  /**
   * Evaluate running safety coefficient parameters.
   */
  public static computeSafetyConfidenceScore(
    ledgerDiscrepanciesCount: number,
    unresolvedSequenceGaps: number,
    globalErrorBudgetAvg: number
  ): number {
    let score = 100.0;

    // Deduct points heavily representing operational fragility
    score -= (ledgerDiscrepanciesCount * 30.0); // Extreme penalty for financial drift
    score -= (unresolvedSequenceGaps * 15.0); // High penalty for out-of-order clock traces
    score -= (Math.max(0, 100 - globalErrorBudgetAvg) * 0.5); // Marginal penalty from SLO depletion

    score = Math.max(0.0, Math.min(100.0, score));
    this.controlPlane.safetyConfidenceScore = parseFloat(score.toFixed(2));

    // Dynamic Action Gates mapping according to safety thresholds
    if (this.controlPlane.safetyConfidenceScore < 60.0) {
      this.triggerEmergencyGlobalFreeze('Safety confidence score dropped past critical threshold (<60%)');
    } else if (this.controlPlane.safetyConfidenceScore < 85.0 && !this.controlPlane.readOnlyFallbacksEnabled) {
      this.activateReadOnlyFallbackMode();
    }

    return this.controlPlane.safetyConfidenceScore;
  }

  /**
   * Action progressive degradation: Switch off write mechanisms and run state projections only.
   */
  public static activateReadOnlyFallbackMode() {
    logger.fatal('SAFETY_DEGRADATION: Activating systemic read-only safety fallbacks. Muting promotional modules.');
    this.controlPlane.readOnlyFallbacksEnabled = true;
    this.controlPlane.globalSystemMode = SystemState.DEGRADED_COOLDOWN;
    GlobalKernelState.setSystemState(SystemState.DEGRADED_COOLDOWN);
    
    // Auto-disable Promotions & Routing AIs
    this.setSubsystemMode('PROMOTIONS_ENGINE', true, 'AUTOMATED_SLO_BURST');
    this.setSubsystemMode('ROUTING_AI', true, 'AUTOMATED_SLO_BURST');
  }

  /**
   * Full System Lock: Rejects all updates until SRE overrides are satisfied.
   */
  public static triggerEmergencyGlobalFreeze(reason: string) {
    logger.fatal({ reason }, 'SAFETY_FREEZE_TRIGGERED: Global safe-state freeze forced!');
    this.controlPlane.writeBypassActive = true;
    this.controlPlane.globalSystemMode = SystemState.SAFE_MODE_FREEZE;
    GlobalKernelState.setSystemState(SystemState.SAFE_MODE_FREEZE);

    // Lock all modules
    Object.keys(this.controlPlane.activeSwitches).forEach(key => {
      this.setSubsystemMode(key as any, true, 'ADVERSARIAL_ATTACK_DETECTED');
    });
  }

  /**
   * Toggle a module-level override.
   */
  public static setSubsystemMode(
    key: 'BILLING_SYSTEM' | 'DISPATCH_CORE' | 'REALTIME_OVERLAYS' | 'PROMOTIONS_ENGINE' | 'ROUTING_AI',
    muted: boolean,
    source: 'MANUAL_OVERRIDE' | 'AUTOMATED_SLO_BURST' | 'ADVERSARIAL_ATTACK_DETECTED'
  ) {
    const sw = this.controlPlane.activeSwitches[key];
    if (sw) {
      sw.muted = muted;
      sw.triggerSource = source;
      sw.lastToggledAt = new Date().toISOString();

      logger.warn({ key, muted, source }, 'SAFETY_PLANE_SWITCH: Subsystem permission configuration mutated.');
    }
  }

  public static getControlPlaneState(): EmergencyControlPlane {
    return { ...this.controlPlane };
  }

  public static verifyActionPermission(
    subsystem: 'BILLING_SYSTEM' | 'DISPATCH_CORE' | 'REALTIME_OVERLAYS' | 'PROMOTIONS_ENGINE' | 'ROUTING_AI',
    agentType?: KernelAgentType
  ): boolean {
    // If the system is globally frozen, abort immediately
    if (this.controlPlane.writeBypassActive || this.controlPlane.globalSystemMode === SystemState.SAFE_MODE_FREEZE) {
      return false;
    }

    const sw = this.controlPlane.activeSwitches[subsystem];
    if (sw && sw.muted) {
      logger.error({ subsystem, agentType }, 'SAFETY_BLOCKED_ACTION: Attempted call to muted subsystem rejected.');
      return false;
    }

    return true;
  }

  public static restoreControlPlane() {
    this.controlPlane.globalSystemMode = SystemState.NOMINAL;
    this.controlPlane.writeBypassActive = false;
    this.controlPlane.readOnlyFallbacksEnabled = false;
    this.controlPlane.safetyConfidenceScore = 100.0;
    
    Object.values(this.controlPlane.activeSwitches).forEach(sw => {
      sw.muted = false;
      sw.triggerSource = 'MANUAL_OVERRIDE';
    });
  }
}
