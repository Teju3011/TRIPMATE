# Phase 12: Secure Coding and Refactoring [4 Marks]

## 1. Selected Critical Modules for Refactoring
Two security-critical architectural modules were analyzed and refactored:
1. **Module 1: RBAC & Shared-Resource Authorization Middleware (`src/middleware/rbacMiddleware.js`)**
2. **Module 2: Expense Validation & Cent-Precision Split Engine (`src/routes/expenseRoutes.js` + `src/middleware/validationMiddleware.js`)**

---

## 2. Identified Security Weaknesses

### Security Weakness 1: Broken Object-Level Authorization (BOLA/IDOR) & Privilege Escalation
- **Initial Vulnerability:** The initial trip deletion and modification endpoints trusted client-supplied IDs without verifying whether the caller was a registered collaborator or possessed owner/editor privileges. Any authenticated user could send `DELETE /api/trips/:tripId` with an arbitrary UUID to wipe another user's trip.
- **OWASP Categorization:** OWASP API Security Top 10 — API1:2023 Broken Object Level Authorization (BOLA).
- **Refactoring Applied:** Implemented declarative `requireTripRole(['owner'])` and `requireTripRole(['owner', 'editor'])` middleware. The interceptor fetches the trip, looks up the caller's membership in the `collaborators` ledger, verifies permission hierarchy (`owner > editor > viewer`), and blocks unauthorized attempts with `HTTP 403 Forbidden` while generating an audit event.

### Security Weakness 2: Unvalidated Numeric Inputs & IEEE-754 Floating-Point Ledger Drift
- **Initial Vulnerability:** 
  1. The expense creation endpoint did not validate that `amount` was a positive number; an attacker could submit negative amounts (`amount: -500`) to artificially invert debt balances.
  2. Direct floating-point division (`amount / memberCount`) in JavaScript caused fractional cent errors ($100 / 3 = $33.333333333333336), violating the zero-sum ledger conservation invariant.
- **Refactoring Applied:**
  1. Added strict validation middleware (`validateExpense`) verifying `typeof amount === 'number'`, `amount > 0`, and `isFinite(amount)`.
  2. Implemented integer cent conversion and 2-decimal precision rounding (`Math.round(amt * 100) / 100`).
  3. Reconciled rounding residuals to the primary payer so the sum of all debtor shares exactly matches total expenditure.

---

## 3. Before vs. After Code Evidence

### A. Authorization & BOLA Refactoring (`src/routes/tripRoutes.js`)

#### Before Refactoring (Vulnerable Implementation):
```javascript
// VULNERABLE: No ownership or role check
router.delete('/:tripId', authenticate, (req, res) => {
  const tripId = req.params.tripId;
  // FLAW: Deletes trip without verifying if req.user.id is the owner!
  db.delete('trips', tripId);
  return res.json({ success: true, message: 'Trip deleted' });
});
```

#### After Refactoring (Secure Implementation):
```javascript
// SECURE: Enforces strict owner role and cascades dependent resources
router.delete('/:tripId', authenticate, requireTripRole(['owner']), (req, res) => {
  const tripId = req.params.tripId;
  
  // 1. Cascade delete associated destinations, itinerary items, expenses, and collaborators
  db.find('destinations', d => d.tripId === tripId).forEach(d => db.delete('destinations', d.id));
  db.find('itinerary', i => i.tripId === tripId).forEach(i => db.delete('itinerary', i.id));
  db.find('expenses', e => e.tripId === tripId).forEach(e => db.delete('expenses', e.id));
  db.find('collaborators', c => c.tripId === tripId).forEach(c => db.delete('collaborators', c.id));
  db.delete('trips', tripId);

  // 2. Log security audit trail
  db.logAudit({
    actorId: req.user.id,
    actorEmail: req.user.email,
    action: 'TRIP_DELETED',
    resourceType: 'Trip',
    resourceId: tripId,
    status: 'SUCCESS',
    details: `Trip permanently deleted by owner ${req.user.email}`
  });

  return res.json({ success: true, message: 'Trip and associated resources permanently deleted.' });
});
```

---

### B. Input Validation & Split Math Refactoring (`src/middleware/validationMiddleware.js`)

#### Before Refactoring (Vulnerable Implementation):
```javascript
// VULNERABLE: Naive passthrough without validation
router.post('/expenses', authenticate, (req, res) => {
  const { title, amount } = req.body;
  // FLAW: Accepts negative amounts, empty titles, and NaN
  const expense = db.insert('expenses', { title, amount });
  res.json({ success: true, expense });
});
```

#### After Refactoring (Secure Implementation):
```javascript
// SECURE: Comprehensive input sanitization, type validation, and cent precision
function validateExpense(req, res, next) {
  const { title, amount, splitWithUserIds } = req.body;

  // 1. Title validation & sanitization
  if (!title || typeof title !== 'string' || title.trim().length < 2) {
    return res.status(400).json({ success: false, error: 'Expense title must be at least 2 characters long.' });
  }

  // 2. Strict positive number validation
  const numAmount = Number(amount);
  if (isNaN(numAmount) || !isFinite(numAmount) || numAmount <= 0) {
    return res.status(400).json({ success: false, error: 'Expense amount must be a positive number greater than 0.' });
  }

  // 3. Array validation
  if (splitWithUserIds && !Array.isArray(splitWithUserIds)) {
    return res.status(400).json({ success: false, error: 'splitWithUserIds must be an array of user IDs.' });
  }

  // 4. Cent precision normalization
  req.body.sanitizedAmount = Math.round(numAmount * 100) / 100;
  req.body.sanitizedTitle = title.trim();
  next();
}
```

---

## 4. Demonstration of Four Core Secure Coding Tenets

### 1. Input Validation:
- All request parameters validated against whitelist criteria (title length, date coherence, positive numbers).
- String inputs sanitized to eliminate Cross-Site Scripting (XSS) and command injection vectors.

### 2. Authorization:
- Every protected operation passes through `authenticate` (validates JWT integrity) and `requireTripRole` (checks granular permissions).
- Strict role hierarchy: `owner` (full admin) > `editor` (itinerary & expense write) > `viewer` (read-only).

### 3. Error Handling:
- Centralized error handler (`src/middleware/errorHandler.js`) catches all unhandled exceptions.
- In production (`NODE_ENV === 'production'`), internal stack traces are stripped to prevent information disclosure.
- Standardized response envelopes: `{ success: false, error: 'Sanitized error message' }`.

### 4. Secure Sensitive-Data Handling:
- Passwords hashed using Bcrypt with 10 salt rounds before storage.
- Passwords stripped from user objects prior to serialization (`delete user.passwordHash`).
- JWT tokens signed with high-entropy cryptographic keys and expired within 24 hours.
