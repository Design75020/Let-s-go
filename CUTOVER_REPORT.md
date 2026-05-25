# LetsGoFood V15: Zero-Downtime Event System Cutover Report

**Migration ID**: EVENT-CUTOVER-2026-V15
**Status**: IN_PROGRESS (Phase 1: Dual Read Mode)
**Author**: Staff Distributed Systems Engineer

## 1. Migration Goals
- Consolidate `DurableEventStream` (Legacy) into `EventStream` (Hardened).
- Enable HMAC signature verification for ALL business intelligence events.
- Mitigate data drift between simulation and production streams.

## 2. Infrastructure Changes
- **Target Stream**: `letsgo:stream:bi` (Hardened Domain)
- **Source Stream**: `letsgo:bi:events` (Durable/Unsigned)
- **Middleware**: `EventMigrationManager` proxy implemented for all BI engines.

## 3. Current Phase: Safe Observation
We are currently in **Phase 1 (DUAL_READ)**.
- **Writers**: Directed exclusively to the hardened `EventStream`.
- **Readers**: Listening to both `EventStream` and `DurableEventStream` to ensure zero message loss during transitional period.

## 4. Verification Checklist
- [x] All BI Publishers migrated to `MigrationManager`.
- [x] Workers updated to `MigrationManager.consume`.
- [x] Hardened Stream supports `BI` domain.
- [x] Parity checking logic enabled in Shadow Mode.

## 5. Next Steps
1. Transition to **PHASE 2 (SHADOW_VALIDATION)** once stable for 24 hours.
2. Monitor `letsgo_migration_drift_total` metrics.
3. Perform final cutover (PHASE 3) after 99.9% consistency validation.
