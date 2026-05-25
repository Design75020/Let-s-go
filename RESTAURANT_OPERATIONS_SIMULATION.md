# LetsGoFood V15: Restaurant Operations Simulation

**Role**: Kitchen Staff / Merchant Manager

## 1. Fulfillment Workflow
The Merchant App allows for a "Pressure-Tested" preparation flow:
1.  **New Order Notification**: Instant alert on the POS.
2.  **Preparation Start**: Merchant marks as "preparing", notifying the client.
3.  **Ready for Collection**: Merchant marks as "ready", triggering the dispatch broadcast to the driver network.

## 2. Menu Control
- Merchants can add/remove items in the `MenuManager`.
- Changes propagate to the Customer app instantly via the shared Firestore catalog.

## 3. Financial Visibility
- **Live Revenue Card**: Tracks earnings in real-time.
- **GMV Integration**: Aggregated data from Prisma provides an audit-safe historical record.

## 4. Verdict
The Merchant experience is robust and focused on throughput. It lacks "demo bloat" and focuses on active order management.
