# LetsGoFood V15: Operational Dashboard Specification

Design for the V15 Command & Control interface used by Product Operations and SRE.

## 1. HUD (Heads-Up Display)
Top-level metrics updated every 500ms via `bi:metrics:batch`.

- **Platform Vitality**: Giant Health Score Gauge (0-100).
- **Market Heat**: Color-coded indicator (🔵 Cold to 🔴 Melt).
- **GMV Counter**: Real-time ticker of today's gross value.
- **Active Incident Count**: Badge showing open P1/P2 incidents.

## 2. Marketplace Map (Center Panel)
Visual representation of the supply/demand balance.

- **Supply Layer**: Active drivers (count + availability).
- **Demand Layer**: Pending orders (hotspots).
- **Gap Analysis**: Calculated predicted shortage for the next 15 minutes.

## 3. Event Backbone View (Left Sidebar)
Status of the hardened EventStream.

- **Throughput**: Events/sec per domain (ECONOMY, ANOMALY, COST).
- **Lag Monitor**: Consumer processing delay (ms).
- **DLQ Alarm**: Flashing indicator if Dead Letter Queue > 0.

## 4. Autonomous Controls (Right Sidebar)
Manual overrides for the V16 Engine.

- **Safe Mode Toggle**: Emergency switch (requires dual-auth).
- **Throttling Slider**: Manual control of AI spending modes.
- **Heal Action Feed**: Log of recent autonomous remediation actions (e.g., "Restarted Gateway").

## 5. Bottom Panel: Incident & Audit Log
Real-time stream of security and operational events.

- Filterable list of `AuditLog` events.
- Redacted PII display for authorized operators.
- "Acknowledge" button for recent anomalies.

## 6. Technical Stack
- **Frontend**: React + Tailwind + Lucide Icons.
- **Charts**: Recharts for GMV/Latency history.
- **Real-time**: `Socket.io` connection with JWT authentication.
- **Reliability**: Dashboard operates on a dedicated "ReadOnly" connection to prevent adding load to the transaction plane.
