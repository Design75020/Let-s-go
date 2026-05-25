# LetsGoFood V15: Marketplace Liquidity Specification

This document defines the rules for maintaining economic equilibrium (Supply vs. Demand balance) within the LetsGoFood V15 Autonomous Platform.

## 1. Supply/Demand Signal Detection
Liquidity is monitored by the `EconomyEngine` and processed via the `ECONOMY` stream.

| Signal | Metric | Condition | Action |
|--------|--------|-----------|--------|
| **Oversupply** | `activeDrivers >> pendingOrders` | Heat < 0.1 | Reduce Surge (min 1.0) |
| **Equilibrium** | `activeDrivers ~= (pendingOrders * 1.5)` | 0.3 < Heat < 0.6 | Maintain Surge 1.0 |
| **Undersupply** | `pendingOrders > activeDrivers` | Heat > 0.8 | Trigger Surge 1.2x |
| **Critical Gap** | `pendingOrders > (activeDrivers * 2)` | Heat > 1.2 | Trigger Surge 1.5x |

## 2. Liquidity Zones
Market heat determines the operational "mode" of the marketplace engine:

### ❄️ Cold Zone (Heat < 0.2)
- Driver oversupply detected.
- **Action**: Disable driver auxiliary recruitment messages.
- **Goal**: Protect driver earnings by reducing competition.

### 🌡️ Temperate Zone (Heat 0.2 - 0.7)
- Ideal marketplace balance.
- **Action**: Static pricing enabled.
- **Goal**: Predictable customer experience.

### 🔥 Hot Zone (Heat 0.7 - 1.0)
- High demand pressure.
- **Action**: Dynamic surge pricing (1.2x - 1.5x).
- **Action**: `V16PredictiveEngine` initiates preemptive driver pool expansion.
- **Goal**: Attract supply and moderate demand.

### 🌋 Melt Zone (Heat > 1.0)
- System saturation risk.
- **Action**: Max Surge (2.0x).
- **Action**: Increase delivery ETA estimates by +15 min in UI.
- **Goal**: Prevent marketplace collapse.

## 3. Predictive Liquidity (V16 Global Intelligence)
The `V16Engine` looks ahead 15-30 minutes using:
- **Velocity**: Rate of change in `pendingOrders`.
- **Drift**: Simulation data from `EconomyEngine`.
- **Confidence**: Accuracy score of the prediction.

If `predictedDemand > (predictedSupply * 1.5)` with `confidence > 0.85`, the system emits a `PRICE_ADJUSTED` event ahead of the actual surge.

## 4. Backpressure Mechanisms
When liquidity cannot be restored via pricing:
1. **Throttling**: AI-assisted menu optimization suggestions slowed down.
2. **Order Gating**: Only "High Completion" restaurants shown in primary search.
3. **Safe Mode**: In extreme cases, new orders are paused globally.
