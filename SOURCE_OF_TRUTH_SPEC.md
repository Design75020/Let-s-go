# LetsGoFood V15: Source of Truth (SSoT) Specification

**Version**: 1.0.0-FINAL
**Authority**: Prisma / PostgreSQL

## 1. Domain Ownership Rules

| Model | Primary Storage | Responsibility |
|-------|-----------------|----------------|
| **Account (User)** | Prisma `User` | Authentication, Identity, Role |
| **Merchant** | Prisma `Restaurant` | Catalog, Location, Availability |
| **Order** | Prisma `Order` | Transaction integrity, Payment, Lifecycle |
| **Drivers** | Prisma `User` (Role) | Supply tracking, Dispatch |
| **Market State**| Prisma Aggregations | Persistence of heat, surge, and density metrics |

## 2. Unification Workflow

1.  **Frontend**: Reads from API (which reads from Prisma).
2.  **OrderService**: Writes to Prisma first, then emits event.
3.  **EconomyEngine**: Aggregates Prisma `Order` (status=PENDING) and `User` (role=DRIVER active=true) to compute surge.
4.  **BIMonitor**: Uses Prisma `SUM(total)` for GMV instead of internal counters.

## 3. Deprecation Plan
- **In-Memory Counters**: To be removed from `EconomyEngine` and `BusinessMonitor`.
- **Mock Persistence**: `OrderService` `order` object literal to be replaced by `prisma.order.create`.
- **Firebase Sync**: Optional. If Firebase is used for real-time mobile sync, it must be a *downstream* mirror of the PostgreSQL master state.

## 4. Constraint Enforcement
- No business logic should operate on data that doesn't exist in the SQL layer.
- All "Market Heat" calculations must use cached SQL results (indexed periodically) to avoid performance degradation.
