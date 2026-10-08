/**
 * Centralized Application Error Handler
 * Hides stack traces from production responses and logs securely
 */

const db = require('../db/database');
const config = require('../config');

function errorHandler(err, req, res, next) {
  console.error(`[ERROR] [${new Date().toISOString()}] ${req.method} ${req.originalUrl}:`, err);

  // Audit log severe runtime errors
  try {
    db.logAudit({
      actorId: req.user ? req.user.id : 'system',
      actorEmail: req.user ? req.user.email : 'system@tripmate.io',
      action: 'SERVER_ERROR',
      resourceType: 'API',
      resourceId: req.originalUrl,
      status: 'ERROR',
      ipAddress: req.ip || req.connection.remoteAddress,
      details: err.message
    });
  } catch (_) {}

  const statusCode = err.status || err.statusCode || 500;
  const isDev = config.NODE_ENV === 'development';

  res.status(statusCode).json({
    success: false,
    error: isDev ? err.message : 'An internal error occurred. Please contact security support.',
    ...(isDev && { stack: err.stack })
  });
}

module.exports = errorHandler;
