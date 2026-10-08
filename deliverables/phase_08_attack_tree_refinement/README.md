# Phase 8: Attack Tree & Security Architecture Refinement

## 1. Selected Critical Attacker Goal
**Root Attacker Goal:** *"Unauthorized Exfiltration of Private Trip Itineraries OR Falsification of Group Expense Ledgers."*

---

## 2. Attack Tree Decomposition (AND/OR Logic)

```
[ROOT GOAL]: Exfiltrate Private Trip Plans OR Falsify Group Expenses
|
+--- [OR] 1.0 Bypass Access Control & BOLA/IDOR
|    |
|    +--- [AND] 1.1 Parameter Tampering on tripId Endpoint
|    |    +-- [Leaf 1.1.1] Harvest predictable or sequential trip IDs
|    |    +-- [Leaf 1.1.2] Craft direct GET/PUT request bypassing UI
|    |
|    +--- [AND] 1.2 Direct Role Escalation via Unchecked PUT /collaborators
|         +-- [Leaf 1.2.1] Authenticate as Viewer
|         +-- [Leaf 1.2.2] Invoke role update endpoint with role='owner'
|
+--- [OR] 2.0 Hijack Session Token / Identity Spoofing
|    |
|    +--- [AND] 2.1 Automated Credential Stuffing / Brute Force
|    |    +-- [Leaf 2.1.1] High-frequency dictionary attack on /api/auth/login
|    |    +-- [Leaf 2.1.2] Harvest victim traveler password
|    |
|    +--- [AND] 2.2 Stored Cross-Site Scripting (XSS) Token Theft
|         +-- [Leaf 2.2.1] Inject malicious payload into itinerary note
|         +-- [Leaf 2.2.2] Victim loads schedule; script steals JWT from memory
|
+--- [OR] 3.0 Manipulate Financial Split Ledger
     |
     +--- [AND] 3.1 Currency Arithmetic / Floating-Point Drift Exploit
     |    +-- [Leaf 3.1.1] Inject negative expense amount (e.g., -500.00)
     |    +-- [Leaf 3.1.2] Cause balance inversion so attacker is owed funds
     |
     +--- [AND] 3.2 Race Condition / Concurrency Collision on Settlements
          +-- [Leaf 3.2.1] Concurrently dispatch duplicate settlement requests
          +-- [Leaf 3.2.2] Cause double-crediting in database store
```

> **Diagram Artifact:** [attack_tree.svg](file:///C:/Users/tej30/.gemini/antigravity-ide/scratch/tripmate/deliverables/phase_08_attack_tree_refinement/diagrams/attack_tree.svg)

---

## 3. Preventative and Detective Controls Mapped to Attack Paths

| Attack Tree Path | Threat Vector | Preventive Control | Detective Control |
|---|---|---|---|
| **Path 1.1 (IDOR on tripId)** | Broken Object-Level Authorization | `requireTripRole` middleware validates caller is active collaborator before returning data. | Logs `UNAUTHORIZED_TRIP_ACCESS_ATTEMPT` with actor ID and IP; alerts if >3 denials/min. |
| **Path 1.2 (Role Escalation)** | Privilege Escalation | Exclusive `owner` role check on all collaborator role modification endpoints. | Logs `PRIVILEGE_VIOLATION_BLOCKED` to tamper-evident audit store. |
| **Path 2.1 (Brute Force)** | Credential Stuffing | Sliding-window `authLimiter` restricts to 20 attempts / 15 min; Bcrypt salt rounds (10). | Logs `LOGIN_FAILED` events; triggers IP ban upon threshold violation. |
| **Path 2.2 (Stored XSS)** | Cross-Site Scripting | Server-side entity encoding (`sanitizeBody`) + strict Content-Security-Policy (CSP). | Automated SAST vulnerability audit scans dependencies and inputs. |
| **Path 3.1 (Negative Amounts)** | Financial Data Tampering | Input validation schema mandates `amount > 0 && isFinite`; rejects negative numbers. | Input validation returns HTTP 400 Bad Request; logs malformed payload attempt. |
| **Path 3.2 (Settlement Races)** | Data Race Condition | Atomic file rename transactions with OS-level write locking in `database.js`. | Database consistency check verifies zero-sum ledger conservation. |

---

## 4. Security-Refined Architecture Enhancements
To address the highest-risk threats identified in the Attack Tree, the architecture was refined with four core enhancements:
1. **Zero-Trust Middleware Chain:** Every API route is guarded by both authentication (identity verification) and authorization (role scoping) interceptors.
2. **Context-Aware UI Reflection:** The frontend dynamically disables mutating buttons and displays a Read-Only notice for `viewer` roles, preventing user errors while server-side guards block API-level bypasses.
3. **Atomic Financial Transactions:** File and record persistence uses atomic write-and-rename semantics (`fs.writeFileSync` to temp file + `fs.renameSync`) to eliminate dirty writes or half-written financial ledgers.
4. **Structured Security Telemetry:** Tamper-evident logging decoupled from user operations, guaranteeing that even aborted or blocked requests leave an indelible forensic record.
