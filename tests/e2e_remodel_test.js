const assert = require('assert');

(async () => {
  const BASE = 'http://localhost:3000';

  console.log('[*] Testing HTML response...');
  const htmlRes = await fetch(BASE);
  const html = await htmlRes.text();
  assert(html.includes('id="authPortal"'), 'Should contain auth portal');
  assert(!html.includes('personaAliceBtn'), 'Should NOT contain persona buttons');
  assert(!html.includes('personaBobBtn'), 'Should NOT contain persona buttons');
  assert(!html.includes('personaCharlieBtn'), 'Should NOT contain persona buttons');
  console.log('[+] HTML verified: Clean auth portal present, demo persona buttons removed!');

  console.log('[*] Testing real user registration...');
  const userA = {
    name: 'Sarah Connor',
    email: 'sarah_' + Date.now() + '@resistance.io',
    password: 'SecurePass2026!'
  };
  const regRes = await fetch(BASE + '/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userA)
  });
  const regData = await regRes.json();
  assert.strictEqual(regRes.status, 201, 'Registration must return 201 Created');
  assert.ok(regData.token, 'Must return JWT token');
  assert.strictEqual(regData.user.name, userA.name);
  console.log('[+] Registration succeeded for ' + userA.name + ' (' + userA.email + ')');

  console.log('[*] Testing login...');
  const loginRes = await fetch(BASE + '/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: userA.email, password: userA.password })
  });
  const loginData = await loginRes.json();
  assert.strictEqual(loginRes.status, 200);
  assert.ok(loginData.token);
  console.log('[+] Login succeeded with JWT token generation');

  console.log('[*] Testing /api/auth/me profile verification...');
  const meRes = await fetch(BASE + '/api/auth/me', {
    headers: { 'Authorization': 'Bearer ' + loginData.token }
  });
  const meData = await meRes.json();
  assert.strictEqual(meRes.status, 200);
  assert.strictEqual(meData.user.email, userA.email);
  console.log('[+] /api/auth/me returned correct authenticated profile');

  console.log('[*] Testing initial trips count (should be 0 for new user)...');
  const tripsRes = await fetch(BASE + '/api/trips', {
    headers: { 'Authorization': 'Bearer ' + loginData.token }
  });
  const tripsData = await tripsRes.json();
  assert.strictEqual(tripsData.trips.length, 0, 'New user must have 0 initial trips');
  console.log('[+] Initial trips count verified: exactly 0 (empty state active)!');

  console.log('[*] Creating a real trip as Sarah (Owner)...');
  const createTripRes = await fetch(BASE + '/api/trips', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + loginData.token
    },
    body: JSON.stringify({
      title: 'Patagonia Wilderness Expedition',
      destinationSummary: 'El Chalten, Torres del Paine',
      startDate: '2026-11-01',
      endDate: '2026-11-15',
      budget: 3200,
      currency: 'USD',
      description: 'Backpacking and trail exploration in southern Patagonia'
    })
  });
  const newTripData = await createTripRes.json();
  assert.strictEqual(createTripRes.status, 201);
  const tripId = newTripData.trip.id;
  assert.strictEqual(newTripData.trip.userRole, 'owner');
  console.log('[+] Trip created successfully: ' + tripId);

  console.log('[*] Inviting collaborator by email before they register...');
  const friendEmail = 'john_' + Date.now() + '@resistance.io';
  const inviteRes = await fetch(BASE + '/api/trips/' + tripId + '/collaborators', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + loginData.token
    },
    body: JSON.stringify({
      email: friendEmail,
      role: 'editor'
    })
  });
  const inviteData = await inviteRes.json();
  assert.strictEqual(inviteRes.status, 201);
  console.log('[+] Successfully invited collaborator ' + friendEmail + ' with EDITOR role');

  console.log('[*] Registering John with invited email...');
  const regJohnRes = await fetch(BASE + '/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'John Connor',
      email: friendEmail,
      password: 'LeaderPass2026!'
    })
  });
  const regJohnData = await regJohnRes.json();
  assert.strictEqual(regJohnRes.status, 201);
  console.log('[+] John registered! Checking if pending invite was auto-activated...');

  const johnTripsRes = await fetch(BASE + '/api/trips', {
    headers: { 'Authorization': 'Bearer ' + regJohnData.token }
  });
  const johnTripsData = await johnTripsRes.json();
  assert.strictEqual(johnTripsData.trips.length, 1);
  assert.strictEqual(johnTripsData.trips[0].id, tripId);
  assert.strictEqual(johnTripsData.trips[0].userRole, 'editor');
  console.log('[+] Auto-linking verified: John automatically has access as EDITOR to Patagonia trip!');

  console.log('\n==========================================');
  console.log('✅ ALL REAL-TIME APP WORKFLOW CHECKS PASSED!');
  console.log('==========================================');
})().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
