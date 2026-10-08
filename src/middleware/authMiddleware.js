/**
 * Authentication Middleware
 * Validates JWT Bearer tokens and loads authenticated user context
 */

const jwt = require('jsonwebtoken');
const config = require('../config');
const db = require('../db/database');

function authenticate(req, res, next) {
  let token = null;

  const authHeader = req.headers['authorization'] || req.headers['x-access-token'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  } else if (authHeader) {
    token = authHeader;
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required. Please provide a valid Bearer token.'
    });
  }

  try {
    const decoded = jwt.verify(token, config.JWT_SECRET);
    const user = db.findById('users', decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'User session invalid or user no longer exists.'
      });
    }

    // Attach sanitized user context
    req.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      avatar: user.avatar
    };

    next();
  } catch (err) {
    db.logAudit({
      actorId: 'anonymous',
      action: 'INVALID_TOKEN_ATTEMPT',
      resourceType: 'Auth',
      status: 'FAILED',
      ipAddress: req.ip || req.connection.remoteAddress,
      details: `JWT Verification Failed: ${err.message}`
    });

    return res.status(401).json({
      success: false,
      error: 'Invalid or expired authentication token.'
    });
  }
}

// Optional auth for public preview if permitted
function optionalAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    try {
      const decoded = jwt.verify(token, config.JWT_SECRET);
      const user = db.findById('users', decoded.id);
      if (user) {
        req.user = {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          avatar: user.avatar
        };
      }
    } catch (_) {}
  }
  next();
}

module.exports = { authenticate, optionalAuth };
