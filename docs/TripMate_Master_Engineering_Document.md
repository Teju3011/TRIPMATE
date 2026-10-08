# TripMate — Master Software Engineering & Security Capstone Document

**Project Name:** TripMate — Collaborative Travel Planning Application  
**Security Focus:** Access Control, Shared-Resource Authorization (RBAC), Privacy Preservation, and Secure Collaboration  
**Author / Engineering Team:** TripMate Core DevSecOps Team  
**Specification Standard:** Full 16-Phase Integrated Agile & Security Development Lifecycle  

---

## Table of Contents
1. [Phase 1: Agile Process & Development Approach](#phase-1-agile-process--development-approach)
2. [Phase 2: Requirements Engineering](#phase-2-requirements-engineering)
3. [Phase 3: Requirements Analysis & UML Modeling](#phase-3-requirements-analysis--uml-modeling)
4. [Phase 4: Data & Information Flow Modeling](#phase-4-data--information-flow-modeling)
5. [Phase 5: Software Architecture & Design Engineering](#phase-5-software-architecture--design-engineering)
6. [Phase 6: User Interface Design & Golden Rules](#phase-6-user-interface-design--golden-rules)
7. [Phase 7: Threat Modeling & Security Analysis (STRIDE)](#phase-7-threat-modeling--security-analysis-stride)
8. [Phase 8: Attack Tree & Security Architecture Refinement](#phase-8-attack-tree--security-architecture-refinement)
9. [Phase 9: Product Backlog & Jira / Scrum Setup](#phase-9-product-backlog--jira--scrum-setup)
10. [Phase 10: Sprint Execution & Scrum Metrics](#phase-10-sprint-execution--scrum-metrics)
11. [Phase 11: Secure Development & Build Environment](#phase-11-secure-development--build-environment)
12. [Phase 12: Secure Coding & Refactoring Evidence](#phase-12-secure-coding--refactoring-evidence)
13. [Phase 13: Containerized Development (Docker & Kubernetes)](#phase-13-containerized-development-docker--kubernetes)
14. [Phase 14: CI/CD Pipeline & Security / Fuzz Testing](#phase-14-cicd-pipeline--security--fuzz-testing)
15. [Phase 15: Logging, Monitoring, Hardening & Secure Deployment](#phase-15-logging-monitoring-hardening--secure-deployment)
16. [Phase 16: Final Security Review & Traceability Matrix](#phase-16-final-security-review--traceability-matrix)

---

## Executive Summary
**TripMate** is a production-grade, collaborative travel-planning platform engineered from the ground up with defense-in-depth security principles. It empowers groups of travelers to:
- **Create and customize trips** (dates, multi-currency budgets, descriptions, cover styles, privacy toggles).
- **Map ordered destination routes** (cities, countries, arrival/departure dates, notes).
- **Schedule collaborative daily itineraries** (time slots, locations, costs, activity completion checkoffs, and task assignments to companions).
- **Track group expenses and calculate splits** (category breakdowns, multi-payer support, equal/custom splits, receipt notes).
- **Reconcile group debts** via a Greedy Minimum-Transfer transaction solver ("Who Owes Whom").
- **Share trips and delegate roles** (fine-grained RBAC: **Owner**, **Editor**, **Viewer**).
- **Enforce comprehensive security controls:** Broken Object-Level Authorization (BOLA/IDOR) defenses, in-memory sliding-window rate limiting, input sanitization against XSS, and tamper-evident audit logging.

Crucially, **all 16 academic and professional engineering deliverables are neatly partitioned inside the repository's dedicated `deliverables/` directories** without cluttering the traveler-facing web interface.

---

## Summary of All 16 Deliverable Folders

| Phase | Phase Name | Primary Deliverable Artifacts | Location Link |
|---|---|---|---|
| **Phase 1** | Agile Process & Development Approach | Methodology justification, 5 Manifesto mappings, refactoring evidence, limitations & mitigations | [deliverables/phase_01_agile_approach](file:///C:/Users/tej30/.gemini/antigravity-ide/scratch/tripmate/deliverables/phase_01_agile_approach) |
| **Phase 2** | Requirements Engineering | User personas, Functional/NFR/Security specs, MoSCoW prioritization, complete SRS table | [deliverables/phase_02_requirements_engineering](file:///C:/Users/tej30/.gemini/antigravity-ide/scratch/tripmate/deliverables/phase_02_requirements_engineering) |
| **Phase 3** | Requirements Analysis & UML | UML Use Case Diagram, UC-01 & UC-02 detailed specs, Scenario analysis model | [deliverables/phase_03_requirements_analysis_uml](file:///C:/Users/tej30/.gemini/antigravity-ide/scratch/tripmate/deliverables/phase_03_requirements_analysis_uml) |
| **Phase 4** | Data & Information Flow Modeling | ER Diagram, Level-0 DFD, Level-1 DFD with 3 Trust Boundaries, Consistency mapping | [deliverables/phase_04_data_information_flow](file:///C:/Users/tej30/.gemini/antigravity-ide/scratch/tripmate/deliverables/phase_04_data_information_flow) |
| **Phase 5** | Software Architecture & Design | Layered Clean Architecture, 4 Design Patterns (Interceptor, Repository, Factory, Observer), Component mapping | [deliverables/phase_05_architecture_and_design](file:///C:/Users/tej30/.gemini/antigravity-ide/scratch/tripmate/deliverables/phase_05_architecture_and_design) |
| **Phase 6** | User Interface Design | 4 screen wireframes (Login, Dashboard, Itinerary, Expenses), Shneiderman's 8 Golden Rules | [deliverables/phase_06_ui_design](file:///C:/Users/tej30/.gemini/antigravity-ide/scratch/tripmate/deliverables/phase_06_ui_design) |
| **Phase 7** | Threat Modeling & STRIDE | 8 CIA assets, 12 STRIDE threats, Information Flow Analysis for 3 assets, 6 vulnerability analyses | [deliverables/phase_07_threat_modeling_stride](file:///C:/Users/tej30/.gemini/antigravity-ide/scratch/tripmate/deliverables/phase_07_threat_modeling_stride) |
| **Phase 8** | Attack Tree & Refinement | Root attacker goal, AND/OR Attack Tree, Preventive & Detective controls, Refined architecture | [deliverables/phase_08_attack_tree_refinement](file:///C:/Users/tej30/.gemini/antigravity-ide/scratch/tripmate/deliverables/phase_08_attack_tree_refinement) |
| **Phase 9** | Product Backlog & Jira | 12 User Stories, 4 Epics, Acceptance criteria, 2 Sprint plans, Importable Jira CSV | [deliverables/phase_09_product_backlog_jira](file:///C:/Users/tej30/.gemini/antigravity-ide/scratch/tripmate/deliverables/phase_09_product_backlog_jira) |
| **Phase 10** | Sprint Execution & Metrics | Scrum Board (To Do → In Progress → Testing → Done), Daily Scrum logs, Burndown chart, Velocity, Retrospective | [deliverables/phase_10_sprint_execution_metrics](file:///C:/Users/tej30/.gemini/antigravity-ide/scratch/tripmate/deliverables/phase_10_sprint_execution_metrics) |
| **Phase 11** | Secure Build Environment | GitFlow branching, 5 secure development controls, secret management validation, automated SAST scan report | [deliverables/phase_11_secure_build_environment](file:///C:/Users/tej30/.gemini/antigravity-ide/scratch/tripmate/deliverables/phase_11_secure_build_environment) |
| **Phase 12** | Secure Coding & Refactoring | Auth & RBAC source code, 2 vulnerabilities refactored, side-by-side diffs, security justification | [deliverables/phase_12_secure_coding_refactoring](file:///C:/Users/tej30/.gemini/antigravity-ide/scratch/tripmate/deliverables/phase_12_secure_coding_refactoring) |
| **Phase 13** | Docker & Kubernetes | Multi-stage Dockerfile, 4 container security practices, k8s manifests, SecurityContext, NetworkPolicy | [deliverables/phase_13_docker_kubernetes](file:///C:/Users/tej30/.gemini/antigravity-ide/scratch/tripmate/deliverables/phase_13_docker_kubernetes) |
| **Phase 14** | CI/CD & Security Testing | GitHub Actions 4-stage pipeline, 11 automated unit & integration tests, 13 fuzz probes, defect report | [deliverables/phase_14_cicd_security_testing](file:///C:/Users/tej30/.gemini/antigravity-ide/scratch/tripmate/deliverables/phase_14_cicd_security_testing) |
| **Phase 15** | Logging, Monitoring & Hardening | 7 security audit events cataloged, 5 metrics & alerts, OS/Node/K8s hardening checklist, deployment gates | [deliverables/phase_15_logging_monitoring_hardening](file:///C:/Users/tej30/.gemini/antigravity-ide/scratch/tripmate/deliverables/phase_15_logging_monitoring_hardening) |
| **Phase 16** | Final Security Review | 11-stage critical requirement traceability chain, top 3 highest-risk controls, future security roadmap | [deliverables/phase_16_final_security_review](file:///C:/Users/tej30/.gemini/antigravity-ide/scratch/tripmate/deliverables/phase_16_final_security_review) |

---

## Application Verification Commands
To execute and verify all components locally:

```bash
# 1. Install dependencies (verified 0 vulnerabilities)
npm install

# 2. Run automated Unit & Integration Test suites (11 tests pass)
npm test

# 3. Run Input Boundary Fuzzing Suite (13 edge-case probes pass)
npm run test:fuzz

# 4. Start Local Development Server
npm start
# -> Access at: http://localhost:3000

# 5. Build and run Docker Container
docker build -t tripmate:1.0.0 .
docker run -p 3000:3000 tripmate:1.0.0
```
