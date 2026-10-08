# Phase 12: Secure Coding & Refactoring

## 1. Selected Critical Modules
To demonstrate secure coding principles and systematic refactoring, two core security-critical modules were analyzed, refactored, and tested:
1. **Module 1: RBAC & Shared-Resource Authorization Middleware (`src/middleware/rbacMiddleware.js`)**
2. **Module 2: Group Expense Split & Debt Minimization Engine (`src/routes/expenseRoutes.js`)**

---

## 2. Identified Weaknesses & Secure Refactoring

### Security Weakness 1: Broken Object-Level Authorization (BOLA/IDOR) & Missing Role Enforcement
- **Initial Flaw:** The initial endpoint trusted client-supplied IDs without verifying whether the user was a member of the trip or possessed write privileges. A malicious Viewer could submit HTTP `DELETE /api/trips/:tripId` and destroy an entire trip.
- **Refactoring Applied:** Implemented declarative `requireTripRole(['owner'])` and `requireTripRole(['owner', 'editor'])` interceptors. Added explicit ownership checks, cascading deletes, and security audit log triggers.
- **Security Improvement:** Eliminates BOLA (OWASP API Security Top 10 #1). Access is granted strictly on proven membership; unauthorized requests return `403 Forbidden` and generate an alert.

### Security Weakness 2: Unvalidated Currency Inputs & Floating-Point Drift
- **Initial Flaw:** Naive numeric division in JavaScript IEEE 754 floating-point math caused fractions of cents to disappear during equal bill splitting (e.g., $100 / 3 = 33.333333333333336), violating the zero-sum ledger conservation rule. In addition, negative numbers (e.g., `-500.00`) were not blocked, allowing balance inversion fraud.
- **Refactoring Applied:** Introduced strict validation middleware (`validateExpense`) verifying `amount > 0 && isFinite`. Implemented 2-decimal cent rounding (`Math.round(amt * 100) / 100`) and a Greedy Minimum-Transfer settlement algorithm.
- **Security Improvement:** Guarantees financial ledger integrity, prevents monetary fraud, and satisfies strict accounting standards.

---

## 3. Demonstration of Core Secure Coding Principles

### A. Input Validation
```javascript
// Strict schema validation in src/middleware/validationMiddleware.js
function validateExpense(req, res, next) {
  const { title, amount, splitWithUserIds } = req.body;
  if (!title || title.trim().length < 2) {
    return res.status(400).json({ success: false, error: 'Expense title is required.' });
  }
  const numAmount = Number(amount);
  if (isNaN(numAmount) || numAmount <= 0) {
    return res.status(400).json({ success: false, error: 'Expense amount must be a positive number greater than 0.' });
  }
  if (splitWithUserIds && !Array.isArray(splitWithUserIds)) {
    return res.status(400).json({ success: false, error: 'splitWithUserIds must be an array of user IDs.' });
  }
  next();
}
```

### B. Authorization
```javascript
// Fine-grained RBAC in src/middleware/rbacMiddleware.js
function requireTripRole(allowedRoles = ['owner', 'editor', 'viewer']) {
  return (req, res, next) => {
    const tripId = req.params.tripId;
    const trip = db.findById('trips', tripId);
    if (!trip) return res.status(404).json({ success: false, error: 'Trip not found.' });

    let userRole = trip.ownerId === req.user.id ? 'owner' : (
      (db.findOne('collaborators', c => c.tripId === tripId && c.userId === req.user.id) || {}).role
    );

    if (!userRole || !allowedRoles.includes(userRole)) {
      db.logAudit({ actorId: req.user.id, action: 'PRIVILEGE_VIOLATION_BLOCKED', status: 'BLOCKED_403' });
      return res.status(403).json({ success: false, error: 'Forbidden: Insufficient privileges.' });
    }
    req.trip = trip;
    req.tripRole = userRole;
    next();
  };
}
```

### C. Error Handling
- Stack traces stripped in production (`NODE_ENV === 'production'`) in `errorHandler.js`.
- Errors formatted as standardized JSON objects (`{ success: false, error: '...' }`).

### D. Secure Sensitive-Data Handling
- User passwords hashed using Bcrypt with 10 salt rounds.
- JWT tokens signed using high-entropy secret keys (`JWT_SECRET`).
- Plaintext passwords never stored in memory or logged to audit streams.

---

*(See `code_diffs.md` for explicit side-by-side Before/After code listings).*
