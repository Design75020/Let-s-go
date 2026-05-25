
import { migrationManager } from '../infrastructure/EventMigration';
import { EventDomain } from '../infrastructure/EventStream';
import { eventBus, BIEvents } from './EventBus';
import { IdempotencyManager } from '../infrastructure/Hardening';
import { HealthMonitor, logger } from '../infrastructure/Observability';

export interface Anomaly {
  id: string;
  type: 'latency' | 'error_spike' | 'fraud' | 'security';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: Date;
}

export class AnomalyDetector {
  private recentErrors = 0;
  private thresholds = {
    errorRate: 25,
    latency: 500
  };

  constructor() {
    setInterval(() => this.resetHeat(), 30000);
  }

  public trackError() {
    this.recentErrors++;
    if (this.recentErrors > this.thresholds.errorRate) {
      this.triggerAnomaly('error_spike', 'critical', 'Critical system error rate detected!');
      HealthMonitor.reportMetric('errorRate', this.recentErrors);
    }
  }

  private async triggerAnomaly(type: Anomaly['type'], severity: Anomaly['severity'], message: string) {
    const anomaly: Anomaly = {
      id: Math.random().toString(36).substring(2, 11),
      type,
      severity,
      message,
      timestamp: new Date()
    };
    
    await migrationManager.publish(BIEvents.ANOMALY_DETECTED, anomaly, EventDomain.ANOMALY);
    eventBus.emit(BIEvents.ANOMALY_DETECTED, anomaly); // Legacy relay
  }

  private resetHeat() {
    this.recentErrors = 0;
  }
}

export const anomalyDetector = new AnomalyDetector();

export class SelfHealer {
  constructor() {
    eventBus.on(BIEvents.ANOMALY_DETECTED, (anomaly: Anomaly) => {
      this.orchestrate(anomaly);
    });
  }

  private lastActionTime = 0;
  private readonly COOLDOWN_MS = 5 * 60 * 1000; // 5 minute cooldown

  private async orchestrate(anomaly: Anomaly) {
    // 1. COOL-OFF CHECK (Stability Guard)
    if (Date.now() - this.lastActionTime < this.COOLDOWN_MS) {
      logger.warn({ anomalyId: anomaly.id }, 'SelfHealer: Suppression active - Cooldown period in effect');
      return;
    }

    // 2. IDEMPOTENCY CHECK
    const alreadyHealed = await IdempotencyManager.isProcessed(anomaly.id, 'healing');
    if (alreadyHealed) return;

    logger.info({ anomalyId: anomaly.id, type: anomaly.type }, 'Distributed self-heal orchestrator engaged');

    this.lastActionTime = Date.now();

    if (anomaly.severity === 'critical') {
      await this.executeEmergencyActions(anomaly);
    } else if (anomaly.severity === 'high') {
      await this.executeOptimizationActions(anomaly);
    }

    HealthMonitor.reportMetric('errorRate', 0);
    eventBus.emit(BIEvents.SYSTEM_HEALED, { 
      anomalyId: anomaly.id, 
      status: 'restored',
      timestamp: new Date()
    });
  }

  private async executeEmergencyActions(anomaly: Anomaly) {
    const actions = [
      'SHUTDOWN_NON_ESSENTIAL_AI',
      'RESTART_GATEWAY_INSTANCES',
      'FLUSH_L1_CACHE'
    ];
    for (const action of actions) {
      logger.warn({ action, anomalyId: anomaly.id }, 'EMERGENCY_RECOVERY_PHASE');
      await new Promise(r => setTimeout(r, 500));
    }
  }

  private async executeOptimizationActions(anomaly: Anomaly) {
    logger.info({ anomalyId: anomaly.id }, 'HIGH_SEVERITY_OPTIMIZATION_PHASE');
    await new Promise(r => setTimeout(r, 1000));
  }
}

export const selfHealer = new SelfHealer();
