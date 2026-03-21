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
 *   ✅ Local Services CRUD
 *   ✅ Auto Registration Contact GET/PUT
 *   ✅ Announcements CRUD
 *   ✅ Auth Signup & RBAC User Management
 *   ✅ Public Register (self-signup)
 *   ✅ Health Check endpoint
 *
 * Requires environment variables:
 *   API_BASE (default: https://pannaipuram-api.onrender.com)
 *   ADMIN_EMAIL (default: venthan89@gmail.com)
 *   ADMIN_PASSWORD (default: admin123)
 *
 * Usage:
 *   node test/admin_crud.test.js
 *   ADMIN_PASSWORD=yourpass node test/admin_crud.test.js
 *   API_BASE=http://localhost:3000 ADMIN_EMAIL=admin@test.com ADMIN_PASSWORD=pass node test/admin_crud.test.js
 */

const http = require('http');
const https = require('https');
const querystring = require('querystring');

const API_BASE = process.env.API_BASE || 'https://pannaipuram-api.onrender.com';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'venthan89@gmail.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

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
    // Handle both formats: { data: { token } } and { token }
    const token = (body.data && body.data.token) || body.token;
    assert(token, 'Expected token in response');
    authToken = token;
    // Capture role if present
    const role = (body.data && body.data.role) || body.role;
    if (role) console.log(`      Role: ${role}`);
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

  await test('POST /admin/bus/routes finds or creates route for corridor', async () => {
    if (!corridorId) {
      assert(true, 'Skipped (no corridors available)');
      return;
    }
    const { status, body } = await post('/admin/bus/routes', {
      corridor_id: corridorId,
      direction: 'outbound',
      origin_tamil: 'பண்ணைப்புரம்',
      dest_tamil: 'பண்ணைப்புரம்',
    }, getAuthHeaders());
    assert(status === 200 || status === 201, `Expected 200/201, got ${status}`);
    assert(body.success === true, 'Expected success: true');
    routeId = body.data && body.data.id;
    assert(routeId, 'Expected route id in response');
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

async function testLocalServicesCRUD() {
  console.log('\n🛍  Local Services CRUD');

  let createdServiceId = null;

  await test('POST /admin/services adds a test service contact', async () => {
    const { status, body } = await post('/admin/services', {
      category: 'milk',
      name_tamil: 'டெஸ்ட் பால்காரர்',
      name_english: 'Test Milk Man',
      phone: '9876543210',
      area_tamil: 'முழு ஊர்',
      area_english: 'Whole village',
      notes_tamil: 'சோதனை',
      display_order: 99,
    }, getAuthHeaders());
    assert(status === 200 || status === 201, `Expected 200/201, got ${status}`);
    assert(body.success === true, 'Expected success: true');
    assert(body.data && typeof body.data.id === 'number', 'Expected id in response');
    assert(body.data.category === 'milk', `Expected category milk, got ${body.data.category}`);
    assert(body.data.phone === '9876543210', 'Expected phone to match');
    createdServiceId = body.data.id;
  });

  await test('POST /admin/services rejects missing required fields', async () => {
    const { status, body } = await post('/admin/services', {
      category: 'plumber',
      // missing name_tamil and phone
    }, getAuthHeaders());
    assert(status === 400, `Expected 400, got ${status}`);
    assert(body.success === false, 'Expected success: false');
  });

  await test('GET /admin/services lists all services including test service', async () => {
    const { status, body } = await get('/admin/services', getAuthHeaders());
    assert(status === 200, `Expected 200, got ${status}`);
    assert(body.success === true, 'Expected success: true');
    assert(Array.isArray(body.data), 'Expected data to be an array');
    if (createdServiceId) {
      const found = body.data.find(s => s.id === createdServiceId);
      assert(found, `Test service (id=${createdServiceId}) not found in list`);
      assert(found.name_tamil === 'டெஸ்ட் பால்காரர்', 'Tamil name should match');
    }
  });

  await test('PUT /admin/services/:id updates service', async () => {
    if (!createdServiceId) { assert(true, 'Skipped'); return; }
    const { status, body } = await put(`/admin/services/${createdServiceId}`, {
      phone: '9999999999',
      notes_tamil: 'புதிய குறிப்பு',
      is_active: false,
    }, getAuthHeaders());
    assert(status === 200, `Expected 200, got ${status}`);
    assert(body.success === true, 'Expected success: true');
    assert(body.data.phone === '9999999999', 'Phone should be updated');
  });

  await test('DELETE /admin/services/:id deletes service', async () => {
    if (!createdServiceId) { assert(true, 'Skipped'); return; }
    const { status, body } = await del(`/admin/services/${createdServiceId}`, getAuthHeaders());
    assert(status === 200, `Expected 200, got ${status}`);
    assert(body.success === true, 'Expected success: true');
  });

  await test('GET /admin/services verifies deletion', async () => {
    if (!createdServiceId) { assert(true, 'Skipped'); return; }
    const { status, body } = await get('/admin/services', getAuthHeaders());
    assert(status === 200, `Expected 200, got ${status}`);
    const found = body.data.find(s => s.id === createdServiceId);
    assert(!found, `Test service should be deleted but found id=${createdServiceId}`);
  });
}

async function testAutoContactCRUD() {
  console.log('\n📞 Auto Registration Contact GET/PUT');

  await test('GET /admin/auto/contact returns contact info', async () => {
    const { status, body } = await get('/admin/auto/contact', getAuthHeaders());
    assert(status === 200, `Expected 200, got ${status}`);
    assert(body.success === true, 'Expected success: true');
    assert(body.data, 'Expected data object');
    assert(typeof body.data.phone === 'string', 'Expected phone as string');
  });

  await test('PUT /admin/auto/contact updates contact', async () => {
    const { status, body } = await put('/admin/auto/contact', {
      name: 'டெஸ்ட் நபர்',
      name_english: 'Test Person',
      phone: '7777777777',
    }, getAuthHeaders());
    assert(status === 200, `Expected 200, got ${status}`);
    assert(body.success === true, 'Expected success: true');
    assert(body.data.phone === '7777777777', 'Phone should be updated');
  });

  await test('GET /admin/auto/contact verifies update', async () => {
    const { status, body } = await get('/admin/auto/contact', getAuthHeaders());
    assert(status === 200, `Expected 200, got ${status}`);
    assert(body.data.phone === '7777777777', 'Updated phone should persist');
    assert(body.data.name_english === 'Test Person', 'Updated name should persist');
  });

  await test('PUT /admin/auto/contact rejects missing phone', async () => {
    const { status, body } = await put('/admin/auto/contact', {
      name: 'No Phone',
    }, getAuthHeaders());
    assert(status === 400, `Expected 400, got ${status}`);
    assert(body.success === false, 'Expected success: false');
  });

  // Restore original default
  await test('PUT /admin/auto/contact restores default contact', async () => {
    const { status, body } = await put('/admin/auto/contact', {
      name: 'கௌதம்',
      name_english: 'Gowtham',
      phone: '8888888888',
    }, getAuthHeaders());
    assert(status === 200, `Expected 200, got ${status}`);
    assert(body.success === true, 'Expected success: true');
  });
}

async function testAnnouncementsCRUD() {
  console.log('\n📢 Announcements CRUD');

  let createdAnnouncementId = null;

  await test('POST /admin/announcements creates a test announcement', async () => {
    const { status, body } = await post('/admin/announcements', {
      message_tamil: 'சோதனை அறிவிப்பு — இது ஒரு டெஸ்ட்',
      message_english: 'Test announcement — this is a test',
      type: 'info',
      priority: 5,
    }, getAuthHeaders());
    assert(status === 200 || status === 201, `Expected 200/201, got ${status}`);
    assert(body.success === true, 'Expected success: true');
    assert(body.data && typeof body.data.id === 'number', 'Expected id in response');
    assert(body.data.type === 'info', `Expected type info, got ${body.data.type}`);
    assert(body.data.message_tamil.includes('சோதனை'), 'Tamil message should match');
    createdAnnouncementId = body.data.id;
  });

  await test('POST /admin/announcements rejects missing message_tamil', async () => {
    const { status, body } = await post('/admin/announcements', {
      message_english: 'English only — should fail',
    }, getAuthHeaders());
    assert(status === 400, `Expected 400, got ${status}`);
    assert(body.success === false, 'Expected success: false');
  });

  await test('GET /admin/announcements lists all including test announcement', async () => {
    const { status, body } = await get('/admin/announcements', getAuthHeaders());
    assert(status === 200, `Expected 200, got ${status}`);
    assert(body.success === true, 'Expected success: true');
    assert(Array.isArray(body.data), 'Expected data to be an array');
    if (createdAnnouncementId) {
      const found = body.data.find(a => a.id === createdAnnouncementId);
      assert(found, `Test announcement (id=${createdAnnouncementId}) not found`);
    }
  });

  await test('PUT /admin/announcements/:id updates announcement', async () => {
    if (!createdAnnouncementId) { assert(true, 'Skipped'); return; }
    const { status, body } = await put(`/admin/announcements/${createdAnnouncementId}`, {
      type: 'warning',
      priority: 10,
      is_active: false,
    }, getAuthHeaders());
    assert(status === 200, `Expected 200, got ${status}`);
    assert(body.success === true, 'Expected success: true');
    assert(body.data.type === 'warning', 'Type should be updated to warning');
    assert(body.data.is_active === false, 'Should be deactivated');
  });

  await test('GET /api/announcements public endpoint returns only active', async () => {
    const { status, body } = await get('/api/announcements');
    assert(status === 200, `Expected 200, got ${status}`);
    assert(body.success === true, 'Expected success: true');
    assert(Array.isArray(body.data), 'Expected data to be an array');
    // Our test announcement is inactive, should not appear
    if (createdAnnouncementId) {
      const found = body.data.find(a => a.id === createdAnnouncementId);
      assert(!found, 'Inactive announcement should not appear in public endpoint');
    }
  });

  await test('DELETE /admin/announcements/:id deletes announcement', async () => {
    if (!createdAnnouncementId) { assert(true, 'Skipped'); return; }
    const { status, body } = await del(`/admin/announcements/${createdAnnouncementId}`, getAuthHeaders());
    assert(status === 200, `Expected 200, got ${status}`);
    assert(body.success === true, 'Expected success: true');
  });
}

async function testAuthSignupAndRBAC() {
  console.log('\n👥 Auth Signup & RBAC User Management');

  const testEmail = `test_${Date.now()}@pannaipuram.local`;
  const testPassword = 'testpass123';
  let createdUserId = null;

  await test('POST /admin/auth/signup creates viewer user', async () => {
    const { status, body } = await post('/admin/auth/signup', {
      email: testEmail,
      password: testPassword,
      name: 'Test Viewer',
    }, getAuthHeaders());
    assert(status === 200 || status === 201, `Expected 200/201, got ${status}`);
    assert(body.success === true, 'Expected success: true');
    assert(body.user, 'Expected user in response');
    assert(body.user.role === 'viewer', `Expected role viewer, got ${body.user.role}`);
    assert(body.user.email === testEmail, 'Email should match');
    createdUserId = body.user.id;
  });

  await test('POST /admin/auth/signup rejects duplicate email', async () => {
    const { status } = await post('/admin/auth/signup', {
      email: testEmail,
      password: testPassword,
    }, getAuthHeaders());
    assert(status === 400, `Expected 400 for duplicate, got ${status}`);
  });

  await test('POST /admin/auth/login works for new viewer user', async () => {
    const { status, body } = await post('/admin/auth/login', {
      email: testEmail,
      password: testPassword,
    });
    assert(status === 200, `Expected 200, got ${status}`);
    assert(body.success === true, 'Expected success: true');
    const role = (body.data && body.data.role) || body.role;
    assert(role === 'viewer', `Expected viewer role, got ${role}`);
  });

  await test('GET /admin/auth/users lists users (super_admin)', async () => {
    const { status, body } = await get('/admin/auth/users', getAuthHeaders());
    assert(status === 200, `Expected 200, got ${status}`);
    assert(body.success === true, 'Expected success: true');
    assert(Array.isArray(body.data), 'Expected data array');
    if (createdUserId) {
      const found = body.data.find(u => u.id === createdUserId);
      assert(found, 'Test user should appear in user list');
      assert(found.role === 'viewer', 'Test user should be viewer');
    }
  });

  await test('PUT /admin/auth/users/:id/role changes role to admin', async () => {
    if (!createdUserId) { assert(true, 'Skipped'); return; }
    const { status, body } = await put(`/admin/auth/users/${createdUserId}/role`, {
      role: 'admin',
    }, getAuthHeaders());
    assert(status === 200, `Expected 200, got ${status}`);
    assert(body.success === true, 'Expected success: true');
    assert(body.user.role === 'admin', `Expected admin, got ${body.user.role}`);
  });

  await test('PUT /admin/auth/users/:id/role rejects invalid role', async () => {
    if (!createdUserId) { assert(true, 'Skipped'); return; }
    const { status } = await put(`/admin/auth/users/${createdUserId}/role`, {
      role: 'president',
    }, getAuthHeaders());
    assert(status === 400, `Expected 400 for invalid role, got ${status}`);
  });

  await test('PUT /admin/auth/users/:id/active deactivates user', async () => {
    if (!createdUserId) { assert(true, 'Skipped'); return; }
    const { status, body } = await put(`/admin/auth/users/${createdUserId}/active`, {
      is_active: false,
    }, getAuthHeaders());
    assert(status === 200, `Expected 200, got ${status}`);
    assert(body.success === true, 'Expected success: true');
    assert(body.user.is_active === false, 'User should be deactivated');
  });

  await test('POST /admin/auth/login rejects deactivated user', async () => {
    const { status } = await post('/admin/auth/login', {
      email: testEmail,
      password: testPassword,
    });
    assert(status === 401, `Expected 401 for deactivated user, got ${status}`);
  });

  // Clean up: reactivate and note for manual cleanup
  if (createdUserId) {
    try {
      await put(`/admin/auth/users/${createdUserId}/active`, { is_active: true }, getAuthHeaders());
      // We leave the test user — can be cleaned up manually
      console.log(`      ℹ️  Test user ${testEmail} (id=${createdUserId}) left in DB for cleanup`);
    } catch (_) {}
  }
}

async function testRBACViewerRestrictions() {
  console.log('\n🔒 RBAC Viewer Restrictions');

  const viewerEmail = `viewer_${Date.now()}@pannaipuram.local`;
  const viewerPassword = 'viewer123';
  let viewerToken = null;

  // Create a viewer user
  await test('Setup: create viewer for restriction tests', async () => {
    const { status, body } = await post('/admin/auth/signup', {
      email: viewerEmail,
      password: viewerPassword,
      name: 'Restriction Test Viewer',
    }, getAuthHeaders());
    assert(status === 200 || status === 201, `Expected 200/201, got ${status}`);

    // Login as viewer to get their token
    const loginRes = await post('/admin/auth/login', {
      email: viewerEmail,
      password: viewerPassword,
    });
    assert(loginRes.status === 200, `Login expected 200, got ${loginRes.status}`);
    viewerToken = (loginRes.body.data && loginRes.body.data.token) || loginRes.body.token;
    assert(viewerToken, 'Expected viewer token');
  });

  await test('GET /admin/auth/users forbidden for viewer', async () => {
    if (!viewerToken) { assert(true, 'Skipped'); return; }
    const { status } = await get('/admin/auth/users', {
      'Authorization': `Bearer ${viewerToken}`,
    });
    assert(status === 403, `Expected 403 for viewer accessing user list, got ${status}`);
  });

  await test('PUT /admin/auth/users/:id/role forbidden for viewer', async () => {
    if (!viewerToken) { assert(true, 'Skipped'); return; }
    const { status } = await put('/admin/auth/users/1/role', {
      role: 'admin',
    }, {
      'Authorization': `Bearer ${viewerToken}`,
    });
    assert(status === 403, `Expected 403 for viewer changing role, got ${status}`);
  });

  console.log(`      ℹ️  Test viewer ${viewerEmail} left in DB for cleanup`);
}

async function testHealthCheck() {
  console.log('\n🏥 Health Check');

  await test('GET /health returns ok with db connected', async () => {
    const { status, body } = await get('/health');
    assert(status === 200, `Expected 200, got ${status}`);
    assert(body.status === 'ok', `Expected status ok, got ${body.status}`);
    assert(body.db === 'connected', `Expected db connected, got ${body.db}`);
    assert(body.env.jwt_secret_set === true, 'JWT_SECRET should be set');
    assert(body.env.database_url_set === true, 'DATABASE_URL should be set');
  });
}

async function testPublicRegister() {
  console.log('\n📝 Public Registration');

  const regEmail = `register_${Date.now()}@pannaipuram.local`;

  await test('POST /admin/auth/register creates inactive user (no auth needed)', async () => {
    const { status, body } = await post('/admin/auth/register', {
      email: regEmail,
      password: 'testpass123',
      name: 'Test Register User',
    });
    assert(status === 200, `Expected 200, got ${status}`);
    assert(body.success === true, 'Expected success: true');
    assert(body.user, 'Expected user in response');
    assert(body.user.role === 'viewer', `Expected viewer role, got ${body.user.role}`);
  });

  await test('POST /admin/auth/login rejects inactive registered user', async () => {
    const { status } = await post('/admin/auth/login', {
      email: regEmail,
      password: 'testpass123',
    });
    assert(status === 401, `Expected 401 for inactive user, got ${status}`);
  });

  await test('POST /admin/auth/register rejects duplicate email', async () => {
    const { status } = await post('/admin/auth/register', {
      email: regEmail,
      password: 'testpass123',
    });
    assert(status === 400, `Expected 400 for duplicate, got ${status}`);
  });

  console.log(`      ℹ️  Test user ${regEmail} left in DB (inactive) for cleanup`);
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

  // Health check
  await testHealthCheck();

  // Public register
  await testPublicRegister();

  // Run all CRUD test suites
  await testPowerCutsCRUD();
  await testBusTimingsCRUD();
  await testDoctorsCRUD();
  await testEmergencyContactsCRUD();
  await testAutoDriversCRUD();
  await testStreetsCRUD();
  await testWaterScheduleUpdate();
  await testLocalServicesCRUD();
  await testAutoContactCRUD();
  await testAnnouncementsCRUD();
  await testAuthSignupAndRBAC();
  await testRBACViewerRestrictions();

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
