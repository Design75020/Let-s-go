
export type FailureType = 'LATENCY' | 'CRASH' | 'TIMEOUT' | 'AUTH_ERROR' | 'LLM_TIMEOUT' | 'DB_LATENCY';

export class JulesChaosMonkey {
  private active = false;

  enable() { this.active = true; console.log("[CHAOS] Monkey enabled."); }
  disable() { this.active = false; console.log("[CHAOS] Monkey disabled."); }

  async injectFailure(type: FailureType) {
    if (!this.active) return;

    console.warn(`[CHAOS] [INJECT] Failure type: ${type}`);

    switch (type) {
      case 'LATENCY':
      case 'DB_LATENCY':
        await new Promise(res => setTimeout(res, 5000));
        break;
      case 'LLM_TIMEOUT':
        throw new Error("LLM Provider Timeout (Chaos Simulation)");
      case 'TIMEOUT':
        throw new Error("Simulated Pipeline Timeout");
      case 'AUTH_ERROR':
        throw new Error("Simulated RBAC Access Denied");
      case 'CRASH':
        process.exit(1);
    }
  }

  shouldFail(probability: number): boolean {
    return this.active && Math.random() < probability;
  }
}

export const chaosMonkey = new JulesChaosMonkey();
