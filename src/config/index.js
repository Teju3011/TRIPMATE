/**
 * TripMate Application Configuration
 * Secure Environment and Runtime Settings
 */

const path = require('path');
require('dotenv').config();

module.exports = {
  PORT: process.env.PORT || 3000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  JWT_SECRET: process.env.JWT_SECRET || 'tripmate_secure_jwt_production_secret_key_2026_!@#$',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '24h',
  BCRYPT_SALT_ROUNDS: parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) || 10,
  DATA_FILE_PATH: process.env.DATA_FILE_PATH || path.join(__dirname, '../../data/tripmate_db.json'),
  RATE_LIMIT_WINDOW_MS: 15 * 60 * 1000, // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: 200,
  AUTH_RATE_LIMIT_MAX_REQUESTS: 20 // 20 attempts per 15 min for auth
};
