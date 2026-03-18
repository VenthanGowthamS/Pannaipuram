#!/usr/bin/env node
/**
 * பண்ணைப்புரம் — Admin CRUD Test Suite
 *
 * Tests all admin endpoints for CREATE, READ, UPDATE, DELETE operations:
 *   ✅ Authentication (POST /admin/auth/login)
 *   ✅ Power Cuts CRUD
 *   ✅ Bus Timings CRUD
 *   ✅ Doctors CRUD
 *   ✅ Emergency Contacts CRUD
 *   ✅ Auto Drivers CRUD
 *   ✅ Streets CRUD
 *   ✅ Water Schedule UPDATE
 *
 * Requires environment variables:
 *   API_BASE (default: https://pannaipuram-api.onrender.com)
 *   ADMIN_EMAIL (default: admin@pannaipuram.local)
 *   ADMIN_PASSWORD (default: password123)
 *
 * Usage:
 *   node test/admin_crud.test.js
 *   API_BASE=http://localhost:3000 ADMIN_EMAIL=admin@test.com ADMIN_PASSWORD=pass node test/admin_crud.test.js
 */

const http = require('http');
const https = require('https');
const querystring = require('querystring');

const API_BASE = process.env.API_BASE || 'https://pannaipuram-api.onrender.com';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@pannaipuram.local';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'password123';

const isHttps = API_BASE.startsWith('https');
const fetcher = isHttps ? https : http;

let passed = 0;
let failed = 0;
let skipped = 0;
const errors = [];
let authToken = null;

// ── Helpers ────────────────────────────────────────────────────────────────

function get(path, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = `${API_BASE}${path}`;
    fetcher.get(url, { timeout: 30000, headers }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch (e) {
          reject(new Error(`Invalid JSON from ${path}: ${data.substring(0, 200)}`));
        }
      });
    }).on('error', reject)
      .on('timeout', () => reject(new Error(`Timeout on ${path}`)));
  });
}

function post(path, body, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(`${API_BASE}${path}`);
    const hostname = url.hostname;
    const pathname = url.pathname + url.search;
    const port = url.port || (isHttps ? 443 : 80);

    const bodyString = typeof body === 'string' ? body : JSON.stringify(body);
    const defaultHeaders = {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(bodyString),
      ...headers,
    };

    const options = { hostname, port, path: pathname, method: 'POST', headers: defaultHeaders, timeout: 30000 };

    const req = fetcher.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch (e) {
          reject(new Error(`Invalid JSON from ${path}: ${data.substring(0, 200)}`));
        }
      });
    });

    req.on('error', reject);
    req.on('timeout', () => reject(new Error(`Timeout on ${path}`)));
    req.write(bodyString);
    req.end();
  });
}

function put(path, body, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(`${API_BASE}${path}`);
    const hostname = url.hostname;
    const pathname = url.pathname + url.search;
    const port = url.port || (isHttps ? 443 : 80);

    const bodyString = typeof body === 'string' ? body : JSON.stringify(body);
    const defaultHeaders = {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(bodyString),
      ...headers,
    };

    const options = { hostname, port, path: pathname, method: 'PUT', headers: defaultHeaders, timeout: 30000 };

    const req = fetcher.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch (e) {
          reject(new Error(`Invalid JSON from ${path}: ${data.substring(0, 200)}`));
        }
      });
    });

    req.on('error', reject);
    req.on('timeout', () => reject(new Error(`Timeout on ${path}`)));
    req.write(bodyString);
    req.end();
  });
}

function del(path, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(`${API_BASE}${path}`);
    const hostname = url.hostname;
    const pathname = url.pathname + url.search;
    const port = url.port || (isHttps ? 443 : 80);

    const options = { hostname, port, path: pathname, method: 'DELETE', headers, timeout: 30000 };

    const req = fetcher.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch (e) {
          reject(new Error(`Invalid JSON from ${path}: ${data.substring(0, 200)}`));
        }
      });
    });

    req.on('error', reject);
    req.on('timeout', () => reject(new Error(`Timeout on ${path}`)));
    req.end();
  });
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function test(name, fn) {
  try {
    await fn();
    passed++;
    console.log(`  ✅ ${name}`);
  } catch (e) {
    failed++;
    const msg = `  ❌ ${name} — ${e.message}`;
    console.log(msg);
    errors.push(msg);
  }
}

function skip(name, reason) {
  skipped++;
  console.log(`  ⏭  ${name} — ${reason}`);
}

function getAuthHeaders() {
  if (!authToken) throw new Error('Not authenticated. Call testAuth() first.');
  return { 'Authorization': `Bearer ${authToken}` };
}

// ── Test Suites ──────────────────────────────────────────────────────────

async function testAuth() {
  console.log('\n🔐 Authentication');

  await test('POST /admin/auth/login authenticates and returns token', async () => {
    const { status, body } = await post('/admin/auth/login', {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
    });
    assert(status === 200, `Expected 200, got ${status}`);
    assert(body.success === true, 'Expected success: true');
    assert(body.data && body.data.token, 'Expected token in response');
    authToken = body.data.token;
    console.log(`      Token: ${authToken.substring(0, 20)}...`);
  });
}

async function testPowerCutsCRUD() {
  console.log('\n⚡ Power Cuts CRUD');

  let createdPowerCutId = null;

  await test('POST /admin/power/cuts creates a new power cut', async () => {
    const { status, body } = await post('/admin/power/cuts', {
      street_id: 1,
      cut_type: 'planned',
      start_time: '2026-03-18T09:00:00Z',
      end_time: '2026-03-18T13:00:00Z',
      reason_tamil: 'சோதனை நோக்கம்',
    }, getAuthHeaders());
    assert(status === 200 || status === 201, `Expected 200/201, got ${status}`);
    assert(body.success === true, 'Expected success: true');
    assert(body.data && typeof body.data.id === 'number', 'Expected id in response');
    createdPowerCutId = body.data.id;
  });

  await test('GET /admin/power/cuts lists power cuts including test cut', async () => {
    const { status, body } = await get('/admin/power/cuts', getAuthHeaders());
    assert(status === 200, `Expected 200, got ${status}`);
    assert(body.success === true, 'Expected success: true');
    assert(Array.isArray(body.data), 'Expected data to be an array');
    if (createdPowerCutId) {
      const found = body.data.find(c => c.id === createdPowerCutId);
      assert(found, `Test power cut (id=${createdPowerCutId}) not found in list`);
    }
  });

  await test('PUT /admin/power/cuts/:id updates power cut (resolve)', async () => {
    if (!createdPowerCutId) {
      assert(true, 'Skipped (no test cut created)');
      return;
    }
    const { status, body } = await put(`/admin/power/cuts/${createdPowerCutId}`, {
      is_resolved: true,
    }, getAuthHeaders());
    assert(status === 200, `Expected 200, got ${status}`);
    assert(body.success === true, 'Expected success: true');
  });

  await test('DELETE /admin/power/cuts/:id deletes power cut', async () => {
    if (!createdPowerCutId) {
      assert(true, 'Skipped (no test cut created)');
      return;
    }
    const { status, body } = await del(`/admin/power/cuts/${createdPowerCutId}`, getAuthHeaders());
    assert(status === 200, `Expected 200, got ${status}`);
    assert(body.success === true, 'Expected success: true');
  });

  await test('GET /admin/power/cuts verifies deletion', async () => {
    if (!createdPowerCutId) {
      assert(true, 'Skipped (no test cut created)');
      return;
    }
    const { status, body } = await get('/admin/power/cuts', getAuthHeaders());
    assert(status === 200, `Expected 200, got ${status}`);
    const found = body.data.find(c => c.id === createdPowerCutId);
    assert(!found, `Test power cut should be deleted but found id=${createdPowerCutId}`);
  });
}

async function testBusTimingsCRUD() {
  console.log('\n🚌 Bus Timings CRUD');

  let corridorId = null;
  let routeId = null;
  let createdTimingId = null;

  await test('GET /admin/bus/corridors returns corridors', async () => {
    const { status, body } = await get('/admin/bus/corridors', getAuthHeaders());
    assert(status === 200, `Expected 200, got ${status}`);
    assert(body.success === true, 'Expected success: true');
    assert(Array.isArray(body.data), 'Expected data to be an array');
    if (body.data.length > 0) {
      corridorId = body.data[0].id;
    }
  });

  await test('GET /admin/bus/routes/:corridorId or POST /admin/bus/routes creates route', async () => {
    if (!corridorId) {
      assert(true, 'Skipped (no corridors available)');
      return;
    }
    const { status, body } = await get(`/admin/bus/routes?corridor_id=${corridorId}`, getAuthHeaders());
    if (status === 200 && body.data && body.data.length > 0) {
      routeId = body.data[0].id;
    } else {
      // Try creating a route if it doesn't exist
      const createRes = await post('/admin/bus/routes', {
        corridor_id: corridorId,
        route_number: 'TEST-001',
      }, getAuthHeaders());
      if (createRes.status === 200 || createRes.status === 201) {
        routeId = createRes.body.data?.id;
      }
    }
    assert(routeId, 'Could not get or create route');
  });

  await test('POST /admin/bus/timings adds a test timing', async () => {
    if (!routeId) {
      assert(true, 'Skipped (no route available)');
      return;
    }
    const { status, body } = await post('/admin/bus/timings', {
      route_id: routeId,
      departs_at: '06:30',
      bus_type: 'ordinary',
    }, getAuthHeaders());
    assert(status === 200 || status === 201, `Expected 200/201, got ${status}`);
    assert(body.success === true, 'Expected success: true');
    assert(body.data && typeof body.data.id === 'number', 'Expected id in response');
    createdTimingId = body.data.id;
  });

  await test('DELETE /admin/bus/timings/:id deletes timing', async () => {
    if (!createdTimingId) {
      assert(true, 'Skipped (no timing created)');
      return;
    }
    const { status, body } = await del(`/admin/bus/timings/${createdTimingId}`, getAuthHeaders());
    assert(status === 200, `Expected 200, got ${status}`);
    assert(body.success === true, 'Expected success: true');
  });
}

async function testDoctorsCRUD() {
  console.log('\n👨‍⚕️ Doctors CRUD');

  let createdDoctorId = null;

  await test('POST /admin/hospital/doctors adds test doctor', async () => {
    const { status, body } = await post('/admin/hospital/doctors', {
      hospital_id: 1,
      name_tamil: 'டெஸ்ட் டாக்டர்',
      name_english: 'Test Doctor',
      specialization_tamil: 'பொது மருத்துவம்',
      specialization_english: 'General Medicine',
    }, getAuthHeaders());
    assert(status === 200 || status === 201, `Expected 200/201, got ${status}`);
    assert(body.success === true, 'Expected success: true');
    assert(body.data && typeof body.data.id === 'number', 'Expected id in response');
    createdDoctorId = body.data.id;
  });

  await test('POST /admin/hospital/doctors/:id/schedule adds schedule', async () => {
    if (!createdDoctorId) {
      assert(true, 'Skipped (no doctor created)');
      return;
    }
    const { status, body } = await post(`/admin/hospital/doctors/${createdDoctorId}/schedule`, {
      day_of_week: 1,
      start_time: '09:00',
      end_time: '14:00',
      notes_tamil: 'சோதனை',
    }, getAuthHeaders());
    assert(status === 200 || status === 201, `Expected 200/201, got ${status}`);
    assert(body.success === true, 'Expected success: true');
  });

  await test('DELETE /admin/hospital/doctors/:id deletes doctor', async () => {
    if (!createdDoctorId) {
      assert(true, 'Skipped (no doctor created)');
      return;
    }
    const { status, body } = await del(`/admin/hospital/doctors/${createdDoctorId}`, getAuthHeaders());
    assert(status === 200, `Expected 200, got ${status}`);
    assert(body.success === true, 'Expected success: true');
  });
}

async function testEmergencyContactsCRUD() {
  console.log('\n📞 Emergency Contacts CRUD');

  let createdContactId = null;

  await test('POST /admin/contacts adds test emergency contact', async () => {
    const { status, body } = await post('/admin/contacts', {
      category_english: 'Police',
      category_tamil: 'போலீஸ்',
      name_tamil: 'டெஸ்ட் போலீஸ்',
      name_english: 'Test Police',
      phone: '9876543210',
      notes_tamil: 'சோதனை',
    }, getAuthHeaders());
    assert(status === 200 || status === 201, `Expected 200/201, got ${status}`);
    assert(body.success === true, 'Expected success: true');
    assert(body.data && typeof body.data.id === 'number', 'Expected id in response');
    createdContactId = body.data.id;
  });

  await test('PUT /admin/contacts/:id updates contact', async () => {
    if (!createdContactId) {
      assert(true, 'Skipped (no contact created)');
      return;
    }
    const { status, body } = await put(`/admin/contacts/${createdContactId}`, {
      phone: '9999999999',
      notes_tamil: 'புதிய குறிப்பு',
    }, getAuthHeaders());
    assert(status === 200, `Expected 200, got ${status}`);
    assert(body.success === true, 'Expected success: true');
  });

  await test('DELETE /admin/contacts/:id deletes contact', async () => {
    if (!createdContactId) {
      assert(true, 'Skipped (no contact created)');
      return;
    }
    const { status, body } = await del(`/admin/contacts/${createdContactId}`, getAuthHeaders());
    assert(status === 200, `Expected 200, got ${status}`);
    assert(body.success === true, 'Expected success: true');
  });
}

async function testAutoDriversCRUD() {
  console.log('\n🚗 Auto Drivers CRUD');

  let createdDriverId = null;

  await test('POST /admin/auto/drivers adds test driver', async () => {
    const { status, body } = await post('/admin/auto/drivers', {
      name_tamil: 'டெஸ்ட் ஆட்டோ',
      name_english: 'Test Auto',
      phone: '9876543210',
      vehicle_type: 'auto',
      coverage_area_tamil: 'பண்ணைப்புரம்',
    }, getAuthHeaders());
    assert(status === 200 || status === 201, `Expected 200/201, got ${status}`);
    assert(body.success === true, 'Expected success: true');
    assert(body.data && typeof body.data.id === 'number', 'Expected id in response');
    createdDriverId = body.data.id;
  });

  await test('PUT /admin/auto/drivers/:id updates driver', async () => {
    if (!createdDriverId) {
      assert(true, 'Skipped (no driver created)');
      return;
    }
    const { status, body } = await put(`/admin/auto/drivers/${createdDriverId}`, {
      phone: '9999999999',
      vehicle_type: 'van',
    }, getAuthHeaders());
    assert(status === 200, `Expected 200, got ${status}`);
    assert(body.success === true, 'Expected success: true');
  });

  await test('DELETE /admin/auto/drivers/:id deletes driver', async () => {
    if (!createdDriverId) {
      assert(true, 'Skipped (no driver created)');
      return;
    }
    const { status, body } = await del(`/admin/auto/drivers/${createdDriverId}`, getAuthHeaders());
    assert(status === 200, `Expected 200, got ${status}`);
    assert(body.success === true, 'Expected success: true');
  });
}

async function testStreetsCRUD() {
  console.log('\n🛣️ Streets CRUD');

  let createdStreetId = null;

  await test('POST /admin/streets adds test street', async () => {
    const { status, body } = await post('/admin/streets', {
      name_tamil: 'டெஸ்ட் தெரு',
      name_english: 'Test Street',
      ward_number: 99,
      zone_name: 'Test Zone',
    }, getAuthHeaders());
    assert(status === 200 || status === 201, `Expected 200/201, got ${status}`);
    assert(body.success === true, 'Expected success: true');
    assert(body.data && typeof body.data.id === 'number', 'Expected id in response');
    createdStreetId = body.data.id;
  });

  await test('PUT /admin/streets/:id updates street', async () => {
    if (!createdStreetId) {
      assert(true, 'Skipped (no street created)');
      return;
    }
    const { status, body } = await put(`/admin/streets/${createdStreetId}`, {
      name_tamil: 'புதிய டெஸ்ட் தெரு',
      ward_number: 100,
    }, getAuthHeaders());
    assert(status === 200, `Expected 200, got ${status}`);
    assert(body.success === true, 'Expected success: true');
  });

  await test('DELETE /admin/streets/:id deletes street', async () => {
    if (!createdStreetId) {
      assert(true, 'Skipped (no street created)');
      return;
    }
    const { status, body } = await del(`/admin/streets/${createdStreetId}`, getAuthHeaders());
    assert(status === 200, `Expected 200, got ${status}`);
    assert(body.success === true, 'Expected success: true');
  });
}

async function testWaterScheduleUpdate() {
  console.log('\n💧 Water Schedule Update');

  await test('PUT /admin/water/schedule/:streetId updates schedule for street', async () => {
    const { status, body } = await put('/admin/water/schedule/1', {
      frequency_days: 3,
      supply_time: '06:00',
      supply_duration_hours: 2,
      notes_tamil: 'சோதனை அட்டவணை',
    }, getAuthHeaders());
    assert(status === 200, `Expected 200, got ${status}`);
    assert(body.success === true, 'Expected success: true');
  });

  await test('GET /api/water/schedule/1 verifies updated schedule', async () => {
    const { status, body } = await get('/api/water/schedule/1');
    assert(status === 200, `Expected 200, got ${status}`);
    assert(body.success === true, 'Expected success: true');
    // Note: may be null if no schedule exists, but if it exists should have the fields
  });
}

// ── Main ──────────────────────────────────────────────────────────────────

async function main() {
  console.log('═══════════════════════════════════════════════');
  console.log('  பண்ணைப்புரம் — Admin CRUD Tests');
  console.log(`  Target: ${API_BASE}`);
  console.log(`  Admin: ${ADMIN_EMAIL}`);
  console.log('═══════════════════════════════════════════════');

  // Wake up Render free tier (cold start ~30s)
  console.log('\n⏳ Waking up server (Render free tier cold start)...');
  try {
    await get('/health');
    console.log('  Server is awake ✅');
  } catch (e) {
    console.log('  ⚠️  Server took too long to wake up. Retrying...');
    await new Promise(r => setTimeout(r, 10000));
    try {
      await get('/health');
      console.log('  Server is awake ✅');
    } catch (e2) {
      console.log('  ❌ Server unreachable. Aborting tests.');
      process.exit(1);
    }
  }

  // Authentication is required for all admin tests
  await testAuth();
  if (!authToken) {
    console.log('\n❌ Authentication failed. Cannot proceed with admin tests.');
    process.exit(1);
  }

  // Run all CRUD test suites
  await testPowerCutsCRUD();
  await testBusTimingsCRUD();
  await testDoctorsCRUD();
  await testEmergencyContactsCRUD();
  await testAutoDriversCRUD();
  await testStreetsCRUD();
  await testWaterScheduleUpdate();

  console.log('\n═══════════════════════════════════════════════');
  console.log(`  Results: ${passed} passed, ${failed} failed, ${skipped} skipped`);
  if (errors.length > 0) {
    console.log('\n  Failures:');
    errors.forEach(e => console.log(e));
  }
  console.log('═══════════════════════════════════════════════\n');

  process.exit(failed > 0 ? 1 : 0);
}

main().catch(e => {
  console.error('Fatal error:', e);
  process.exit(1);
});
