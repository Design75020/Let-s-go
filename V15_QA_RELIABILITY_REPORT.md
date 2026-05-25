
# LetsGoFood V15 Stable: QA & Reliability Validation System

This document outlines the full QA, stress-testing, and reliability architecture for the LetsGoFood V15 platform.

## 1. QA Architecture

The testing system is organized into a tiered hierarchy to ensure both component reliability and system-wide integrity.

```text
/tests
  ├── unit/           # Business logic & individual service validation (Vitest)
  ├── integration/    # Multi-component flows (Express -> Redis -> Workers)
  ├── e2e/            # Real-world production scenarios (Supertest + Socket.io)
  ├── load/           # Performance & scalability benchmarks (k6)
  ├── chaos/          # Fault tolerance & resilience validation
  └── fixtures/       # Reusable test data & mock states
```

## 2. Testing Tools

- **Runner**: [Vitest](https://vitest.dev/) (Vite-native, fast, modern)
- **API Testing**: [Supertest](https://github.com/ladjs/supertest)
- **Load Testing**: [k6](https://k6.io/) (Go-based, scriptable in JS)
- **Mocking**: Mock Service Worker (MSW) or native Vitest mocks
- **CI/CD**: GitHub Actions integration

## 3. Performance Benchmarks (SLA/SLO)

| Metric | Target (p95) | Target (p99) | Critical Threshold |
| :--- | :--- | :--- | :--- |
| **API Latency** | < 300ms | < 800ms | > 2000ms (Circuit OPENS) |
| **Event Processing** | < 1.5s | < 3s | > 10s (Auto-Scaling Alert) |
| **Worker Lag** | < 500ms | < 1s | > 5s (Lag Spike Alert) |
| **WS Sync Delay** | < 100ms | < 250ms | > 1s (Stale Data Alert) |
| **Error Rate** | < 0.1% | < 0.5% | > 1% (Rollback Trigger) |

## 4. Testing Scenarios

### Unit Testing
- **OrderService**: Validate state transitions and event emission.
- **EconomyEngine**: Verify surge pricing multipliers under variable load.
- **CircuitBreaker**: Test transition from CLOSED -> OPEN when failure rate hits 50%.

### Integration Testing
- **Stream Integrity**: Validate that events published by the API are correctly formatted and received by the specific domain consumer.
- **Idempotency**: Ensure that re-publishing the same correlation ID results in zero side effects.
- **DLQ Recovery**: Manually move failed events to DLQ and verify re-processing capability.

### Chaos Scenarios
- **Worker Crash**: SIGKILL a worker process and verify a new one resumes from the last known Redis message ID.
- **Redis Partition**: Simulate network lag between Node.js and Redis and verify the system shifts to "Safe Mode" (local caching).
- **Latency Injection**: Artificially delay external provider responses to verify circuit half-open behavior.

## 5. Automated Reliability Pipeline

The CI/CD pipeline in `.github/workflows/main.yml` has been updated:
1. **Linting**: Static code analysis.
2. **Unit Tests**: Full suite execution.
3. **Integration Tests**: Verify component communication.
4. **Load Smoke**: Run `stress_test.js` with a small VU count to detect p95 degradations early.
5. **Security Audit**: Scan for credential leaks and vulnerable packages.

## 6. Execution Guide

```bash
# Run all vitest suites
npm run test

# Run with coverage report
npm run test:coverage

# Run k6 load test (requires k6 binary)
k6 run tests/load/stress_test.js
```
