
import { logger } from './Observability';
import { Security } from './Security';

export class AuditLog {
  public static logAction(userId: string, action: string, detail: any) {
    const redactedDetail = Security.redactPII(detail);
    
    logger.info({
      audit: true,
      userId,
      action,
      detail: redactedDetail,
      timestamp: new Date()
    }, `AUDIT: User ${userId} performed ${action}`);
  }

  public static logSecurityEvent(userId: string | null, event: string, detail: any) {
    logger.warn({
      security: true,
      userId,
      event,
      detail,
      timestamp: new Date()
    }, `SECURITY EVENT: ${event}`);
  }
}
