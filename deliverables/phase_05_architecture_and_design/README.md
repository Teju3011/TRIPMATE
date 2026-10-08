# Phase 5: Software Architecture & Design Engineering

## 1. Architectural Style Selection & Justification
For TripMate, we have adopted a **Layered Clean Architecture** combined with a **Micro-Modular REST API Gateway Pattern**.

### Architectural Justification:
1. **Separation of Concerns:** Clearly decouples HTTP transport parsing, authorization policy enforcement, business calculation logic, and persistence mechanics.
2. **Security by Isolation (Defense-in-Depth):** Placing the Security Interceptor Layer in front of domain handlers guarantees that no request reaches trip data without prior token verification, rate checking, and role scoping.
3. **High Cohesion & Low Coupling:** Financial split calculation operates independently of presentation details, allowing straightforward unit testing and future microservice extraction.

---

## 2. Four Applicable Design Patterns

### 1. Interceptor / Decorator Pattern (Middleware Chain)
- **Role in TripMate:** Implemented via Express middleware (`authenticate`, `requireTripRole`, `apiLimiter`, `securityHeaders`).
- **Mechanism:** Dynamically wraps incoming HTTP requests, intercepts unauthorized requests (e.g., Viewer attempting to mutate data), attaches contextual claims, and logs security violations before execution reaches route controllers.

### 2. Repository Pattern (Persistence Abstraction)
- **Role in TripMate:** Implemented in `src/db/database.js` (`DatabaseEngine`).
- **Mechanism:** Provides a standardized CRUD collection interface (`find`, `findOne`, `insert`, `update`, `delete`, `persist`) isolating upper business layers from the underlying storage technology (JSON file atomic writes, SQLite, or PostgreSQL).

### 3. Factory / Strategy Pattern (Expense Split Strategy)
- **Role in TripMate:** Implemented in `src/routes/expenseRoutes.js`.
- **Mechanism:** Dynamically resolves split calculation strategies based on user selection:
  - *Equal Split Strategy:* Splits evenly across all active trip collaborators (`total / N`).
  - *Targeted Group Strategy:* Splits exclusively across a custom subset of designated travelers.
  - *Greedy Debt Minimization Solver:* Reconciles debtor-creditor balances into minimum required settlement transfers.

### 4. Observer / Event-Driven Logger Pattern (Security Telemetry)
- **Role in TripMate:** Implemented via `db.logAudit()`.
- **Mechanism:** Asynchronously observes sensitive operations throughout the request lifecycle (logins, role updates, deletions, 403 authorization denials) and publishes immutable event records to the audit ledger without impeding main-thread request latency.

---

## 3. Component Mapping & Service Interfaces

| System Concern | Responsible Component / File | Public Interface / Methods | Key Responsibilities |
|---|---|---|---|
| **Authentication & Identity** | `src/routes/authRoutes.js`<br>`src/middleware/authMiddleware.js` | `POST /api/auth/register`<br>`POST /api/auth/login`<br>`GET /api/auth/me` | Validates credentials, executes bcrypt salt verification, issues signed JWTs. |
| **Trip Lifecycle Management** | `src/routes/tripRoutes.js`<br>`src/routes/destinationRoutes.js` | `GET /api/trips`<br>`POST /api/trips`<br>`PUT /api/trips/:id`<br>`DELETE /api/trips/:id` | Enforces owner-only deletion, manages ordered destination stops. |
| **Collaboration & RBAC** | `src/middleware/rbacMiddleware.js`<br>`src/routes/collaboratorRoutes.js` | `requireTripRole(roles)`<br>`POST /:tripId/collaborators`<br>`PUT /:tripId/collaborators/:uid` | Validates trip membership, enforces Owner/Editor/Viewer access rules. |
| **Itinerary Scheduling** | `src/routes/itineraryRoutes.js` | `POST /:tripId/itinerary`<br>`PATCH /:tripId/itinerary/:id/status` | Manages day-by-day plans, maps activity assignments to companions. |
| **Expense & Debt Reconciliation** | `src/routes/expenseRoutes.js` | `POST /:tripId/expenses`<br>`GET /:tripId/expenses/settlement-summary` | Validates positive amounts, executes greedy debt minimization. |
| **Security Audit Logging** | `src/routes/auditRoutes.js`<br>`src/db/database.js` | `db.logAudit(event)`<br>`GET /api/audit/trips/:tripId` | Records tamper-evident audit entries, exposes filtered logs to owners and admins. |

> **Diagram Artifact:** [software_architecture.svg](file:///C:/Users/tej30/.gemini/antigravity-ide/scratch/tripmate/deliverables/phase_05_architecture_and_design/diagrams/software_architecture.svg)
