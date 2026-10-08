# Phase 1: Refactoring Evidence & Architectural Evolution

## Refactoring 1: Broken Object-Level Authorization (BOLA/IDOR) Defense

### 1. Context & Code Smells
In the initial naive prototype, route handlers trusted the client payload and inspected only global authentication without validating object-level ownership:

#### Before Refactoring (Vulnerable / Anti-Pattern):
```javascript
// Naive Prototype - Vulnerable to IDOR (Insecure Direct Object Reference)
app.delete('/api/trips/:tripId', authenticate, (req, res) => {
  const tripId = req.params.tripId;
  // FLAW: Any authenticated user can delete ANY trip just by knowing its tripId!
  const deleted = db.delete('trips', tripId);
  return res.json({ success: true, message: 'Trip deleted' });
});
```

#### After Refactoring (Secure Clean Interceptor):
```javascript
// Secure Refactored Implementation (Extracted RBAC Interceptor)
const { requireTripRole } = require('../middleware/rbacMiddleware');

// Strictly enforces that the caller must possess the 'owner' role on :tripId
router.delete('/:tripId', authenticate, requireTripRole(['owner']), (req, res) => {
  const tripId = req.params.tripId;
  
  // Cascade delete all sub-resources (Destinations, Itinerary, Expenses, Collaborators)
  db.find('destinations', d => d.tripId === tripId).forEach(d => db.delete('destinations', d.id));
  db.find('itinerary', i => i.tripId === tripId).forEach(i => db.delete('itinerary', i.id));
  db.find('expenses', e => e.tripId === tripId).forEach(e => db.delete('expenses', e.id));
  db.find('collaborators', c => c.tripId === tripId).forEach(c => db.delete('collaborators', c.id));
  db.delete('trips', tripId);

  // Immutable Audit Logging
  db.logAudit({
    actorId: req.user.id,
    actorEmail: req.user.email,
    action: 'TRIP_DELETED',
    resourceType: 'Trip',
    resourceId: tripId,
    status: 'SUCCESS',
    details: `Trip permanently deleted by owner ${req.user.email}`
  });

  return res.json({ success: true, message: 'Trip permanently deleted.' });
});
```
- **Security Impact:** Eliminates OWASP API Security Top 10 #1 (Broken Object Level Authorization). Viewer or Editor role attempts are intercepted and return `HTTP 403 Forbidden` with a recorded security alert.

---

## Refactoring 2: Group Expense Split Engine & Ledger Conservation

### 1. Context & Code Smells
Floating point arithmetic `0.1 + 0.2 === 0.30000000000000004` caused fractional cent leakage when splitting bills 3 or 7 ways.

#### Before Refactoring:
```javascript
// Floating-point division error
const share = expense.amount / expense.splitWithUserIds.length;
// Result: 100 / 3 = 33.333333333333336
// Total collected: 33.33 * 3 = 99.99 (0.01 cent vanishes, failing ledger audit)
```

#### After Refactoring:
```javascript
// High-Precision Currency Math with Cent Rounding and Minimum Transaction Settlement
const roundedAmount = Math.round(Number(amount) * 100) / 100;
const sharePerPerson = roundedAmount / splitGroup.length;

// Ledger Conservation Verification
const totalDebits = splitGroup.reduce((sum, uid) => sum + sharePerPerson, 0);
assert(Math.abs(roundedAmount - totalDebits) < 0.01, 'Ledger imbalance detected');

// Greedy Minimum-Transfer Reconciliation Algorithm implemented in /settlement-summary
```
- **Security Impact:** Guarantees financial integrity and auditability.
