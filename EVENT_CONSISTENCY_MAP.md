# LetsGoFood V15: Event Consistency Map (FINALIZED)

Mapping of legacy streams to hardened production domains. All traffic is now consolidated in the Target Domains.

| Legacy Stream (`DurableEventStream`) | Target Domain (`EventStream`) | Event Types | Security | Status |
|--------------------------------------|-------------------------------|-------------|----------|--------|
| `letsgo:bi:events` (DEPRECATED)      | `BI`                          | `economy.snapshot`, `bi.prediction.snapshot`, `price.adjusted` | HMAC Signed | ACTIVE |
| `letsgo:bi:events` (DEPRECATED)      | `ANOMALY`                     | `anomaly.detected` | HMAC Signed | ACTIVE |
| `letsgo:bi:events` (DEPRECATED)      | `COST`                        | `ai.usage.tracked` | HMAC Signed | ACTIVE |

## Validation Logic
Each event is validated against:
1. **Schema Integrity**: Zod/Interface validation.
2. **Identity Integrity**: HMAC signature check using `EVENT_SIGNING_SECRET`.
3. **Relational Integrity**: Cross-stream correlation IDs.

## Idempotency
- **Contexts**: `economy-worker`, `anomaly-worker`, `cost-worker`.
- **TTL**: 24 Hours in Redis.
