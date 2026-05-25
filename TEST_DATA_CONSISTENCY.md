# LetsGoFood V15: Test Data Consistency Audit

**Scope**: Relational & Persistence Integrity

## 1. Database Fragmentations
Audit detected three parallel data layers that do not synchronize:

1.  **Firebase (Firestore)**: Used by `seedingService.ts` to store Restaurants, Users, and baseline Orders. Only accessible via Frontend or direct Firebase SDK.
2.  **Prisma (PostgreSQL)**: Schema defined but NO data seeded. Primary application models (Order, User) are empty in the SQL layer.
3.  **In-Memory (Mocks)**: `OrderService.ts` ignores both DBs and generates random IDs for orders. `BusinessMonitor.ts` starts with static numbers.

## 2. Inconsistent Entities
- **Users**: A "client_1" exists in Firestore, but the JWT login logic in `routes.ts` uses a different hardcoded email (`admin@letsgofood.fr`).
- **Orders**: Orders created via `/api/orders` never reach Firestore or PostgreSQL. They only exist until the Node process restarts.

## 3. Relationship Gaps
- **Orders <-> Restaurants**: No foreign key validation in `OrderService`. Any `restaurantId` string is accepted.
- **Dispatch Correctness**: Since the simulation uses a counter for "active drivers" but real driver entities exist in Firestore, "dispatching" an order to a specific driver like "Marco" is impossible in the current runtime state.

## 4. Conclusion
**CRITICAL**: The data layer is fragmented. Cross-system consistency is 0%.
