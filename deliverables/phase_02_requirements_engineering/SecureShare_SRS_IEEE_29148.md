# Software Requirements Specification (SRS)
## SecureShare — Secure File Sharing Platform with Automated Security Validation
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
   - Detailed Specification Matrix (FR-01 to FR-12)
   - 3.1 Requirements Traceability Matrix
4. [External Interface Requirements](#4-external-interface-requirements)
   - 4.1 User Interfaces
   - 4.2 Software Interfaces
   - 4.3 Communication Interfaces
5. [Non-Functional Requirements](#5-non-functional-requirements)
6. [Security Requirements & Assets Inventory](#6-security-requirements--assets-inventory)
   - 6.1 System Assets Inventory & Sensitivity Classification
   - 6.2 Application Security Requirements
7. [Data Requirements](#7-data-requirements)
8. [Use Case Descriptions](#8-use-case-descriptions)
9. [Acceptance Criteria](#9-acceptance-criteria)
10. [Assumptions & Dependencies](#10-assumptions--dependencies)

---

## 1. Introduction

### 1.1 Purpose
This document specifies the software requirements for SecureShare, a secure web application that lets users upload and share files while the platform automatically scans every uploaded file for security threats and continuously validates the application's own security through its CI/CD pipeline. It is prepared in conformance with the structure recommended by IEEE 29148.

### 1.2 Document Conventions
Functional requirements are labeled FR-nn, and project objectives are labeled O1 through O5. Priority levels (High/Medium/Low) indicate relative implementation priority.

### 1.3 Intended Audience
* Project guide and review panel evaluating project deliverables.
* The developer(s) implementing SecureShare.
* Future contributors extending the scanning engines or CI/CD integrations.

### 1.4 Project Scope
SecureShare allows registered users to upload files and share them securely with others. Every uploaded file is automatically validated for its declared type, scanned by a malware detection engine, and checked for dangerous scripts or executables before it is made available for download. Files can be shared through expiring, optionally password-protected links. In parallel, the application's own codebase is continuously validated: every commit and deployment triggers automated static analysis (SAST), dependency vulnerability scanning, and dynamic analysis (DAST) within the CI/CD pipeline, and administrators can review all findings — both file-level and pipeline-level — from a central security dashboard.

> **Out of Scope:** Out of scope for this phase: real-time collaborative file editing, mobile native applications, and automated remediation of source-code vulnerabilities (findings are surfaced for manual review rather than auto-patched).

### 1.5 Definitions, Acronyms, and Abbreviations
* **SAST:** Static Application Security Testing — analysis of source code for vulnerabilities without executing it.
* **DAST:** Dynamic Application Security Testing — analysis of a running application for vulnerabilities.
* **CI/CD:** Continuous Integration / Continuous Deployment — the automated build, test, and release pipeline.
* **MFA:** Multi-Factor Authentication.
* **RBAC:** Role-Based Access Control.
* **KYC:** Know Your Customer — identity-verification documents referenced as an example file type.
* **Magic Bytes:** The initial bytes of a file that identify its true format, used to detect disguised file types.

---

## 2. Overall Description

### 2.1 Product Perspective
SecureShare is a standalone web application intended for organizations that routinely handle sensitive files — such as HR departments, hospitals, banks, and universities — where an uploaded malicious file (malware, dangerous scripts, or executables) could compromise users or infrastructure. It is not a component of a larger product line.

### 2.2 Product Functions
At a high level, SecureShare performs the following functions, derived from its core objectives (O1–O5):
* **O1:** Provide secure user management and role-based access control.
* **O2:** Detect and neutralize malicious or unsafe uploaded files automatically.
* **O3:** Enable secure, controlled file sharing with strong data protection.
* **O4:** Maintain a complete, tamper-evident audit trail of all activity.
* **O5:** Continuously validate the application's own security through the CI/CD pipeline.

### 2.3 User Classes and Characteristics
| User Class / Actor | Characteristics & Access Privileges |
| :--- | :--- |
| **Standard User** | Uploads, shares, and downloads files; has no visibility into other users' files unless explicitly shared with them. |
| **Administrator** | Manages user accounts, reviews quarantined files and malware detections, and monitors CI/CD security findings via the dashboard. |
| **CI/CD Pipeline (system actor)** | Automatically triggers SAST, dependency scanning, and DAST on every commit and deployment. |

### 2.4 Operating Environment
* Web application accessible via any modern browser over HTTPS.
* Backend server environment (e.g., Linux-based) with object/file storage.
* Malware scanning engine (e.g., ClamAV or equivalent) integrated as a scanning service.
* CI/CD platform (e.g., GitHub Actions, GitLab CI, or Jenkins) integrated with SAST, dependency-scanning, and DAST tools.

### 2.5 Design and Implementation Constraints
* Every uploaded file must pass malware and type-validation checks before it can be downloaded or shared.
* All data in transit must use HTTPS/TLS; no unencrypted endpoints are permitted.
* The CI/CD pipeline must block deployment when a critical-severity security finding is detected.

### 2.6 Assumptions and Dependencies
* A malware-scanning engine with regularly updated signatures is available to the system.
* The CI/CD environment has access to configured SAST, dependency-scanning, and DAST tools.
* Users access the platform using modern, HTTPS-capable browsers.
* Underlying object storage guarantees durability of uploaded files.

---

## 3. Functional Requirements

### Functional Requirements Specification Matrix
| ID | Title | Requirement Description | Priority |
| :---: | :--- | :--- | :---: |
| **FR-01** | User Registration & Authentication | The system shall allow users to register and log in securely, with passwords stored using a strong hashing algorithm (bcrypt/Argon2) and support for multi-factor authentication. | High |
| **FR-02** | Role-Based Access Control | The system shall support at least two roles — Standard User and Administrator — with permissions enforced on every file and sharing operation. | High |
| **FR-03** | File Upload | The system shall allow authenticated users to upload files through the web interface, subject to a configurable maximum file size. | High |
| **FR-04** | File Type & Signature Validation | The system shall validate each uploaded file's declared MIME type against its actual file signature (magic bytes) and reject or quarantine files with mismatched or disallowed types. | High |
| **FR-05** | Automated Malware Scanning | The system shall automatically scan every uploaded file using a malware/antivirus scanning engine before the file is made available for sharing or download. | High |
| **FR-06** | Dangerous Script & Executable Detection | The system shall detect and flag uploaded executables, shell/batch scripts, and macro-enabled documents as high-risk content. | High |
| **FR-07** | Quarantine & Notification | The system shall automatically quarantine any file flagged as malicious or high-risk and notify the uploader and administrator of the detection. | High |
| **FR-08** | Secure File Sharing | The system shall allow users to generate shareable links with configurable expiry time, optional password protection, and download limits. | High |
| **FR-09** | Encryption At Rest & In Transit | The system shall encrypt stored files (AES-256 or equivalent) and enforce HTTPS/TLS for all client-server and file-transfer communication. | High |
| **FR-10** | Audit Logging | The system shall log all uploads, downloads, share actions, scan results, and administrative actions with user identity and timestamp. | High |
| **FR-11** | CI/CD Security Pipeline Integration | The system's build pipeline shall automatically run static application security testing (SAST), dependency vulnerability scanning, and dynamic application security testing (DAST) on every commit and deployment. | High |
| **FR-12** | Security Dashboard & Reporting | The system shall provide an administrator dashboard summarizing malware detections, quarantined files, and CI/CD pipeline security findings. | Med |

### 3.1 Requirements Traceability
| Objective | Description | Traced Requirements |
| :---: | :--- | :--- |
| **O1** | Provide secure user management and access control. | FR-01, FR-02 |
| **O2** | Detect and neutralize malicious or unsafe uploaded files automatically. | FR-03, FR-04, FR-05, FR-06, FR-07 |
| **O3** | Enable secure, controlled file sharing with strong data protection. | FR-08, FR-09 |
| **O4** | Maintain a complete, tamper-evident audit trail. | FR-10 |
| **O5** | Continuously validate the application's own security through the CI/CD pipeline. | FR-11, FR-12 |

---

## 4. External Interface Requirements

### 4.1 User Interfaces
SecureShare is operated through a responsive web interface providing screens for registration/login, file upload, a file/share management dashboard, and — for administrators — a security dashboard summarizing scan results and pipeline findings.

### 4.2 Software Interfaces
* **Malware Scanning Engine:** scans each uploaded file and returns a clean/malicious verdict (e.g., ClamAV or equivalent).
* **Object/File Storage:** stores uploaded files and their encrypted contents.
* **CI/CD Platform:** orchestrates automated SAST, dependency-vulnerability scanning, and DAST on each build/deploy.
* **Notification Service:** sends email/in-app alerts for quarantine events and critical pipeline findings.

### 4.3 Communication Interfaces
All client-server communication occurs over HTTPS. Internal service-to-service communication (e.g., application to scanning engine) uses REST APIs, secured within the deployment environment.

---

## 5. Non-Functional Requirements

| Attribute | Requirement Statement |
| :--- | :--- |
| **Performance** | Malware scanning of a file up to 50 MB shall complete within 10 seconds under normal load. |
| **Scalability** | The system shall support concurrent uploads and scans from at least 500 simultaneous users without service degradation. |
| **Availability** | The platform shall maintain 99.5% uptime, excluding scheduled maintenance windows. |
| **Usability** | Core actions — upload, share, download — shall each be completable within three user interactions from the dashboard. |
| **Maintainability** | Malware signatures and CI/CD scanning tool rules shall be updatable without requiring application redeployment. |
| **Portability** | The web application shall run on any modern browser and be deployable to any standard container-orchestration environment. |
| **Reliability** | No file shall be made available for download before its malware scan has completed successfully. |

---

## 6. Security Requirements & Assets Inventory

### 6.1 System Assets Inventory & Sensitivity Classification
| Asset ID | Asset Name | Category | CIA Rating | Identified Threats | Applied Security Controls |
| :---: | :--- | :--- | :---: | :--- | :--- |
| **AST-01** | User Accounts & Credentials | Authentication | C: High<br>I: High<br>A: Med | Brute-force attacks, credential stuffing, session hijacking. | bcrypt/Argon2 salted hashing, MFA enforcement, session timeout. |
| **AST-02** | Uploaded File Payloads | User Data | C: High<br>I: Critical<br>A: High | Malware weaponization, data exfiltration, ransomware seeding. | AES-256 encryption at rest, pre-download ClamAV scanning, magic bytes validation. |
| **AST-03** | Quarantine Store Vault | Security Isolation | C: High<br>I: Critical<br>A: High | Accidental execution of quarantined malicious binaries. | Strict isolation on separate unmapped storage path with zero execute permissions. |
| **AST-04** | Share Links & Secrets | Access Control | C: High<br>I: High<br>A: Med | URL guessing, token enumeration, unauthorized link harvesting. | Cryptographically random high-entropy tokens, link expiration, password hashing. |
| **AST-05** | Antivirus Signatures & Engine | Security Service | C: Med<br>I: Critical<br>A: Critical | Signature evasion, scanning service denial-of-service, engine tamper. | Automated hourly ClamAV signature updates, daemon isolation, fallback circuit breaker. |
| **AST-06** | Tamper-Evident Audit Trail | Compliance / Forensics | C: Med<br>I: Critical<br>A: High | Log deletion by attacker to cover tracks, log injection. | Append-only storage, HMAC hashing, immutable actor/timestamp logging. |
| **AST-07** | CI/CD Pipeline Secrets & Scanners | DevSecOps Infrastructure | C: Critical<br>I: Critical<br>A: Critical | Pipeline compromise, toxic dependency injection, secret leak in logs. | Encrypted secret manager, automated SAST, DAST, SCA dependency gating. |

### 6.2 Application Security Requirements
* Passwords shall be stored using a strong, salted hashing algorithm (bcrypt/Argon2); plaintext passwords shall never be logged or stored.
* All communication shall be encrypted in transit using HTTPS/TLS; all stored files shall be encrypted at rest (AES-256).
* Role-Based Access Control shall be enforced on every file, share, and administrative operation.
* Every uploaded file shall be scanned for malware and validated by file signature before being made available for download or sharing.
* Files flagged as malicious or high-risk shall be isolated in a quarantine store inaccessible to standard users.
* User sessions shall expire after a period of inactivity, and all authentication events shall be logged.
* All user input shall be validated and sanitized to prevent injection attacks (SQL injection, XSS, path traversal).
* The CI/CD pipeline shall block deployment when a critical-severity vulnerability is detected by SAST, dependency scanning, or DAST.
* Secrets and credentials used by the CI/CD pipeline shall be stored in a secure secrets manager, not in source code.

---

## 7. Data Requirements

| Entity | Description |
| :--- | :--- |
| **User** | Registered account with credentials, role, and profile information. |
| **File** | Metadata for an uploaded file, including name, size, MIME type, owner, and storage location. |
| **FileVersion** | A specific version of a file, supporting version history where applicable. |
| **ScanResult** | The outcome of a malware/security scan performed on a file, including verdict and engine details. |
| **ShareLink** | A generated shareable link, including expiry time, password protection flag, and download limit. |
| **AuditLog** | A record of a user or system action (upload, download, share, admin action) with timestamp and actor. |
| **PipelineRun** | A record of a CI/CD build/deploy execution and its associated security scan results. |
| **SecurityFinding** | A specific vulnerability or issue identified by SAST, DAST, or dependency scanning during a pipeline run. |

---

## 8. Use Case Descriptions

| Use Case ID & Title | Actor & Flow Summary |
| :--- | :--- |
| **UC-1 Register / Login** | A user creates an account or authenticates securely, optionally using MFA. |
| **UC-2 Upload File** | A user uploads a file, which is automatically validated and scanned before becoming available. |
| **UC-3 Share File Securely** | A user generates a shareable link with an expiry time and optional password protection. |
| **UC-4 Download Shared File** | A recipient accesses a shared file via a valid, unexpired link. |
| **UC-5 Review Quarantined Files** | An administrator reviews files flagged as malicious or high-risk and confirms or releases them. |
| **UC-6 Trigger CI/CD Security Scan** | On every commit or deployment, the pipeline automatically runs SAST, dependency scanning, and DAST. |
| **UC-7 View Security Dashboard** | An administrator reviews a consolidated view of file-scan detections and CI/CD security findings. |

---

## 9. Acceptance Criteria
* Every uploaded file shall be scanned, and files containing known malware signatures shall be automatically quarantined.
* Disguised executables and dangerous scripts shall be correctly identified via file-signature validation, regardless of file extension.
* Shared files shall be accessible only through valid, unexpired share links, honoring any configured password protection and download limits.
* A deployment containing a critical-severity SAST, dependency, or DAST finding shall be automatically blocked by the CI/CD pipeline.
* All upload, download, share, and administrative actions shall appear in the audit log with correct timestamps and actor identity.

---

## 10. Assumptions & Dependencies
* The malware-scanning engine's signature database is kept up to date.
* The CI/CD environment has the necessary access and licenses for its configured SAST/DAST/dependency-scanning tools.
* Users interact with the platform using modern, HTTPS-capable browsers.
* Organizations deploying SecureShare (HR, healthcare, banking, education, etc.) provide their own compliance policies governing the specific document types they handle.
