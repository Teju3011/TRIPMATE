# Phase 7: Threat Modeling and Security Analysis

## 1. Asset Identification & CIA Requirements Classification (9 Core Assets)

In accordance with the IEEE/ISO 27005 and STRIDE threat modeling guidelines, all system assets within TripMate have been identified, categorized, and evaluated for **Confidentiality (C)**, **Integrity (I)**, and **Availability (A)** requirements:

| Asset ID | Asset Name & Description | Category | Confidentiality (C) | Integrity (I) | Availability (A) | Core Security Objective |
| :---: | :--- | :--- | :--- | :--- | :--- | :--- |
| **AST-01** | **User Credentials & Password Hashes**<br>Bcrypt salted hashes, salt factors, emails. | Identity & Auth | **HIGH**<br>Unauthorized disclosure allows account takeover. | **HIGH**<br>Tampering allows attacker to forge credentials or lock out users. | **MEDIUM**<br>Must be available for login; cached hashes enable offline recovery. | Prevent credential leakage; guarantee bcrypt work factor >= 10. |
| **AST-02** | **JWT Authentication Tokens & Secret Keys**<br>HMAC-SHA256 signing key & active user tokens. | Cryptographic Secrets | **CRITICAL**<br>Key leak allows universal token forgery across all tenants. | **CRITICAL**<br>Altered tokens must be instantly rejected by signature checks. | **HIGH**<br>Verification must execute with sub-millisecond latency. | Key isolation in environment variables; strict 24h token lifetime. |
| **AST-03** | **Trip Metadata & Privacy Flags**<br>Trip title, dates, budget, private/shared status. | Application Core | **HIGH**<br>Private vacation details must remain isolated from strangers. | **HIGH**<br>Unauthorized edits can disrupt travel plans. | **HIGH**<br>Must be accessible to travelers offline and online. | Enforce trip-level RBAC; prevent BOLA / IDOR query leaks. |
| **AST-04** | **Destination & Geolocation Waypoints**<br>Stop sequence, countries, coordinates, notes. | PII / Location | **HIGH**<br>Exposing physical traveler coordinates creates real-world risk. | **MEDIUM**<br>Altered stops could misguide travelers. | **MEDIUM**<br>Needed for route visualization. | Restrict waypoint visibility to verified trip collaborators. |
| **AST-05** | **Daily Itinerary Schedules & Task Assignments**<br>Time-stamped activities, locations, assignees. | Operational Plans | **MEDIUM**<br>Internal schedule details shared among travel group. | **HIGH**<br>Sabotaged bookings or deleted events disrupt trip operations. | **MEDIUM**<br>Activities must be retrievable per day. | Restrict modifications to Owner and Editor roles only. |
| **AST-06** | **Financial Expense Records & Split Debts**<br>Receipt amounts, payer IDs, debt matrices. | Financial Ledger | **HIGH**<br>Personal financial contributions must remain confidential. | **CRITICAL**<br>Tampering produces false debt balances and monetary fraud. | **HIGH**<br>Debts must settle accurately without race conditions. | Enforce zero-sum ledger conservation; prevent negative amounts. |
| **AST-07** | **Collaborator Roles & Privilege Mappings**<br>User-to-trip membership tuples and roles. | Authorization Policy | **HIGH**<br>Prevents discovery of co-traveler contact information. | **CRITICAL**<br>Tampering allows vertical privilege escalation to Owner. | **HIGH**<br>Must be evaluated on every incoming API request. | Owner-only role modification logic; immutable ownership trail. |
| **AST-08** | **Tamper-Evident Security Audit Logs**<br>Actor, IP, timestamp, action type, status. | Compliance & Forensics | **MEDIUM**<br>Internal administrative and regulatory visibility. | **CRITICAL**<br>Log manipulation destroys forensic accountability. | **HIGH**<br>Logs must persist even during server process crashes. | Append-only architecture; decoupled logging pipeline. |
| **AST-09** | **Container Infrastructure & CI/CD Secrets**<br>Docker socket, K8s secrets, pipeline tokens. | Infrastructure Security | **CRITICAL**<br>Secret exposure compromises container hosting node. | **CRITICAL**<br>Tampered deployment manifests poison production code. | **CRITICAL**<br>CI/CD pipeline and runtime pods must remain operational. | Non-root container execution; secrets injected via Kubernetes Secret. |

---

## 2. STRIDE Threat Analysis Table (12 Identified Threats)

Every element in the Phase 4 Data Flow Diagram (Processes, Data Stores, Data Flows, and External Entities) was analyzed against the **STRIDE** threat categories:

| Threat ID | DFD Element Affected | STRIDE Category | Threat Description | Business / Technical Impact | Implemented Technical Mitigation |
| :---: | :--- | :---: | :--- | :--- | :--- |
| **THR-01** | Process 1.0 (Auth Controller) | **Spoofing** | Attacker replays stolen or forged JWT token to impersonate trip owner. | Full account takeover; unauthorized exfiltration of private itineraries. | Cryptographic HMAC-SHA256 signature verification; strict 24-hour expiration (`JWT_EXPIRES_IN`). |
| **THR-02** | Data Flow: Client → Ingress Gateway | **Spoofing** | Attacker executes automated credential stuffing against `/api/auth/login`. | Brute-force compromise of traveler accounts with weak passwords. | In-memory sliding-window rate limiter (`authLimiter`) restricts to 20 attempts/15 min; bcrypt (10 salt rounds). |
| **THR-03** | Process 4.0 (Expense Split Engine) | **Tampering** | Malicious user injects negative or fractional currency amounts into expense payloads. | Financial ledger corruption; artificial generation of unauthorized credit balances. | Strict numerical validation in `validationMiddleware` (`amount > 0 && isFinite`); cent integer rounding (`Math.round(amt * 100) / 100`). |
| **THR-04** | Process 2.0 & 3.0 (Trip & Itinerary Mgr) | **Tampering** | Attacker injects HTML/JavaScript `<script>` tags in trip description or destination notes. | Stored Cross-Site Scripting (XSS); session token exfiltration from victim browser. | Server-side HTML entity escaping (`sanitizeBody`); script tag stripping; strict Content-Security-Policy (CSP) headers. |
| **THR-05** | Data Store: D4 (Audit Store) | **Repudiation** | Trip collaborator deletes shared itinerary items and denies performing the deletion. | Interpersonal disputes; inability to establish forensic accountability. | Immutable `auditLogs` collection recording actor ID, email, IP address, timestamp, and action details. |
| **THR-06** | Process 1.0 (Auth) & Process 5.0 (Audit) | **Repudiation** | Administrator denies altering platform configurations or inspecting private trips. | Compliance audit failure; lack of administrative traceability. | Dedicated admin audit endpoints logging every administrative inspection; append-only storage. |
| **THR-07** | Data Store: D2 (Trip Store) | **Information Disclosure** | Unauthenticated stranger accesses private trip via guessed predictable trip ID (BOLA/IDOR). | Exfiltration of traveler physical locations, travel dates, and companion rosters. | Anti-BOLA defense: `requireTripRole(['owner','editor','viewer'])` verifies caller membership before returning metadata; returns 403. |
| **THR-08** | External Entity: Client Browser Runtime | **Information Disclosure** | Attacker frames TripMate site inside malicious iframe to harvest credentials (Clickjacking). | Credential theft; unauthorized button clicks performed on behalf of victim. | HTTP security header `X-Frame-Options: DENY` and CSP directive `frame-ancestors 'none'`. |
| **THR-09** | Process 1.0 & Process 4.0 (Express App) | **Denial of Service** | Attacker spams large multi-megabyte JSON payloads to exhaust Node.js event loop memory. | Server crash; denial of service for legitimate travelers. | Express body parser payload size limited strictly to `1mb`; general rate limiter (`apiLimiter`). |
| **THR-10** | Process 4.0 (Splits Computation) | **Denial of Service** | Attacker submits cyclic debt inputs to cause infinite loop in debt minimization solver. | CPU spikes; Node.js single-thread event loop starvation. | Greedy debtor-creditor settlement algorithm with guaranteed $O(N \log N)$ termination bound. |
| **THR-11** | Process 2.0 (Role & Collaborator Mgr) | **Elevation of Privilege** | User assigned `viewer` role directly invokes `PUT /api/trips/:id/collaborators` to self-promote to `owner`. | Complete compromise of trip administration; unauthorized removal of true owner. | Scoped RBAC check: collaborator management endpoints strictly restricted to caller possessing `owner` role. |
| **THR-12** | Container Infrastructure / K8s Pods | **Elevation of Privilege** | Attacker exploits a Node.js vulnerability to gain root shell inside container. | Container breakout; host node compromise; adjacent pod inspection. | Multi-stage Dockerfile running as unprivileged user `UID 10001 (tripmate)`; K8s `securityContext: runAsNonRoot: true`, `drop: [ALL]`. |

---

## 3. Information Flow Analysis (IFA) for Sensitive Assets

Information Flow Analysis evaluates the path, trust boundaries crossed, exposure vectors, and applied security controls across the end-to-end lifecycle of three critical platform assets:

### Information Flow 1: User Credentials & Authentication Tokens (`AST-01` / `AST-02`)
* **Asset Flow Path:**
  1. **Source:** Client Browser form input (`email`, `password`).
  2. **Boundary Crossing 1 (Public to DMZ):** Traverses public network to Reverse Proxy / Ingress over **TLS 1.3 encrypted channel**.
  3. **Boundary Crossing 2 (DMZ to App Tier):** Ingress forwards request to Express Node.js application container over internal cluster network.
  4. **Authentication Processing:** Auth Controller passes plaintext password to `bcrypt.compare(password, user.passwordHash)`.
  5. **Token Issuance:** Upon match, Auth Controller invokes `jwt.sign()` using the isolated server secret `JWT_SECRET`.
  6. **Destination:** HMAC-signed JWT returned in JSON payload; stored in client `localStorage`; transmitted in `Authorization: Bearer <token>` for subsequent requests.
* **Trust Boundaries Crossed:**
  * **TB-1 (Browser to Ingress):** Untrusted public internet to DMZ.
  * **TB-2 (Ingress to App Container):** DMZ to private container network.
  * **TB-3 (App Container to Persistent Store):** In-memory runtime to disk store (`data/tripmate_db.json`).
* **Threat Vectors Along Path:** Man-in-the-middle sniffing, credential stuffing, memory dumping, JWT signature stripping.
* **Applied Security Controls:** Mandatory TLS 1.3, bcrypt with 10 salt rounds, in-memory sliding-window rate limiting (20 req/15 min), 24-hour token expiration, zero plaintext password persistence.

---

### Information Flow 2: Private Trip Itineraries & Geolocation Waypoints (`AST-03` / `AST-04` / `AST-05`)
* **Asset Flow Path:**
  1. **Source:** Authenticated Trip Owner / Editor creates destination or itinerary task in web client.
  2. **Boundary Crossing 1:** JSON payload with `Authorization: Bearer <token>` transmitted over TLS 1.3.
  3. **Interception & Authentication:** Express `verifyToken` middleware decodes JWT and validates signature against `JWT_SECRET`.
  4. **Authorization Enforcement:** `requireTripRole(['owner', 'editor'])` middleware performs query on `collaborators` table matching `(tripId, userId)`.
  5. **Input Sanitization:** `sanitizeBody` middleware strips HTML tags and escapes entity characters to prevent stored XSS.
  6. **Persistence:** Destination and itinerary records written to atomic JSON database with file-level mutex locking.
  7. **Destination:** Filtered JSON returned exclusively to authorized trip collaborators.
* **Trust Boundaries Crossed:**
  * **TB-1 (Client to Web API):** Public client to authenticated API gateway.
  * **TB-2 (API Gateway to RBAC Engine):** General API route to trip-scoped authorization context.
  * **TB-3 (Business Logic to Database):** Application service to storage volume.
* **Threat Vectors Along Path:** Broken Object Level Authorization (BOLA/IDOR), cross-tenant data harvesting, stored XSS in activity notes.
* **Applied Security Controls:** Scoped `requireTripRole` check on every endpoint, strict 403 Forbidden on uninvited user queries, HTML entity escaping, atomic write-and-rename disk commits.

---

### Information Flow 3: Group Financial Expense Records & Debt Settlement Graph (`AST-06`)
* **Asset Flow Path:**
  1. **Source:** Trip Collaborator enters expense (`amount`, `category`, `payerId`, `splitMembers[]`).
  2. **Boundary Crossing 1:** Transmitted over TLS 1.3 to `/api/trips/:tripId/expenses`.
  3. **Role & Payload Validation:** `requireTripRole(['owner', 'editor'])` validates write permissions. `validationMiddleware` enforces `amount > 0`, finite number validation, and non-empty `splitMembers`.
  4. **Cent-Precision Normalization:** System converts floating values to integer cents (`Math.round(amt * 100)`) to eliminate binary floating-point drift.
  5. **Settlement Computation:** Debt minimization solver calculates net participant balances (`Credits - Debits = Net`) and executes a greedy balance reconciliation algorithm to derive the minimal transfer set.
  6. **Persistence:** Immutable expense record stored in database; audit event `EXPENSE_CREATED` logged.
  7. **Destination:** Rendered in client UI as the "Who Owes Whom" settlement matrix.
* **Trust Boundaries Crossed:**
  * **TB-1 (Client to API):** User browser to Express API.
  * **TB-2 (API Controller to Computational Engine):** Data parsing to mathematical settlement logic.
  * **TB-3 (Computational Engine to Database):** In-memory ledger to persistent file store.
* **Threat Vectors Along Path:** Negative currency injection, fractional cent rounding leakage, cyclic debt deadlocks, race conditions from duplicate clicks.
* **Applied Security Controls:** Strict positive number validation, two-decimal cent integer arithmetic, guaranteed $O(N \log N)$ algorithm convergence, atomic transactional persistence.

---

## 4. Vulnerability Analysis (6 Critical Vulnerabilities)

| Vulnerability ID | Vulnerability Title | Affected DFD Element | Related Threat | CWE Classification | Technical Impact | Implemented Technical Mitigation |
| :---: | :--- | :--- | :---: | :--- | :--- | :--- |
| **VULN-01** | **Broken Object-Level Authorization (BOLA / IDOR)** | Process 2.0 (Trip Route Manager) / `tripRoutes.js` | THR-07 | **CWE-639** (Authorization Bypass via User-Controlled Key) | An uninvited user could read, modify, or delete another traveler's private trip by manipulating the URL parameter `:tripId`. | Enforced `requireTripRole(['owner', 'editor', 'viewer'])` on all sub-resources; validates active membership in the `collaborators` table before granting access. |
| **VULN-02** | **Floating-Point Rounding & Division Drift** | Process 4.0 (Expense Split Engine) / `expenseRoutes.js` | THR-03 | **CWE-682** (Incorrect Calculation) | Fractional cents vanish during group splits, leading to ledger discrepancies and unreconciled group balances. | Standardized two-decimal cent precision math; verified zero-sum ledger conservation before finalizing settlement graph. |
| **VULN-03** | **Cross-Site Scripting (Stored XSS) in Notes** | Process 3.0 (Itinerary Scheduler) / `itineraryRoutes.js` | THR-04 | **CWE-79** (Improper Neutralization of Input During Web Generation) | A collaborator could insert `<script>` tags into activity descriptions to execute arbitrary JavaScript in co-travelers' browsers. | Centralized input sanitization middleware (`sanitizeBody`), HTML entity encoding, and Content-Security-Policy headers blocking inline scripts. |
| **VULN-04** | **Credential Stuffing & Brute-Force Auth** | Process 1.0 (Auth Controller) / `authRoutes.js` | THR-02 | **CWE-307** (Improper Restriction of Excessive Auth Attempts) | Automated password guessing tools could compromise traveler accounts with weak passwords. | In-memory sliding-window rate limiter restricting login attempts to 20 requests per 15-minute window; bcrypt password hashing with 10 salt rounds. |
| **VULN-05** | **Privilege Escalation via Unchecked Role Edit** | Process 2.0 (Collaborator Manager) / `collaboratorRoutes.js` | THR-11 | **CWE-269** (Improper Privilege Management) | An Editor or Viewer could change their own role or other companions' roles without owner consent. | Exclusive Owner authorization guard (`requireTripRole(['owner'])`) for all collaborator invite, role modification, and removal endpoints. |
| **VULN-06** | **Root Container Execution & Host Escalation** | Runtime Infrastructure / Dockerfile & K8s Pods | THR-12 | **CWE-250** (Execution with Unnecessary Privileges) | If a container vulnerability is exploited, the attacker inherits host root permissions. | Dedicated unprivileged system user `tripmate (UID 10001)` defined in Dockerfile; Kubernetes `securityContext` drops all Linux capabilities and prevents privilege escalation. |
