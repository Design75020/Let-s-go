# LetsGoFood V15: Persistence Fragmentation Report

**Date**: 2026.05.18
**Auditor**: Senior Staff+ Backend Architect

## 1. Fragmentation Points

| Entity / Domain | Source of Truth | Current Status | Issues |
|-----------------|-----------------|----------------|--------|
| **Restaurants** | Firebase (Frontend Seed) | DISCONNECTED | Backend cannot validate restaurant availability or menu items. |
| **Orders** | In-Memory (OrderService) | VOLATILE | Orders disappear on restart. No historical persistence. |
| **Business KPIs**| In-Memory (Monitor) | SYNTHETIC | GMV and conversion rates are based on static counters + session increments. |
| **Market Supply**| EconomyEngine Jitter | MOCKED | "Active Drivers" count is a random walk; doesn't reflect real user state. |
| **Market Demand**| EconomyEngine Jitter | MOCKED | "Pending Orders" doesn't match the actual rows in any database. |

## 2. Stale Simulation Paths
- **Economy Simulation**: Operates 100% in-memory with no database lookups.
- **Mock Service Layer**: `OrderService` returns hardcoded status `ACCEPTED` for any ID.

## 3. Risk Assessment
- **High Risk**: Pilot tests will result in 0% data durability.
- **Operational Drift**: Any anomaly detected by `AnomalyWorker` will be based on synthetic noise, not real traffic anomalies.
- **Decision Inconsistency**: `DecisionEngine` triggers surge pricing based on fake counters while real drivers might be idle.

## 4. Consolidation Goal
Unify all domains under **Prisma/PostgreSQL**. Deprecate Firebase for business logic. Ground all simulations in real row counts.
