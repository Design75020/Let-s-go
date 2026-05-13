
export type ResilienceState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

export class CircuitBreaker {
  private state: ResilienceState = 'CLOSED';
  private failureThreshold = 5;
  private failureCount = 0;
  private resetTimeout = 30000;
  private lastFailureTime?: number;

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      if (Date.now() - (this.lastFailureTime || 0) > this.resetTimeout) {
        this.state = 'HALF_OPEN';
      } else {
        throw new Error("Circuit Breaker is OPEN");
      }
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess() {
    this.failureCount = 0;
    this.state = 'CLOSED';
  }

  private onFailure() {
    this.failureCount++;
    this.lastFailureTime = Date.now();
    if (this.failureCount >= this.failureThreshold) {
      this.state = 'OPEN';
      console.error("[RESILIENCE] Circuit Breaker switched to OPEN state");
    }
  }
}

export class RetryPolicy {
  constructor(
    private maxRetries: number = 3,
    private initialDelayMs: number = 1000,
    private multiplier: number = 2
  ) {}

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    let lastError: any;
    for (let i = 0; i < this.maxRetries; i++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;
        const delay = this.initialDelayMs * Math.pow(this.multiplier, i);
        console.warn(`[RETRY] Attempt ${i + 1} failed. Retrying in ${delay}ms...`);
        await new Promise(res => setTimeout(res, delay));
      }
    }
    throw lastError;
  }
}

export const backoff = async (retryCount: number) => {
  const delay = Math.min(Math.pow(2, retryCount) * 1000, 30000);
  return new Promise(res => setTimeout(res, delay));
};
