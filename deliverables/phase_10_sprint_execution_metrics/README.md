# Phase 10: Sprint Execution and Scrum Metrics [7 Marks]

## 1. Scrum Board Workflow & Task Progression Evidence
The development workflow was governed by a 4-state Jira Scrum Board:
`[TO DO] ➔ [IN PROGRESS] ➔ [TESTING] ➔ [DONE]`

### Work-in-Progress (WIP) Limits:
- **TO DO:** Uncapped
- **IN PROGRESS:** WIP Limit = 4 (Prevents developer context switching)
- **TESTING:** WIP Limit = 3 (Ensures peer testing and automated CI checks are prioritized)
- **DONE:** Uncapped (Requires passing tests and peer signoff)

### Sprint 2 Task Progression Matrix (26 Story Points)

| Issue Key | Summary | Story Points | Day 1 | Day 4 | Day 7 | Day 10 (Final) | Transition Evidence |
|---|---|---|---|---|---|---|---|
| **TM-201** | Daily Itinerary Activity Scheduling | 5 | TO DO | IN PROGRESS | DONE | **DONE** | PR #14 merged; unit tests passed |
| **TM-202** | Task & Activity Assignment to Companions | 3 | TO DO | TESTING | DONE | **DONE** | Validated collaborator foreign key checks |
| **TM-203** | Group Expense Logging with Payer | 5 | TO DO | IN PROGRESS | TESTING | **DONE** | Verified category breakdown calculations |
| **TM-204** | Zero-Sum Group Split Engine | 5 | TO DO | TO DO | TESTING | **DONE** | Cent precision rounding verified ($100/3) |
| **TM-205** | Greedy Min-Transfer Debt Settlement | 5 | TO DO | TO DO | IN PROGRESS | **DONE** | Min-transaction graph passed 5-member tests |
| **TM-206** | Security Audit Trail & Telemetry | 3 | TO DO | TO DO | TESTING | **DONE** | Immutable append-only audit stream active |

---

## 2. Daily Scrum Log Entries (Three Documented Standups)

### Daily Scrum Entry 1 (Sprint 2 — Day 3)
- **Yesterday's Progress:** Completed REST endpoints for itinerary scheduling (`POST /api/trips/:tripId/itinerary`) and initial timeline styling.
- **Today's Plan:** Connect task assignment logic so only verified collaborators can be assigned tasks; begin expense logging schema.
- **Blockers / Impediments:** Orphan foreign-key risk if an assigned user is removed from the trip.
  - *Resolution:* Added nullable checks and cascade handler in `database.js` on collaborator deletion.

### Daily Scrum Entry 2 (Sprint 2 — Day 6)
- **Yesterday's Progress:** Built expense logging and category aggregation; initialized split ledger logic.
- **Today's Plan:** Implement Greedy Minimum-Transfer settlement algorithm ("Who Owes Whom") and write tests for zero-sum conservation.
- **Blockers / Impediments:** JavaScript floating-point division when splitting $100 three ways caused a 1-cent discrepancy ($33.33 * 3 = $99.99).
  - *Resolution:* Switched to integer cent arithmetic and applied 2-decimal cent rounding (`Math.round(amt * 100) / 100`).

### Daily Scrum Entry 3 (Sprint 2 — Day 9)
- **Yesterday's Progress:** Completed 11/11 automated unit and integration tests; audit logging operational.
- **Today's Plan:** Execute boundary fuzzing test suite against negative amounts, SQLi strings, and XSS payloads; prepare Docker container.
- **Blockers / Impediments:** Rapid automated test execution triggered the sliding window rate limiter (HTTP 429).
  - *Resolution:* Added environment check in `rateLimiter.js` to bypass rate limits when `NODE_ENV === 'test'`.

---

## 3. Sprint Burndown Chart & Trajectory Data
The Sprint Burndown Chart reflects ideal versus actual story points remaining across the 10-day sprint cycle:

| Sprint Day | Ideal Remaining (Pts) | Actual Remaining (Pts) | Activity Completed |
|---|---|---|---|
| **Day 1** | 26.0 | 26.0 | Sprint Planning; backlog grooming; tasks created |
| **Day 2** | 23.4 | 26.0 | Architecture setup; data models configured |
| **Day 3** | 20.8 | 21.0 | TM-201 Itinerary CRUD implemented |
| **Day 4** | 18.2 | 21.0 | Itinerary tests passed; TM-202 In Progress |
| **Day 5** | 15.6 | 18.0 | TM-202 Task assignment completed & verified |
| **Day 6** | 13.0 | 13.0 | TM-203 Expense logging engine merged |
| **Day 7** | 10.4 | 8.0 | TM-204 Zero-sum split engine verified |
| **Day 8** | 7.8 | 8.0 | Settlement algorithm under unit test suite |
| **Day 9** | 5.2 | 3.0 | TM-205 Debt matrix verified; TM-206 In Testing |
| **Day 10** | 0.0 | **0.0** | TM-206 Audit sink passed; Sprint review & 100% Done |

> **Visual Artifact:** [sprint_burndown_chart.drawio](file:///C:/Users/tej30/Desktop/TripMate_DrawIO_Diagrams/sprint_burndown_chart.drawio)

---

## 4. Scrum Velocity, Quality & Defect Metrics

| Metric | Sprint 1 Result | Sprint 2 Result | Project Aggregate |
|---|---|---|---|
| **Committed Story Points** | 29 Points | 26 Points | 55 Points |
| **Completed Story Points** | 29 Points | 26 Points | 55 Points |
| **Team Velocity** | **29 Points / Sprint** | **26 Points / Sprint** | **27.5 Points / Sprint** |
| **Defects Discovered** | 2 (BOLA IDOR vulnerability, Input null) | 1 (Rate limiter test block) | 3 Total Defects |
| **Defects Resolved in Sprint** | 2 Resolved | 1 Resolved | 3 Resolved |
| **Defects Carried Over to Next Sprint** | **0 Defects** | **0 Defects** | **0 Defects** |
| **Automated Test Pass Rate** | 100% (Unit & Integration) | 100% (Unit, Integration & Fuzzing) | 100% |

---

## 5. Sprint Review Outcome & Retrospective

### Sprint Review Outcome:
- Demonstrated live trip creation, day-by-day activity scheduling, collaborator invitations, and real-time expense calculations.
- Live demonstration showed that non-members and Viewers are blocked from mutating trip resources with HTTP 403 Forbidden.
- Stakeholders approved all 6 Sprint 2 User Stories for production release.

### Sprint Retrospective (Went Well, Needs Improvement, Action Items):
- **What Went Well:**
  1. Pair programming on complex algorithms (Greedy min-transfer settlement) prevented logical bugs.
  2. Strict adherence to WIP limits kept the team focused and prevented multitasking churn.
- **What Needs Improvement:**
  1. Integration tests initially failed due to rate limiter thresholds.
  2. Edge cases around floating-point math were caught late during sprint execution.
- **Actionable Improvement Actions:**
  1. **Action 1 (TDD for Boundary & Math Logic):** Mandate test-driven development for all numerical engines before implementing business logic.
  2. **Action 2 (CI/CD Pipeline Cache Optimization):** Cache Docker multi-stage layers and npm dependencies in GitHub Actions to reduce CI cycle time from 2.5 minutes to under 45 seconds.
