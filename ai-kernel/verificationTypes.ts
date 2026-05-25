/**
 * LetsGoFood V15 Hardened OS Kernel - Verification & Consistency Types
 * Defines formal data contracts for the hybrid clocks, property invariants, 
 * logical dependency traces, ledger stability proofs, and emergency controllers.
 */

import { KernelAgentType, OrderState, SystemState } from './types';

// ==========================================
// 1. HYBRID LOGICAL CLOCK & CAUSALITY
// ==========================================
export interface HybridClockState {
  logicalTime: number; // Lamport high-water mark sequence
  physicalTime: number; // Clock-adjusted milliseconds epoch
  counter: number; // Sub-millisecond tick disambiguation
}

export interface CausalEventNode {
  eventId: string;
  correlationId: string;
  clock: HybridClockState;
  vectorClock: Record<string, number>; // Comprehensive agent vector tracker
  dependencies: string[]; // Event ID list of direct causal precursors
}

// ==========================================
// 2. FORMAL INVARIANT VERIFICATION
// ==========================================
export interface VerificationResult {
  passed: boolean;
  violationCode?: string;
  errorMessage?: string;
  remedyActionCode?: string;
  cryptographicSignature?: string;
}

export interface InvariantDefinition {
  id: string;
  name: string;
  description: string;
  category: 'FINANCIAL_EQUITY' | 'LIFECYCLE_SEQUENCE' | 'DISPATCH_UNIQUENESS' | 'SECURITY_ISOLATION';
  assertion: (snapshot: any) => VerificationResult;
}

export interface ProofCertificate {
  certificateId: string;
  timestamp: string;
  rootEventId: string;
  verifiedInvariants: string[];
  ledgerSumCents: number;
  integritySignature: string; // Chained cryptographic fingerprint (proof of zero drift)
}

// ==========================================
// 3. DISTRIBUTED FAILURE RECONSTRUCTION & TIME-TRAVEL
// ==========================================
export interface PivotStateCheckpoint {
  checkpointId: string;
  targetClock: HybridClockState;
  matchingPhysicalTime: string;
  activeOrders: Record<string, OrderState>;
  ledgerParityCents: number;
  causalGraphSnapshotHash: string;
}

export interface StateDivergenceReport {
  isDivergent: boolean;
  reconstructedEventCount: number;
  unresolvedSequenceBreaches: number;
  divergedEntityId?: string;
  expectedState?: any;
  actualReplayedState?: any;
  driftValueCents: number;
}

// ==========================================
// 4. FINANCIAL LEDGER INTEGRITY
// ==========================================
export interface LedgerProofCertificate {
  transactionId: string;
  grossSubtotalCents: number;
  grossTaxAndFeesCents: number;
  cumulativeRefundCents: number;
  reconciliationAuditMatched: boolean;
  doubleSpendCheckCode: string; // Hash verification of idempotence Key
}

// ==========================================
// 5. GLOBAL CONTROL PLANE & KILL-SWITCHES
// ==========================================
export interface KillSwitchStatus {
  subsystemKey: 'BILLING_SYSTEM' | 'DISPATCH_CORE' | 'REALTIME_OVERLAYS' | 'PROMOTIONS_ENGINE' | 'ROUTING_AI';
  muted: boolean;
  triggerSource: 'MANUAL_OVERRIDE' | 'AUTOMATED_SLO_BURST' | 'ADVERSARIAL_ATTACK_DETECTED';
  restrictedAgentType?: KernelAgentType;
  lastToggledAt: string;
}

export interface EmergencyControlPlane {
  globalSystemMode: SystemState;
  writeBypassActive: boolean;
  readOnlyFallbacksEnabled: boolean;
  safetyConfidenceScore: number; // Percentage scale 0.0 - 100.0 from SRE heuristic engine
  activeSwitches: Record<string, KillSwitchStatus>;
}

// ==========================================
// 6. ADVERSARIAL FAILURE SCENARIOS
// ==========================================
export type AdversarialScenarioType = 
  | 'RETRY_STORM_FLOOD'
  | 'GPS_SPOOF_SATELLITE'
  | 'PAYMENT_ID_HIJACK'
  | 'REDIS_SATURATION_FAIL'
  | 'NETWORK_PARTITION_DRIFT';

export interface AdversarialDiagnosticData {
  injectedScenario: AdversarialScenarioType;
  throughputRps: number;
  droppedPacketsRatio: number;
  abortedFraudTransactionsCount: number;
  unresolvedIdempotencyCollisions: number;
  reconstructionParityResult: boolean;
}
