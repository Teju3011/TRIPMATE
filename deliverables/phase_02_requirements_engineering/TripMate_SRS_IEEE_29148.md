# Software Requirements Specification (SRS)
## TripMate — Collaborative Travel Planning Platform with Shared-Resource Authorization & Privacy
**Standard:** IEEE 29148-Conformant SRS  
**Course Code:** 20CYS495 — Capstone Project  
**Institution:** Amrita Vishwa Vidyapeetham, Department of Cybersecurity Systems and Networks  
**Academic Year:** 2025–2026 | Document Release: v1.0 Final  

### Student Contributors
| Student Contributor | Register Number |
| :--- | :--- |
| **A. sushmitha** | `CH.SC.U4CYS23057` |
| **U. Tejaswi** | `CH.SC.U4CYS23047` |

---

## Table of Contents
1. [Introduction](#1-introduction)
   - 1.1 Purpose
   - 1.2 Document Conventions
   - 1.3 Intended Audience
   - 1.4 Project Scope
   - 1.5 Definitions, Acronyms, and Abbreviations
2. [Overall Description](#2-overall-description)
   - 2.1 Product Perspective
   - 2.2 Product Functions
   - 2.3 User Classes and Characteristics
   - 2.4 Operating Environment
   - 2.5 Design and Implementation Constraints
   - 2.6 Assumptions and Dependencies
3. [Functional Requirements](#3-functional-requirements)
   - Detailed Specification Matrix (FR-01 to FR-16)
   - 3.1 Requirements Traceability Matrix
4. [External Interface Requirements](#4-external-interface-requirements)
   - 4.1 User Interfaces
   - 4.2 Software Interfaces
   - 4.3 Communication Interfaces
5. [Non-Functional Requirements](#5-non-functional-requirements)
6. [Security Requirements & Assets Inventory](#6-security-requirements--assets-inventory)
   - 6.1 System Assets Inventory & Sensitivity Classification
   - 6.2 Threat Modeling & Security Controls
7. [Data Requirements](#7-data-requirements)
8. [Use Case Descriptions](#8-use-case-descriptions)
9. [Acceptance Criteria](#9-acceptance-criteria)
10. [Assumptions & Dependencies](#10-assumptions--dependencies)

---

## 1. Introduction

### 1.1 Purpose
This document specifies the software requirements for **TripMate**, an enterprise-grade collaborative travel planning web platform designed with high-assurance security, fine-grained access control, shared-resource authorization, and comprehensive data privacy. The specification is constructed in strict conformance with the structure, syntax, and verification guidelines recommended by the **IEEE 29148 Systems and Software Engineering — Life Cycle Processes — Requirements Engineering** standard.

### 1.2 Document Conventions
Every requirement adheres to standardized identification syntax to facilitate automated bidirectional traceability. Functional requirements are labeled **FR-01** through **FR-16**. Core system objectives are designated **O1** through **O6**. Priority classifications follow IEEE standards: **High** (mandatory for core operational security and MVP functionality), **Medium** (essential for operational optimization and user collaboration), and **Low** (future enhancement). Requirement statements consistently employ the prescriptive normative verb *"shall"*.

### 1.3 Intended Audience
* **Faculty Evaluators & Review Panel:** Evaluating 20CYS495 Capstone deliverables against IEEE 29148 standards.
* **Core Developers:** Implementing frontend interfaces, backend REST endpoints, and security middleware.
* **AppSec & QA Engineers:** Conducting threat modeling, static/dynamic security analysis, and penetration testing.
* **DevSecOps Practitioners:** Maintaining automated CI/CD scanning, containerization, and Kubernetes manifests.

### 1.4 Project Scope
TripMate provides a unified, secure cloud-native environment where individuals and groups can organize, coordinate, and execute travel plans seamlessly. The platform enables users to create customizable trips, configure sequential destination stops, schedule time-indexed daily itinerary tasks, record shared expenses with multi-participant splits, and execute automated debt settlement calculations. 

Critical architectural emphasis is placed on **Shared-Resource Authorization**, eliminating Broken Object Level Authorization (BOLA/IDOR), enforcing strict Role-Based Access Control (RBAC: Owner, Editor, Viewer), protecting participant privacy through multi-tenant data isolation, providing a tamper-evident cryptographic audit trail, and automating security validation across the DevSecOps CI/CD delivery pipeline.

> **Boundary Specification:** Out of scope for Phase 1: Real-time GPS vehicle tracking, automated flight booking transaction processing, and proprietary payment gateway disbursement. Expense settlement provides optimal calculation vectors but leaves actual fiat disbursement to users.

### 1.5 Definitions, Acronyms, and Abbreviations
* **RBAC:** Role-Based Access Control — An authorization mechanism governing resource actions based on assigned roles.
* **BOLA / IDOR:** Broken Object Level Authorization / Insecure Direct Object References (OWASP API Security Top 1).
* **JWT:** JSON Web Token — An open standard (RFC 7519) compact, URL-safe container for cryptographically signed claims.
* **STRIDE:** Threat classification model: Spoofing, Tampering, Repudiation, Information Disclosure, Denial of Service, Elevation of Privilege.
* **SAST / DAST:** Static / Dynamic Application Security Testing — Automated source code and runtime penetration scanning tools.
* **SCA:** Software Composition Analysis — Automated detection of known CVEs in third-party libraries.
* **HMAC:** Hash-based Message Authentication Code — Cryptographic construction verifying data authenticity and integrity.
* **HPA:** Horizontal Pod Autoscaler — Kubernetes mechanism dynamically scaling container replicas based on resource metrics.

---

## 2. Overall Description

### 2.1 Product Perspective
TripMate operates as a standalone, multi-tenant web application engineered with modern three-tier microservices-ready architecture. It integrates client-side single page rendering with a high-throughput Node.js/Express RESTful backend, secure ACID-compliant persistence, containerized deployment via Docker, and orchestration through Kubernetes. TripMate solves the systemic vulnerability of contemporary consumer travel apps where trip itineraries, budgets, and participant lists are routinely exposed to unauthorized actors through unprotected object parameters.

### 2.2 Product Functions
The functional foundation of TripMate is derived from six core strategic objectives (O1–O6):
* **O1 — Identity & Authentication:** Deliver zero-trust user onboarding, cryptographic password hashing (bcrypt), and stateless JWT session issuance.
* **O2 — Trip & Privacy Management:** Provide granular trip lifecycle management with multi-tenant privacy boundaries and strict ownership protection.
* **O3 — Routing & Scheduling:** Enable sequential destination routing and time-stamped itinerary scheduling with designated member responsibility.
* **O4 — Financial Settlement:** Execute multi-currency group expense tracking with zero-sum debt settlement optimization (*"Who Owes Whom"*).
* **O5 — Authorization & Auditing:** Enforce strict Role-Based Access Control (Owner, Editor, Viewer) and maintain an immutable, tamper-evident audit trail.
* **O6 — DevSecOps Pipeline:** Continuously validate security posture via automated SAST, SCA, container scanning, and DAST in CI/CD pipelines.

### 2.3 User Classes and Characteristics
| User Class / Actor | Operational Responsibilities & Privilege Profile |
| :--- | :--- |
| **Trip Owner** | Creator of a trip. Possesses comprehensive administrative authority: can edit trip metadata, manage privacy status, invite/demote/remove collaborators, assign roles, delete the trip, and purge resources. Highest privilege level. |
| **Trip Editor** | Active collaborator invited with write privileges. Can add/modify/delete destinations, manage itinerary activities, toggle completion milestones, and log expenses. Cannot invite new members, alter permissions, or delete the trip. |
| **Trip Viewer** | Read-only participant. Can view trip overview, explore itinerary timings, inspect destination routes, and view personal debt balances. Barred from making any state modifications. |
| **System Administrator** | Platform governance actor. Possesses platform-wide audit inspection authority, monitors system health metrics, reviews security policy violations, and oversees automated DevSecOps telemetry. |
| **CI/CD Pipeline Actor** | Automated non-human service actor executing Git-triggered linting, unit/integration test suites, SAST vulnerability scans, container image scans (Trivy), and automated deployment checks. |

### 2.4 Operating Environment
* **Client Tier:** Modern web browsers supporting ECMAScript 2022+ and TLS 1.3 (Chrome 110+, Firefox 115+, Safari 16+, Edge 110+).
* **Application Server:** Node.js v20.x LTS runtime on Linux (Ubuntu 22.04 LTS / Alpine 3.19) executing Express REST API services.
* **Persistence Tier:** ACID transactional JSON document store with atomic file swapping and locking mechanisms.
* **Container Orchestration:** Docker Engine 24+ and Kubernetes / Minikube v1.28+ with Ingress-NGINX and persistent volume claims.
* **CI/CD Environment:** GitHub Actions / GitLab CI runner supporting Node.js, Trivy, ESLint, and OWASP ZAP runners.

### 2.5 Design and Implementation Constraints
* Every authenticated API request must cryptographically validate the JWT Bearer token and enforce trip-level RBAC prior to data access.
* Zero hardcoded demo data: All application states must dynamically initialize from real authenticated user actions.
* Zero trust network model: All external and internal service communications must enforce TLS 1.3 encryption.
* All financial transactions must enforce zero-sum mathematical consistency (Sum of individual member balances == 0).
* Automated CI/CD security gate must fail build pipelines if any High or Critical severity CVE is discovered.

### 2.6 Assumptions and Dependencies
* Users maintain secure local control of their authentication credentials and devices.
* The container hosting platform provides high-availability network connectivity and persistent block storage.
* External mapping and currency conversion APIs adhere to public RESTful service availability contracts.

---

## 3. Functional Requirements

### Detailed Functional Requirements Matrix
| ID | Title | Requirement Description | Pri | Preconditions | Verification |
| :---: | :--- | :--- | :---: | :--- | :--- |
| **FR-01** | User Registration & Credential Security | The system shall allow new users to register with a unique email address, display name, and password. Passwords shall be validated against a strong complexity policy (minimum 8 characters, uppercase, lowercase, number) and salted/hashed using bcrypt (cost factor >= 10). | High | Unregistered email | Unit & Integration Test |
| **FR-02** | Cryptographic Authentication & Session Issuance | The system shall authenticate registered users against bcrypt hashes and issue an HMAC-SHA256 signed JSON Web Token (JWT) containing user ID, email, and role, with a strict 24-hour expiration window. | High | Valid user credentials | Automated API Test |
| **FR-03** | Multi-Tenant Trip Creation & Metadata Management | The system shall enable authenticated users to create trips specifying title, destination country, date range, total budget, and privacy toggle (Private vs Shared). The creator shall be atomically assigned the 'owner' role. | High | Authenticated session | Functional Integration Test |
| **FR-04** | Role-Based Access Control (RBAC) Enforcement | The system shall enforce RBAC permissions across all trip sub-resources (destinations, itineraries, expenses, members). Unauthorized access attempts shall be rejected with HTTP 403 Forbidden. | High | Active trip session | Security RBAC Suite |
| **FR-05** | Collaborator Invitation & Role Assignment | The system shall permit Trip Owners to invite collaborators by email address, assigning them either 'editor' or 'viewer' privileges. Unregistered invitees shall automatically gain trip access upon registration. | High | Trip Owner authority | End-to-End Test |
| **FR-06** | Destination Routing & Sequence Ordering | The system shall allow Owners and Editors to add, edit, reorder, and remove sequential destination stops with arrival/departure dates, geographic coordinates, and stay notes. | High | Owner / Editor role | API & UI Test |
| **FR-07** | Time-Indexed Itinerary Task Scheduling | The system shall permit Owners and Editors to create daily scheduled activities linked to specific dates, times, locations, estimated budgets, and assigned collaborator responsibilities. | High | Owner / Editor role | Unit & Integration Test |
| **FR-08** | Activity Completion Status Tracking | The system shall enable Owners and Editors to toggle the completion milestone of scheduled activities, dynamically updating the trip's overall progress metric. | Med | Scheduled activity exists | Interactive UI Test |
| **FR-09** | Multi-Currency Expense Recording & Splitting | The system shall allow Owners and Editors to log expenses specifying category, amount, currency, payer, and multi-member split distribution. The system shall verify zero-sum financial allocation. | High | Owner / Editor role | Financial Test Suite |
| **FR-10** | Automated Debt Settlement Optimization | The system shall execute a greedy minimum-cash-flow algorithm calculating net member balances and deriving the minimum number of debt transfer transactions ('Who Owes Whom'). | High | Recorded trip expenses | Algorithmic Unit Test |
| **FR-11** | Data Privacy & Multi-Tenant Resource Isolation | The system shall isolate private trip resources such that non-collaborators cannot view, query, or infer metadata about trips to which they have not been explicitly invited. | High | Cross-tenant query | BOLA Security Probe |
| **FR-12** | Tamper-Evident Security Audit Logging | The system shall record an immutable, time-stamped audit entry for all security-sensitive operations (authentication attempts, collaborator invitations, role mutations, resource deletions). | High | System state change | Audit Verification Suite |
| **FR-13** | Sliding-Window Rate Limiting & DoS Defense | The system shall enforce IP-based rate limiting on sensitive authentication and API endpoints (maximum 100 requests per 15-minute window), returning HTTP 429 upon threshold breach. | High | Incoming HTTP request | Boundary Fuzzing Test |
| **FR-14** | In-Transit & At-Rest Cryptographic Protection | The system shall enforce TLS 1.3 encryption for all client-server communications and secure sensitive stored entities (hashed credentials, secrets) using industry-standard cryptography. | High | Data transmission/storage | Cryptographic Review |
| **FR-15** | Automated CI/CD DevSecOps Security Gates | The build pipeline shall automatically execute ESLint security rules, dependency vulnerability scanning (npm audit), container vulnerability scanning (Trivy), and automated unit/integration suites. | High | Git commit / Pull Request | Pipeline Execution Test |
| **FR-16** | Administrative Security Dashboard & Telemetry | The system shall provide administrators with a centralized real-time dashboard displaying active security events, audit log entries, failed authorization attempts, and system health status. | Med | Admin authentication | UI & Integration Test |

### 3.1 Requirements Traceability Matrix
| Objective | Strategic Goal Description | Traced Functional Requirements |
| :--- | :--- | :--- |
| **O1 — Identity & Authentication** | Provide secure user onboarding, credential hashing, and stateless JWT session issuance. | FR-01, FR-02, FR-13 |
| **O2 — Trip & Privacy Management** | Enable customizable multi-tenant trip management with strict boundary privacy. | FR-03, FR-11 |
| **O3 — Routing & Scheduling** | Provide destination staging, sequential route ordering, and time-stamped itinerary assignment. | FR-06, FR-07, FR-08 |
| **O4 — Financial Settlement** | Facilitate group expense tracking and execute greedy debt settlement optimization. | FR-09, FR-10 |
| **O5 — Authorization & Auditing** | Enforce strict RBAC across all sub-resources and maintain tamper-evident audit logs. | FR-04, FR-05, FR-12, FR-16 |
| **O6 — DevSecOps Pipeline** | Automate static code scanning, container scanning, and CI/CD security validation gates. | FR-14, FR-15 |

---

## 4. External Interface Requirements

### 4.1 User Interfaces
* **Auth Portal:** Provides a modern dual-tab interface for secure Registration and Login with real-time client-side form validation, password strength indicators, and error banners.
* **Main Travel Dashboard:** Displays user-owned and shared trips, complete with countdowns, status tags, budget summaries, and an action trigger for creating new trips.
* **Trip Workspace:** A multi-tab command center featuring: Trip Overview, Destination Route Builder, Daily Itinerary Planner, Collaborative Expense Ledger, and Collaborator Manager.
* **Expense Settlement View:** Visualizes net member balances and generates an interactive 'Who Owes Whom' debt transfer matrix with individual clearance badges.
* **Audit Log Viewer:** Administrative modal displaying real-time security events, filterable by action type, severity, and actor.

### 4.2 Software Interfaces
* **Mapping Service Interface:** OpenStreetMap / Leaflet tile API interfaces for rendering geographical destination waypoints and route lines.
* **Foreign Exchange API:** RESTful exchange rate service providing updated fiat currency conversion ratios for foreign travel expenditure.
* **Docker Container Engine:** OCI-compliant container engine hosting the microservices runtime within isolated namespaces.
* **Kubernetes Cluster API:** Kubernetes API orchestrating Horizontal Pod Autoscalers, Ingress controllers, and persistent volume bindings.

### 4.3 Communication Interfaces
* **Transport Security:** Mandatory TLS 1.3 encryption across all public and internal service boundaries. Plaintext HTTP is strictly rejected or redirected.
* **Application Protocol:** Standardized JSON payloads adhering to RFC 8259, accompanied by `Content-Type: application/json` headers.
* **Authentication Headers:** RFC 6750 Bearer Token standard passing signed JWT credentials in the `Authorization` header of all API calls.

---

## 5. Non-Functional Requirements

| Attribute & Identifier | Normative Specification Statement |
| :--- | :--- |
| **NFR-01: Performance** | API endpoint response times shall not exceed 200 ms under nominal load. The debt settlement optimization algorithm shall calculate complete balance distributions in under 10 ms for up to 50 trip participants. |
| **NFR-02: Scalability** | The system architecture shall support at least 1,000 concurrent active trips and 10,000 daily API transactions through horizontal container scaling without performance degradation. |
| **NFR-03: Availability** | The platform shall maintain 99.9% uptime per calendar month, excluding scheduled maintenance windows announced at least 48 hours in advance. |
| **NFR-04: Usability** | All primary operations (creating a trip, adding a stop, logging an expense, generating debt settlement) shall be achievable within three user clicks from the active trip workspace. |
| **NFR-05: Maintainability** | The codebase shall enforce modular separation between routing controllers, business services, and database persistence layers. Automated code test coverage shall exceed 85%. |
| **NFR-06: Portability** | The application shall run seamlessly inside standard Linux containers (Docker / OCI) on any cloud platform (AWS, GCP, Azure, or on-premises Kubernetes). |
| **NFR-07: Reliability & Fault Tolerance** | Data persistence operations shall implement atomic transactional writes to prevent file corruption in the event of unexpected process termination. |

---

## 6. Security Requirements & Assets Inventory

### 6.1 System Assets Inventory & Sensitivity Classification
| Asset ID | Asset Name | Category | CIA Rating | Identified Threats | Applied Security Controls |
| :---: | :--- | :--- | :---: | :--- | :--- |
| **AST-01** | User Credentials & Passwords | Identity & Auth Data | C: High<br>I: High<br>A: Med | Credential stuffing, brute force dictionary attacks, unauthorized account takeover. | bcrypt hashing with salt rounds >= 10, strong password complexity enforcement, sliding window rate limiting. |
| **AST-02** | JWT Auth Tokens & Signing Key | Cryptographic Secrets | C: Critical<br>I: Critical<br>A: High | Key leakage, signature forgery, token replay, algorithm downgrade attacks. | HMAC-SHA256 signing with 256-bit environment secret, 24-hour expiration, no algorithm 'none' permitted. |
| **AST-03** | Trip Metadata & Privacy Flags | User Application Data | C: High<br>I: High<br>A: High | Broken Object Level Authorization (BOLA), unauthorized public discovery of private vacations. | Strict trip-level access control middleware checking user authorization against collaborator table before query execution. |
| **AST-04** | Destination & Geolocation Trajectories | Location & PII Data | C: High<br>I: Med<br>A: Med | Tracking user travel itineraries, physical security compromise of traveling participants. | Private visibility restrictions, encrypted transport via TLS 1.3, strict RBAC authorization. |
| **AST-05** | Itinerary Task Schedules & Assignees | Operational Plans | C: Med<br>I: High<br>A: Med | Unauthorized alteration of travel bookings, task sabotage by rogue editors. | Role enforcement (Owner/Editor only), activity audit logging, atomic state validation. |
| **AST-06** | Financial Expense Records & Split Debts | Financial Ledger | C: High<br>I: Critical<br>A: High | Fraudulent expense insertion, tamper with debt calculation algorithm, circular credit loops. | Zero-sum mathematical verification, immutable expense author logging, greedy debt calculation engine. |
| **AST-07** | Collaborator Privilege Mappings | Authorization Policy | C: High<br>I: Critical<br>A: High | Privilege escalation, unauthorized self-promotion from Viewer to Owner. | Owner-only role modification logic; Owner cannot demote self without explicit ownership transfer. |
| **AST-08** | Tamper-Evident Security Audit Logs | Compliance & Forensics | C: Med<br>I: Critical<br>A: High | Log deletion by attacker to cover malicious tracks, log injection / spoofing. | Append-only storage structure, timestamping, comprehensive capturing of actor, IP, action, and result. |
| **AST-09** | CI/CD & Deployment Credentials | Infrastructure Secrets | C: Critical<br>I: Critical<br>A: Critical | Supply chain poisoning, production deployment hijacking, container repository breach. | External secret storage, zero credentials committed to Git, automated SAST and Trufflehog scanning. |

### 6.2 Threat Modeling & Security Controls
* **Broken Object Level Authorization (BOLA / IDOR):** Every endpoint containing a trip parameter (`/api/trips/:tripId/...`) performs a pre-flight database lookup validating that the requesting JWT user ID is an authorized collaborator. Uninvited actors receive HTTP 403 Forbidden.
* **Cross-Site Scripting (XSS):** All inbound query parameters and request bodies pass through HTML entity sanitization to prevent stored and reflected script injection.
* **Cross-Site Request Forgery (CSRF):** The API relies entirely on stateless Authorization Bearer tokens, rendering the platform naturally immune to standard browser cookie CSRF attacks.
* **HTTP Header Hardening:** Helmet security middleware configures HTTP response headers including Content-Security-Policy (CSP), `X-Frame-Options: DENY`, and `X-Content-Type-Options: nosniff`.

---

## 7. Data Requirements

| Entity | Schema Attributes & Relational Key Constraints |
| :--- | :--- |
| **User** | `id` (UUID, PK), `email` (Unique String), `passwordHash` (String), `displayName` (String), `role` (Enum: 'user', 'admin'), `createdAt` (Timestamp) |
| **Trip** | `id` (UUID, PK), `title` (String), `description` (Text), `destination` (String), `startDate` (Date), `endDate` (Date), `budget` (Decimal), `isPrivate` (Boolean), `createdBy` (UUID, FK -> User.id), `createdAt` (Timestamp) |
| **Collaborator** | `id` (UUID, PK), `tripId` (UUID, FK -> Trip.id), `userId` (UUID, FK -> User.id), `role` (Enum: 'owner', 'editor', 'viewer'), `invitedBy` (UUID, FK -> User.id), `joinedAt` (Timestamp) |
| **Destination** | `id` (UUID, PK), `tripId` (UUID, FK -> Trip.id), `name` (String), `country` (String), `arrivalDate` (Date), `departureDate` (Date), `orderIndex` (Integer), `notes` (Text) |
| **ItineraryItem** | `id` (UUID, PK), `tripId` (UUID, FK -> Trip.id), `destinationId` (UUID, FK -> Destination.id), `title` (String), `date` (Date), `time` (Time), `estimatedCost` (Decimal), `isCompleted` (Boolean), `assignedTo` (UUID, FK -> User.id) |
| **Expense** | `id` (UUID, PK), `tripId` (UUID, FK -> Trip.id), `title` (String), `amount` (Decimal), `currency` (String), `category` (String), `payerId` (UUID, FK -> User.id), `splitMembers` (JSON Array of UUIDs), `createdAt` (Timestamp) |
| **AuditLog** | `id` (UUID, PK), `timestamp` (Timestamp), `actorId` (UUID), `action` (String), `targetResource` (String), `ipAddress` (String), `status` (Enum: 'SUCCESS', 'DENIED', 'FAILURE'), `details` (JSON Object) |

---

## 8. Use Case Descriptions

| Use Case ID & Title | Primary Actor | Execution Flow & System Outcome |
| :--- | :--- | :--- |
| **UC-1: Register & Authenticate User** | User | User provides registration details; system hashes credentials with bcrypt and returns signed JWT token. |
| **UC-2: Create Travel Trip** | Trip Owner | Authenticated user creates trip with title, dates, and budget; system records trip and establishes user as Owner. |
| **UC-3: Invite Collaborator by Email** | Trip Owner | Owner inputs collaborator email and role ('editor'/'viewer'); system generates membership record or pending invite. |
| **UC-4: Schedule Itinerary Activity** | Owner / Editor | User creates scheduled event linked to a destination, sets time, estimated cost, and assigns responsible member. |
| **UC-5: Log Shared Expense & Split** | Owner / Editor | User logs expenditure, designates paying member, and selects participants to share cost; system validates zero-sum split. |
| **UC-6: Compute Debt Settlement Matrix** | Any Member | User views expense summary; system executes greedy minimization algorithm returning optimal 'Who Owes Whom' ledger. |
| **UC-7: Enforce RBAC on Unauthorized Action** | Trip Viewer | Viewer attempts to modify trip itinerary; middleware intercepts request and returns HTTP 403 Forbidden with audit log entry. |
| **UC-8: DevSecOps CI/CD Pipeline Gate** | CI/CD System | Automated runner executes tests, SAST, and Trivy scans on Git push; deployment proceeds only if zero Critical findings exist. |

---

## 9. Acceptance Criteria
* User passwords shall be cryptographically hashed using bcrypt with work factor >= 10; plaintext passwords shall never appear in logs or responses.
* Users shall only have access to trips they created or were explicitly invited to join; cross-tenant queries must return HTTP 403.
* Trip Editors shall be barred from modifying collaborator roles or deleting trips; only the Owner possesses administrative privileges.
* The debt settlement algorithm shall reduce cyclic mutual debts to the mathematical minimum number of transfer transactions.
* The DevSecOps pipeline shall automatically block deployment if any High or Critical severity vulnerability is flagged by SAST or Trivy.
* All security events (logins, failed auth, role changes, resource deletions) shall appear in the tamper-evident audit log.

---

## 10. Assumptions & Dependencies
* Target deployment servers run container engines with secure, unprivileged runtime configurations.
* DNS and TLS certificates are managed and provisioned via automated Let's Encrypt / Ingress controllers.
* Collaborators are responsible for validating external financial transfers conducted outside the platform ledger.
