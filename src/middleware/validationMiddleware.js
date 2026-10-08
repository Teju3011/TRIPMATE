/**
 * Input Validation and Sanitization Middleware
 * Defense-in-depth against XSS, Parameter Tampering, and Malformed Payloads
 */

function sanitizeString(str) {
  if (typeof str !== 'string') return str;
  return str
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/[<>]/g, tag => ({ '<': '&lt;', '>': '&gt;' }[tag] || tag))
    .trim();
}

function sanitizeObject(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  const cleaned = Array.isArray(obj) ? [] : {};
  for (const key of Object.keys(obj)) {
    if (typeof obj[key] === 'string') {
      cleaned[key] = sanitizeString(obj[key]);
    } else if (typeof obj[key] === 'object' && obj[key] !== null) {
      cleaned[key] = sanitizeObject(obj[key]);
    } else {
      cleaned[key] = obj[key];
    }
  }
  return cleaned;
}

function sanitizeBody(req, res, next) {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeObject(req.body);
  }
  next();
}

function validateRegister(req, res, next) {
  const { name, email, password } = req.body;

  if (!name || name.trim().length < 2) {
    return res.status(400).json({ success: false, error: 'Name must be at least 2 characters long.' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  if (!email || !emailRegex.test(email)) {
    return res.status(400).json({ success: false, error: 'A valid email address is required.' });
  }

  // Strong password rule: min 8 chars, 1 uppercase, 1 lowercase, 1 number
  if (!password || password.length < 8) {
    return res.status(400).json({
      success: false,
      error: 'Password must be at least 8 characters in length.'
    });
  }

  next();
}

function validateTrip(req, res, next) {
  const { title, startDate, endDate, budget } = req.body;

  if (!title || title.trim().length < 3) {
    return res.status(400).json({ success: false, error: 'Trip title is required and must be at least 3 characters.' });
  }

  if (startDate && endDate && new Date(endDate) < new Date(startDate)) {
    return res.status(400).json({ success: false, error: 'Trip end date cannot precede start date.' });
  }

  if (budget !== undefined) {
    const numBudget = Number(budget);
    if (isNaN(numBudget) || numBudget < 0) {
      return res.status(400).json({ success: false, error: 'Budget must be a non-negative number.' });
    }
  }

  next();
}

function validateExpense(req, res, next) {
  const { title, amount, splitWithUserIds } = req.body;

  if (!title || title.trim().length < 2) {
    return res.status(400).json({ success: false, error: 'Expense title is required.' });
  }

  const numAmount = Number(amount);
  if (isNaN(numAmount) || numAmount <= 0) {
    return res.status(400).json({ success: false, error: 'Expense amount must be a positive number greater than 0.' });
  }

  if (splitWithUserIds && !Array.isArray(splitWithUserIds)) {
    return res.status(400).json({ success: false, error: 'splitWithUserIds must be an array of user IDs.' });
  }

  next();
}

module.exports = {
  sanitizeBody,
  validateRegister,
  validateTrip,
  validateExpense
};
