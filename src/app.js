/**
 * TripMate Express Application Setup
 * Integrates Security Headers, Rate Limiting, API Routing, and Static Asset Serving
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const securityHeaders = require('./middleware/securityHeaders');
const errorHandler = require('./middleware/errorHandler');
const { apiLimiter } = require('./middleware/rateLimiter');

// Import routes
const authRoutes = require('./routes/authRoutes');
const tripRoutes = require('./routes/tripRoutes');
const destinationRoutes = require('./routes/destinationRoutes');
const itineraryRoutes = require('./routes/itineraryRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
const collaboratorRoutes = require('./routes/collaboratorRoutes');
const auditRoutes = require('./routes/auditRoutes');

const app = express();

// Apply security headers to all responses
app.use(securityHeaders);

// CORS configuration
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Access-Token']
}));

// Body parsing with strict payload size limit (defense against DoS)
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Static frontend web files
app.use(express.static(path.join(__dirname, 'public')));

// General API Rate Limiting
app.use('/api', apiLimiter);

// Health Check Endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'UP',
    service: 'TripMate Secure Travel Planning Engine',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    securityCompliance: {
      rbac: 'ACTIVE',
      bolaProtection: 'ENFORCED',
      auditLogging: 'ENABLED'
    }
  });
});

// Mount API routes
app.use('/api/auth', authRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/trips/:tripId/destinations', destinationRoutes);
app.use('/api/trips/:tripId/itinerary', itineraryRoutes);
app.use('/api/trips/:tripId/expenses', expenseRoutes);
app.use('/api/trips/:tripId/collaborators', collaboratorRoutes);
app.use('/api/audit', auditRoutes);

// Fallback to Single Page App index.html for frontend routing
app.use((req, res, next) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ success: false, error: 'Endpoint not found.' });
  }
  if (req.method === 'GET') {
    return res.sendFile(path.join(__dirname, 'public', 'index.html'));
  }
  next();
});

// Centralized Error Handler
app.use(errorHandler);

module.exports = app;
