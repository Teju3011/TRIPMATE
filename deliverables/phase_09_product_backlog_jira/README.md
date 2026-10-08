# Phase 9: Product Backlog & Jira / Scrum Engineering

## 1. Product Backlog Structure & Epics
The TripMate Product Backlog is partitioned into 4 core Epics representing distinct business and architectural domains:

1. **EPIC-1: Core Identity, Authentication & Access Control** (JWT, Bcrypt, RBAC Interceptor, Rate Limiting).
2. **EPIC-2: Trip Lifecycle & Destination Routing** (Trip creation, privacy settings, destination sequence mapping).
3. **EPIC-3: Collaborative Itinerary & Task Delegation** (Day-by-day scheduler, companion task assignment, status toggles).
4. **EPIC-4: Group Expense Engine & Debt Settlement** (Category expense logging, zero-sum split math, "Who Owes Whom" graph).

---

## 2. User Stories Catalog (12 Detailed User Stories)

| Story ID | Epic | User Story (Standard Format) | Priority | Story Pts | Acceptance Criteria (Gherkin Format) |
|---|---|---|---|---|---|
| **STORY-101** | EPIC-1 | **As a** traveler,<br>**I want to** register with my email and a strong password,<br>**So that** my travel data is securely isolated. | Highest | 5 | **Given** valid email and 8+ char password with upper/lower/digit,<br>**When** registration is submitted,<br>**Then** user is created and password hashed with bcrypt (salt 10). |
| **STORY-102** | EPIC-1 | **As a** registered traveler,<br>**I want to** log in with credentials and receive a JWT,<br>**So that** I can authenticate API requests. | Highest | 3 | **Given** valid credentials,<br>**When** POST `/api/auth/login` is executed,<br>**Then** a signed JWT token is issued with 24h expiration. |
| **STORY-103** | EPIC-2 | **As a** trip organizer,<br>**I want to** create a new trip plan with title, dates, and budget,<br>**So that** I become the designated trip Owner. | Highest | 5 | **Given** authenticated user,<br>**When** trip is created,<br>**Then** creator is automatically assigned `owner` role in collaborators ledger. |
| **STORY-104** | EPIC-1 | **As a** security architect,<br>**I want** fine-grained RBAC middleware (`requireTripRole`),<br>**So that** unauthorized actions are blocked with 403. | Highest | 8 | **Given** user with `viewer` role,<br>**When** attempting to mutate trip data,<br>**Then** server returns HTTP 403 Forbidden and logs security violation. |
| **STORY-105** | EPIC-2 | **As a** trip planner,<br>**I want to** add multiple ordered destination stops,<br>**So that** our route is clearly organized. | High | 3 | **Given** owner or editor role,<br>**When** adding destination stop,<br>**Then** destination is stored in sequential `orderIndex` order. |
| **STORY-106** | EPIC-2 | **As a** trip owner,<br>**I want to** invite members and delegate Editor or Viewer roles,<br>**So that** companions can collaborate securely. | High | 5 | **Given** trip owner,<br>**When** inviting registered traveler,<br>**Then** membership is stored and audit event `COLLABORATOR_INVITED` logged. |
| **STORY-201** | EPIC-3 | **As an** editor,<br>**I want to** schedule activities with times and locations,<br>**So that** the group has a clear daily itinerary. | High | 5 | **Given** owner or editor,<br>**When** adding activity,<br>**Then** item is saved under specified day number. |
| **STORY-202** | EPIC-3 | **As an** itinerary planner,<br>**I want to** assign specific activities to collaborators,<br>**So that** responsibilities are delegated. | Medium | 3 | **Given** verified trip collaborator,<br>**When** assigned to activity,<br>**Then** assignee avatar and name are displayed on activity card. |
| **STORY-203** | EPIC-4 | **As a** traveler,<br>**I want to** log shared expenses with category and payer,<br>**So that** group spending is accurately tracked. | Highest | 5 | **Given** positive currency amount,<br>**When** expense is submitted,<br>**Then** payer is credited and split group recorded. |
| **STORY-204** | EPIC-4 | **As a** group member,<br>**I want** expenses split equally or custom among companions,<br>**So that** costs are fairly apportioned. | Highest | 5 | **Given** total cost and N members,<br>**When** split is computed,<br>**Then** sum of individual debits equals total amount exactly (zero-sum). |
| **STORY-205** | EPIC-4 | **As a** group,<br>**I want** an optimal "Who Owes Whom" debt settlement matrix,<br>**So that** debts can be resolved with minimum transfers. | High | 5 | **Given** net member balances,<br>**When** settlement summary is requested,<br>**Then** minimum transaction graph is generated. |
| **STORY-206** | EPIC-1 | **As a** security auditor,<br>**I want** immutable audit logs for logins and role modifications,<br>**So that** platform actions are fully traceable. | High | 3 | **Given** security events,<br>**When** action occurs,<br>**Then** event record is stored with actor, IP, timestamp, and status. |

---

## 3. Sprint Division & Sprint Goals

### Sprint 1 (Duration: 2 Weeks · Committed: 29 Story Points)
- **Included Stories:** STORY-101, STORY-102, STORY-103, STORY-104, STORY-105, STORY-106.
- **Sprint 1 Goal:** *"Establish secure user authentication, trip creation, destination route planning, and fine-grained RBAC authorization foundation."*

### Sprint 2 (Duration: 2 Weeks · Committed: 26 Story Points)
- **Included Stories:** STORY-201, STORY-202, STORY-203, STORY-204, STORY-205, STORY-206.
- **Sprint 2 Goal:** *"Deliver collaborative itinerary scheduling, task delegation, group expense splitting engine, audit logging, and containerized deployment."*

---

## 4. Jira Project Configuration Artifact
A fully compatible Jira CSV import file has been generated at:
> **Artifact File:** [jira_product_backlog_import.csv](file:///C:/Users/tej30/.gemini/antigravity-ide/scratch/tripmate/deliverables/phase_09_product_backlog_jira/jira_product_backlog_import.csv)
*(Can be imported directly into Atlassian Jira via External System Import → CSV).*
