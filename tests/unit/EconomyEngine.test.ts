
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { EconomyEngine } from '../../server/services/bi/EconomyEngine';

describe('EconomyEngine Unit Tests', () => {
  let engine: any; // Use any to access private members for testing if needed

  beforeEach(() => {
    // We create a fresh instance for testing rather than using the singleton
    engine = new EconomyEngine();
    // Stop the interval to prevent background interference
    // Note: Since constructor starts interval, we might want to kill it or use fake timers
    vi.useFakeTimers();
  });

  it('should initialize with default state', () => {
    const snapshot = engine.getSnapshot();
    expect(snapshot.activeDrivers).toBe(0);
    expect(snapshot.surgeMultiplier).toBe(1.0);
  });

  it('should calculate surge correctly based on ratio', () => {
    // Access private calculateSurge via casting
    const testCases = [
      { drivers: 20, orders: 5, expectedSurge: 1.0 },
      { drivers: 10, orders: 9, expectedSurge: 1.2 }, // ratio 0.9
      { drivers: 10, orders: 13, expectedSurge: 1.5 }, // ratio 1.3
      { drivers: 5, orders: 11, expectedSurge: 2.0 },  // ratio 2.2
    ];

    testCases.forEach(({ drivers, orders, expectedSurge }) => {
      engine.state.activeDrivers = drivers;
      engine.state.pendingOrders = orders;
      engine.calculateSurge();
      expect(engine.state.surgeMultiplier).toBe(expectedSurge);
    });
  });

  it('should cap market heat at 1.0', () => {
    engine.state.activeDrivers = 1;
    engine.state.pendingOrders = 100; // ratio 100
    engine.calculateSurge();
    expect(engine.state.marketHeat).toBe(1.0);
  });
});
