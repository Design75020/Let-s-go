/**
 * LetsGoFood Chaos Engineering Engine
 * Automates Fault Injection to validate system resilience.
 */
import { K8s } from './orchestrator';
import { Geo } from './region';
import { SocketManager } from '../socket';

class ChaosEngine {
  private static instance: ChaosEngine;
  private isRunning: boolean = false;

  private constructor() {}

  public static getInstance(): ChaosEngine {
    if (!ChaosEngine.instance) {
      ChaosEngine.instance = new ChaosEngine();
    }
    return ChaosEngine.instance;
  }

  public startChaosExperiment() {
    if (this.isRunning) return;
    this.isRunning = true;
    console.log('[CHAOS] Experiment Started: "The Great Disruption"');
    
    // Inject random failures
    const interval = setInterval(() => {
      if (!this.isRunning) {
        clearInterval(interval);
        return;
      }

      const die = Math.random();
      if (die < 0.2) {
        // Kill a random pod
        const pods = K8s.getClusterStatus();
        if (pods.length > 0) {
          K8s.crashPod(pods[0].id);
        }
      } else if (die < 0.3) {
        // Trigger regional failover
        Geo.simulateFailover();
        SocketManager.getInstance().broadcast('CHAOS_FAILOVER', { timestamp: new Date() });
      }
    }, 10000);
  }

  public stopChaos() {
    this.isRunning = false;
    Geo.recoverRegions();
    console.log('[CHAOS] Experiment Stopped. Regions recovered.');
  }
}

export const Chaos = ChaosEngine.getInstance();
