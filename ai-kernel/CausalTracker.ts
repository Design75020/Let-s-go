/**
 * LetsGoFood V15 OS Kernel - Global Causal Consistency Engine
 * Implements causal dependency tracing, Hybrid Logical Clocks (HLC),
 * vector clocks for concurrent agent verification, and sequence gap detection.
 */

import { HybridClockState, CausalEventNode } from './verificationTypes';
import { KernelAgentType } from './types';
import { logger } from '../server/services/infrastructure/Observability';

export class CausalConsistencyEngine {
  private static hlc: HybridClockState = {
    logicalTime: 0,
    physicalTime: Date.now(),
    counter: 0
  };

  private static globalVectorClock: Record<string, number> = {
    [KernelAgentType.DISPATCH_AGENT]: 0,
    [KernelAgentType.PAYMENTS_AGENT]: 0,
    [KernelAgentType.INFRASTRUCTURE_AGENT]: 0,
    [KernelAgentType.SECURITY_AGENT]: 0,
    [KernelAgentType.SRE_AGENT]: 0,
    [KernelAgentType.REALTIME_AGENT]: 0,
    [KernelAgentType.ANALYTICS_AGENT]: 0,
    'CUSTOMER': 0,
    'DRIVER': 0,
    'SYSTEM': 0
  };

  private static causalGraph: Map<string, CausalEventNode> = new Map();

  /**
   * Thread-safe updates to the Hybrid Logical Clock following distributed receive rules.
   */
  public static tickSend(actorString: string): HybridClockState {
    const systemNow = Date.now();
    
    // Core HLC progression algorithm
    if (systemNow > this.hlc.physicalTime) {
      this.hlc.physicalTime = systemNow;
      this.hlc.counter = 0;
    } else {
      this.hlc.counter++;
    }
    this.hlc.logicalTime++;

    // Increment agent instance sequence sequence sequence
    if (this.globalVectorClock[actorString] !== undefined) {
      this.globalVectorClock[actorString]++;
    }

    return { ...this.hlc };
  }

  /**
   * Absorb external HLC values to perform clock-synchronization convergence.
   */
  public static tickReceive(incomingClock: HybridClockState, actorString: string): HybridClockState {
    const systemNow = Date.now();
    const maxPhysical = Math.max(systemNow, this.hlc.physicalTime, incomingClock.physicalTime);

    if (maxPhysical === this.hlc.physicalTime && maxPhysical === incomingClock.physicalTime) {
      this.hlc.counter = Math.max(this.hlc.counter, incomingClock.counter) + 1;
    } else if (maxPhysical === this.hlc.physicalTime) {
      this.hlc.counter++;
    } else if (maxPhysical === incomingClock.physicalTime) {
      this.hlc.counter = incomingClock.counter + 1;
    } else {
      this.hlc.counter = 0;
    }

    this.hlc.physicalTime = maxPhysical;
    this.hlc.logicalTime = Math.max(this.hlc.logicalTime, incomingClock.logicalTime) + 1;

    if (this.globalVectorClock[actorString] !== undefined) {
      this.globalVectorClock[actorString]++;
    }

    return { ...this.hlc };
  }

  /**
   * Track event causation node structures.
   */
  public static registerEventInCausalityGraph(
    eventId: string,
    correlationId: string,
    actorString: string,
    dependencies: string[]
  ): CausalEventNode {
    const activeClock = this.tickSend(actorString);
    const node: CausalEventNode = {
      eventId,
      correlationId,
      clock: activeClock,
      vectorClock: { ...this.globalVectorClock },
      dependencies
    };

    this.causalGraph.set(eventId, node);
    logger.info({ eventId, logical: activeClock.logicalTime, dependenciesCount: dependencies.length }, 'CAUSAL_TRACE: Event registered with causal graph anchors.');
    return node;
  }

  /**
   * Audit sequence traces for out-of-order execution holes.
   */
  public static checkCausalAnomalies(eventId: string): { consistent: boolean; brokenPrecursorId?: string } {
    const node = this.causalGraph.get(eventId);
    if (!node) return { consistent: true };

    for (const depId of node.dependencies) {
      const parentNode = this.causalGraph.get(depId);
      if (!parentNode) {
        logger.error({ eventId, parentGapId: depId }, 'CAUSAL_ERROR: Undocumented causal predecessor identified!');
        return { consistent: false, brokenPrecursorId: depId };
      }

      // Check logical clocks progression sanity
      if (parentNode.clock.logicalTime >= node.clock.logicalTime) {
        logger.fatal({ parentId: depId, activeId: eventId }, 'CAUSAL_FATAL: Causal clock contradiction detected! Parent logical time is ahead or equivalent.');
        return { consistent: false, brokenPrecursorId: depId };
      }
    }

    return { consistent: true };
  }

  public static getCausalNode(id: string): CausalEventNode | undefined {
    return this.causalGraph.get(id);
  }

  public static getLogicalClock(): HybridClockState {
    return { ...this.hlc };
  }

  public static getVectorClockSnapshot(): Record<string, number> {
    return { ...this.globalVectorClock };
  }

  public static resetCausalGraph() {
    this.causalGraph.clear();
    this.hlc = { logicalTime: 0, physicalTime: Date.now(), counter: 0 };
    Object.keys(this.globalVectorClock).forEach(k => {
      this.globalVectorClock[k] = 0;
    });
  }
}
