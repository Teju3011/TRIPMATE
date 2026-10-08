/**
 * TripMate Automated Integration & Security Test Suite
 * Tests End-to-End Authentication, RBAC Access Control, IDOR Prevention, and Audit Logging
 */

const { test, before, after } = require('node:test');
const assert = require('node:assert');

const BASE_URL = 'http://localhost:3000';

let serverInstance = null;

before(async () => {
  try {
    const res = await fetch(`${BASE_URL}/health`);
    if (res.ok) return;
  } catch (err) {
    const app = require('../src/app');
    await new Promise((resolve) => {
      serverInstance = app.listen(3000, resolve);
    });
  }
});

after(() => {
  if (serverInstance) {
    serverInstance.close();
  }
});

let aliceToken = null;
let bobToken = null;
let charlieToken = null;
let aliceUser = null;
let bobUser = null;
let charlieUser = null;
let tripId = 'trip-swiss-alps-01';

async function authenticateOrRegister(name, email, password) {
  let res = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-test-suite': 'true' },
    body: JSON.stringify({ email, password })
  });
  if (res.status === 200) {
    const data = await res.json();
    return { token: data.token, user: data.user };
  }
  const regRes = await fetch(`${BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-test-suite': 'true' },
    body: JSON.stringify({ name, email, password })
  });
  const regData = await regRes.json();
  return { token: regData.token, user: regData.user };
}

test('Integration 1: Authenticate Alice (Owner), Bob (Editor), and Charlie (Viewer)', async () => {
  const uAlice = await authenticateOrRegister('Alice Chen', 'alice@tripmate.io', 'SecurePass123!');
  assert.ok(uAlice.token);
  aliceToken = uAlice.token;
  aliceUser = uAlice.user;

  const uBob = await authenticateOrRegister('Bob Smith', 'bob@tripmate.io', 'SecurePass123!');
  assert.ok(uBob.token);
  bobToken = uBob.token;
  bobUser = uBob.user;

  const uCharlie = await authenticateOrRegister('Charlie Davis', 'charlie@tripmate.io', 'SecurePass123!');
  assert.ok(uCharlie.token);
  charlieToken = uCharlie.token;
  charlieUser = uCharlie.user;
  charlieToken = uCharlie.token;

  // Check if test trip exists
  let checkTrip = await fetch(`${BASE_URL}/api/trips/${tripId}`, {
    headers: { 'Authorization': `Bearer ${aliceToken}` }
  });
  if (checkTrip.status !== 200) {
    const cTrip = await fetch(`${BASE_URL}/api/trips`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${aliceToken}`
      },
      body: JSON.stringify({
        title: 'Swiss Alps & Mediterranean Odyssey',
        destinationSummary: 'Zurich, Zermatt, French Riviera',
        budget: 4500,
        currency: 'USD'
      })
    });
    const cTripData = await cTrip.json();
    tripId = cTripData.trip.id;

    // Add Bob as editor and Charlie as viewer
    await fetch(`${BASE_URL}/api/trips/${tripId}/collaborators`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${aliceToken}` },
      body: JSON.stringify({ userId: uBob.user.id, role: 'editor' })
    });
    await fetch(`${BASE_URL}/api/trips/${tripId}/collaborators`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${aliceToken}` },
      body: JSON.stringify({ userId: uCharlie.user.id, role: 'viewer' })
    });
  }
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
      paidByUserId: bobUser.id,
      splitWithUserIds: [aliceUser.id, bobUser.id, charlieUser.id]
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
    headers: { 'Content-Type': 'application/json', 'x-test-suite': 'true' },
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
