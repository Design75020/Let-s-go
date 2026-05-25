# LetsGoFood V15 Autonomous BI Architecture

## System Diagram
```text
[ Sources: Orders, GPS, Systems ] 
        |
        v
[ Internal Event Bus (EventEmitter) ] <---- [ Webhooks / API ]
        |
        +-----> [ Anomaly Detector ] ----> [ Alerts / Realtime ]
        |           |
        |           v
        |       [ Self-Healing Engine ] ----> [ System Actions: Restart, Rollback ]
        |
        +-----> [ Economy Engine ] ----> [ Dynamic Pricing / Supply Rebalancing ]
        |
        +-----> [ Decision Engine ] <---- [ Policies ]
        |           |
        |           v
        |       [ System Outputs: Throttling, Optimization ]
        |
[ Batch Processor (5min) ] ----> [ Aggregator ] ----> [ Long-term BI Metrics ]
        |
        v
[ Monitoring API ] <---- [ Telemetry Data ]
        |
        v
[ Realtime Dashboard (Socket.io) ]
```

## Core Modules

### 1. Event Bus
Central nervous system. Decouples system actions from data production.

### 2. Economy Engine
Monitors supply (active drivers) vs demand (pending orders). Adjusts pricing modifiers in real-time.

### 3. Anomaly Detection
Uses threshold-based analysis (and optional AI verification) to detect outages or fraud.

### 4. Autonomous Decision Engine
Executes business logic based on configured policies.
- **Policy 1**: If demand > 1.5x supply, increase incentive + pricing.
- **Policy 2**: If AI usage > $X/day, switch to local rule-based fallback.

### 5. Self-Healing
If the system detects critical error rates (>5%) in the last 1min, it automatically enters "Safe Mode" and attempts to restart/rollback micro-services (simulated).

### 6. Real-time Monitoring
Broadcats every state change to the SaaS dashboard.
