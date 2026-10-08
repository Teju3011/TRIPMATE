# Phase 3: Requirements Analysis and UML Modeling

## 1. UML Use Case Diagram Overview
The TripMate system model defines four key actors:
- **Trip Owner:** Primary administrator of specific travel itineraries with exclusive authority to invite, assign roles, transfer ownership, and delete trips.
- **Trip Editor:** Collaborative traveler with read/write access to destination stops, daily schedules, and group expenses.
- **Trip Viewer:** Companion or guest with read-only observation rights.
- **Security Auditor:** System administrator responsible for compliance monitoring, threat alerts, and immutable audit trails.

> **Diagram Artifact:** [use_case_diagram.svg](file:///C:/Users/tej30/.gemini/antigravity-ide/scratch/tripmate/deliverables/phase_03_requirements_analysis_uml/diagrams/use_case_diagram.svg)

---

## 2. Critical Use Case Specifications

### Use Case Specification 1: UC-01 Secure Trip Creation & Role Delegation

| Specification Field | Description |
|---|---|
| **Use Case ID & Name** | **UC-01: Secure Trip Creation & Role Delegation** |
| **Primary Actor** | Trip Owner |
| **Secondary Actor(s)** | Invited Collaborator (Editor/Viewer), Security Auditor |
| **Preconditions** | 1. User must be authenticated with a valid signed JWT.<br>2. Invited user must have an active registered account on TripMate. |
| **Trigger** | User submits the "+ New Trip" modal or executes POST `/api/trips/:tripId/collaborators`. |
| **Main Success Scenario** | 1. Owner creates trip with title, dates, budget, and privacy toggle.<br>2. System validates input schemas and stores trip in DB.<br>3. System registers Creator as `owner` in the collaborators ledger.<br>4. Owner invokes invitation for a registered traveler and selects role `editor` or `viewer`.<br>5. System verifies owner privilege via `requireTripRole(['owner'])`.<br>6. System stores collaborator membership mapping.<br>7. System logs `TRIP_CREATED` and `COLLABORATOR_INVITED` audit events.<br>8. UI updates member avatar stack and confirms action via toast notification. |
| **Alternative Flows** | **Alt-1 (Target User Not Found):** If entered email is not registered, system returns `404 Not Found` with actionable error message.<br>**Alt-2 (Collaborator Already Exists):** If target user is already a member, system returns `409 Conflict`. |
| **Exception Flows** | **Exc-1 (Unauthorized Role Escalation Attempt):** If a user with `editor` or `viewer` role attempts to invoke the invite endpoint, `requireTripRole` halts execution, returns `403 Forbidden`, and logs a `PRIVILEGE_VIOLATION_BLOCKED` security alert. |
| **Postconditions** | Trip created, membership established with scoped privileges, and security audit trail updated. |

---

### Use Case Specification 2: UC-02 Collaborative Expense Allocation & Debt Settlement

| Specification Field | Description |
|---|---|
| **Use Case ID & Name** | **UC-02: Collaborative Expense Allocation & Debt Settlement** |
| **Primary Actor** | Trip Editor / Trip Owner |
| **Secondary Actor(s)** | Trip Collaborators, Security Auditor |
| **Preconditions** | 1. User must possess `owner` or `editor` role on the active trip.<br>2. Trip must have at least one active collaborator. |
| **Trigger** | User submits the "Record Group Expense" form or requests GET `/settlement-summary`. |
| **Main Success Scenario** | 1. User enters expense title, amount, category, payer ID, and selects split members.<br>2. Validation middleware verifies that amount > 0 and title is non-empty.<br>3. RBAC middleware verifies caller possesses `['owner', 'editor']` privileges.<br>4. System computes individual shares (`amount / splitGroup.length`) with 2-decimal cent precision.<br>5. System executes atomic write to `expenses` collection.<br>6. System logs `EXPENSE_CREATED` with actor IP and timestamp.<br>7. Client queries `/settlement-summary`.<br>8. Reconciliation algorithm calculates net balances (Paid - Share) and executes Greedy Minimum-Transfer matching to eliminate circular debts.<br>9. UI displays simplified "Who Owes Whom" settlement cards. |
| **Alternative Flows** | **Alt-1 (Custom Split):** User manually deselects certain companions from the split checkbox group; system recalculates shares exclusively among checked members. |
| **Exception Flows** | **Exc-1 (Negative or Malformed Amount):** If client sends negative numbers (e.g., `-500`) or non-numeric strings, input validator rejects with `400 Bad Request`.<br>**Exc-2 (Viewer Mutation Attempt):** If user with `viewer` role attempts to add or delete expense, system returns `403 Forbidden` and records security event. |
| **Postconditions** | Group ledger updated, zero-sum financial balance conserved, and simplified settlement transfers computed. |

---

## 3. Scenario-Based Analysis Model: Collaborative Expense & Debt Settlement
The scenario-based analysis model captures the dynamic sequence of interactions between the Traveler Client, RBAC Authorization Interceptor, Core Trip & Expense Engine, and Persistence Store.

> **Diagram Artifact:** [scenario_analysis_model.svg](file:///C:/Users/tej30/.gemini/antigravity-ide/scratch/tripmate/deliverables/phase_03_requirements_analysis_uml/diagrams/scenario_analysis_model.svg)
