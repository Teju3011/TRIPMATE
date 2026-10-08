# Phase 6: User Interface Design

## 1. Overview of Key Application Screens
The TripMate frontend is engineered as a responsive, dark-mode Single Page Application (SPA) adhering to modern design principles, accessible contrast ratios, and Shneiderman's 8 Golden Rules of Interface Design.

---

## 2. Screen Specifications & Design Rationale

### Screen 1: Secure Authentication & Persona Onboarding
- **Target User:** All Users (Organizer, Contributor, Viewer, Auditor).
- **User Goal:** Authenticate securely into the platform or rapidly switch roles for evaluation.
- **Navigation:** Root entry point (`/`); redirects to Trip Dashboard upon successful token issuance.
- **Inputs:** Email address, password, test persona quick-switcher buttons (Alice, Bob, Charlie).
- **Visual Feedback:** Instant avatar loading, active pill highlight, animated toast message ("Logged in as Alice Chen").
- **Error Handling:** Red inline error alerts for invalid credentials; 429 rate limit banner indicating retry timeout.
- **Security Considerations:** Passwords masked; CSRF token & CSP headers applied; client prevents credential caching in plaintext.
- **Wireframe Artifact:** [screen_01_login_auth.svg](file:///C:/Users/tej30/.gemini/antigravity-ide/scratch/tripmate/deliverables/phase_06_ui_design/wireframes/screen_01_login_auth.svg)

---

### Screen 2: Trip Dashboard & Route Overview
- **Target User:** Trip Owner, Editor, Viewer.
- **User Goal:** Monitor high-level trip health, budget utilization, route stops, and member rosters.
- **Navigation:** Primary Landing tab ("Overview"); links to Destinations, Itinerary, and Expense tabs.
- **Inputs:** Active Trip dropdown selector, quick "+ Add Destination" and "+ Invite" modal triggers.
- **Visual Feedback:** Two-color gradient budget progress bar (cyan to emerald; transitions to amber/rose if >90% spent); destination timeline dots.
- **Error Handling:** Empty state graphic displayed if no trips exist; polite error banner if trip fails to load.
- **Security Considerations:** If current user is in `viewer` role, mutating buttons are visually disabled with a padlock badge and explanatory tooltip.
- **Wireframe Artifact:** [screen_02_trip_dashboard.svg](file:///C:/Users/tej30/.gemini/antigravity-ide/scratch/tripmate/deliverables/phase_06_ui_design/wireframes/screen_02_trip_dashboard.svg)

---

### Screen 3: Collaborative Itinerary & Task Planner
- **Target User:** Trip Owner, Editor, Viewer.
- **User Goal:** Schedule day-by-day activities, assign tasks to companions, and track completion.
- **Navigation:** "Itinerary & Tasks" tab with horizontal day chips (All Days, Day 1, Day 2, etc.).
- **Inputs:** Activity Title, Day number, Time, Location, Estimated Cost, Assignee dropdown, Checkbox toggle.
- **Visual Feedback:** Interactive checkboxes toggle item completion with strike-through typography; assigned member avatar pills.
- **Error Handling:** Client-side HTML5 validation ensures positive day numbers and non-empty titles.
- **Security Considerations:** Assignee select list is strictly populated with verified trip collaborators to prevent unauthorized foreign-user assignment.
- **Wireframe Artifact:** [screen_03_itinerary_planner.svg](file:///C:/Users/tej30/.gemini/antigravity-ide/scratch/tripmate/deliverables/phase_06_ui_design/wireframes/screen_03_itinerary_planner.svg)

---

### Screen 4: Group Expenses & Debt Settlement Hub
- **Target User:** Trip Collaborators & Financial Settlers.
- **User Goal:** Log shared payments, view category breakdowns, and inspect "Who Owes Whom" simplified debts.
- **Navigation:** "Expenses & Split" tab.
- **Inputs:** Title, Amount, Category, Payer member, Split checkboxes, Receipt reference note.
- **Visual Feedback:** Real-time Category Breakdown pills; prominent "Who Owes Whom" settlement cards displaying directional arrows (`Bob owes → Alice $140.00`).
- **Error Handling:** Prevents submission if amount ≤ 0; notifies user if zero split members are selected.
- **Security Considerations:** Zero-sum ledger verification; XSS sanitization on receipt notes; deletion restricted to authorized roles.
- **Wireframe Artifact:** [screen_04_expenses_settlement.svg](file:///C:/Users/tej30/.gemini/antigravity-ide/scratch/tripmate/deliverables/phase_06_ui_design/wireframes/screen_04_expenses_settlement.svg)

---

## 3. Evaluation Against Shneiderman's 8 Golden Rules

1. **Strive for Consistency:** Uniform color hierarchy (cyan accents, emerald finances, amber owner badges), identical modal interaction patterns, and standardized button radiuses across all screens.
2. **Enable Frequent Users to Use Shortcuts:** Fast persona switcher in top navigation allows instant role toggling without manually re-typing credentials.
3. **Offer Informative Feedback:** Every write operation triggers an animated toast notification and immediate UI state update.
4. **Design Dialogs to Yield Closure:** Add/Edit modals contain explicit "Save" and "Cancel" actions, auto-closing upon successful API confirmation.
5. **Prevent Errors:** Buttons requiring write permissions are disabled for `viewer` roles with clear tooltips; date inputs enforce chronological order (`endDate >= startDate`).
6. **Permit Easy Reversal of Actions:** Activity completion status can be toggled back and forth at any time.
7. **Support Internal Locus of Control:** Users initiate all actions explicitly; the active trip dropdown gives total navigational agency.
8. **Reduce Short-Term Memory Load:** Key metrics (total budget, spent, remaining) remain permanently visible in dashboard header cards.
