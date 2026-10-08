# Phase 9: Product Backlog and Jira / Scrum [7 Marks]

## 1. Product Backlog Architecture & Epic Breakdown
The TripMate Product Backlog is partitioned into 4 core functional and security Epics:
- **TM-EPIC-1: Core Identity, Authentication & Scoped Access Control** (JWT, Bcrypt salt 10, fine-grained RBAC middleware, brute-force rate limiting).
- **TM-EPIC-2: Trip Lifecycle & Destination Route Management** (Trip provisioning, multi-stop destination ordering, collaborator roles delegation).
- **TM-EPIC-3: Collaborative Itinerary Planning & Task Assignment** (Day-by-day scheduler, assignee delegation, completion status tracking).
- **TM-EPIC-4: Group Expense Ledger, Splitting & Debt Settlement** (Categorized expenditures, zero-sum split math, minimum-transfer debt matrix).

---

## 2. Formal User Stories Catalog (12 Stories)

| Story ID | Epic | User Story ('As a... I want... so that...') | Priority | Pts | Acceptance Criteria (Gherkin Format) |
|---|---|---|---|---|---|
| **TM-101** | EPIC-1 | **As a** traveler,<br>**I want to** register with my email and a strong password,<br>**So that** my travel data is securely isolated from other users. | Highest | 5 | **Given** a valid email and 8+ char password with upper/lower/digit,<br>**When** registration is submitted,<br>**Then** an account is created and password hashed with bcrypt (salt rounds = 10). |
| **TM-102** | EPIC-1 | **As a** registered traveler,<br>**I want to** log in with credentials and receive a signed JWT token,<br>**So that** I can authenticate API calls securely. | Highest | 3 | **Given** valid credentials,<br>**When** POST `/api/auth/login` is executed,<br>**Then** an HMAC-SHA256 JWT is issued with 24-hour expiration payload. |
| **TM-103** | EPIC-2 | **As a** trip organizer,<br>**I want to** create a new trip plan with title, dates, and budget,<br>**So that** I am designated as the trip Owner with full administrative control. | Highest | 5 | **Given** an authenticated user,<br>**When** creating a trip,<br>**Then** the trip is persisted and creator inserted into collaborators roster as `owner`. |
| **TM-104** | EPIC-1 | **As a** platform security architect,<br>**I want** fine-grained RBAC middleware (`requireTripRole`),<br>**So that** unauthorized mutation actions are blocked with HTTP 403 Forbidden. | Highest | 8 | **Given** a user with `viewer` role,<br>**When** attempting to mutate trip data,<br>**Then** server returns HTTP 403 Forbidden and logs security violation. |
| **TM-105** | EPIC-2 | **As a** trip planner,<br>**I want to** add multiple ordered destination stops,<br>**So that** the group route is clearly organized. | High | 3 | **Given** owner or editor role,<br>**When** adding destination stop,<br>**Then** stop is stored with sequential `orderIndex` and valid dates. |
| **TM-106** | EPIC-2 | **As a** trip owner,<br>**I want to** invite members and delegate Editor or Viewer roles,<br>**So that** companions can collaborate under least privilege. | High | 5 | **Given** trip owner,<br>**When** inviting registered traveler,<br>**Then** membership is saved and audit event `COLLABORATOR_INVITED` logged. |
| **TM-201** | EPIC-3 | **As an** editor or owner,<br>**I want to** schedule activities with times and locations,<br>**So that** the group has a clear daily itinerary. | High | 5 | **Given** owner or editor,<br>**When** adding activity,<br>**Then** item is saved under the specified day number. |
| **TM-202** | EPIC-3 | **As an** itinerary coordinator,<br>**I want to** assign specific activities to collaborators,<br>**So that** responsibilities are delegated. | Medium | 3 | **Given** verified trip collaborator,<br>**When** assigned to activity,<br>**Then** assignee avatar and name are displayed on activity card. |
| **TM-203** | EPIC-4 | **As a** group traveler,<br>**I want to** log shared expenses with category and payer,<br>**So that** group expenditures are accurately tracked. | Highest | 5 | **Given** positive currency amount,<br>**When** expense is submitted,<br>**Then** payer is credited and split group recorded. |
| **TM-204** | EPIC-4 | **As a** group member,<br>**I want** expenses split equally or custom among companions,<br>**So that** costs are fairly apportioned with cent precision. | Highest | 5 | **Given** total cost and N members,<br>**When** split is computed,<br>**Then** sum of individual debits equals total amount exactly (zero-sum). |
| **TM-205** | EPIC-4 | **As a** group,<br>**I want** an optimal "Who Owes Whom" debt settlement matrix,<br>**So that** debts can be resolved with minimum transfers. | High | 5 | **Given** net member balances,<br>**When** settlement summary is requested,<br>**Then** minimum transaction graph is generated. |
| **TM-206** | EPIC-1 | **As a** security auditor,<br>**I want** immutable audit logs for logins and role modifications,<br>**So that** platform actions are fully traceable. | High | 3 | **Given** security events,<br>**When** action occurs,<br>**Then** event record is stored with actor, IP, timestamp, and status. |

---

## 3. Jira Scrum Project Structure & Technical Tasks
Every Story contains concrete engineering Sub-tasks in Jira:
- **TM-101-1:** Implement Bcrypt password hashing utility with salt rounds = 10.
- **TM-101-2:** Build user registration REST endpoint & email uniqueness check.
- **TM-102-1:** Implement JWT signature verification with HMAC-SHA256.
- **TM-102-2:** Add login endpoint and credential validation with audit logging.
- **TM-103-1:** Implement trip creation controller and database schema.
- **TM-103-2:** Auto-insert trip owner into collaborators collection.
- **TM-104-1:** Write `requireTripRole` middleware with owner/editor/viewer checks.
- **TM-104-2:** Add unit tests for 403 Forbidden on privilege escalation.
- **TM-105-1:** Build destination CRUD endpoints with sequential `orderIndex`.
- **TM-106-1:** Implement collaborator invite endpoint with role validation.
- **TM-201-1:** Build itinerary item model and daily scheduling logic.
- **TM-202-1:** Implement collaborator assignment endpoint and UI badges.
- **TM-203-1:** Build expense creation controller with category tagging.
- **TM-204-1:** Implement zero-sum division and cent-rounding algorithm.
- **TM-205-1:** Implement greedy debt settlement algorithm ("Who Owes Whom").
- **TM-206-1:** Implement append-only tamper-evident audit logging stream.

---

## 4. Two Sprint Plans and Sprint Goals

### Sprint 1: Architecture, Authentication & Scoped Access Control
- **Duration:** 2 Weeks (10 Working Days).
- **Committed Scope:** Stories TM-101 through TM-106 (29 Story Points).
- **Sprint Goal:** *"Establish secure user authentication, trip creation, destination route planning, and fine-grained RBAC authorization foundation."*
- **Deliverables:** Working Auth API, Trip creation engine, Destination routing, RBAC middleware interceptor, 100% passing unit tests.

### Sprint 2: Collaboration, Dynamic Ledger & Secure Deployment
- **Duration:** 2 Weeks (10 Working Days).
- **Committed Scope:** Stories TM-201 through TM-206 (26 Story Points).
- **Sprint Goal:** *"Deliver collaborative itinerary scheduling, task delegation, group expense splitting engine, audit logging, and containerized deployment."*
- **Deliverables:** Itinerary planner, Task delegation, Expense splitting math, Settlement matrix, Audit sink, Docker multi-stage container.

---

## 5. Artifact Links
- **Jira CSV Import File:** [`jira_product_backlog_import.csv`](file:///C:/Users/tej30/Desktop/TripMate_Jira_and_Scrum_Deliverables/jira_product_backlog_import.csv)
- **Jira Setup Guide:** [`HOW_TO_IMPORT_INTO_JIRA.md`](file:///C:/Users/tej30/Desktop/TripMate_Jira_and_Scrum_Deliverables/HOW_TO_IMPORT_INTO_JIRA.md)
