# Phase 6: User Interface Design

## 1. Overview & Problem Statement Mapping
The TripMate frontend is engineered as a responsive, high-performance Single Page Application (SPA) adhering to modern design principles, accessible contrast ratios (WCAG 2.1 AA), and Shneiderman's Golden Rules of Interface Design.

### Rubric Mapping to Problem Statement
To align directly with the academic rubric criteria (which evaluates four core operational screens: Authentication, Primary Participant Workspace, Administrative/Management Portal, and Evaluative/Settlement Summary), TripMate defines four distinct interfaces:

| Rubric Screen Archetype | TripMate Concrete Screen | Primary Target User | Core Functional Scope |
| :--- | :--- | :--- | :--- |
| **Screen 1: Login / Auth** | **Dual-Tab Authentication & Registration Portal** | All Users (Unauthenticated) | Secure user registration, credential hashing validation, JWT token issuance, session persistence. |
| **Screen 2: Core Workspace** | **Trip Dashboard & Route Waypoint Overview** | Trip Owner, Editor, Viewer | Multi-trip navigation, status badges, budget overview, sequential destination stops, timeline cards. |
| **Screen 3: Management Interface** | **Collaborative Itinerary & Task Scheduler** | Trip Owner, Editor | Day-indexed schedule creation, task assignment to collaborators, completion milestone tracking. |
| **Screen 4: Outcome & Settlement** | **Group Expenses Ledger & Debt Settlement Matrix** | Trip Collaborators | Zero-sum group expense recording, multi-member splits, automated *"Who Owes Whom"* debt minimization matrix. |

---

## 2. Screen Specifications & Design Rationale (Detailed Attributes)

### Screen 1: Secure Authentication & Persona Onboarding
* **Target User:** All Users (New visitors, returning travelers, system auditors).
* **User Goal:** Create a new authenticated account or securely log in to receive an HMAC-SHA256 signed JWT session token.
* **Navigation:** Root entry route (`/`); upon successful authentication, the system automatically redirects to the Trip Dashboard (`/dashboard`). Unauthenticated requests to protected views automatically redirect to this portal.
* **Inputs:** 
  * Registration: Display Name, Email address, Password (enforces min 8 characters, 1 uppercase, 1 lowercase, 1 number).
  * Login: Email address, Password.
* **Visual Feedback:** 
  * Real-time client-side password strength progress bar (Red = Weak, Amber = Moderate, Green = Strong).
  * Form submission spinner and animated toast notifications (`"Registration successful! Welcome to TripMate"`).
  * Smooth active tab sliding highlight between "Login" and "Register".
* **Error Handling:** 
  * Red inline alert boxes indicating exact failure reasons (`"Invalid email or password"`, `"Email already registered"`).
  * HTTP 429 Rate Limiting banner: `"Too many requests. Please wait 15 minutes before retrying."`
  * Client-side HTML5 input validation prevents submission of malformed emails.
* **Security Considerations:** 
  * Passwords masked using standard HTML `<input type="password">`.
  * Passwords transmitted over TLS 1.3 and hashed server-side with bcrypt (10 salt rounds); plaintext credentials never logged.
  * In-memory sliding-window rate limiter prevents brute-force credential stuffing.
  * Stateless JWT stored in `localStorage` with client-side expiration checks.
* **Wireframe Artifact:** [screen_01_login_auth.svg](file:///C:/Users/tej30/.gemini/antigravity-ide/scratch/tripmate/deliverables/phase_06_ui_design/wireframes/screen_01_login_auth.svg)

---

### Screen 2: Trip Dashboard & Route Waypoint Overview
* **Target User:** Trip Owner, Editor, Viewer.
* **User Goal:** Monitor high-level trip health, view countdowns, inspect budget utilization, explore destination routes, and switch between trips.
* **Navigation:** Primary landing view. Contains top navigation bar with user profile pill, "+ New Trip" action button, active trip switcher dropdown, and deep links to Itinerary and Expense tabs.
* **Inputs:** 
  * Active Trip Selector (dropdown).
  * "+ Add Destination" modal inputs: City Name, Country, Arrival Date, Departure Date, Notes.
  * "+ Invite Collaborator" modal inputs: Email address, Role (`editor` or `viewer`).
* **Visual Feedback:** 
  * Two-color gradient budget progress bar (Cyan `#38bdf8` to Emerald `#10b981`; transitions to Amber/Rose if >90% of budget is spent).
  * Interactive destination waypoint timeline with sequential stop counters (Stop 1, Stop 2, Stop 3).
  * Role indicator badge displayed in header (`OWNER` in gold, `EDITOR` in emerald, `VIEWER` in slate).
* **Error Handling:** 
  * Zero-data empty state illustration when a user has no active trips, displaying a friendly prompt: *"No trips found. Create your first trip to get started!"*
  * Non-blocking toast alert if destination date range falls outside the trip's start/end dates.
* **Security Considerations:** 
  * Broken Object Level Authorization (BOLA) defense: The client only receives trips where the user's ID is linked in the `collaborators` table.
  * UI role disabling: If the active user has the `viewer` role, mutating action buttons (`+ Add Destination`, `+ Invite`) are visually hidden or disabled with a padlock badge.
* **Wireframe Artifact:** [screen_02_trip_dashboard.svg](file:///C:/Users/tej30/.gemini/antigravity-ide/scratch/tripmate/deliverables/phase_06_ui_design/wireframes/screen_02_trip_dashboard.svg)

---

### Screen 3: Collaborative Itinerary & Task Scheduler
* **Target User:** Trip Owner, Trip Editor, Trip Viewer.
* **User Goal:** Schedule day-by-day activities, assign specific duties/tasks to companions, specify estimated costs, and track completion progress.
* **Navigation:** Accessible via the "Itinerary & Tasks" tab in the trip workspace. Features horizontal filter chips to view "All Days", "Day 1", "Day 2", etc.
* **Inputs:** 
  * Activity Title (String).
  * Scheduled Date & Time picker.
  * Location / Venue (String).
  * Estimated Budget / Cost (Decimal).
  * Assignee dropdown (populated dynamically with active trip collaborators).
  * Activity Completion toggle (Checkbox).
* **Visual Feedback:** 
  * Clicking the completion checkbox triggers strikethrough typography, soft opacity fade, and green checkmark badge.
  * Avatar pill for the assigned member with initials and color-coded border.
  * Real-time calculation of daily total estimated cost at the top of each day's schedule card.
* **Error Handling:** 
  * Form blocks submission if activity title is blank or cost is negative.
  * If a user tries to schedule an activity for a date outside the trip duration, an inline error warns: *"Activity date must be between [StartDate] and [EndDate]"*.
* **Security Considerations:** 
  * Assignee selection dropdown is strictly constrained to verified collaborators on that specific trip, preventing unauthorized cross-trip data injection.
  * Input sanitization prevents Stored XSS: Activity titles and location notes are HTML entity-encoded before rendering.
  * Only `owner` and `editor` roles can add or toggle activities; `viewer` attempts return HTTP 403.
* **Wireframe Artifact:** [screen_03_itinerary_planner.svg](file:///C:/Users/tej30/.gemini/antigravity-ide/scratch/tripmate/deliverables/phase_06_ui_design/wireframes/screen_03_itinerary_planner.svg)

---

### Screen 4: Group Expenses Ledger & Debt Settlement Matrix
* **Target User:** Trip Collaborators (Owner, Editor, Viewer).
* **User Goal:** Log shared group expenditures, categorize costs, split costs equally or custom among members, and inspect the simplified *"Who Owes Whom"* debt settlement matrix.
* **Navigation:** Accessible via the "Expenses & Split" tab in the trip workspace.
* **Inputs:** 
  * Expense Title / Description.
  * Amount (positive currency decimal).
  * Currency Selector (`USD`, `EUR`, `GBP`, `INR`).
  * Category dropdown (`Lodging`, `Food & Dining`, `Transport`, `Activities`, `Miscellaneous`).
  * Payer Member selector (who paid).
  * Split Members checkboxes (select which travelers share the expense).
* **Visual Feedback:** 
  * Dynamic spending breakdown by category with colored pill tags.
  * Prominent **"Who Owes Whom" Debt Settlement Matrix**: Clean directional transfer cards showing exact minimum payments (e.g., `Bob owes → Alice $140.00`).
  * Green badge indicating *"Settled / Balanced"* when all debts equal zero.
* **Error Handling:** 
  * Rejects submissions with negative, zero, or non-numeric amounts.
  * Prevents submission if no split members are checked, with inline notification: *"Select at least one traveler to split this expense"*.
* **Security Considerations:** 
  * Zero-sum ledger conservation: Enforces mathematical consistency where the sum of credits equals the sum of debits.
  * Cent-level integer rounding eliminates floating-point division leakage.
  * Viewers can inspect debts but cannot modify or delete expense entries.
* **Wireframe Artifact:** [screen_04_expenses_settlement.svg](file:///C:/Users/tej30/.gemini/antigravity-ide/scratch/tripmate/deliverables/phase_06_ui_design/wireframes/screen_04_expenses_settlement.svg)

---

## 3. Application of the Golden Rules of Interface Design

The TripMate interface rigorously implements the six core Golden Rules specified in the syllabus rubric:

### 1. Consistency
* **Visual Consistency:** Standardized dark-slate color palette (`#0f172a` canvas, `#1e293b` cards, `#38bdf8` cyan highlights, `#10b981` emerald success badges).
* **Component Consistency:** All buttons utilize identical 8px border radiuses, font weights, and hover states. Modal dialogs across all views follow identical layout geometry: Title header, Form body, Cancel/Save footer.
* **Terminological Consistency:** Roles are uniformly termed `Owner`, `Editor`, and `Viewer` across all dialogs, tables, and audit logs.

### 2. User Control and Freedom
* **Navigation Agency:** Users can navigate freely between Overview, Itinerary, and Expense tabs without losing entered draft states.
* **Explicit Action Triggers:** Destructive actions (e.g., deleting a trip or removing an expense) require explicit secondary confirmation dialogs to prevent accidental loss.
* **Reversibility of Actions:** Activity completion states can be toggled back and forth instantly; expenses can be updated or removed by authorized editors.

### 3. Informative Feedback
* **Instant Visual Confirmation:** Every CRUD operation triggers an animated toast notification in the upper-right corner (e.g., `"Destination Paris added successfully"`).
* **Dynamic State Updates:** Toggling an activity immediately strikes through the text and updates the progress indicator without requiring a manual page refresh.
* **System Loading States:** Asynchronous API fetches display pulsing skeleton placeholders rather than empty blank containers.

### 4. Error Prevention
* **Disabled Invalid States:** Submit buttons remain disabled or warn users if mandatory fields (e.g., Expense Amount, Trip Title) are incomplete.
* **Constrained Inputs:** Date pickers enforce chronological validity (Departure date cannot precede Arrival date).
* **Role-Based Guards:** Non-owners cannot see or click ownership transfer actions, preventing privilege violations before network requests are dispatched.

### 5. Clear Navigation
* **Predictable Hierarchy:** Clean breadcrumb path from `Dashboard` → `Active Trip` → `Sub-Module (Itinerary / Expenses)`.
* **Sticky Navigation Bar:** Top navigation bar remains anchored during long page scrolls, keeping trip switcher and profile controls immediately accessible.
* **Tab Highlighting:** Active views are highlighted with vibrant cyan underlines and high-contrast text.

### 6. Visibility of System Status
* **Real-Time Budget Metric:** The Trip Overview displays spent funds vs. remaining budget as both a numerical total and an interactive visual progress bar.
* **Authentication State:** User avatar, display name, and active RBAC role badge are permanently visible in the top header.
* **Network Status:** The UI displays immediate feedback if offline or if a background request fails due to network disconnection.
