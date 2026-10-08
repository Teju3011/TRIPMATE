# Phase 4: Data & Information Flow Modeling

## 1. Entity-Relationship (ER) Data Model
The TripMate data layer is modeled with strict relational normalization (3NF) and referential integrity to enforce ownership boundaries and cascade operations.

### Core Entities & Attributes:
1. **USER:** `id` (PK), `email` (Unique), `passwordHash`, `name`, `role` (`user` / `admin`), `createdAt`.
2. **TRIP:** `id` (PK), `ownerId` (FK → USER.id), `title`, `description`, `startDate`, `endDate`, `budget`, `currency`, `isPrivate`, `createdAt`, `updatedAt`.
3. **COLLABORATOR (Join Entity):** `id` (PK), `tripId` (FK → TRIP.id), `userId` (FK → USER.id), `role` (`owner`, `editor`, `viewer`), `joinedAt`.
4. **DESTINATION:** `id` (PK), `tripId` (FK → TRIP.id), `name`, `city`, `country`, `arrivalDate`, `departureDate`, `orderIndex`, `notes`.
5. **ITINERARY_ITEM:** `id` (PK), `tripId` (FK → TRIP.id), `destinationId` (FK → DESTINATION.id), `assignedToUserId` (FK → USER.id), `dayNumber`, `time`, `title`, `location`, `estimatedCost`, `isCompleted`, `notes`.
6. **EXPENSE:** `id` (PK), `tripId` (FK → TRIP.id), `paidByUserId` (FK → USER.id), `title`, `amount`, `currency`, `category`, `splitType`, `splitWithUserIds` (JSON array of user IDs), `isSettled`, `receiptNote`, `createdAt`.
7. **AUDIT_LOG:** `id` (PK), `timestamp`, `actorId`, `actorEmail`, `action`, `resourceType`, `resourceId`, `status`, `ipAddress`, `details`.

> **Diagram Artifact:** [er_diagram.svg](file:///C:/Users/tej30/.gemini/antigravity-ide/scratch/tripmate/deliverables/phase_04_data_information_flow/diagrams/er_diagram.svg)

---

## 2. Data Flow Diagrams (DFD) & Trust Boundaries

### Level-0 Context DFD
Illustrates high-level boundaries between external entities (Trip Organizer, Co-Travelers, Security Auditor) and the central TripMate Collaborative Engine.

> **Diagram Artifact:** [dfd_level_0.svg](file:///C:/Users/tej30/.gemini/antigravity-ide/scratch/tripmate/deliverables/phase_04_data_information_flow/diagrams/dfd_level_0.svg)

### Level-1 DFD with Trust Boundaries
Decomposes the system into 5 distinct processes and 3 explicit trust boundaries:
- **Process 1.0 (Auth & RBAC Interceptor):** Validates incoming JWTs, enforces sliding rate limits, blocks unauthorized role escalations.
- **Process 2.0 (Trip & Route Manager):** Handles trip lifecycle and ordered destination routing.
- **Process 3.0 (Collaborative Itinerary Scheduler):** Manages activity scheduling and task assignment to members.
- **Process 4.0 (Expense & Debt Reconciliation):** Computes group shares and solves the "Who Owes Whom" minimum transfer matrix.
- **Process 5.0 (Security Audit Logger):** Dispatches asynchronous event entries to persistent storage.

### Demarcated Trust Boundaries:
1. **Trust Boundary 1 (Client / Untrusted Internet to DMZ / Reverse Proxy):**
   - Separates untrusted web clients from the Express application gateway.
   - Mitigations: HTTPS / TLS 1.3, CSP headers, XSS sanitization, rate limiting.
2. **Trust Boundary 2 (API Gateway / Auth Interceptor to Core Business Services):**
   - Separates unauthenticated request streams from internal business domain handlers.
   - Mitigations: Mandatory JWT signature verification, scope checking, `requireTripRole` enforcement.
3. **Trust Boundary 3 (Application Runtime to Persistent Database & Audit Store):**
   - Protects internal JSON/SQL database and audit records from direct external manipulation.
   - Mitigations: Atomic writes via temporary files, parameter binding, non-root OS file permissions.

> **Diagram Artifact:** [dfd_level_1_trust_boundaries.svg](file:///C:/Users/tej30/.gemini/antigravity-ide/scratch/tripmate/deliverables/phase_04_data_information_flow/diagrams/dfd_level_1_trust_boundaries.svg)

---

## 3. Consistency Mapping Across Use Case, ER, and DFD Models

| Use Case (Phase 3) | Primary Entity (ER Model) | DFD Process (Level-1) | Applied Trust Boundary |
|---|---|---|---|
| **UC-01: Create Trip & Role Delegation** | `TRIP`, `COLLABORATOR` | Process 1.0 & Process 2.0 | Boundary 1 & Boundary 2 |
| **UC-02: Expense Split & Debt Settlement** | `EXPENSE`, `USER` | Process 4.0 | Boundary 2 |
| **UC-04: Schedule Itinerary & Tasks** | `ITINERARY_ITEM`, `DESTINATION` | Process 3.0 | Boundary 2 |
| **UC-08: Security Audit Inspection** | `AUDIT_LOG` | Process 5.0 | Boundary 2 & Boundary 3 |
