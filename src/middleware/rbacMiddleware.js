/**
 * Role-Based Access Control (RBAC) & Shared-Resource Authorization Middleware
 * Enforces fine-grained permission levels: 'owner', 'editor', 'viewer'
 * Implements strict Broken Object-Level Authorization (BOLA/IDOR) defenses and audit logging
 */

const db = require('../db/database');

/**
 * Checks if authenticated user has one of the allowedRoles for the target trip
 * @param {Array<string>} allowedRoles e.g. ['owner'], ['owner', 'editor'], ['owner', 'editor', 'viewer']
 */
function requireTripRole(allowedRoles = ['owner', 'editor', 'viewer']) {
  return (req, res, next) => {
    const tripId = req.params.tripId || req.body.tripId || req.query.tripId;

    if (!tripId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required tripId parameter.'
      });
    }

    const trip = db.findById('trips', tripId);
    if (!trip) {
      return res.status(404).json({
        success: false,
        error: 'Trip not found.'
      });
    }

    // System admin override for auditing/read
    if (req.user && req.user.role === 'admin') {
      req.trip = trip;
      req.tripRole = 'admin';
      return next();
    }

    // Determine user's role on this trip
    let userRole = null;

    if (trip.ownerId === req.user.id) {
      userRole = 'owner';
    } else {
      const collab = db.findOne('collaborators', c => c.tripId === tripId && c.userId === req.user.id);
      if (collab) {
        userRole = collab.role;
      }
    }

    // If user has no association with the trip
    if (!userRole) {
      // If trip is private, return 404 or 403 to prevent information disclosure
      db.logAudit({
        actorId: req.user.id,
        actorEmail: req.user.email,
        action: 'UNAUTHORIZED_TRIP_ACCESS_ATTEMPT',
        resourceType: 'Trip',
        resourceId: tripId,
        status: 'BLOCKED_403',
        ipAddress: req.ip || req.connection.remoteAddress,
        details: `User ${req.user.email} attempted unauthorized access to trip ${tripId}`
      });

      return res.status(403).json({
        success: false,
        error: 'Forbidden: You are not a collaborator on this trip and do not have access permissions.'
      });
    }

    // Check if userRole is permitted for this action
    if (!allowedRoles.includes(userRole)) {
      db.logAudit({
        actorId: req.user.id,
        actorEmail: req.user.email,
        action: 'PRIVILEGE_VIOLATION_BLOCKED',
        resourceType: 'Trip',
        resourceId: tripId,
        status: 'BLOCKED_403',
        ipAddress: req.ip || req.connection.remoteAddress,
        details: `User role '${userRole}' denied action on trip ${tripId}. Required roles: [${allowedRoles.join(', ')}]`
      });

      return res.status(403).json({
        success: false,
        error: `Forbidden: Insufficient privileges. Required role: [${allowedRoles.join(', ')}]. Your current role is: '${userRole}'.`
      });
    }

    // Attach trip and role to request object
    req.trip = trip;
    req.tripRole = userRole;
    next();
  };
}

/**
 * Requires system administrator role
 */
function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    db.logAudit({
      actorId: req.user ? req.user.id : 'unknown',
      actorEmail: req.user ? req.user.email : 'unknown',
      action: 'ADMIN_ACCESS_BLOCKED',
      resourceType: 'SystemAdmin',
      status: 'BLOCKED_403',
      ipAddress: req.ip || req.connection.remoteAddress,
      details: 'Attempted to access administrator-restricted resource'
    });

    return res.status(403).json({
      success: false,
      error: 'Forbidden: Administrator privileges required.'
    });
  }
  next();
}

module.exports = { requireTripRole, requireAdmin };
