# LetsGoFood V15: Marketplace Simulation Gaps

**Audit Goal**: Detect disconnects between Simulation and Reality

## 1. Simulation vs. Persistence
| Feature | Simulation Behavior | Persistence State | Disconnect |
|---------|---------------------|-------------------|------------|
| **Demand** | Counter-based jitter | 3 Orders in Firestore | High |
| **Supply** | Counter-based jitter | 2 Drivers in Firestore | High |
| **Liquidity** | Ratio of counters | N/A | Total |
| **Pricing** | Surge based on ratio | Static in metadata | Moderate |

## 2. Broken Marketplace Flows
- **Driver Intake**: New drivers seeded in Firestore do not increment the `EconomyEngine` active driver count.
- **Restaurant Load**: All 4 restaurants share the same "Market Heat" global variable; granular per-restaurant load monitoring is missing.
- **Order Cancellation**: In-memory cancellation count increases, but no order status is updated in any database.

## 3. Missing Triggers
- **Regional Pockets**: Simulation assumes a single global zone. No support for geographic supply/demand pockets (e.g. "Paris Centre" vs "Paris Nord").
- **Traffic Spikes**: No time-of-day automation (Lunch/Dinner cycles). Jitter is purely random.

## 4. Recommendations
- Connect `BusinessMonitor` to a real DB listener.
- Synchronize `EconomyEngine` state with real Firestore/Prisma counts on startup.
