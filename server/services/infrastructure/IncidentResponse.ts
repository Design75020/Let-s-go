
import { logger, HealthMonitor } from './Observability';
import { eventBus, BIEvents } from '../bi/EventBus';

export enum IncidentSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export class IncidentResponse {
  private static safeMode = false;
  private static recentIncidents: any[] = [];

  public static reportSecurityIncident(severity: IncidentSeverity, detail: any) {
    const incident = {
      timestamp: new Date(),
      severity,
      ...detail
    };

    this.recentIncidents.push(incident);
    logger.fatal(incident, 'SECURITY INCIDENT DETECTED');

    if (severity === IncidentSeverity.CRITICAL) {
      this.activateSafeMode();
    }

    if (this.recentIncidents.length > 100) this.recentIncidents.shift();
  }

  private static activateSafeMode() {
    this.safeMode = true;
    HealthMonitor.reportMetric('errorRate', 1.0); // Drop health score
    logger.warn('EMERGENCY: SAFE MODE ACTIVATED. Non-essential operations suspended.');
    
    // Broadcast to UI
    eventBus.emit(BIEvents.AI_THROTTLED, { reason: 'SECURITY_SAFE_MODE', detail: 'System in lockdown' });
  }

  public static isSafeMode(): boolean {
    return this.safeMode;
  }

  public static deactivateSafeMode() {
    this.safeMode = false;
    logger.info('SAFE MODE DEACTIVATED. System restored.');
  }

  public static getIncidentHistory() {
    return this.recentIncidents;
  }
}
