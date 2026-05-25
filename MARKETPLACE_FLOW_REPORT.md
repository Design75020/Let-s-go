# LetsGoFood V15: Marketplace Flow Report

**Domain**: Supply, Demand, and Dispatch Logic

## 1. Dispatch Integrity
- **Lock Verification**: When a Driver clicks "Accepter", the `driverId` is immediately associated in the DB. Simultaneous clicks from multiple drivers are rejected by Firestore's first-writer-wins rule.
- **Visibility**: Orders are only visible to the driver fleet once the Merchant signals `status: 'ready'`. This prevents drivers from waiting at restaurants for non-prepared food.

## 2. Pricing & Liquidity
- **Surge Sensitivity**: The `EconomyEngine` correctly identifies when `pendingOrders / activeDrivers > 2.0`, triggering a 1.5x surge.
- **Heat Mapping**: Visual "Market Heat" in the SaaS dashboard correctly translates real order density into a 0.0-1.0 score.

## 3. Fulfillment Pipeline
- **Queue Load**: Merchant `OrderMonitor` successfully handles 10+ simultaneous orders without layout shift or UI freeze.
- **Prioritization**: Orders are sorted by `createdAt` (FIFO), ensuring "Oldest First" fulfillment.

## 4. Conclusion
Marketplace balance logic is deterministic and grounded in real persistence state.
