# LetsGoFood V15: Business KPI Specification

This document defines the core Business Key Performance Indicators (KPIs) required for measuring the operational success and marketplace efficiency of the LetsGoFood Platform.

## 1. Top-Line Growth & Revenue
| KPI | Definition | Source | Target |
|-----|------------|--------|--------|
| **GMV (Gross Merchandise Value)** | Total order value processed (inclusive of tax & fees) | `OrderService` / `ECONOMY` stream | > €50k / day |
| **Net Revenue** | Total platform fees + delivery fees collected | `CostWorker` aggregation | 12% of GMV |
| **AOV (Average Order Value)** | Total GMV / Total Successful Orders | `EconomyEngine` statistics | > €25.00 |

## 2. Fulfillment & Marketplace Efficiency
| KPI | Definition | Source | Target |
|-----|------------|--------|--------|
| **Order Success Rate** | (Completed Orders / Total Orders) * 100 | `EventStream` (ORDERS domain) | > 98.5% |
| **Avg Delivery Time** | Total delivery duration (from placement to dropoff) | `EconomyEngine` (avgDeliveryTime) | < 28 min |
| **Driver Utilization** | % of time active drivers spend on an active delivery | `EconomyEngine` state ratio | 75% - 85% |
| **Driver Density** | Number of active drivers per 1,000 pending orders | `EconomyState` (activeDrivers/pendingOrders) | > 15 |

## 3. Conversion & Customer Success
| KPI | Definition | Source | Target |
|-----|------------|--------|--------|
| **Cart Conversion Rate** | % of users who checkout after adding items to cart | UI Analytics / API Logs | > 65% |
| **Restaurant Acceptance Rate** | % of orders accepted by merchants within 2 minutes | `AuditLog` (order.accepted) | > 95% |
| **Cancellation Rate** | % of orders cancelled post-acceptance | `IncidentResponse` history | < 1% |

## 4. Economic Vitality (V15 Exclusive)
| KPI | Definition | Source | Target |
|-----|------------|--------|--------|
| **Surge Efficiency** | Addnl GMV captured during 1.2x+ surge periods | `EconomyEngine` (surgeMultiplier) | > 15% lift |
| **Market Heat Accuracy** | Delta between predicted demand and actual orders | `V16Engine` vs `EconomyWorker` | < 5% variance |

## 5. Monitoring & Reporting
- **Real-time**: Metrics pushed via `Socket.io` to the Ops Dashboard.
- **Batch**: 5-minute aggregations performed by `BatchProcessor`.
- **Audit**: Historical verification via `AuditLog.ts`.
