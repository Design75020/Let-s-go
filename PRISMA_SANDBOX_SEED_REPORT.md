# LetsGoFood V15: Prisma Sandbox Seed Report

**Date**: 2026.05.18
**Status**: SUCCESS

## 1. Seeded Entities

| Entity | Count | Details |
|--------|-------|---------|
| **Users** | 8 | 5 Drivers (Marco, Sophie, Ahmed, Lucia, Jean), 2 Customers, 1 Admin. |
| **Restaurants**| 5 | Burger House, Sushi Zen, Pasta Viva, Le Bistro, Pizza Flash. |
| **Orders** | 20 | Mixed states (PENDING/COMPLETED) across random clients. |
| **Regions** | 5 | Paris Centre, Paris 15, Lyon, Marseille. |

## 2. Relational Consistency
- **FK Integrity**: All orders correctly reference a `UserId` and `RestaurantId` present in the database.
- **Dispatch Simulation**: Drivers are identified via `name: { contains: 'Driver' }`, allowing the `EconomyEngine` to count real supply.

## 3. Data Volatility
- **Database**: `prisma/dev.db` (SQLite used for sandbox unification).
- **Persistence**: Data survives server crashes and restarts.

## 4. Conclusion
The sandbox is now populated with a high-fidelity dataset that mirrors real-world marketplace complexity.
