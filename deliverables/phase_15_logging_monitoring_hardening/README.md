# Phase 15: Logging, Monitoring, Hardening & Secure Deployment

## 1. Security-Relevant Event Logging Catalog
The TripMate security engine records tamper-evident audit log entries whenever authentication or access boundaries are traversed:

| Event Code | Action Name | Triggering Condition | Captured Context Fields | Security Purpose |
|---|---|---|---|---|
| **EVT-01** | `LOGIN_SUCCESS` | Successful traveler authentication. | `actorId`, `actorEmail`, `ipAddress`, `timestamp` | Audit legitimate user sessions; detect geo-velocity anomalies. |
| **EVT-02** | `LOGIN_FAILED` | Incorrect password or unverified email submitted. | `actorEmail`, `ipAddress`, `details`, `timestamp` | Detect credential stuffing and brute-force password guessing attacks. |
| **EVT-03** | `PRIVILEGE_VIOLATION_BLOCKED` | Viewer role attempts write/delete operation. | `actorId`, `resourceId`, `status: BLOCKED_403`, `details` | Identify malicious internal actors or client-side tampering. |
| **EVT-04** | `UNAUTHORIZED_TRIP_ACCESS_ATTEMPT` | Stranger attempts to read or access private trip ID. | `actorId`, `resourceId`, `status: BLOCKED_403`, `ipAddress` | Detect BOLA/IDOR enumeration and port scanning. |
| **EVT-05** | `ROLE_MODIFIED` | Owner promotes or demotes member (e.g. Viewer → Editor). | `actorId`, `resourceId` (target user), `newRole`, `timestamp` | Non-repudiation of privilege escalation or delegation. |
| **EVT-06** | `TRIP_DELETED` | Owner executes permanent cascade deletion of trip. | `actorId`, `resourceId`, `timestamp`, `details` | Forensic accountability for data destruction events. |
| **EVT-07** | `OWNERSHIP_TRANSFERRED` | Owner transfers master rights to another collaborator. | `actorId`, `newOwnerId`, `tripId`, `timestamp` | Track changes in root resource authority. |

---

## 2. Logging & Monitoring Strategy (5 Key Metrics & Alerts)

```
[Incoming Telemetry Stream]
         │
         ├───► Auth Metric Analyzer ─────► Alert: Surging Login Failures (> 5/min)
         ├───► RBAC Anomaly Counter ─────► Alert: 403 Forbidden Rate Spike (> 3 in 5 min)
         ├───► Latency Probe (P99) ──────► Alert: API Slowdown (> 350ms)
         ├───► Expense Anomaly Engine ───► Alert: Abnormal Bulk Mutation (> 15/min)
         └───► Multi-Session Tracker ────► Alert: Concurrent Token Collisions
```

### Metrics & Alerting Threshold Specifications:

1. **Metric 1: Authentication Failure Rate Surge**
   - *Formula:* $\text{Count}(\text{LOGIN\_FAILED}) / 60\text{ seconds}$.
   - *Alert Threshold:* $> 5$ failed attempts per minute from a single IP.
   - *Automated Action:* Temporarily ban IP via rate limiter; notify security operations center.
2. **Metric 2: 403 Forbidden Authorization Denial Rate**
   - *Formula:* $\text{Count}(\text{PRIVILEGE\_VIOLATION\_BLOCKED} + \text{UNAUTHORIZED\_TRIP\_ACCESS}) / 300\text{ seconds}$.
   - *Alert Threshold:* $> 3$ denials in a 5-minute rolling window.
   - *Automated Action:* Flag user session as high-risk; require re-authentication.
3. **Metric 3: P99 API Response Latency**
   - *Formula:* $99\text{th percentile of HTTP request-response duration}$.
   - *Alert Threshold:* $\text{Latency} > 350\text{ms}$.
   - *Automated Action:* Trigger Kubernetes Horizontal Pod Autoscaler (HPA) to scale replicas from 2 to 4.
4. **Metric 4: Anomalous Expense Mutation Spike**
   - *Formula:* $\text{Count}(\text{EXPENSE\_CREATED} + \text{EXPENSE\_DELETED}) / \text{tripId} / \text{minute}$.
   - *Alert Threshold:* $> 15$ expense mutations on a single trip within 60 seconds.
   - *Automated Action:* Dispatch notification email to Trip Owner to verify group expense activity.
5. **Metric 5: Concurrent Session Token IP Anomaly**
   - *Formula:* Discrepancy between IP on token issuance and IP on subsequent API call.
   - *Alert Threshold:* Token accessed simultaneously from distinct geographic subnets.
   - *Automated Action:* Invalidate JWT token immediately; log session hijacking alert.

---

## 3. Physical & Operational Security Controls
- **Physical Controls:** Production servers hosted in certified cloud datacenters (ISO 27001 / SOC 2 Type II) with biometric access control, redundant power supplies, and video surveillance.
- **Operational Controls:**
  - Mandatory Multi-Factor Authentication (MFA) for cloud infrastructure access.
  - Quarterly access reviews and automated revocation of inactive contractor accounts.
  - Daily automated encrypted offsite backups of `tripmate_db.json` with 30-day retention and tested disaster recovery drills.

---

*(See `hardening_checklist.md` for target environment OS, Node.js, and deployment hardening checklists).*
