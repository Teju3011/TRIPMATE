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
    const user = c.userId ? db.findById('users', c.userId) : null;
    return {
      id: c.id,
      tripId: c.tripId,
      userId: c.userId,
      email: c.email || (user ? user.email : ''),
      role: c.role,
      joinedAt: c.joinedAt,
      isPending: !c.userId,
      user: user ? {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar
      } : {
        id: null,
        name: c.email ? c.email.split('@')[0] : 'Invited Member',
        email: c.email || '',
        avatar: null
      }
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
  const normalizedEmail = email ? email.toLowerCase().trim() : null;

  if (userId) {
    targetUser = db.findById('users', userId);
  } else if (normalizedEmail) {
    targetUser = db.findOne('users', u => u.email.toLowerCase() === normalizedEmail);
  }

  if (targetUser) {
    // Check if already a collaborator
    const existing = db.findOne('collaborators', c => c.tripId === tripId && c.userId === targetUser.id);
    if (existing) {
      return res.status(409).json({
        success: false,
        error: `User (${targetUser.email}) is already a collaborator with role '${existing.role}'.`
      });
    }

    const newCollaborator = db.insert('collaborators', {
      tripId,
      userId: targetUser.id,
      email: targetUser.email,
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
      message: `User ${targetUser.name} added to trip as ${assignedRole.toUpperCase()}.`,
      collaborator: {
        ...newCollaborator,
        user: { id: targetUser.id, name: targetUser.name, email: targetUser.email, avatar: targetUser.avatar }
      }
    });
  } else if (normalizedEmail) {
    // Check if already invited pending registration
    const existing = db.findOne('collaborators', c => c.tripId === tripId && c.email && c.email.toLowerCase() === normalizedEmail);
    if (existing) {
      return res.status(409).json({
        success: false,
        error: `An invitation is already pending for ${normalizedEmail}.`
      });
    }

    // Pending collaborator invitation
    const newCollaborator = db.insert('collaborators', {
      tripId,
      userId: null,
      email: normalizedEmail,
      role: assignedRole,
      invitedBy: req.user.id,
      joinedAt: new Date().toISOString()
    });

    db.logAudit({
      actorId: req.user.id,
      actorEmail: req.user.email,
      action: 'COLLABORATOR_INVITED',
      resourceType: 'Collaborator',
      resourceId: normalizedEmail,
      status: 'SUCCESS',
      ipAddress: req.ip || req.connection.remoteAddress,
      details: `Owner ${req.user.email} invited ${normalizedEmail} as '${assignedRole}'. Pending registration.`
    });

    return res.status(201).json({
      success: true,
      message: `Invitation sent to ${normalizedEmail} as ${assignedRole.toUpperCase()}. They will automatically have access when they register.`,
      collaborator: {
        ...newCollaborator,
        user: { id: null, name: normalizedEmail.split('@')[0], email: normalizedEmail, avatar: null }
      }
    });
  } else {
    return res.status(400).json({ success: false, error: 'Please enter a valid collaborator email address.' });
  }
});

// Update collaborator role (strictly restricted to 'owner')
router.put('/:userId', authenticate, requireTripRole(['owner']), sanitizeBody, (req, res) => {
  const tripId = req.params.tripId;
  const targetId = req.params.userId;
  const { role } = req.body;

  if (!['editor', 'viewer'].includes(role)) {
    return res.status(400).json({ success: false, error: 'Valid role must be either editor or viewer.' });
  }

  if (targetId === req.user.id) {
    return res.status(400).json({ success: false, error: 'Owner cannot demote their own role directly. Use transfer ownership.' });
  }

  const collab = db.findOne('collaborators', c => c.tripId === tripId && (c.userId === targetId || c.id === targetId));
  if (!collab) {
    return res.status(404).json({ success: false, error: 'Collaborator not found.' });
  }

  const updated = db.update('collaborators', collab.id, { role });

  db.logAudit({
    actorId: req.user.id,
    actorEmail: req.user.email,
    action: 'ROLE_MODIFIED',
    resourceType: 'Collaborator',
    resourceId: targetId,
    status: 'SUCCESS',
    ipAddress: req.ip || req.connection.remoteAddress,
    details: `Role updated to '${role}' for member on trip ${tripId}`
  });

  return res.json({
    success: true,
    message: `Collaborator role updated to ${role.toUpperCase()}.`,
    collaborator: updated
  });
});

// Remove collaborator (owner can remove any collaborator; collaborators can remove themselves)
router.delete('/:userId', authenticate, requireTripRole(['owner', 'editor', 'viewer']), (req, res) => {
  const tripId = req.params.tripId;
  const targetId = req.params.userId;

  // If not owner, user can only remove themselves (leave trip)
  if (req.tripRole !== 'owner' && targetId !== req.user.id) {
    return res.status(403).json({
      success: false,
      error: 'Forbidden: Only the trip owner can remove other collaborators.'
    });
  }

  // Cannot remove owner from collaborators
  if (targetId === req.trip.ownerId) {
    return res.status(400).json({
      success: false,
      error: 'Cannot remove trip owner. Trip must be deleted or ownership transferred.'
    });
  }

  const collab = db.findOne('collaborators', c => c.tripId === tripId && (c.userId === targetId || c.id === targetId));
  if (!collab) {
    return res.status(404).json({ success: false, error: 'Collaborator not found on this trip.' });
  }

  db.delete('collaborators', collab.id);

  db.logAudit({
    actorId: req.user.id,
    actorEmail: req.user.email,
    action: 'COLLABORATOR_REMOVED',
    resourceType: 'Collaborator',
    resourceId: targetId,
    status: 'SUCCESS',
    ipAddress: req.ip || req.connection.remoteAddress,
    details: `Member removed from trip ${tripId}`
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
