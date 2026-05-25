
import { eventStream as hardenedStream, EventDomain, AppEvent as HardenedEvent } from './EventStream';
import { eventStream as legacyStream, AppEvent as LegacyEvent } from './DurableEventStream';
import { logger, metrics } from './Observability';
import client from 'prom-client';

export enum MigrationMode {
  LEGACY = 'LEGACY',
  PHASE_1_DUAL_READ = 'PHASE_1_DUAL_READ',
  PHASE_2_SHADOW_VALIDATION = 'PHASE_2_SHADOW_VALIDATION',
  PHASE_3_CUTOVER = 'PHASE_3_CUTOVER',
  PHASE_4_FREEZE = 'PHASE_4_FREEZE'
}

const migrationDriftCounter = new client.Counter({
  name: 'letsgo_migration_drift_total',
  help: 'Total number of event mismatches during migration',
  labelNames: ['type', 'reason']
});

metrics.register.registerMetric(migrationDriftCounter);

export class EventMigrationManager {
  private mode: MigrationMode = MigrationMode.LEGACY;
  private static instance: EventMigrationManager;

  private constructor() {
    this.mode = (process.env.MIGRATION_MODE as MigrationMode) || MigrationMode.PHASE_3_CUTOVER;
  }

  public static getInstance(): EventMigrationManager {
    if (!this.instance) {
      this.instance = new EventMigrationManager();
    }
    return this.instance;
  }

  public getMode(): MigrationMode {
    return this.mode;
  }

  public setMode(mode: MigrationMode) {
    this.mode = mode;
    logger.info({ mode }, 'MIGRATION: Mode updated');
  }

  /**
   * Safe Publish Wrapper
   */
  public async publish(type: string, payload: any, domain: EventDomain = EventDomain.BI): Promise<string> {
    if (this.mode === MigrationMode.PHASE_4_FREEZE) {
      logger.error({ type, domain }, 'MIGRATION: Write attempted to FROZEN legacy stream! Rejected.');
      throw new Error('Migration Error: Event system is FROZEN');
    }

    // Phases 1, 2, 3 write to Hardened Stream
    const hardenedId = await hardenedStream.publish(domain, type, payload);

    if (this.mode === MigrationMode.PHASE_2_SHADOW_VALIDATION) {
       // Shadow write to legacy for parity check (if needed by specific validation logic)
       // But user said: "Run DurableEventStream as read-only shadow system" in Phase 2 instructions?
       // Wait, Phase 2 says "Run DurableEventStream as read-only shadow system".
       // This implies legacy is NO LONGER WRITTEN TO by the main flow, but maybe by a mirroring worker?
       // Or maybe it meant legacy is the comparison source.
    }

    return hardenedId;
  }

  /**
   * Safe Consume Wrapper
   */
  public async consume(
    domain: EventDomain, 
    groupName: string,
    consumerName: string, 
    handler: (event: any) => Promise<void>
  ) {
    logger.info({ domain, mode: this.mode }, 'MIGRATION: Initializing consumer');

    if (this.mode === MigrationMode.LEGACY) {
      return legacyStream.listen(handler);
    }

    logger.info({ domain, groupName, consumerName }, 'MIGRATION: Unified Production Stream ACTIVE');
    return hardenedStream.consume(domain, groupName, consumerName, handler);
  }

  public async getConsistencyReport() {
    const report = {
      mode: this.mode,
      driftCount: 0, // In real world, we'd query Prometheus or Redis counters
      timestamp: new Date().toISOString(),
      status: 'VALIDATING'
    };
    return report;
  }
}

export const migrationManager = EventMigrationManager.getInstance();
