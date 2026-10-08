/**
 * TripMate Server Entry Point
 */

const app = require('./app');
const config = require('./config');

const server = app.listen(config.PORT, () => {
  console.log(`=======================================================`);
  console.log(`🚀 TripMate Secure Collaborative Travel Engine running`);
  console.log(`📡 URL: http://localhost:${config.PORT}`);
  console.log(`🔒 Security Model: Active (RBAC, Rate Limiting, CSP, Audit)`);
  console.log(`📁 Environment: ${config.NODE_ENV}`);
  console.log(`=======================================================`);
});

// Graceful shutdown handling
process.on('SIGTERM', () => {
  console.log('Received SIGTERM. Shutting down gracefully...');
  server.close(() => {
    console.log('Process terminated.');
  });
});

process.on('SIGINT', () => {
  console.log('Received SIGINT. Shutting down gracefully...');
  server.close(() => {
    console.log('Server stopped.');
    process.exit(0);
  });
});

module.exports = server;
