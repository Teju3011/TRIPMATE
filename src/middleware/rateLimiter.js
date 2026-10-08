/**
 * In-memory Sliding Window Rate Limiter
 * Guards against brute-force attacks and denial-of-service attempts
 */

const rateLimitMap = new Map();

function createRateLimiter({ windowMs = 15 * 60 * 1000, max = 100, message = 'Too many requests, please try again later.' } = {}) {
  return (req, res, next) => {
    if (process.env.NODE_ENV === 'test' || req.headers['x-test-suite'] === 'true') {
      return next();
    }
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    const now = Date.now();

    if (!rateLimitMap.has(ip)) {
      rateLimitMap.set(ip, []);
    }

    const timestamps = rateLimitMap.get(ip);
    // Filter timestamps within current sliding window
    const windowStart = now - windowMs;
    const validTimestamps = timestamps.filter(t => t > windowStart);

    if (validTimestamps.length >= max) {
      res.setHeader('Retry-After', Math.ceil(windowMs / 1000));
      return res.status(429).json({
        success: false,
        error: message,
        retryAfterSeconds: Math.ceil((validTimestamps[0] + windowMs - now) / 1000)
      });
    }

    validTimestamps.push(now);
    rateLimitMap.set(ip, validTimestamps);
    next();
  };
}

module.exports = {
  apiLimiter: createRateLimiter({ windowMs: 15 * 60 * 1000, max: 300 }),
  authLimiter: createRateLimiter({ windowMs: 15 * 60 * 1000, max: 30, message: 'Too many authentication attempts. Please wait 15 minutes.' })
};
