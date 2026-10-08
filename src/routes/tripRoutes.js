/**
 * Trip Management Routes
 * Handles trip creation, retrieval, updates, and deletion with RBAC
 */

const express = require('express');
const router = express.Router();
const db = require('../db/database');
const { authenticate } = require('../middleware/authMiddleware');
const { requireTripRole } = require('../middleware/rbacMiddleware');
const { validateTrip, sanitizeBody } = require('../middleware/validationMiddleware');

// List trips for authenticated user
router.get('/', authenticate, (req, res) => {
  const userId = req.user.id;

  // Find all trips owned by user or where user is an active collaborator
  const collaboratorEntries = db.find('collaborators', c => c.userId === userId);
  const collaboratedTripIds = new Set(collaboratorEntries.map(c => c.tripId));

  const accessibleTrips = db.find('trips', trip => {
    if (trip.ownerId === userId) return true;
    if (collaboratedTripIds.has(trip.id)) return true;
    if (req.user.role === 'admin') return true;
    return false;
  }).map(trip => {
    const role = trip.ownerId === userId ? 'owner' : (
      (collaboratorEntries.find(c => c.tripId === trip.id) || {}).role || 'viewer'
    );
    const destCount = db.find('destinations', d => d.tripId === trip.id).length;
    const expTotal = db.find('expenses', e => e.tripId === trip.id)
      .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
    const memberCount = db.find('collaborators', c => c.tripId === trip.id).length;

    return {
      ...trip,
      userRole: role,
      destinationsCount: destCount,
      totalExpenses: Math.round(expTotal * 100) / 100,
      collaboratorsCount: memberCount
    };
  });

  return res.json({ success: true, trips: accessibleTrips });
});

// Create a new Trip
router.post('/', authenticate, sanitizeBody, validateTrip, (req, res) => {
  const { title, description, destinationSummary, startDate, endDate, budget, currency, coverGradient, isPrivate } = req.body;

  const newTrip = db.insert('trips', {
    title: title.trim(),
    description: description ? description.trim() : '',
    destinationSummary: destinationSummary ? destinationSummary.trim() : '',
    startDate: startDate || new Date().toISOString().split('T')[0],
    endDate: endDate || '',
    budget: Number(budget) || 0,
    currency: currency || 'USD',
    coverGradient: coverGradient || 'linear-gradient(135deg, #0ea5e9 0%, #10b981 100%)',
    isPrivate: isPrivate !== undefined ? Boolean(isPrivate) : false,
    ownerId: req.user.id
  });

  // Automatically register owner in collaborators table
  db.insert('collaborators', {
    tripId: newTrip.id,
    userId: req.user.id,
    role: 'owner',
    invitedBy: req.user.id,
    joinedAt: new Date().toISOString()
  });

  db.logAudit({
    actorId: req.user.id,
    actorEmail: req.user.email,
    action: 'TRIP_CREATED',
    resourceType: 'Trip',
    resourceId: newTrip.id,
    status: 'SUCCESS',
    ipAddress: req.ip || req.connection.remoteAddress,
    details: `Trip '${newTrip.title}' created with budget ${newTrip.currency} ${newTrip.budget}`
  });

  return res.status(201).json({
    success: true,
    message: 'Trip created successfully.',
    trip: {
      ...newTrip,
      userRole: 'owner'
    }
  });
});

// Get Trip Details (requires at least 'viewer' role)
router.get('/:tripId', authenticate, requireTripRole(['owner', 'editor', 'viewer']), (req, res) => {
  const trip = req.trip;
  const userRole = req.tripRole;

  const destinations = db.find('destinations', d => d.tripId === trip.id)
    .sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));
  
  const itinerary = db.find('itinerary', i => i.tripId === trip.id)
    .sort((a, b) => (a.dayNumber || 0) - (b.dayNumber || 0));

  const expenses = db.find('expenses', e => e.tripId === trip.id);

  const collaborators = db.find('collaborators', c => c.tripId === trip.id).map(c => {
    const user = db.findById('users', c.userId);
    return {
      id: c.id,
      userId: c.userId,
      role: c.role,
      joinedAt: c.joinedAt,
      user: user ? { id: user.id, name: user.name, email: user.email, avatar: user.avatar } : null
    };
  });

  const totalSpent = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

  return res.json({
    success: true,
    trip: {
      ...trip,
      userRole,
      destinations,
      itinerary,
      expenses,
      collaborators,
      stats: {
        totalSpent: Math.round(totalSpent * 100) / 100,
        budgetRemaining: Math.round(((trip.budget || 0) - totalSpent) * 100) / 100,
        itineraryItemCount: itinerary.length,
        completedActivities: itinerary.filter(i => i.isCompleted).length
      }
    }
  });
});

// Update Trip (requires 'owner' or 'editor')
router.put('/:tripId', authenticate, requireTripRole(['owner', 'editor']), sanitizeBody, validateTrip, (req, res) => {
  const tripId = req.params.tripId;
  const { title, description, destinationSummary, startDate, endDate, budget, currency, coverGradient, isPrivate } = req.body;

  const updates = {};
  if (title) updates.title = title.trim();
  if (description !== undefined) updates.description = description.trim();
  if (destinationSummary !== undefined) updates.destinationSummary = destinationSummary.trim();
  if (startDate) updates.startDate = startDate;
  if (endDate) updates.endDate = endDate;
  if (budget !== undefined) updates.budget = Number(budget);
  if (currency) updates.currency = currency;
  if (coverGradient) updates.coverGradient = coverGradient;
  if (isPrivate !== undefined) updates.isPrivate = Boolean(isPrivate);

  const updatedTrip = db.update('trips', tripId, updates);

  db.logAudit({
    actorId: req.user.id,
    actorEmail: req.user.email,
    action: 'TRIP_UPDATED',
    resourceType: 'Trip',
    resourceId: tripId,
    status: 'SUCCESS',
    ipAddress: req.ip || req.connection.remoteAddress,
    details: `Trip '${updatedTrip.title}' details updated`
  });

  return res.json({
    success: true,
    message: 'Trip updated successfully.',
    trip: updatedTrip
  });
});

// Delete Trip (strictly restricted to 'owner')
router.delete('/:tripId', authenticate, requireTripRole(['owner']), (req, res) => {
  const tripId = req.params.tripId;

  // Cascade delete all sub-resources
  const dests = db.find('destinations', d => d.tripId === tripId);
  dests.forEach(d => db.delete('destinations', d.id));

  const itins = db.find('itinerary', i => i.tripId === tripId);
  itins.forEach(i => db.delete('itinerary', i.id));

  const exps = db.find('expenses', e => e.tripId === tripId);
  exps.forEach(e => db.delete('expenses', e.id));

  const collabs = db.find('collaborators', c => c.tripId === tripId);
  collabs.forEach(c => db.delete('collaborators', c.id));

  db.delete('trips', tripId);

  db.logAudit({
    actorId: req.user.id,
    actorEmail: req.user.email,
    action: 'TRIP_DELETED',
    resourceType: 'Trip',
    resourceId: tripId,
    status: 'SUCCESS',
    ipAddress: req.ip || req.connection.remoteAddress,
    details: `Trip and all associated resources permanently deleted by owner ${req.user.email}`
  });

  return res.json({
    success: true,
    message: 'Trip and associated itinerary data deleted permanently.'
  });
});

module.exports = router;
