/**
 * Authentication and User Identity Routes
 */

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config');
const db = require('../db/database');
const { authenticate } = require('../middleware/authMiddleware');
const { validateRegister, sanitizeBody } = require('../middleware/validationMiddleware');
const { authLimiter } = require('../middleware/rateLimiter');

// User Registration
router.post('/register', authLimiter, sanitizeBody, validateRegister, (req, res) => {
  const { name, email, password } = req.body;
  const normalizedEmail = email.toLowerCase().trim();

  // Check existing user
  const existing = db.findOne('users', u => u.email.toLowerCase() === normalizedEmail);
  if (existing) {
    db.logAudit({
      actorId: 'anonymous',
      actorEmail: normalizedEmail,
      action: 'REGISTRATION_FAILED_EMAIL_EXISTS',
      resourceType: 'User',
      status: 'FAILED',
      ipAddress: req.ip || req.connection.remoteAddress,
      details: 'Attempted to register with an existing email address'
    });
    return res.status(409).json({ success: false, error: 'An account with this email already exists.' });
  }

  const salt = bcrypt.genSaltSync(config.BCRYPT_SALT_ROUNDS);
  const passwordHash = bcrypt.hashSync(password, salt);

  const newUser = db.insert('users', {
    name: name.trim(),
    email: normalizedEmail,
    passwordHash,
    role: 'user',
    avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150`,
    createdAt: new Date().toISOString()
  });

  // Activate any pending trip invitations sent to this email address
  const pendingInvites = db.find('collaborators', c => 
    !c.userId && 
    c.email && c.email.toLowerCase() === normalizedEmail
  );
  pendingInvites.forEach(inv => {
    db.update('collaborators', inv.id, {
      userId: newUser.id
    });
  });

  const token = jwt.sign(
    { id: newUser.id, email: newUser.email, name: newUser.name, role: newUser.role },
    config.JWT_SECRET,
    { expiresIn: config.JWT_EXPIRES_IN }
  );

  db.logAudit({
    actorId: newUser.id,
    actorEmail: newUser.email,
    action: 'USER_REGISTERED',
    resourceType: 'User',
    resourceId: newUser.id,
    status: 'SUCCESS',
    ipAddress: req.ip || req.connection.remoteAddress,
    details: `User registered successfully: ${newUser.name}`
  });

  return res.status(201).json({
    success: true,
    message: 'Registration successful.',
    token,
    user: {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      avatar: newUser.avatar
    }
  });
});

// User Login
router.post('/login', authLimiter, (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, error: 'Email and password are required.' });
  }

  const normalizedEmail = email.toLowerCase().trim();
  const user = db.findOne('users', u => u.email.toLowerCase() === normalizedEmail);

  if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
    db.logAudit({
      actorId: user ? user.id : 'unknown',
      actorEmail: normalizedEmail,
      action: 'LOGIN_FAILED',
      resourceType: 'Auth',
      status: 'FAILED',
      ipAddress: req.ip || req.connection.remoteAddress,
      details: 'Invalid login credentials provided'
    });

    return res.status(401).json({ success: false, error: 'Invalid email or password.' });
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, name: user.name, role: user.role },
    config.JWT_SECRET,
    { expiresIn: config.JWT_EXPIRES_IN }
  );

  db.logAudit({
    actorId: user.id,
    actorEmail: user.email,
    action: 'LOGIN_SUCCESS',
    resourceType: 'Auth',
    resourceId: user.id,
    status: 'SUCCESS',
    ipAddress: req.ip || req.connection.remoteAddress,
    details: `User logged in: ${user.name} (${user.email})`
  });

  return res.json({
    success: true,
    message: 'Authentication successful.',
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar
    }
  });
});

// Current User Profile
router.get('/me', authenticate, (req, res) => {
  const user = db.findById('users', req.user.id);
  if (!user) {
    return res.status(404).json({ success: false, error: 'User not found' });
  }

  return res.json({
    success: true,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      createdAt: user.createdAt
    }
  });
});

// List all registered users (for inviting collaborators)
router.get('/users', authenticate, (req, res) => {
  const users = db.find('users').map(u => ({
    id: u.id,
    name: u.name,
    email: u.email,
    avatar: u.avatar
  }));

  return res.json({ success: true, users });
});

module.exports = router;
