# Software Requirements Specification (SRS) Table

## Detailed Requirements Specification Matrix

| Req ID | Category | Requirement Description | Primary Actor | Preconditions | Expected Postcondition | Verification Method |
|---|---|---|---|---|---|---|
| **SRS-01** | Auth | User registration with unique email, display name, and strong password (min 8 chars, 1 uppercase, 1 lowercase, 1 digit). | Traveler | Email not registered | User account created, password hashed with bcrypt, JWT issued. | Unit & Integration Test |
| **SRS-02** | Auth | Secure login endpoint returning signed JWT token containing user ID, email, and role. | Traveler | User exists in DB | Returns valid JWT with 24h expiration; audit log records `LOGIN_SUCCESS`. | Automated API Test |
| **SRS-03** | Trip | Create trip with title, description, dates, budget, and privacy toggle (Private vs Shared). | Owner | Authenticated user | Trip stored in DB; creator automatically recorded as `owner` in collaborators table. | Automated Integration Test |
| **SRS-04** | Trip | Retrieve trip details including destinations, itinerary, expenses, and current user's role. | Collaborator | Valid JWT; user is collaborator or admin | Full trip JSON returned with stats and computed role; 403 returned if uninvited stranger. | RBAC Automated Test |
| **SRS-05** | Trip | Delete trip and cascade delete all associated destinations, activities, expenses, and memberships. | Owner | User is trip Owner | Trip and sub-records deleted; audit log records `TRIP_DELETED`; non-owner gets 403. | Security Cascade Test |
| **SRS-06** | Destination | Add, update, and remove ordered destination stops with city, country, arrival/departure dates, and notes. | Owner, Editor | User is Owner or Editor on trip | Destination record created/updated/deleted; Viewer attempt returns 403. | RBAC Endpoint Test |
| **SRS-07** | Itinerary | Schedule daily itinerary items with time, location, estimated cost, notes, and assign to specific collaborator. | Owner, Editor | User is Owner or Editor on trip | Itinerary item created; assignee must be an active collaborator on the trip. | Unit & Integration Test |
| **SRS-08** | Itinerary | Toggle completion status of scheduled activities. | Owner, Editor | User is Owner or Editor on trip | `isCompleted` boolean updated; UI reflects completed strikethrough. | UI & API Test |
| **SRS-09** | Expense | Record trip expenses with category, payer user, split members array, and receipt note. | Owner, Editor | Valid positive amount | Expense stored; payer credited; split members debited; zero-sum verified. | Financial Test Suite |
| **SRS-10** | Expense | Calculate group debt settlement summary using greedy minimum-transfer algorithm ("Who Owes Whom"). | All Roles | At least 1 recorded expense | Returns array of `{fromUser, toUser, amount, currency}` eliminating circular debts. | Algorithm Unit Test |
| **SRS-11** | Collaboration | Invite registered user to trip by email or user ID, assigning role `editor` or `viewer`. | Owner | Target user exists | Collaborator entry created; audit event `COLLABORATOR_INVITED` logged; Editor cannot invite. | Security Role Test |
| **SRS-12** | Collaboration | Modify collaborator role between Editor and Viewer. | Owner | Target is collaborator | Role updated in DB; Owner cannot demote self without ownership transfer. | RBAC Audit Test |
| **SRS-13** | Security | In-memory sliding window rate limiter on auth and API endpoints. | System | Excessive requests from same IP | Returns HTTP 429 Too Many Requests with Retry-After header. | Fuzz & Load Test |
| **SRS-14** | Security | Centralized tamper-evident audit logging for security events (logins, role updates, 403 violations). | Admin, Owner | Triggered by system events | Immutable log entry stored with actor, timestamp, IP, status, and details. | Audit Verification Test |
