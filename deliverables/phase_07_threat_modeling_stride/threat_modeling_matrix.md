# STRIDE Threat Modeling Matrix & Vulnerability Analysis

## 1. STRIDE Threat Analysis Table (12 Identified Threats)

| Threat ID | DFD Element Affected | STRIDE Category | Threat Description | Business / Technical Impact | Implemented Mitigation |
|---|---|---|---|---|---|
| **THR-01** | Process 1.0 (Auth) | **Spoofing** | Attacker replays stolen or forged JWT token to impersonate trip owner. | Account takeover, unauthorized exfiltration of private itineraries. | Cryptographic HMAC-SHA256 signature verification, strict 24-hour expiration (`JWT_EXPIRES_IN`). |
| **THR-02** | Data Flow: Client → Ingress | **Spoofing** | Attacker executes credential stuffing against `/api/auth/login`. | Brute-force discovery of traveler passwords. | In-memory sliding-window rate limiter (`authLimiter`) restricts to 20 attempts / 15 min; Bcrypt salt rounds (10). |
| **THR-03** | Process 4.0 (Expenses) | **Tampering** | Malicious user injects negative or fractional currency amounts into expense payloads. | Corruption of financial ledger, artificial generation of credit balances. | Strict numerical validation in `validationMiddleware` (`amount > 0 && isFinite`), cent rounding (`Math.round(amt * 100) / 100`). |
| **THR-04** | Process 2.0 (Trip Mgr) | **Tampering** | Attacker injects HTML/JavaScript `<script>` tags in trip description or destination notes. | Stored Cross-Site Scripting (XSS), session token exfiltration. | Server-side HTML entity escaping, script tag stripping, strict Content-Security-Policy (CSP). |
| **THR-05** | D1 (User Store) | **Repudiation** | Trip collaborator deletes shared itinerary items and denies performing the deletion. | Interpersonal disputes, inability to hold actors accountable. | Immutable `auditLogs` collection recording actor ID, email, IP address, timestamp, and action details. |
| **THR-06** | Process 1.0 (Auth) | **Repudiation** | Admin denies altering platform configurations or inspecting private trips. | Compliance audit failure, lack of administrative traceability. | Dedicated admin audit endpoints logging every administrative inspection. |
| **THR-07** | Data Store: D2 (Trips) | **Information Disclosure** | Unauthenticated stranger accesses private trip via guessed predictable trip ID (IDOR). | Exfiltration of traveler physical locations and travel dates. | Anti-BOLA / IDOR defense: `requireTripRole` verifies caller membership before returning trip metadata; returns 403. |
| **THR-08** | Client Browser Runtime | **Information Disclosure** | Attacker frames TripMate site inside malicious iframe to harvest credentials (Clickjacking). | Credential theft, unauthorized button clicks. | Security header `X-Frame-Options: DENY` and CSP `frame-ancestors 'none'`. |
| **THR-09** | Process 1.0 & Process 4.0 | **Denial of Service** | Attacker spams large multi-megabyte JSON payloads to exhaust Node.js event loop memory. | Server crash, denial of service for legitimate travelers. | Express body parser payload size limited strictly to `1mb`; general rate limiter (`apiLimiter`). |
| **THR-10** | Process 4.0 (Splits) | **Denial of Service** | Attacker submits cyclic debt inputs to cause infinite loop in debt minimization solver. | CPU spikes, thread starvation. | Greedy debtor-creditor settlement algorithm with guaranteed $O(N \log N)$ termination bound. |
| **THR-11** | Process 2.0 (Role Mgr) | **Elevation of Privilege** | User assigned `viewer` role directly invokes `PUT /api/trips/:id/collaborators` to self-promote to `owner`. | Complete compromise of trip administration. | Scoped RBAC check: collaborator management endpoints strictly restricted to caller possessing `owner` role. |
| **THR-12** | Container Infrastructure | **Elevation of Privilege** | Attacker exploits a Node.js vulnerability to gain root shell inside container. | Host takeover, container breakout. | Multi-stage Dockerfile running as unprivileged user `UID 10001 (tripmate)`; K8s `securityContext: runAsNonRoot: true`, `drop: [ALL]`. |

---

## 2. Vulnerability Analysis (6 Critical Vulnerabilities)

### Vulnerability 1: Broken Object-Level Authorization (BOLA / IDOR)
- **Affected Element:** Process 2.0 (Trip Route Manager) / `src/routes/tripRoutes.js`
- **Related Threat:** THR-07 (Information Disclosure) & THR-11 (Elevation of Privilege)
- **CWE Classification:** CWE-639 (Authorization Bypass Through User-Controlled Key)
- **Technical Impact:** An uninvited user could read, modify, or delete another traveler's private trip by manipulating the URL parameter `:tripId`.
- **Mitigation Implemented:** Enforced `requireTripRole(['owner', 'editor', 'viewer'])` on all sub-resources; validates active membership in the `collaborators` table before granting access.

### Vulnerability 2: Floating-Point Rounding & Division Drift
- **Affected Element:** Process 4.0 (Expense Split Engine) / `src/routes/expenseRoutes.js`
- **Related Threat:** THR-03 (Tampering)
- **CWE Classification:** CWE-682 (Incorrect Calculation)
- **Technical Impact:** Fractional cents vanish during group splits, leading to ledger discrepancies and unreconciled group balances.
- **Mitigation Implemented:** Standardized two-decimal cent precision math; verified zero-sum ledger conservation before finalizing settlement graph.

### Vulnerability 3: Cross-Site Scripting (Stored XSS) in Collaborative Notes
- **Affected Element:** Process 3.0 (Itinerary Scheduler) / `src/routes/itineraryRoutes.js`
- **Related Threat:** THR-04 (Tampering & Information Disclosure)
- **CWE Classification:** CWE-79 (Improper Neutralization of Input During Web Page Generation)
- **Technical Impact:** A collaborator could insert `<script>` tags into activity descriptions to execute arbitrary JavaScript in co-travelers' browsers.
- **Mitigation Implemented:** Centralized input sanitization middleware (`sanitizeBody`), HTML entity encoding, and Content-Security-Policy headers blocking inline scripts.

### Vulnerability 4: Credential Stuffing & Brute-Force Authentication
- **Affected Element:** Process 1.0 (Auth Controller) / `src/routes/authRoutes.js`
- **Related Threat:** THR-02 (Spoofing)
- **CWE Classification:** CWE-307 (Improper Restriction of Excessive Authentication Attempts)
- **Technical Impact:** Automated password guessing tools could compromise traveler accounts with weak passwords.
- **Mitigation Implemented:** In-memory sliding-window rate limiter restricting login attempts to 20 requests per 15-minute window; bcrypt password hashing with 10 salt rounds.

### Vulnerability 5: Privilege Escalation via Unchecked Role Modification
- **Affected Element:** Process 2.0 (Collaborator Manager) / `src/routes/collaboratorRoutes.js`
- **Related Threat:** THR-11 (Elevation of Privilege)
- **CWE Classification:** CWE-269 (Improper Privilege Management)
- **Technical Impact:** An Editor or Viewer could change their own role or other companions' roles without owner consent.
- **Mitigation Implemented:** Exclusive Owner authorization guard (`requireTripRole(['owner'])`) for all collaborator invite, role modification, and removal endpoints.

### Vulnerability 6: Root Container Execution & Privilege Escalation
- **Affected Element:** Runtime Infrastructure / Dockerfile & K8s Pods
- **Related Threat:** THR-12 (Elevation of Privilege)
- **CWE Classification:** CWE-250 (Execution with Unnecessary Privileges)
- **Technical Impact:** If a container vulnerability is exploited, the attacker inherits host root permissions.
- **Mitigation Implemented:** Dedicated unprivileged system user `tripmate (UID 10001)` defined in Dockerfile; Kubernetes `securityContext` drops all Linux capabilities and prevents privilege escalation.
