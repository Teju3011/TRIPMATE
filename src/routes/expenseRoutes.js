/**
 * Expense and Collaborative Split Settlement Routes
 * Handles group expense tracking, currency math, and "Who Owes Whom" debt reconciliation
 */

const express = require('express');
const router = express.Router({ mergeParams: true });
const db = require('../db/database');
const { authenticate } = require('../middleware/authMiddleware');
const { requireTripRole } = require('../middleware/rbacMiddleware');
const { validateExpense, sanitizeBody } = require('../middleware/validationMiddleware');

// Get all expenses for trip
router.get('/', authenticate, requireTripRole(['owner', 'editor', 'viewer']), (req, res) => {
  const tripId = req.params.tripId;
  const expenses = db.find('expenses', e => e.tripId === tripId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .map(exp => {
      const paidUser = db.findById('users', exp.paidByUserId);
      const splitUsers = (exp.splitWithUserIds || []).map(id => {
        const u = db.findById('users', id);
        return u ? { id: u.id, name: u.name, email: u.email } : { id };
      });

      return {
        ...exp,
        paidUser: paidUser ? { id: paidUser.id, name: paidUser.name, email: paidUser.email, avatar: paidUser.avatar } : null,
        splitUsers
      };
    });

  return res.json({ success: true, expenses });
});

// Add new expense (owner or editor)
router.post('/', authenticate, requireTripRole(['owner', 'editor']), sanitizeBody, validateExpense, (req, res) => {
  const tripId = req.params.tripId;
  const { title, amount, currency, category, paidByUserId, splitType, splitWithUserIds, receiptNote } = req.body;

  // Default splitWith to all active collaborators if not provided or empty
  let finalSplitWith = splitWithUserIds;
  if (!finalSplitWith || !finalSplitWith.length) {
    const collabs = db.find('collaborators', c => c.tripId === tripId);
    finalSplitWith = collabs.map(c => c.userId);
  }

  // Ensure paidBy user exists
  const payerId = paidByUserId || req.user.id;
  const payerUser = db.findById('users', payerId);
  if (!payerUser) {
    return res.status(400).json({ success: false, error: 'Designated payer user does not exist.' });
  }

  const roundedAmount = Math.round(Number(amount) * 100) / 100;

  const newExpense = db.insert('expenses', {
    tripId,
    title: title.trim(),
    amount: roundedAmount,
    currency: currency || req.trip.currency || 'USD',
    category: category || 'General',
    paidByUserId: payerId,
    splitType: splitType || 'equal',
    splitWithUserIds: finalSplitWith,
    isSettled: false,
    receiptNote: receiptNote ? receiptNote.trim() : ''
  });

  db.logAudit({
    actorId: req.user.id,
    actorEmail: req.user.email,
    action: 'EXPENSE_CREATED',
    resourceType: 'Expense',
    resourceId: newExpense.id,
    status: 'SUCCESS',
    ipAddress: req.ip || req.connection.remoteAddress,
    details: `Created expense '${newExpense.title}' for ${newExpense.currency} ${newExpense.amount} paid by ${payerUser.name}`
  });

  return res.status(201).json({
    success: true,
    message: 'Expense added successfully.',
    expense: newExpense
  });
});

// Update expense (owner or editor)
router.put('/:expenseId', authenticate, requireTripRole(['owner', 'editor']), sanitizeBody, validateExpense, (req, res) => {
  const tripId = req.params.tripId;
  const expenseId = req.params.expenseId;

  const expense = db.findById('expenses', expenseId);
  if (!expense || expense.tripId !== tripId) {
    return res.status(404).json({ success: false, error: 'Expense record not found.' });
  }

  const { title, amount, currency, category, paidByUserId, splitType, splitWithUserIds, isSettled, receiptNote } = req.body;

  const updates = {};
  if (title) updates.title = title.trim();
  if (amount !== undefined) updates.amount = Math.round(Number(amount) * 100) / 100;
  if (currency) updates.currency = currency;
  if (category) updates.category = category;
  if (paidByUserId) updates.paidByUserId = paidByUserId;
  if (splitType) updates.splitType = splitType;
  if (splitWithUserIds) updates.splitWithUserIds = splitWithUserIds;
  if (isSettled !== undefined) updates.isSettled = Boolean(isSettled);
  if (receiptNote !== undefined) updates.receiptNote = receiptNote.trim();

  const updated = db.update('expenses', expenseId, updates);

  db.logAudit({
    actorId: req.user.id,
    actorEmail: req.user.email,
    action: 'EXPENSE_UPDATED',
    resourceType: 'Expense',
    resourceId: expenseId,
    status: 'SUCCESS',
    ipAddress: req.ip || req.connection.remoteAddress,
    details: `Updated expense '${updated.title}'`
  });

  return res.json({ success: true, message: 'Expense updated.', expense: updated });
});

// Delete expense (owner or editor)
router.delete('/:expenseId', authenticate, requireTripRole(['owner', 'editor']), (req, res) => {
  const tripId = req.params.tripId;
  const expenseId = req.params.expenseId;

  const expense = db.findById('expenses', expenseId);
  if (!expense || expense.tripId !== tripId) {
    return res.status(404).json({ success: false, error: 'Expense record not found.' });
  }

  db.delete('expenses', expenseId);

  db.logAudit({
    actorId: req.user.id,
    actorEmail: req.user.email,
    action: 'EXPENSE_DELETED',
    resourceType: 'Expense',
    resourceId: expenseId,
    status: 'SUCCESS',
    ipAddress: req.ip || req.connection.remoteAddress,
    details: `Deleted expense '${expense.title}' (${expense.amount} ${expense.currency}) from trip ${tripId}`
  });

  return res.json({ success: true, message: 'Expense record removed.' });
});

// Settlement Summary & Who Owes Whom Algorithm
router.get('/settlement-summary', authenticate, requireTripRole(['owner', 'editor', 'viewer']), (req, res) => {
  const tripId = req.params.tripId;
  const trip = req.trip;
  const expenses = db.find('expenses', e => e.tripId === tripId);
  const collabs = db.find('collaborators', c => c.tripId === tripId);

  // Initialize balance ledger for all collaborators
  const balances = {};
  const totalPaid = {};
  const totalShare = {};
  const userMap = {};

  collabs.forEach(c => {
    const user = db.findById('users', c.userId);
    if (user) {
      balances[c.userId] = 0;
      totalPaid[c.userId] = 0;
      totalShare[c.userId] = 0;
      userMap[c.userId] = { id: user.id, name: user.name, email: user.email, avatar: user.avatar };
    }
  });

  let totalTripSpent = 0;
  const categoryBreakdown = {};

  expenses.forEach(exp => {
    const amount = Number(exp.amount) || 0;
    totalTripSpent += amount;

    // Category accumulation
    categoryBreakdown[exp.category] = (categoryBreakdown[exp.category] || 0) + amount;

    // Credit payer
    if (balances[exp.paidByUserId] !== undefined) {
      balances[exp.paidByUserId] += amount;
      totalPaid[exp.paidByUserId] += amount;
    }

    // Debit split members
    const splitGroup = (exp.splitWithUserIds && exp.splitWithUserIds.length > 0)
      ? exp.splitWithUserIds
      : collabs.map(c => c.userId);

    const sharePerPerson = amount / splitGroup.length;

    splitGroup.forEach(uid => {
      if (balances[uid] !== undefined) {
        balances[uid] -= sharePerPerson;
        totalShare[uid] += sharePerPerson;
      }
    });
  });

  // Calculate "Who Owes Whom" simplified settlement transactions
  const debtors = [];
  const creditors = [];

  Object.keys(balances).forEach(uid => {
    const bal = Math.round(balances[uid] * 100) / 100;
    balances[uid] = bal;
    totalPaid[uid] = Math.round(totalPaid[uid] * 100) / 100;
    totalShare[uid] = Math.round(totalShare[uid] * 100) / 100;

    if (bal < -0.01) {
      debtors.push({ userId: uid, amount: -bal });
    } else if (bal > 0.01) {
      creditors.push({ userId: uid, amount: bal });
    }
  });

  // Sort: largest debtors and creditors first (Greedy reconciliation)
  debtors.sort((a, b) => b.amount - a.amount);
  creditors.sort((a, b) => b.amount - a.amount);

  const settlements = [];
  let dIdx = 0;
  let cIdx = 0;

  while (dIdx < debtors.length && cIdx < creditors.length) {
    const debtor = debtors[dIdx];
    const creditor = creditors[cIdx];

    const settleAmount = Math.min(debtor.amount, creditor.amount);
    if (settleAmount > 0.01) {
      settlements.push({
        fromUserId: debtor.userId,
        fromUser: userMap[debtor.userId],
        toUserId: creditor.userId,
        toUser: userMap[creditor.userId],
        amount: Math.round(settleAmount * 100) / 100,
        currency: trip.currency || 'USD'
      });
    }

    debtor.amount -= settleAmount;
    creditor.amount -= settleAmount;

    if (debtor.amount <= 0.01) dIdx++;
    if (creditor.amount <= 0.01) cIdx++;
  }

  return res.json({
    success: true,
    summary: {
      totalTripSpent: Math.round(totalTripSpent * 100) / 100,
      budget: trip.budget || 0,
      budgetRemaining: Math.round(((trip.budget || 0) - totalTripSpent) * 100) / 100,
      currency: trip.currency || 'USD',
      categoryBreakdown,
      memberSummaries: Object.keys(balances).map(uid => ({
        user: userMap[uid],
        paid: totalPaid[uid],
        share: totalShare[uid],
        netBalance: balances[uid] // positive means they are owed money, negative means they owe
      })),
      settlements
    }
  });
});

module.exports = router;
