/**
 * LetsGoFood V15 AI Kernel Type System
 * Authorities, immutable types, structures, and schemas.
 */

export enum SystemState {
  INITIALIZING = 'INITIALIZING',
  NOMINAL = 'NOMINAL',
  DEGRADED_COOLDOWN = 'DEGRADED_COOLDOWN',
  SAFE_MODE_FREEZE = 'SAFE_MODE_FREEZE',
  EMERGENCY_CORRECTION = 'EMERGENCY_CORRECTION'
}

export enum KernelAgentType {
  DISPATCH_AGENT = 'DISPATCH_AGENT',
  PAYMENTS_AGENT = 'PAYMENTS_AGENT',
  INFRASTRUCTURE_AGENT = 'INFRASTRUCTURE_AGENT',
  SECURITY_AGENT = 'SECURITY_AGENT',
  SRE_AGENT = 'SRE_AGENT',
  REALTIME_AGENT = 'REALTIME_AGENT',
  ANALYTICS_AGENT = 'ANALYTICS_AGENT'
}

export interface OperationalLimits {
  memoryAllocationMb: number;
  cpuSharesPercent: number;
  maxExecutionTimeMs: number;
  permittedDirectories: string[];
  forbiddenTables: string[];
}

export interface AgentSandboxProfile {
  id: KernelAgentType;
  name: string;
  securityDomain: 'SYSTEM_RING_0' | 'TRANSACTION_RING_1' | 'APPLICATION_RING_2';
  limits: OperationalLimits;
  allowedEvents: string[];
  autoRollbackAuthority: boolean;
}

export interface KernelEvent {
  eventId: string;
  correlationId: string;
  timestamp: string;
  actor: KernelAgentType | 'SYSTEM' | 'CUSTOMER' | 'RESTAURANT' | 'DRIVER';
  eventType: string;
  payload: Record<string, any>;
  cryptoDigest: string; // Append-only block proof chaining
}

export interface OrderState {
  orderId: string;
  status: 'CREATED' | 'ACCEPTED' | 'PREPARING' | 'READY' | 'PICKED_UP' | 'DELIVERED' | 'CANCELLED';
  restaurantId: string;
  driverId?: string;
  subtotalCents: number;
  deliveryFeeCents: number;
  refundedCents: number;
  updatedAt: string;
}

export interface DriverState {
  driverId: string;
  online: boolean;
  activeOrderId?: string;
  latitude: number;
  longitude: number;
}

export interface KernelSnapshot {
  snapshotId: string;
  globalState: SystemState;
  timestamp: string;
  orders: Record<string, OrderState>;
  drivers: Record<string, DriverState>;
  ledgerParityCents: number;
  priorCryptographicHash: string;
}

export interface SloBudget {
  subsystem: string;
  p95LatencyLimitMs: number;
  p99LatencyLimitMs: number;
  errorRateThreshold: number; // e.g. 0.01 for 1%
  remainingErrorBudget: number; // e.g. percentage 100.0
  activeMutedFeatures: string[];
}

export interface PolicyRule {
  policyId: string;
  invariantName: string;
  assertion: (state: any, proposal: any) => { passed: boolean; errorText?: string };
  actionOnViolation: 'ABORT_TRANSACTION' | 'DEGRADE_MODE' | 'ALERT_SRE';
}
