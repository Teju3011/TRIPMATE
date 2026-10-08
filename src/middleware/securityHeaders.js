/**
 * Security Headers Middleware
 * Enforces strict Content-Security-Policy, anti-clickjacking, MIME sniffing protection
 */

function securityHeaders(req, res, next) {
  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // Anti-clickjacking
  res.setHeader('X-Frame-Options', 'DENY');

  // Cross-Site Scripting filter protection
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // Referrer policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // HTTP Strict Transport Security
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');

  // Content-Security-Policy
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https://images.unsplash.com https://cdn.jsdelivr.net; connect-src 'self';"
  );

  // Remove server technology header
  res.removeHeader('X-Powered-By');

  next();
}

module.exports = securityHeaders;
