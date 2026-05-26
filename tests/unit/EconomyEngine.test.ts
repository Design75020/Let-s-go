import { describe, it, expect, beforeEach, vi } from "vitest";
import { EconomyEngine } from "../../server/services/bi/EconomyEngine";

// Mock Prisma to avoid DB dependency in unit tests
vi.mock("../../server/lib/prisma", () => ({
  prisma: {
    order: { count: vi.fn().mockResolvedValue(0) },
    user: { count: vi.fn().mockResolvedValue(0) },
  },
}));

// Mock Observability to avoid metrics registration issues
vi.mock("../../server/services/infrastructure/Observability", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    metrics: {
      register: {
        registerMetric: vi.fn(),
        getSingleMetric: vi.fn().mockReturnValue(undefined),
      },
    },
    logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() },
  };
});

// Mock EventMigration to avoid side effects
vi.mock("../../server/services/infrastructure/EventMigration", () => ({
  migrationManager: { publish: vi.fn().mockResolvedValue(undefined) },
}));

describe("EconomyEngine Unit Tests", () => {
  let engine: any;

  beforeEach(() => {
    vi.useFakeTimers();
    engine = new EconomyEngine();
  });

  it("should initialize with default state", () => {
    const snapshot = engine.getSnapshot();
    // Initial state: activeDrivers uses fallback of 10 when DB returns 0 (see EconomyEngine.ts)
    expect(snapshot.activeDrivers).toBe(10);
    expect(snapshot.surgeMultiplier).toBe(1.0);
  });

  it("should calculate surge correctly based on ratio", () => {
    const testCases = [
      { drivers: 20, orders: 5, expectedSurge: 1.0 },
      { drivers: 10, orders: 9, expectedSurge: 1.2 },
      { drivers: 10, orders: 13, expectedSurge: 1.5 },
      { drivers: 5, orders: 11, expectedSurge: 2.0 },
    ];
    testCases.forEach(({ drivers, orders, expectedSurge }) => {
      engine.state.activeDrivers = drivers;
      engine.state.pendingOrders = orders;
      engine.calculateSurge();
      expect(engine.state.surgeMultiplier).toBe(expectedSurge);
    });
  });

  it("should cap market heat at 1.0", () => {
    engine.state.activeDrivers = 1;
    engine.state.pendingOrders = 100;
    engine.calculateSurge();
    expect(engine.state.marketHeat).toBe(1.0);
  });
});
