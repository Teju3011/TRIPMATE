# Phase 1: Agile Process & Development Approach

## 1. Executive Summary & Agile Framework Selection
For **TripMate**, a collaborative travel-planning application requiring fine-grained access control, shared-resource authorization, privacy, and secure financial expense tracking, we have selected a hybrid Agile framework: **Scrum combined with Extreme Programming (XP) engineering practices**.

### Justification of Approach
1. **Scrum for Cadence and Predictability:**
   - Two-week sprint cycles enable iterative delivery of core functionality (Trip Creation → Destination Routing → Itinerary Scheduling → Group Expense Allocation → Role Delegation).
   - Timeboxed ceremonies (Sprint Planning, Daily Scrums, Sprint Reviews, and Retrospectives) provide clear alignment among cross-functional developers, security auditors, and product owners.
2. **Extreme Programming (XP) for Security-Critical Engineering Rigor:**
   - **Test-Driven Development (TDD):** Every authorization rule (RBAC middleware, BOLA defenses, and zero-sum expense math) is authored test-first to prevent security regression.
   - **Continuous Integration (CI):** Automated linting, SAST vulnerability scanning (`npm audit`), and boundary fuzzing run on every git commit.
   - **Pair Programming & Peer Code Reviews:** Crucial for sensitive cryptographic logic (bcrypt salts, JWT issuance, and rate limiting).
   - **Refactoring Mercilessly:** Continuous restructuring of authorization checks to maintain clean, decoupled code without security debt.

---

## 2. Mapping of Agile Manifesto Principles to TripMate

| # | Agile Manifesto Principle | TripMate Project Implementation & Security Mapping |
|---|---|---|
| **1** | *"Our highest priority is to satisfy the customer through early and continuous delivery of valuable software."* | TripMate delivers functional, secure increments: travelers immediately gain trip organization value in Sprint 1, followed by group splitting in Sprint 2. |
| **2** | *"Welcome changing requirements, even late in development. Agile processes harness change for the customer's competitive advantage."* | Travel parameters (destinations, dates, expense splits) evolve dynamically. TripMate's schema and REST endpoints accommodate new collaborators and currency splits without architectural rewrites. |
| **3** | *"Deliver working software frequently, from a couple of weeks to a couple of months, with a preference to the shorter timescale."* | Deploying production-ready Docker containers and automated Kubernetes manifests every two weeks with automated liveness and readiness verification. |
| **4** | *"Business people and developers must work together daily throughout the project."* | Security auditors, trip planners, and software engineers review access control policies and privacy controls daily during Standups and Backlog Refinement. |
| **5** | *"Working software is the primary measure of progress."* | Success is measured not merely by documentation, but by an active, runnable Node.js/Express service enforcing RBAC with zero failing unit, integration, or fuzzing tests. |

---

## 3. Two Refactoring Opportunities (Structure & Code)

### Refactoring Opportunity 1: Broken Object-Level Authorization (BOLA/IDOR) Defense
- **Before:** Route handlers directly queried and updated trips based solely on URL parameter `tripId` without validating if the calling JWT user had an active membership role in that specific trip.
- **After:** Extracted a dedicated declarative middleware `requireTripRole(['owner', 'editor', 'viewer'])` that validates membership, attaches scoped role context, and logs unauthorized access attempts to the immutable audit trail.
- *(See `refactoring_evidence.md` for full before/after code diffs and security analysis).*

### Refactoring Opportunity 2: Financial Split Floating-Point Drift
- **Before:** Standard IEEE 754 floating-point division was used directly in group expense splitting, causing fractional-cent truncation errors and breaking the zero-sum ledger balance constraint.
- **After:** Refactored into a high-precision rounded currency engine and implemented a Greedy Minimum Transaction Settlement algorithm ("Who Owes Whom") ensuring strict financial conservation.

---

## 4. Limitations and Risks of Agile for Security-Critical Systems & Mitigations

### Risk 1: "Security Debt" Accumulation Due to Fast-Paced Feature Velocity
- **Description:** Agile teams under pressure to deliver user stories may treat security requirements (input sanitization, CSRF tokens, rate limiting) as non-urgent back-burner tasks.
- **Mitigation:** Integrate **"Security Definition of Done" (DoD)** into every Jira user story. A user story cannot be marked as "DONE" without passing automated SAST scanning, unit test authorization checks, and zero high/critical vulnerabilities.

### Risk 2: Architectural Drift and Broken Trust Boundaries
- **Description:** Incremental development can lead to ad-hoc API endpoints that accidentally bypass central authentication gateways or expose private data.
- **Mitigation:** Mandate **Sprint-Level Threat Modeling**. Any new epic (such as collaborator invitations or debt settlement) requires updating the DFD Trust Boundary matrix before implementation commences.
