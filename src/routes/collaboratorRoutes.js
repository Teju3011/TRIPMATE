/**
 * Collaboration and Role Delegation Routes
 * Enforces strict authorization policies: Only Owners can manage roles, invite, or transfer ownership
 */

const express = require('express');
const router = express.Router({ mergeParams: true });
const db = require('../db/database');
const { authenticate } = require('../middleware/authMiddleware');
const { requireTripRole } = require('../middleware/rbacMiddleware');
const { sanitizeBody } = require('../middleware/validationMiddleware');

// Get all collaborators for trip
router.get('/', authenticate, requireTripRole(['owner', 'editor', 'viewer']), (req, res) => {
  const tripId = req.params.tripId;
  const collaborators = db.find('collaborators', c => c.tripId === tripId).map(c => {
    const user = db.findById('users', c.userId);
    return {
      id: c.id,
      tripId: c.tripId,
      userId: c.userId,
      role: c.role,
      joinedAt: c.joinedAt,
      user: user ? { id: user.id, name: user.name, email: user.email, avatar: user.avatar } : null
    };
  });

  return res.json({ success: true, collaborators });
});

// Invite / Add collaborator (strictly restricted to 'owner')
router.post('/', authenticate, requireTripRole(['owner']), sanitizeBody, (req, res) => {
  const tripId = req.params.tripId;
  const { email, userId, role } = req.body;

  const validRoles = ['editor', 'viewer'];
  const assignedRole = validRoles.includes(role) ? role : 'viewer';

  let targetUser = null;
  if (userId) {
    targetUser = db.findById('users', userId);
  } else if (email) {
    targetUser = db.findOne('users', u => u.email.toLowerCase() === email.toLowerCase().trim());
  }

  if (!targetUser) {
    return res.status(404).json({
      success: false,
      error: 'User not found. Please ensure the collaborator is registered on TripMate.'
    });
  }

  // Check if already a collaborator
  const existing = db.findOne('collaborators', c => c.tripId === tripId && c.userId === targetUser.id);
  if (existing) {
    return res.status(409).json({
      success: false,
      error: `User is already a collaborator with role '${existing.role}'.`
    });
  }

  const newCollaborator = db.insert('collaborators', {
    tripId,
    userId: targetUser.id,
    role: assignedRole,
    invitedBy: req.user.id,
    joinedAt: new Date().toISOString()
  });

  db.logAudit({
    actorId: req.user.id,
    actorEmail: req.user.email,
    action: 'COLLABORATOR_INVITED',
    resourceType: 'Collaborator',
    resourceId: targetUser.id,
    status: 'SUCCESS',
    ipAddress: req.ip || req.connection.remoteAddress,
    details: `Owner ${req.user.email} granted '${assignedRole}' role to ${targetUser.email} on trip ${tripId}`
  });

  return res.status(201).json({
    success: true,
    message: `User added to trip as ${assignedRole}.`,
    collaborator: {
      ...newCollaborator,
      user: { id: targetUser.id, name: targetUser.name, email: targetUser.email, avatar: targetUser.avatar }
    }
  });
});

// Update collaborator role (strictly restricted to 'owner')
router.put('/:userId', authenticate, requireTripRole(['owner']), sanitizeBody, (req, res) => {
  const tripId = req.params.tripId;
  const targetUserId = req.params.userId;
  const { role } = req.body;

  if (!['editor', 'viewer'].includes(role)) {
    return res.status(400).json({ success: false, error: 'Valid role must be either editor or viewer.' });
  }

  if (targetUserId === req.user.id) {
    return res.status(400).json({ success: false, error: 'Owner cannot demote their own role directly. Use transfer ownership.' });
  }

  const collab = db.findOne('collaborators', c => c.tripId === tripId && c.userId === targetUserId);
  if (!collab) {
    return res.status(404).json({ success: false, error: 'Collaborator not found.' });
  }

  const updated = db.update('collaborators', collab.id, { role });

  db.logAudit({
    actorId: req.user.id,
    actorEmail: req.user.email,
    action: 'ROLE_MODIFIED',
    resourceType: 'Collaborator',
    resourceId: targetUserId,
    status: 'SUCCESS',
    ipAddress: req.ip || req.connection.remoteAddress,
    details: `Role updated to '${role}' for user ${targetUserId} by trip owner`
  });

  return res.json({
    success: true,
    message: `Collaborator role updated to ${role}.`,
    collaborator: updated
  });
});

// Remove collaborator (owner can remove any collaborator; collaborators can remove themselves)
router.delete('/:userId', authenticate, requireTripRole(['owner', 'editor', 'viewer']), (req, res) => {
  const tripId = req.params.tripId;
  const targetUserId = req.params.userId;

  // If not owner, user can only remove themselves (leave trip)
  if (req.tripRole !== 'owner' && targetUserId !== req.user.id) {
    return res.status(403).json({
      success: false,
      error: 'Forbidden: Only the trip owner can remove other collaborators.'
    });
  }

  // Cannot remove owner from collaborators
  if (targetUserId === req.trip.ownerId) {
    return res.status(400).json({
      success: false,
      error: 'Cannot remove trip owner. Trip must be deleted or ownership transferred.'
    });
  }

  const collab = db.findOne('collaborators', c => c.tripId === tripId && c.userId === targetUserId);
  if (!collab) {
    return res.status(404).json({ success: false, error: 'Collaborator not found on this trip.' });
  }

  db.delete('collaborators', collab.id);

  db.logAudit({
    actorId: req.user.id,
    actorEmail: req.user.email,
    action: 'COLLABORATOR_REMOVED',
    resourceType: 'Collaborator',
    resourceId: targetUserId,
    status: 'SUCCESS',
    ipAddress: req.ip || req.connection.remoteAddress,
    details: `User ${targetUserId} removed from trip ${tripId}`
  });

  return res.json({
    success: true,
    message: 'Collaborator successfully removed from trip.'
  });
});

// Transfer ownership of trip
router.post('/transfer-ownership', authenticate, requireTripRole(['owner']), sanitizeBody, (req, res) => {
  const tripId = req.params.tripId;
  const { newOwnerUserId } = req.body;

  if (!newOwnerUserId || newOwnerUserId === req.user.id) {
    return res.status(400).json({ success: false, error: 'A valid distinct new owner user ID must be provided.' });
  }

  const newOwner = db.findById('users', newOwnerUserId);
  if (!newOwner) {
    return res.status(404).json({ success: false, error: 'Proposed new owner user not found.' });
  }

  // Ensure new owner is already a collaborator
  const targetCollab = db.findOne('collaborators', c => c.tripId === tripId && c.userId === newOwnerUserId);
  if (!targetCollab) {
    return res.status(400).json({ success: false, error: 'New owner must already be a collaborator on this trip.' });
  }

  // Update trip owner
  db.update('trips', tripId, { ownerId: newOwnerUserId });

  // Update new owner collaborator role to 'owner'
  db.update('collaborators', targetCollab.id, { role: 'owner' });

  // Demote previous owner to 'editor'
  const oldOwnerCollab = db.findOne('collaborators', c => c.tripId === tripId && c.userId === req.user.id);
  if (oldOwnerCollab) {
    db.update('collaborators', oldOwnerCollab.id, { role: 'editor' });
  }

  db.logAudit({
    actorId: req.user.id,
    actorEmail: req.user.email,
    action: 'OWNERSHIP_TRANSFERRED',
    resourceType: 'Trip',
    resourceId: tripId,
    status: 'SUCCESS',
    ipAddress: req.ip || req.connection.remoteAddress,
    details: `Trip ownership transferred from ${req.user.email} to ${newOwner.email}`
  });

  return res.json({
    success: true,
    message: `Trip ownership transferred to ${newOwner.name}. You are now an Editor on this trip.`
  });
});

module.exports = router;
