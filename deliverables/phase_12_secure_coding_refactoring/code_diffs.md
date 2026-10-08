# Secure Coding Refactoring: Before and After Source Diffs

## Code Diff 1: Trip Deletion Authorization (BOLA/IDOR Elimination)

```diff
- // VULNERABLE INITIAL IMPLEMENTATION:
- router.delete('/:tripId', authenticate, (req, res) => {
-   const tripId = req.params.tripId;
-   // FLAW: No verification that req.user.id owns the trip!
-   // Any authenticated user could delete any trip by guessing the ID.
-   db.delete('trips', tripId);
-   return res.json({ success: true, message: 'Trip deleted' });
- });

+ // REFACTORED SECURE IMPLEMENTATION:
+ router.delete('/:tripId', authenticate, requireTripRole(['owner']), (req, res) => {
+   const tripId = req.params.tripId;
+   
+   // 1. Verify caller has exclusive 'owner' rights on this specific resource
+   // 2. Cascade delete all associated destinations, itinerary items, expenses, and memberships
+   const dests = db.find('destinations', d => d.tripId === tripId);
+   dests.forEach(d => db.delete('destinations', d.id));
+   const itins = db.find('itinerary', i => i.tripId === tripId);
+   itins.forEach(i => db.delete('itinerary', i.id));
+   const exps = db.find('expenses', e => e.tripId === tripId);
+   exps.forEach(e => db.delete('expenses', e.id));
+   const collabs = db.find('collaborators', c => c.tripId === tripId);
+   collabs.forEach(c => db.delete('collaborators', c.id));
+   db.delete('trips', tripId);
+   
+   // 3. Log permanent deletion to immutable security audit trail
+   db.logAudit({
+     actorId: req.user.id,
+     actorEmail: req.user.email,
+     action: 'TRIP_DELETED',
+     resourceType: 'Trip',
+     resourceId: tripId,
+     status: 'SUCCESS',
+     details: `Trip permanently deleted by owner ${req.user.email}`
+   });
+   return res.json({ success: true, message: 'Trip permanently deleted.' });
+ });
```

---

## Code Diff 2: Expense Input Validation & Cent Rounding

```diff
- // VULNERABLE INITIAL IMPLEMENTATION:
- router.post('/', authenticate, (req, res) => {
-   const { title, amount } = req.body;
-   // FLAW 1: Amount not verified to be positive (negative numbers allowed)
-   // FLAW 2: Title not sanitized against HTML/XSS injection
-   // FLAW 3: Floating point division directly performed: amount / N
-   const newExpense = db.insert('expenses', { title, amount });
-   return res.status(201).json({ success: true, expense: newExpense });
- });

+ // REFACTORED SECURE IMPLEMENTATION:
+ router.post('/', authenticate, requireTripRole(['owner', 'editor']), sanitizeBody, validateExpense, (req, res) => {
+   const tripId = req.params.tripId;
+   const { title, amount, currency, category, paidByUserId, splitWithUserIds, receiptNote } = req.body;
+   
+   // 1. Enforce 2-decimal rounded precision
+   const roundedAmount = Math.round(Number(amount) * 100) / 100;
+   
+   // 2. Validate payer exists and split group is valid
+   const payerId = paidByUserId || req.user.id;
+   const payerUser = db.findById('users', payerId);
+   if (!payerUser) return res.status(400).json({ success: false, error: 'Payer does not exist.' });
+   
+   // 3. Persist validated record
+   const newExpense = db.insert('expenses', {
+     tripId,
+     title: title.trim(),
+     amount: roundedAmount,
+     currency: currency || req.trip.currency || 'USD',
+     category: category || 'General',
+     paidByUserId: payerId,
+     splitWithUserIds: splitWithUserIds || [],
+     isSettled: false,
+     receiptNote: receiptNote ? receiptNote.trim() : ''
+   });
+   
+   // 4. Record audit event
+   db.logAudit({
+     actorId: req.user.id,
+     action: 'EXPENSE_CREATED',
+     resourceId: newExpense.id,
+     details: `Created expense ${newExpense.amount} paid by ${payerUser.name}`
+   });
+   return res.status(201).json({ success: true, expense: newExpense });
+ });
```
