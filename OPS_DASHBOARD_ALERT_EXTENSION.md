# LetsGoFood V15: Ops Dashboard Alert Extension

Technical design for the real-time alerting UI components in the V15 Dashboard.

## 1. Global Alert Banner (P1/P2)
Fixed to the top of the viewport when an emergency or critical incident is active.
- **Colors**: P1 = Pulsing Red/Black, P2 = Solid Orange.
- **Content**: `[SEVERITY] - [DESCRIPTION] - [ELAPSED TIME]`.
- **Action**: "Open Incident Center".

## 2. Alert Feed Panel (Sidebar)
Scrollable list of recent events from the `bi:alert` socket stream.
- **Sort**: Newest first.
- **Icons**: `AlertTriangle` (P1/P2), `Info` (P3/P4).
- **Interactions**:
    - Click to see `correlationId` and raw payload.
    - Right-click to "Mute" or "Acknowledge".

## 3. Incident Timeline View (Main Center)
Historical view of system health overlaid with alerts.
- **Component**: Recharts AreaChart (Health Score) with `ReferenceDots` representing alerts.
- **Tooltip**: Hover over dots to see what alert fired and what the system did (Self-heal action).

## 4. Alert States in Dashboard
| State | UI Representation |
|-------|-------------------|
| **Firing** | Pulsing border + High Contrast |
| **Acknowledged** | Solid border - Reduced opacity |
| **Resolved** | Green checkmark - Fades after 5 min |
| **Suppressed** | Grayed out - Moved to "History" tab |

## 5. Implementation Notes (React/Socket)
- **Namespace**: `io.of('/ops')`.
- **Payload Structure**:
```json
{
  "id": "uuid",
  "severity": "P1",
  "type": "LATENCY_SPIKE",
  "message": "p99 Latency at 2.5s in EU-West",
  "timestamp": "2026-05-17T05:40:00Z",
  "metrics": { "value": 2500, "threshold": 2000 }
}
```
- **Sound Alerts**: Optional (switchable) for P1/P2 incidents.
