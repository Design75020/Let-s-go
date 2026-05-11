/**
 * LetsGoFood Event Replay Engine
 * Allows reconstructing system states or debugging production by re-playing the Event Store.
 */
import { AuditLog } from '../models';
import { SocketManager } from '../socket';

class ReplayService {
  private static instance: ReplayService;

  private constructor() {}

  public static getInstance(): ReplayService {
    if (!ReplayService.instance) {
      ReplayService.instance = new ReplayService();
    }
    return ReplayService.instance;
  }

  /**
   * Replay events for a specific correlation ID
   */
  async replayCorrelation(correlationId: string): Promise<any[]> {
    const events = await AuditLog.find({ 'details.correlationId': correlationId }).sort({ timestamp: 1 });
    console.log(`[REPLAY] Replaying ${events.length} events for CID: ${correlationId}`);
    return events;
  }

  /**
   * Replay system-wide events for a timeframe
   */
  async replayRange(start: Date, end: Date): Promise<number> {
    const events = await AuditLog.find({
      timestamp: { $gte: start, $lte: end }
    }).sort({ timestamp: 1 });

    for (const event of events) {
      // Simulate re-broadcasting to SaaS Control Tower for visualization
      SocketManager.getInstance().broadcast('EVENT_REPLAY', {
        ...event.toObject(),
        isReplay: true
      });
    }

    return events.length;
  }
}

export const Replay = ReplayService.getInstance();
