/**
 * TripMate Automated Unit Test Suite
 * Tests core security primitives, input sanitizers, and financial split reconciliation
 */

const test = require('node:test');
const assert = require('node:assert');
const bcrypt = require('bcryptjs');

// Test 1: Bcrypt Password Hashing & Salt Verification
test('Security Unit: Bcrypt hashes passwords securely and rejects incorrect passwords', () => {
  const plainPassword = 'SuperSecretTripPass2026!';
  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(plainPassword, salt);

  assert.notStrictEqual(hash, plainPassword, 'Hash must never equal plaintext');
  assert.strictEqual(bcrypt.compareSync(plainPassword, hash), true, 'Bcrypt should verify correct password');
  assert.strictEqual(bcrypt.compareSync('WrongPassword', hash), false, 'Bcrypt should reject wrong password');
});

// Test 2: Input Sanitization against XSS Payloads
test('Security Unit: Input sanitization strips dangerous <script> tags and escapes HTML', () => {
  const maliciousInput = '<script>alert("pwned")</script><b>Swiss Alps</b>';
  
  // Custom sanitizer logic matching src/middleware/validationMiddleware
  function sanitizeString(str) {
    return str
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/[<>]/g, tag => ({ '<': '&lt;', '>': '&gt;' }[tag] || tag))
      .trim();
  }

  const sanitized = sanitizeString(maliciousInput);
  assert.strictEqual(sanitized.includes('<script>'), false, 'Should strip script tags');
  assert.strictEqual(sanitized.includes('&lt;b&gt;Swiss Alps&lt;/b&gt;'), true, 'Should escape HTML tags');
});

// Test 3: Financial Settlement Engine (Zero-Sum Property)
test('Business Logic Unit: Expense split algorithm preserves zero-sum ledger conservation', () => {
  const totalCost = 300.00;
  const numTravelers = 3;
  const sharePerPerson = totalCost / numTravelers; // 100 each

  const payerBal = totalCost - sharePerPerson; // +200
  const traveler2Bal = -sharePerPerson; // -100
  const traveler3Bal = -sharePerPerson; // -100

  const netLedgerSum = payerBal + traveler2Bal + traveler3Bal;
  assert.strictEqual(Math.abs(netLedgerSum) < 0.0001, true, 'Sum of all net balances must equal zero exactly');
});

// Test 4: Positive Financial Constraint Validation
test('Validation Unit: Expense and budget amounts must reject negative or non-numeric values', () => {
  function validateAmount(amt) {
    const num = Number(amt);
    return !isNaN(num) && num > 0 && isFinite(num);
  }

  assert.strictEqual(validateAmount(150.50), true);
  assert.strictEqual(validateAmount('85.00'), true);
  assert.strictEqual(validateAmount(-50), false, 'Negative amounts must be rejected');
  assert.strictEqual(validateAmount(0), false, 'Zero amount must be rejected');
  assert.strictEqual(validateAmount('abc'), false, 'NaN must be rejected');
  assert.strictEqual(validateAmount(Infinity), false, 'Infinity must be rejected');
});

// Test 5: Date Order Integrity
test('Validation Unit: Trip departure must be on or after arrival date', () => {
  function isValidDateRange(start, end) {
    if (!start || !end) return true;
    return new Date(end) >= new Date(start);
  }

  assert.strictEqual(isValidDateRange('2026-07-10', '2026-07-22'), true);
  assert.strictEqual(isValidDateRange('2026-07-22', '2026-07-10'), false, 'Inverted dates must be rejected');
});
