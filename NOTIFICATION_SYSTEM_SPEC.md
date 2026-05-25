# LetsGoFood V15: Notification System Specification

Backend infrastructure for the reliable delivery of alerts to external and internal consumers.

## 1. Delivery Channels

### A. Socket.io (Primary)
- **Target**: Ops Dashboard.
- **Latency**: < 100ms.
- **Reliability**: Best effort (requires active client tab).

### B. Webhook Proxy (Secondary)
- **Target**: External SRE Paging (e.g., PagerDuty, Slack).
- **Mechanism**: Outbound HTTP POST to a pre-configured URL.
- **Format**: JSON Payload with redacted PII.

### C. System Logs (Audit)
- **Target**: `pino` stream + `AuditLog` DB table.
- **Retention**: 90 Days.

## 2. Reliability Mechanisms

### A. Retry Strategy
For Webhook deliveries:
- **Attempts**: 3 total.
- **Backoff**: Exponential (1s, 5s, 15s).
- **Failure**: On 3rd failure, log a `NOTIF_DELIVERY_FAILURE` anomaly.

### B. Throttling / Rate Limiting
To prevent "Denial of Wallet" or egress spikes:
- **Global Limit**: 100 notifications / hour.
- **Per-Alert Limit**: 1 notification / 5 min / alert_type.

### C. Redaction Layer
Before delivery, all alerts pass through `Security.redactPII`.
- **Rule**: No emails, phone numbers, or clear-text IDs in notification payloads sent to external webhooks.

## 3. Configuration (Env Vars)
- `OPS_WEBHOOK_URL`: Target for P1/P2 escalations.
- `NOTIF_RETRY_ENABLED`: Boolean.
- `NOTIF_MAX_RATE`: Peak notifications per second allowed.

## 4. Lifecycle in Persistence
Alerts are stored in Redis using a Hash: `letsgo:active_alerts:{id}`.
- Field `dispatch_status`: `pending`, `sent`, `failed`.
- Field `retry_count`: Integer.
