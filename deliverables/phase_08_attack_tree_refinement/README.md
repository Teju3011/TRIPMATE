# Phase 8: Attack Tree & Security Architecture Refinement

## 1. Selected Critical Attacker Goal
In alignment with the capstone rubric requiring selection of a high-impact attacker objective (such as modifying student grades or leaking question papers in academic systems), the primary critical attacker objective in TripMate is:

> **Root Attacker Goal:**  
> **"Unauthorized Exfiltration of Private Trip Itineraries OR Falsification of Group Expense Ledgers."**  
> *Target Assets:* `AST-03` (Trip Metadata), `AST-04` (Location Data), `AST-06` (Financial Records), `AST-07` (Role Mappings).

---

## 2. Attack Tree Decomposition (AND/OR Logic)

The Attack Tree models the hierarchical decomposition of the root goal into sub-goals and specific leaf attack paths using Boolean **AND/OR** relationships:

```
[ROOT GOAL]: Exfiltrate Private Trip Plans OR Falsify Group Expenses
│
├── [OR] Sub-Goal 1.0: Bypass Access Control & Exploit BOLA/IDOR
│   │
│   ├── [AND] Sub-Goal 1.1: Parameter Tampering on :tripId Endpoint (Attack Path 1.1)
│   │   ├── [Leaf 1.1.1] Harvest predictable or sequential trip IDs from network traffic
│   │   └── [Leaf 1.1.2] Craft direct GET/PUT REST request bypassing frontend client
│   │
│   └── [AND] Sub-Goal 1.2: Vertical Role Escalation via PUT /collaborators (Attack Path 1.2)
│       ├── [Leaf 1.2.1] Authenticate as low-privilege 'viewer' or 'editor'
│       └── [Leaf 1.2.2] Invoke role update endpoint with payload role='owner'
│
├── [OR] Sub-Goal 2.0: Hijack Session Token / Identity Spoofing
│   │
│   ├── [AND] Sub-Goal 2.1: Automated Credential Stuffing / Brute Force (Attack Path 2.1)
│   │   ├── [Leaf 2.1.1] High-frequency dictionary attack on /api/auth/login
│   │   └── [Leaf 2.1.2] Harvest victim traveler password through weak password policy
│   │
│   └── [AND] Sub-Goal 2.2: Stored Cross-Site Scripting (XSS) Token Exfiltration (Attack Path 2.2)
│       ├── [Leaf 2.2.1] Inject malicious <script> payload into itinerary activity notes
│       └── [Leaf 2.2.2] Victim loads schedule; script steals JWT Bearer token from browser memory
│
└── [OR] Sub-Goal 3.0: Manipulate Group Financial Split Ledger
    │
    ├── [AND] Sub-Goal 3.1: Negative Value & Floating-Point Drift Exploit (Attack Path 3.1)
    │   ├── [Leaf 3.1.1] Inject negative expense amount (e.g., -500.00 USD)
    │   └── [Leaf 3.1.2] Cause balance inversion so attacker is falsely owed funds
    │
    └── [AND] Sub-Goal 3.2: Race Condition / Concurrency Collision on Settlements (Attack Path 3.2)
        ├── [Leaf 3.2.1] Concurrently dispatch duplicate settlement clearance requests
        └── [Leaf 3.2.2] Cause double-crediting in database store via simultaneous writes
```

### Visual Diagram Deliverables
* **Interactive Draw.io Diagram:** [`attack_tree.drawio`](file:///C:/Users/tej30/.gemini/antigravity-ide/scratch/tripmate/deliverables/phase_08_attack_tree_refinement/diagrams/attack_tree.drawio) (Also on Desktop: [`C:\Users\tej30\Desktop\TripMate_DrawIO_Diagrams\attack_tree.drawio`](file:///C:/Users/tej30/Desktop/TripMate_DrawIO_Diagrams/attack_tree.drawio))
* **Vector SVG Diagram:** [`attack_tree.svg`](file:///C:/Users/tej30/.gemini/antigravity-ide/scratch/tripmate/deliverables/phase_08_attack_tree_refinement/diagrams/attack_tree.svg)

---

## 3. Preventative and Detective Controls Mapped to Attack Paths

To systematically counter every branch of the attack tree, defense-in-depth controls have been classified into **Preventive** (stopping the attack pre-execution) and **Detective** (discovering and alarming upon execution attempts):

| Attack Tree Path | Threat Vector | Preventive Control (Block) | Detective Control (Alert & Log) |
| :--- | :--- | :--- | :--- |
| **Path 1.1: Parameter Tampering on :tripId** | Broken Object-Level Authorization (BOLA/IDOR) | Scoped `requireTripRole` middleware validates caller is active collaborator in `collaborators` table before returning data; returns HTTP 403 Forbidden. | Logs `UNAUTHORIZED_TRIP_ACCESS_ATTEMPT` with actor ID, target ID, and IP address; triggers alert threshold if >3 denials/min. |
| **Path 1.2: Vertical Role Escalation** | Privilege Escalation to Owner | Exclusive `owner` role check on all collaborator role modification and deletion endpoints; Owners cannot demote themselves without transferring ownership. | Logs `PRIVILEGE_VIOLATION_BLOCKED` to tamper-evident audit store. |
| **Path 2.1: Credential Stuffing** | Brute Force Password Cracking | Sliding-window `authLimiter` restricts login attempts to 20 per 15-minute window; enforces bcrypt with 10 salt rounds. | Logs `LOGIN_FAILED` events; triggers IP ban upon 5 consecutive failed attempts. |
| **Path 2.2: Stored XSS Token Theft** | Cross-Site Scripting (XSS) | Server-side entity encoding (`sanitizeBody`), script tag stripping, and strict Content-Security-Policy (CSP) headers blocking inline scripts. | Automated SAST vulnerability audit scans dependencies and inputs during CI/CD build. |
| **Path 3.1: Negative Value Injection** | Financial Ledger Tampering | Validation middleware enforces `amount > 0 && isFinite`; rejects negative or NaN values before ledger processing. | Input validation returns HTTP 400 Bad Request; logs malformed payload attempt in security audit log. |
| **Path 3.2: Concurrency Race on Splits** | Data Race Condition | Atomic file write-and-rename transactions with OS-level mutex locking in `database.js`. | Database consistency check verifies zero-sum ledger conservation (`Sum(Balances) == 0`). |

---

## 4. Security-Refined Architecture Enhancements

To mitigate the highest-risk threats identified in the Attack Tree analysis (specifically BOLA, Privilege Escalation, and Financial Ledger Corruption), the TripMate system architecture was refined with four core enhancements:

### 1. Zero-Trust Pre-Flight Middleware Chain
Rather than relying on controllers to manually verify permissions, a modular defense-in-depth pipeline intercepts every inbound request:
```
Inbound Request 
  ──► Rate Limiter (IP check)
  ──► verifyToken (JWT cryptographic verification)
  ──► sanitizeBody (XSS tag stripping)
  ──► requireTripRole (Pre-flight database membership & role check)
  ──► Route Controller
```

### 2. Context-Aware UI Reflection & Client-Side Capability Guards
To prevent user confusion and prevent unauthorized requests before they are dispatched, the frontend dynamically inspects the user's role from the JWT payload:
* Mutating action buttons (`+ Add Destination`, `+ Invite Collaborator`, `Edit`) are visually disabled or hidden for users in the `viewer` role.
* A padlock badge and informative tooltip inform the user: *"You have read-only permissions on this trip."*

### 3. Atomic Financial Ledger Transactions & Invariant Validation
The storage engine was refactored to enforce atomic write-and-rename semantics (`fs.writeFileSync` to temporary file + atomic `fs.renameSync`) with file locking. Before any settlement graph is persisted, an invariant check verifies that:
$$\sum_{i=1}^{n} \text{NetBalance}_i = 0.00$$
If the ledger sum deviates from zero by even one cent, the transaction aborts and rolls back.

### 4. Structured Security Telemetry & Immutable Audit Pipeline
A decoupled audit logging pipeline records all security-sensitive events (`AUTH_SUCCESS`, `AUTH_FAILURE`, `ROLE_CHANGED`, `BOLA_PREVENTED`, `TRIP_DELETED`). Because audit writes occur independently of transactional rollbacks, attempted attacks leave an indelible, tamper-evident forensic record even when the malicious operation is blocked.
