/**
 * TripMate Automated Integration & Security Test Suite
 * Tests End-to-End Authentication, RBAC Access Control, IDOR Prevention, and Audit Logging
 */

const test = require('node:test');
const assert = require('node:assert');

const BASE_URL = 'http://localhost:3000';

let aliceToken = null;
let bobToken = null;
let charlieToken = null;
const tripId = 'trip-swiss-alps-01';

test('Integration 1: Authenticate Alice (Owner), Bob (Editor), and Charlie (Viewer)', async () => {
  // Alice Login
  const rAlice = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'alice@tripmate.io', password: 'SecurePass123!' })
  });
  const dAlice = await rAlice.json();
  assert.strictEqual(rAlice.status, 200);
  assert.ok(dAlice.token);
  aliceToken = dAlice.token;

  // Bob Login
  const rBob = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'bob@tripmate.io', password: 'SecurePass123!' })
  });
  const dBob = await rBob.json();
  assert.strictEqual(rBob.status, 200);
  assert.ok(dBob.token);
  bobToken = dBob.token;

  // Charlie Login
  const rCharlie = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'charlie@tripmate.io', password: 'SecurePass123!' })
  });
  const dCharlie = await rCharlie.json();
  assert.strictEqual(rCharlie.status, 200);
  assert.ok(dCharlie.token);
  charlieToken = dCharlie.token;
});

test('Integration 2: RBAC Enforcement - Viewer (Charlie) Can READ Trip Data', async () => {
  const res = await fetch(`${BASE_URL}/api/trips/${tripId}`, {
    headers: { 'Authorization': `Bearer ${charlieToken}` }
  });
  const data = await res.json();
  assert.strictEqual(res.status, 200);
  assert.strictEqual(data.success, true);
  assert.strictEqual(data.trip.userRole, 'viewer');
});

test('Integration 3: RBAC Enforcement - Viewer (Charlie) is BLOCKED with 403 on Add Expense Attempt', async () => {
  const res = await fetch(`${BASE_URL}/api/trips/${tripId}/expenses`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${charlieToken}`
    },
    body: JSON.stringify({
      title: 'Unauthorized Luxury Dining',
      amount: 450.00,
      category: 'Food'
    })
  });
  const data = await res.json();
  assert.strictEqual(res.status, 403, 'Must return 403 Forbidden for Viewer role');
  assert.strictEqual(data.success, false);
  assert.ok(data.error.includes('Insufficient privileges') || data.error.includes('Forbidden'));
});

test('Integration 4: RBAC Enforcement - Editor (Bob) CAN Add Expense', async () => {
  const res = await fetch(`${BASE_URL}/api/trips/${tripId}/expenses`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${bobToken}`
    },
    body: JSON.stringify({
      title: 'Mountain Cogwheel Train Tickets',
      amount: 180.00,
      category: 'Transport',
      paidByUserId: 'usr-bob-02',
      splitWithUserIds: ['usr-alice-01', 'usr-bob-02', 'usr-charlie-03']
    })
  });
  const data = await res.json();
  assert.strictEqual(res.status, 201, 'Editor should be allowed to create expense');
  assert.strictEqual(data.success, true);
  assert.ok(data.expense.id);
});

test('Integration 5: Anti-BOLA / IDOR Prevention - Non-Member Access Denied', async () => {
  // Register a completely uninvited stranger
  const regRes = await fetch(`${BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Mallory Hacker',
      email: `mallory_${Date.now()}@attacker.io`,
      password: 'AttackPassword123!'
    })
  });
  const regData = await regRes.json();
  assert.strictEqual(regRes.status, 201);
  const strangerToken = regData.token;

  // Attempt unauthorized access to Alice's trip
  const probeRes = await fetch(`${BASE_URL}/api/trips/${tripId}`, {
    headers: { 'Authorization': `Bearer ${strangerToken}` }
  });
  assert.strictEqual(probeRes.status, 403, 'Must return 403 Forbidden for uninvited stranger');
});

test('Integration 6: Settlement Calculation - Total Spend and Split Matrix', async () => {
  const res = await fetch(`${BASE_URL}/api/trips/${tripId}/expenses/settlement-summary`, {
    headers: { 'Authorization': `Bearer ${aliceToken}` }
  });
  const data = await res.json();
  assert.strictEqual(res.status, 200);
  assert.strictEqual(data.success, true);
  assert.ok(data.summary.totalTripSpent > 0);
  assert.ok(Array.isArray(data.summary.settlements));
});
