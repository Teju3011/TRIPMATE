/**
 * Security Audit Log Routes
 * Exposes tamper-evident security audit trails to trip owners and security administrators
 */

const express = require('express');
const router = express.Router();
const db = require('../db/database');
const { authenticate } = require('../middleware/authMiddleware');
const { requireTripRole, requireAdmin } = require('../middleware/rbacMiddleware');

// Get trip-specific audit logs (strictly restricted to Trip Owner or System Admin)
router.get('/trips/:tripId', authenticate, requireTripRole(['owner']), (req, res) => {
  const tripId = req.params.tripId;

  const logs = db.find('auditLogs', log => {
    return log.resourceId === tripId ||
           (log.details && log.details.includes(tripId));
  }).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  return res.json({
    success: true,
    tripId,
    totalLogs: logs.length,
    logs
  });
});

// Get system-wide audit logs (strictly restricted to System Security Admin)
router.get('/admin/all', authenticate, requireAdmin, (req, res) => {
  const { limit = 100, action, status } = req.query;

  let logs = db.find('auditLogs', log => {
    if (action && log.action !== action) return false;
    if (status && log.status !== status) return false;
    return true;
  }).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  logs = logs.slice(0, Number(limit));

  return res.json({
    success: true,
    total: logs.length,
    logs
  });
});

module.exports = router;
