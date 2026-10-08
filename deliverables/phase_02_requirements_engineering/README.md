# Phase 2: Requirements Engineering

## 1. Stakeholders and User Personas

| Actor / User Type | Role & Responsibilities | Security Context & Trust Level |
|---|---|---|
| **Primary Traveler / Trip Organizer (Owner)** | Creates trips, manages overall itinerary, invites companions, assigns roles (Editor/Viewer), transfers ownership, can delete trip. | **High Trust:** Scoped root administrator for their specific trips. |
| **Co-Traveler / Contributor (Editor)** | Adds and updates destinations, schedules daily activities, logs expenses, assigns tasks to companions. | **Medium Trust:** Authorized to write itinerary and financial records, but cannot alter membership or delete trip. |
| **Companion / Guest (Viewer)** | Views itinerary, checks destination schedules, reviews personal expense balances. | **Low / Read-Only Trust:** Explicitly forbidden from mutating any trip data. |
| **System Security Administrator / Auditor** | Platform administrator monitoring system health, reviewing tamper-evident audit logs, enforcing security compliance. | **System Trust:** Privileged administrative access to system-wide audit telemetry and rate-limiting metrics. |

---

## 2. Requirements Classification

### A. Functional Requirements (FR)
- **FR-01: User Registration & Authentication:** Users can register with validated email and strong password; authenticate via JWT token.
- **FR-02: Trip Lifecycle Management:** Users can create, view, update, and delete travel plans with custom budgets, dates, and privacy status.
- **FR-03: Destination Route Planning:** Users can add multiple ordered destination stops with city, country, arrival/departure dates, and notes.
- **FR-04: Daily Itinerary & Task Assignment:** Users can schedule day-by-day activities with time, location, estimated cost, and assign specific companions.
- **FR-05: Group Expense Tracking:** Users can record expenses categorized by type (Flights, Stays, Food, Transport) with payer designation.
- **FR-06: Collaborative Split & Debt Settlement:** System automatically computes per-person shares and produces a simplified "Who Owes Whom" transaction graph.
- **FR-07: Member Invitation & Role Delegation:** Trip Owner can invite registered users and assign scoped roles (Owner, Editor, Viewer).
- **FR-08: Activity Completion Tracking:** Collaborators can toggle itinerary activity completion status.

### B. Non-Functional Requirements (NFR)
- **NFR-01: Performance & Latency:** API response time P95 < 200ms under standard loads.
- **NFR-02: Availability:** System designed for 99.9% uptime with container health probes.
- **NFR-03: Data Integrity:** Financial split ledger must satisfy zero-sum conservation.
- **NFR-04: Usability:** Intuitive dark-mode UI with immediate visual feedback, responsive down to 360px mobile viewports.

### C. Security Requirements (SEC)
- **SEC-01 (Confidentiality):** Private trips are invisible and inaccessible to non-collaborators; passwords hashed with bcrypt (salt 10).
- **SEC-02 (Integrity):** All inputs sanitized against XSS; monetary values strictly verified positive numbers; SQLi/injection blocked.
- **SEC-03 (Availability):** Sliding-window rate limiters prevent brute-force login attempts and API denial of service.
- **SEC-04 (Authentication):** Stateless cryptographic JWT Bearer tokens with 24-hour expiration.
- **SEC-05 (Authorization):** Granular Role-Based Access Control (RBAC) preventing Broken Object-Level Authorization (BOLA/IDOR).
- **SEC-06 (Auditability):** Tamper-evident logging of all security-sensitive events (logins, role elevations, 403 blocks, deletions).

---

## 3. Requirements Prioritization (MoSCoW Matrix)

| Priority | Requirement ID | Requirement Description | CIA / Security Target |
|---|---|---|---|
| **Must Have** | REQ-01 | JWT Authentication & Bcrypt Password Encryption | Confidentiality & AuthN |
| **Must Have** | REQ-02 | Scoped RBAC Middleware (Owner, Editor, Viewer) | Authorization (AuthZ) |
| **Must Have** | REQ-03 | Trip Creation, Destination Routing, and Itinerary Scheduling | Integrity & Availability |
| **Must Have** | REQ-04 | Group Expense Logging & "Who Owes Whom" Split Algorithm | Integrity (Zero-Sum) |
| **Must Have** | REQ-05 | Immutable Security Event Audit Logger | Auditability |
| **Should Have** | REQ-06 | In-Memory Sliding Window Rate Limiting (Brute-Force Shield) | Availability |
| **Should Have** | REQ-07 | Multi-role Testing Persona Switcher in UI | Usability & Verification |
| **Could Have** | REQ-08 | Automated PDF/CSV Itinerary & Financial Export | Usability |
| **Won't Have (v1)** | REQ-09 | Direct Stripe/PayPal Payment Gateway Integration | Deferred to v2 |
