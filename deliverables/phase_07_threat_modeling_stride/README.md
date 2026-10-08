# Phase 7: Threat Modeling & Security Analysis

## 1. Asset Identification & CIA Classification
Eight critical software and data assets were identified across the TripMate platform and classified according to the CIA Triad (Confidentiality, Integrity, Availability):

| Asset ID | Asset Description | Confidentiality | Integrity | Availability | Asset Rationale |
|---|---|---|---|---|---|
| **AST-01** | User Authentication Credentials (Passwords) | **High** | **High** | **High** | Must never be compromised in plaintext; required for identity validation. |
| **AST-02** | Session Bearer Tokens (Signed JWTs) | **High** | **High** | **Med** | Compromise allows session impersonation and unauthorized API access. |
| **AST-03** | Trip Membership & Role Mapping (RBAC Ledger) | **High** | **High** | **High** | Defines authorization boundaries between Owners, Editors, and Viewers. |
| **AST-04** | Private Trip Geodata & Itineraries | **High** | **Med** | **Med** | Traveler privacy and physical security; exfiltration risks physical tracking. |
| **AST-05** | Financial Expense Records & Split Ledger | **Med** | **High** | **High** | Financial accuracy and trust; unauthorized modification causes fraud. |
| **AST-06** | Debt Settlement Matrix ("Who Owes Whom") | **Med** | **High** | **Med** | Algorithmic output dictating interpersonal money transfers. |
| **AST-07** | Security Audit Event Logs | **Med** | **High** | **High** | Non-repudiation and forensic telemetry; must be tamper-evident. |
| **AST-08** | Node.js Runtime & Application Database | **High** | **High** | **High** | Underlying infrastructure hosting data and business services. |

---

## 2. Information Flow Analysis for 3 Sensitive Assets

### Sensitive Asset 1: Session Bearer Tokens (AST-02)
- **Source:** Process 1.0 (Auth Controller) upon verified password match.
- **In-Transit Flow:** Returned over TLS encrypted HTTPS response body → stored in Client memory / local storage → transmitted in `Authorization: Bearer <token>` header on subsequent requests.
- **Processing:** Verified by `authMiddleware` using HMAC-SHA256 and secret key `JWT_SECRET`. Token payload decoded to populate `req.user`.
- **Security Controls:** TLS 1.3 encryption in transit, strict 24-hour expiration, CSP `default-src 'self'` preventing third-party script token harvesting.

### Sensitive Asset 2: Private Trip Itineraries & Geodata (AST-04)
- **Source:** Traveler input via client browser.
- **In-Transit Flow:** Transmitted via JSON POST over TLS → ingested by Process 2.0 (Trip Route Manager) and Process 3.0 (Itinerary Scheduler).
- **Processing:** `requireTripRole` verifies that caller's ID matches an active collaborator record for `tripId`.
- **Storage Flow:** Written to disk repository (`data/tripmate_db.json`) via atomic rename operations.
- **Security Controls:** Private trips hidden from non-collaborators; unauthorized requests return 403/404 to avoid leaking trip existence.

### Sensitive Asset 3: Financial Expense Split Ledger (AST-05)
- **Source:** Co-Traveler expense submission form.
- **In-Transit Flow:** Submitted with amount, category, payer ID, and split user IDs.
- **Processing:** Validated for positive values; zero-sum ledger conservation evaluated; debt minimization algorithm executed.
- **Storage Flow:** Stored in `expenses` collection; logged to `auditLogs`.
- **Security Controls:** Mutation restricted strictly to Owner and Editor roles; Viewer attempts trigger immediate 403 block and alert.

---

## 3. STRIDE Threat Model & Vulnerability Analysis
*(Detailed in `threat_modeling_matrix.md` with full threat table and vulnerability specifications).*
