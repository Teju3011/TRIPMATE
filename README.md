# TripMate — Collaborative Travel Planning Application

TripMate is a secure, collaborative travel planning application designed with an emphasis on **fine-grained access control**, **shared-resource authorization (RBAC)**, **privacy preservation**, and **tamper-evident audit logging**.

---

## 🚀 Key Functional Capabilities

- **Create Trips:** Define custom trips with titles, multi-currency budgets, dates, descriptions, and strict privacy controls.
- **Add Destinations:** Plan ordered travel routes with cities, countries, arrival/departure schedules, and local notes.
- **Create Collaborative Itineraries:** Schedule daily activities, set estimated costs, toggle completion checkoffs, and assign specific companions to tasks.
- **Track Expenses & Split Bills:** Record expenses across categories (Flights, Stays, Food, Transport) with multiple payers and equal/custom splits.
- **Reconcile Group Debts ("Who Owes Whom"):** Automated Greedy Minimum-Transfer algorithm generates optimal debt settlement transfers with zero-sum conservation.
- **Share & Delegate Roles:** Invite registered companions and delegate permissions:
  - 👑 **Owner:** Full administrative authority (manage trips, delegate roles, transfer ownership, cascade delete).
  - ✏️ **Editor:** Contributor access (add/edit destinations, activities, expenses; cannot delete trip or change roles).
  - 👁️ **Viewer:** Read-only observation access (UI mutating buttons locked; API returns `403 Forbidden` on mutation).
- **Security Audit Trail:** Immutable log of authentication events, role changes, trip deletions, and blocked IDOR attempts.

---

## 🏃 Quick Start & Local Execution

### 1. Prerequisites
- Node.js v18+ (tested on Node v22.17.1)
- Python 3.10+ (for boundary fuzz testing suite)

### 2. Start Application
```bash
# Navigate to project directory
cd tripmate

# Install dependencies (0 vulnerabilities)
npm install

# Start the web engine
npm start
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 👥 Preloaded Evaluation Personas
The application includes a **Fast Persona Switcher** in the top navigation bar so you can immediately experience and verify the Role-Based Access Control:

1. **👑 Alice Chen** (`alice@tripmate.io` / `SecurePass123!`): **Trip Owner** on *"Swiss Alps Odyssey"*. Can edit, delete, invite, and change roles.
2. **✏️ Bob Smith** (`bob@tripmate.io` / `SecurePass123!`): **Trip Editor** on *"Swiss Alps Odyssey"*. Can add activities and expenses; cannot delete trip or change roles.
3. **👁️ Charlie Davis** (`charlie@tripmate.io` / `SecurePass123!`): **Trip Viewer** on *"Swiss Alps Odyssey"*. Read-only mode: mutating buttons are visually disabled with padlock cues, and API enforces `403 Forbidden` on mutation attempts.
4. **🛡️ Security Admin** (`admin@tripmate.io` / `AdminPass123!`): System Auditor with access to system-wide audit telemetry.

---

## 🧪 Automated Testing & Verification

```bash
# Run 11 Automated Unit & Integration Tests (RBAC, BOLA/IDOR, Zero-Sum Split, Bcrypt)
npm test

# Run Input Boundary Fuzzing Suite (13 Probes: SQLi, XSS, Negative Numbers, Buffer Stress)
npm run test:fuzz
```

---

## 🐳 Containerization & Kubernetes

```bash
# Docker Build & Run (Non-root user UID 10001, minimal Alpine runtime)
docker build -t tripmate:1.0.0 .
docker run -p 3000:3000 tripmate:1.0.0

# Docker Compose
docker compose up -d

# Kubernetes / Minikube Manifests
kubectl apply -f k8s/k8s-full-stack.yaml
```

---

## 📁 Engineering Deliverables (Phases 1 — 16)
As requested, all 16 academic and professional software engineering deliverables are organized inside dedicated repository folders rather than displayed on the consumer web interface:

- **[Phase 1: Agile Process & Approach](deliverables/phase_01_agile_approach/)** — Scrum + XP, 5 Manifesto principles, refactorings, risks & mitigations.
- **[Phase 2: Requirements Engineering](deliverables/phase_02_requirements_engineering/)** — Personas, Functional/NFR/Security specs, MoSCoW, complete SRS table.
- **[Phase 3: Requirements Analysis & UML](deliverables/phase_03_requirements_analysis_uml/)** — Use Case diagram, UC-01 & UC-02 specs, scenario analysis model.
- **[Phase 4: Data & Information Flow](deliverables/phase_04_data_information_flow/)** — ER diagram, Level-0 DFD, Level-1 DFD with 3 Trust Boundaries.
- **[Phase 5: Architecture & Design](deliverables/phase_05_architecture_and_design/)** — Layered Clean Architecture, 4 design patterns, component mappings.
- **[Phase 6: User Interface Design](deliverables/phase_06_ui_design/)** — 4 screen wireframes, Shneiderman's 8 Golden Rules evaluation.
- **[Phase 7: Threat Modeling (STRIDE)](deliverables/phase_07_threat_modeling_stride/)** — 8 CIA assets, 12 STRIDE threats, information flow analysis, 6 vulnerabilities.
- **[Phase 8: Attack Tree & Refinement](deliverables/phase_08_attack_tree_refinement/)** — AND/OR attack tree, preventive/detective controls, refined architecture.
- **[Phase 9: Product Backlog & Jira](deliverables/phase_09_product_backlog_jira/)** — 12 User Stories, 4 Epics, 2 Sprints, importable Jira CSV file.
- **[Phase 10: Sprint Execution & Metrics](deliverables/phase_10_sprint_execution_metrics/)** — 4-column Scrum board, daily scrums, burndown chart, velocity, retrospective.
- **[Phase 11: Secure Build Environment](deliverables/phase_11_secure_build_environment/)** — GitFlow model, 5 secure controls, secret management, SAST audit report.
- **[Phase 12: Secure Coding & Refactoring](deliverables/phase_12_secure_coding_refactoring/)** — Auth & RBAC source code, 2 vulnerabilities refactored with before/after diffs.
- **[Phase 13: Docker & Kubernetes](deliverables/phase_13_docker_kubernetes/)** — Multi-stage Dockerfile, 4 container controls, k8s SecurityContext, NetworkPolicy.
- **[Phase 14: CI/CD & Security Testing](deliverables/phase_14_cicd_security_testing/)** — 4-stage GitHub Actions pipeline, unit/integration results, fuzz test report, defect record.
- **[Phase 15: Logging, Monitoring & Hardening](deliverables/phase_15_logging_monitoring_hardening/)** — 7 logged events, 5 alerting metrics, OS/Node/K8s hardening checklist.
- **[Phase 16: Final Security Review](deliverables/phase_16_final_security_review/)** — 11-stage critical requirement traceability matrix, top 3 risks, roadmap.
- **[Master Capstone Document](docs/TripMate_Master_Engineering_Document.md)** — Comprehensive master engineering document.
