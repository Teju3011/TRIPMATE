/**
 * Destination Routes
 * CRUD operations for travel destinations with role enforcement
 */

const express = require('express');
const router = express.Router({ mergeParams: true });
const db = require('../db/database');
const { authenticate } = require('../middleware/authMiddleware');
const { requireTripRole } = require('../middleware/rbacMiddleware');
const { sanitizeBody } = require('../middleware/validationMiddleware');

// Get destinations for trip
router.get('/', authenticate, requireTripRole(['owner', 'editor', 'viewer']), (req, res) => {
  const tripId = req.params.tripId;
  const destinations = db.find('destinations', d => d.tripId === tripId)
    .sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));

  return res.json({ success: true, destinations });
});

// Add destination (owner or editor)
router.post('/', authenticate, requireTripRole(['owner', 'editor']), sanitizeBody, (req, res) => {
  const tripId = req.params.tripId;
  const { name, city, country, arrivalDate, departureDate, orderIndex, notes } = req.body;

  if (!name || name.trim().length < 2) {
    return res.status(400).json({ success: false, error: 'Destination name is required.' });
  }

  const existingCount = db.find('destinations', d => d.tripId === tripId).length;

  const destination = db.insert('destinations', {
    tripId,
    name: name.trim(),
    city: city ? city.trim() : '',
    country: country ? country.trim() : '',
    arrivalDate: arrivalDate || '',
    departureDate: departureDate || '',
    orderIndex: orderIndex !== undefined ? Number(orderIndex) : existingCount + 1,
    notes: notes ? notes.trim() : ''
  });

  db.logAudit({
    actorId: req.user.id,
    actorEmail: req.user.email,
    action: 'DESTINATION_ADDED',
    resourceType: 'Destination',
    resourceId: destination.id,
    status: 'SUCCESS',
    ipAddress: req.ip || req.connection.remoteAddress,
    details: `Destination '${destination.name}' added to trip ${tripId}`
  });

  return res.status(201).json({
    success: true,
    message: 'Destination added successfully.',
    destination
  });
});

// Update destination (owner or editor)
router.put('/:destId', authenticate, requireTripRole(['owner', 'editor']), sanitizeBody, (req, res) => {
  const tripId = req.params.tripId;
  const destId = req.params.destId;

  const destination = db.findById('destinations', destId);
  if (!destination || destination.tripId !== tripId) {
    return res.status(404).json({ success: false, error: 'Destination not found in this trip.' });
  }

  const { name, city, country, arrivalDate, departureDate, orderIndex, notes } = req.body;
  const updates = {};
  if (name) updates.name = name.trim();
  if (city !== undefined) updates.city = city.trim();
  if (country !== undefined) updates.country = country.trim();
  if (arrivalDate !== undefined) updates.arrivalDate = arrivalDate;
  if (departureDate !== undefined) updates.departureDate = departureDate;
  if (orderIndex !== undefined) updates.orderIndex = Number(orderIndex);
  if (notes !== undefined) updates.notes = notes.trim();

  const updated = db.update('destinations', destId, updates);

  db.logAudit({
    actorId: req.user.id,
    actorEmail: req.user.email,
    action: 'DESTINATION_UPDATED',
    resourceType: 'Destination',
    resourceId: destId,
    status: 'SUCCESS',
    ipAddress: req.ip || req.connection.remoteAddress,
    details: `Destination '${updated.name}' updated`
  });

  return res.json({ success: true, message: 'Destination updated.', destination: updated });
});

// Delete destination (owner or editor)
router.delete('/:destId', authenticate, requireTripRole(['owner', 'editor']), (req, res) => {
  const tripId = req.params.tripId;
  const destId = req.params.destId;

  const destination = db.findById('destinations', destId);
  if (!destination || destination.tripId !== tripId) {
    return res.status(404).json({ success: false, error: 'Destination not found.' });
  }

  db.delete('destinations', destId);

  db.logAudit({
    actorId: req.user.id,
    actorEmail: req.user.email,
    action: 'DESTINATION_DELETED',
    resourceType: 'Destination',
    resourceId: destId,
    status: 'SUCCESS',
    ipAddress: req.ip || req.connection.remoteAddress,
    details: `Destination ${destId} removed from trip ${tripId}`
  });

  return res.json({ success: true, message: 'Destination removed.' });
});

module.exports = router;
