/**
 * Itinerary and Activity Routes
 * Enables collaborative day-by-day scheduling and task/activity assignment
 */

const express = require('express');
const router = express.Router({ mergeParams: true });
const db = require('../db/database');
const { authenticate } = require('../middleware/authMiddleware');
const { requireTripRole } = require('../middleware/rbacMiddleware');
const { sanitizeBody } = require('../middleware/validationMiddleware');

// Get all itinerary items for trip
router.get('/', authenticate, requireTripRole(['owner', 'editor', 'viewer']), (req, res) => {
  const tripId = req.params.tripId;
  const items = db.find('itinerary', i => i.tripId === tripId)
    .sort((a, b) => {
      if (a.dayNumber !== b.dayNumber) return a.dayNumber - b.dayNumber;
      return (a.time || '').localeCompare(b.time || '');
    })
    .map(item => {
      const assignedUser = item.assignedToUserId ? db.findById('users', item.assignedToUserId) : null;
      return {
        ...item,
        assignedUser: assignedUser ? { id: assignedUser.id, name: assignedUser.name, email: assignedUser.email, avatar: assignedUser.avatar } : null
      };
    });

  return res.json({ success: true, itinerary: items });
});

// Add new itinerary item (owner or editor)
router.post('/', authenticate, requireTripRole(['owner', 'editor']), sanitizeBody, (req, res) => {
  const tripId = req.params.tripId;
  const { destinationId, dayNumber, date, title, time, location, estimatedCost, assignedToUserId, notes } = req.body;

  if (!title || title.trim().length < 2) {
    return res.status(400).json({ success: false, error: 'Activity title is required.' });
  }

  // Validate assigned user if provided
  if (assignedToUserId) {
    const isMember = db.findOne('collaborators', c => c.tripId === tripId && c.userId === assignedToUserId);
    const isOwner = req.trip.ownerId === assignedToUserId;
    if (!isMember && !isOwner) {
      return res.status(400).json({ success: false, error: 'Assigned user must be an active collaborator on this trip.' });
    }
  }

  const newItem = db.insert('itinerary', {
    tripId,
    destinationId: destinationId || null,
    dayNumber: dayNumber ? Number(dayNumber) : 1,
    date: date || '',
    title: title.trim(),
    time: time || '',
    location: location ? location.trim() : '',
    estimatedCost: estimatedCost ? Number(estimatedCost) : 0,
    assignedToUserId: assignedToUserId || null,
    isCompleted: false,
    notes: notes ? notes.trim() : ''
  });

  db.logAudit({
    actorId: req.user.id,
    actorEmail: req.user.email,
    action: 'ITINERARY_CREATED',
    resourceType: 'Itinerary',
    resourceId: newItem.id,
    status: 'SUCCESS',
    ipAddress: req.ip || req.connection.remoteAddress,
    details: `Created itinerary item '${newItem.title}' for Day ${newItem.dayNumber}${assignedToUserId ? ` (assigned to ${assignedToUserId})` : ''}`
  });

  return res.status(201).json({
    success: true,
    message: 'Itinerary item created successfully.',
    item: newItem
  });
});

// Update itinerary item (owner or editor)
router.put('/:itemId', authenticate, requireTripRole(['owner', 'editor']), sanitizeBody, (req, res) => {
  const tripId = req.params.tripId;
  const itemId = req.params.itemId;

  const item = db.findById('itinerary', itemId);
  if (!item || item.tripId !== tripId) {
    return res.status(404).json({ success: false, error: 'Itinerary item not found.' });
  }

  const { destinationId, dayNumber, date, title, time, location, estimatedCost, assignedToUserId, isCompleted, notes } = req.body;
  const updates = {};
  if (destinationId !== undefined) updates.destinationId = destinationId;
  if (dayNumber !== undefined) updates.dayNumber = Number(dayNumber);
  if (date !== undefined) updates.date = date;
  if (title) updates.title = title.trim();
  if (time !== undefined) updates.time = time;
  if (location !== undefined) updates.location = location.trim();
  if (estimatedCost !== undefined) updates.estimatedCost = Number(estimatedCost);
  if (assignedToUserId !== undefined) updates.assignedToUserId = assignedToUserId || null;
  if (isCompleted !== undefined) updates.isCompleted = Boolean(isCompleted);
  if (notes !== undefined) updates.notes = notes.trim();

  const updated = db.update('itinerary', itemId, updates);

  db.logAudit({
    actorId: req.user.id,
    actorEmail: req.user.email,
    action: 'ITINERARY_UPDATED',
    resourceType: 'Itinerary',
    resourceId: itemId,
    status: 'SUCCESS',
    ipAddress: req.ip || req.connection.remoteAddress,
    details: `Updated activity '${updated.title}'`
  });

  return res.json({ success: true, message: 'Itinerary item updated.', item: updated });
});

// Toggle completion status
router.patch('/:itemId/status', authenticate, requireTripRole(['owner', 'editor']), (req, res) => {
  const tripId = req.params.tripId;
  const itemId = req.params.itemId;

  const item = db.findById('itinerary', itemId);
  if (!item || item.tripId !== tripId) {
    return res.status(404).json({ success: false, error: 'Itinerary item not found.' });
  }

  const updated = db.update('itinerary', itemId, { isCompleted: !item.isCompleted });

  return res.json({
    success: true,
    message: `Activity marked as ${updated.isCompleted ? 'completed' : 'pending'}.`,
    item: updated
  });
});

// Delete itinerary item (owner or editor)
router.delete('/:itemId', authenticate, requireTripRole(['owner', 'editor']), (req, res) => {
  const tripId = req.params.tripId;
  const itemId = req.params.itemId;

  const item = db.findById('itinerary', itemId);
  if (!item || item.tripId !== tripId) {
    return res.status(404).json({ success: false, error: 'Itinerary item not found.' });
  }

  db.delete('itinerary', itemId);

  db.logAudit({
    actorId: req.user.id,
    actorEmail: req.user.email,
    action: 'ITINERARY_DELETED',
    resourceType: 'Itinerary',
    resourceId: itemId,
    status: 'SUCCESS',
    ipAddress: req.ip || req.connection.remoteAddress,
    details: `Deleted activity ${itemId} from trip ${tripId}`
  });

  return res.json({ success: true, message: 'Itinerary item removed.' });
});

module.exports = router;
