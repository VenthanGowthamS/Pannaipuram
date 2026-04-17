#!/usr/bin/env node
/**
 * பண்ணைப்புரம் — API Regression Test Suite
 *
 * Tests all public API endpoints for:
 *   ✅ HTTP 200 response
 *   ✅ Correct { success: true, data: ... } envelope
 *   ✅ Correct data types
 *   ✅ Required fields present
 *
 * Usage:
 *   node test/api_regression.test.js                    # test production
 *   API_BASE=http://localhost:3000 node test/api_regression.test.js  # test local
 */

const http = require('http');
const https = require('https');

const API_BASE = process.env.API_BASE || 'https://pannaipuram-api.onrender.com';
const isHttps = API_BASE.startsWith('https');
const fetcher = isHttps ? https : http;

let passed = 0;
let failed = 0;
let skipped = 0;
const errors = [];

// ── Helpers ────────────────────────────────────────────────────────────────

function get(path) {
  return new Promise((resolve, reject) => {
    const url = `${API_BASE}${path}`;
    fetcher.get(url, { timeout: 30000 }, (res) => {
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

// ── Test Suites ──────────────────────────────────────────────────────────

async function testHealth() {
  console.log('\n🏥 Health Check');
  await test('GET /health returns ok', async () => {
    const { status, body } = await get('/health');
    assert(status === 200, `Expected 200, got ${status}`);
    assert(body.status === 'ok', `Expected status ok, got ${body.status}`);
    assert(body.app === 'பண்ணைப்புரம்', `Expected app name பண்ணைப்புரம்`);
  });
}

async function testWaterEndpoints() {
  console.log('\n💧 Water Module');

  await test('GET /api/water/streets returns array of streets', async () => {
    const { status, body } = await get('/api/water/streets');
    assert(status === 200, `Expected 200, got ${status}`);
    assert(body.success === true, 'Expected success: true');
    assert(Array.isArray(body.data), 'Expected data to be an array');
    if (body.data.length > 0) {
      const s = body.data[0];
      assert(typeof s.id === 'number', 'Street id should be number');
      assert(typeof s.name_tamil === 'string', 'Street name_tamil should be string');
    }
  });

  await test('GET /api/water/schedule returns array', async () => {
    const { status, body } = await get('/api/water/schedule');
    assert(status === 200, `Expected 200, got ${status}`);
    assert(body.success === true, 'Expected success: true');
    assert(Array.isArray(body.data), 'Expected data to be an array');
  });

  await test('GET /api/water/schedule/1 returns schedule or null', async () => {
    const { status, body } = await get('/api/water/schedule/1');
    assert(status === 200, `Expected 200, got ${status}`);
    assert(body.success === true, 'Expected success: true');
    // data can be null if no schedule exists for this street
    if (body.data) {
      assert(typeof body.data.frequency_days === 'number', 'frequency_days should be number');
      assert(typeof body.data.supply_time === 'string', 'supply_time should be string');
    }
  });

  await test('GET /api/water/alerts/today returns array', async () => {
    const { status, body } = await get('/api/water/alerts/today');
    assert(status === 200, `Expected 200, got ${status}`);
    assert(body.success === true, 'Expected success: true');
    assert(Array.isArray(body.data), 'Expected data to be an array');
  });
}

async function testPowerEndpoints() {
  console.log('\n⚡ Power Module');

  await test('GET /api/power/cuts returns array', async () => {
    const { status, body } = await get('/api/power/cuts');
    assert(status === 200, `Expected 200, got ${status}`);
    assert(body.success === true, 'Expected success: true');
    assert(Array.isArray(body.data), 'Expected data to be an array');
    if (body.data.length > 0) {
      const c = body.data[0];
      assert(typeof c.id === 'number', 'id should be number');
      assert(['planned','unplanned'].includes(c.cut_type), `Invalid cut_type: ${c.cut_type}`);
      assert(typeof c.start_time === 'string', 'start_time should be string');
    }
  });

  await test('GET /api/power/cuts/today returns array', async () => {
    const { status, body } = await get('/api/power/cuts/today');
    assert(status === 200, `Expected 200, got ${status}`);
    assert(body.success === true, 'Expected success: true');
    assert(Array.isArray(body.data), 'Expected data to be an array');
  });
}

async function testBusEndpoints() {
  console.log('\n🚌 Bus Module');

  let corridorIds = [];

  await test('GET /api/bus/corridors returns array with correct fields', async () => {
    const { status, body } = await get('/api/bus/corridors');
    assert(status === 200, `Expected 200, got ${status}`);
    assert(body.success === true, 'Expected success: true');
    assert(Array.isArray(body.data), 'Expected data to be an array');
    if (body.data.length > 0) {
      const c = body.data[0];
      assert(typeof c.id === 'number', 'Corridor id should be number');
      assert(typeof c.name_tamil === 'string', 'name_tamil should be string');
      corridorIds = body.data.map(c => c.id);
    }
  });

  await test('GET /api/bus/timings/:id returns array with correct fields', async () => {
    if (corridorIds.length === 0) {
      assert(true, 'No corridors to test timings for (skipped)');
      return;
    }
    const { status, body } = await get(`/api/bus/timings/${corridorIds[0]}`);
    assert(status === 200, `Expected 200, got ${status}`);
    assert(body.success === true, 'Expected success: true');
    assert(Array.isArray(body.data), 'Expected data to be an array');
    if (body.data.length > 0) {
      const t = body.data[0];
      assert(typeof t.id === 'number', 'Timing id should be number');
      assert(typeof t.departs_at === 'string', 'departs_at should be string');
      assert(typeof t.bus_type === 'string', 'bus_type should be string');
    }
  });

  await test('GET /api/bus/next returns array', async () => {
    const { status, body } = await get('/api/bus/next');
    assert(status === 200, `Expected 200, got ${status}`);
    assert(body.success === true, 'Expected success: true');
    assert(Array.isArray(body.data), 'Expected data to be an array');
  });
}

async function testHospitalEndpoints() {
  console.log('\n🏥 Hospital Module');

  await test('GET /api/hospital/doctors returns array with hospital_id', async () => {
    const { status, body } = await get('/api/hospital/doctors');
    assert(status === 200, `Expected 200, got ${status}`);
    assert(body.success === true, 'Expected success: true');
    assert(Array.isArray(body.data), 'Expected data to be an array');
    if (body.data.length > 0) {
      const d = body.data[0];
      assert(typeof d.id === 'number', 'Doctor id should be number');
      assert(typeof d.name_tamil === 'string', 'name_tamil should be string');
      assert(d.hospital_id !== undefined, 'hospital_id field must exist');
      assert(typeof d.hospital_id === 'number', `hospital_id should be number, got ${typeof d.hospital_id}`);
      // Check schedules field (critical fix — was returning 'schedule' singular before)
      assert(Array.isArray(d.schedules), `schedules should be array, got ${typeof d.schedules}`);
      if (d.schedules.length > 0) {
        const s = d.schedules[0];
        assert(typeof s.day_of_week === 'number', 'schedule day_of_week should be number');
      }
    }
  });

  await test('GET /api/hospital/info returns hospital data', async () => {
    const { status, body } = await get('/api/hospital/info');
    assert(status === 200, `Expected 200, got ${status}`);
    assert(body.success === true, 'Expected success: true');
  });
}

async function testEmergencyEndpoints() {
  console.log('\n📞 Emergency Module');

  await test('GET /api/emergency/contacts returns grouped map', async () => {
    const { status, body } = await get('/api/emergency/contacts');
    assert(status === 200, `Expected 200, got ${status}`);
    assert(body.success === true, 'Expected success: true');
    assert(typeof body.data === 'object' && !Array.isArray(body.data), 'Expected data to be an object (grouped map)');
    // Check structure of any category
    const categories = Object.keys(body.data);
    if (categories.length > 0) {
      const firstCat = body.data[categories[0]];
      assert(Array.isArray(firstCat), `Category ${categories[0]} should be array`);
      if (firstCat.length > 0) {
        const c = firstCat[0];
        assert(typeof c.id === 'number', 'Contact id should be number');
        assert(typeof c.phone === 'string', 'phone should be string');
        assert(typeof c.name_tamil === 'string', 'name_tamil should be string');
      }
    }
  });
}

async function testAutoEndpoints() {
  console.log('\n🚗 Auto/Van Module');

  await test('GET /api/auto/drivers returns array with correct fields', async () => {
    const { status, body } = await get('/api/auto/drivers');
    assert(status === 200, `Expected 200, got ${status}`);
    assert(body.success === true, 'Expected success: true');
    assert(Array.isArray(body.data), 'Expected data to be an array');
    if (body.data.length > 0) {
      const d = body.data[0];
      assert(typeof d.id === 'number', 'Driver id should be number');
      assert(typeof d.name_tamil === 'string', 'name_tamil should be string');
      assert(typeof d.phone === 'string', 'phone should be string');
      assert(['auto','van','car'].includes(d.vehicle_type), `Invalid vehicle_type: ${d.vehicle_type}`);
    }
  });
}

async function testDoctorHospitalMapping() {
  console.log('\n🔗 Doctor-Hospital Mapping (Integration)');

  await test('Each doctor has a valid hospital_id (1 or 2)', async () => {
    const { status, body } = await get('/api/hospital/doctors');
    assert(status === 200, `Expected 200, got ${status}`);
    if (body.data.length > 0) {
      for (const d of body.data) {
        assert(
          d.hospital_id === 1 || d.hospital_id === 2,
          `Doctor "${d.name_english || d.name_tamil}" (id=${d.id}) has invalid hospital_id: ${d.hospital_id}`
        );
      }
    }
  });

  await test('Doctor schedules use correct field names (day_of_week, start_time, end_time, notes_tamil)', async () => {
    const { status, body } = await get('/api/hospital/doctors');
    if (body.data.length > 0) {
      for (const d of body.data) {
        assert(Array.isArray(d.schedules), `Doctor ${d.id}: schedules should be array`);
        for (const s of d.schedules) {
          assert('day_of_week' in s, `Doctor ${d.id}: schedule missing day_of_week`);
          assert('start_time' in s, `Doctor ${d.id}: schedule missing start_time`);
          assert('end_time' in s, `Doctor ${d.id}: schedule missing end_time`);
          assert('notes_tamil' in s, `Doctor ${d.id}: schedule missing notes_tamil`);
          // Ensure the old field names are NOT present
          assert(!('day' in s), `Doctor ${d.id}: schedule has old field 'day' — should be 'day_of_week'`);
          assert(!('start' in s), `Doctor ${d.id}: schedule has old field 'start' — should be 'start_time'`);
          assert(!('end' in s), `Doctor ${d.id}: schedule has old field 'end' — should be 'end_time'`);
          assert(!('notes' in s), `Doctor ${d.id}: schedule has old field 'notes' — should be 'notes_tamil'`);
        }
      }
    }
  });
}

async function testWaterStreetsSync() {
  console.log('\n🔗 Water-Streets Sync (Integration)');

  await test('/api/water/streets returns ALL streets (not just ones with schedules)', async () => {
    const { status: s1, body: streetsRes } = await get('/api/water/streets');
    const { status: s2, body: schedulesRes } = await get('/api/water/schedule');
    assert(s1 === 200 && s2 === 200, 'Both endpoints should return 200');

    const streetCount = streetsRes.data.length;
    const scheduleCount = schedulesRes.data.length;
    // Streets should be >= schedules (since not all streets have water schedules)
    assert(
      streetCount >= scheduleCount,
      `Streets (${streetCount}) should be >= scheduled streets (${scheduleCount}). If equal, all streets have schedules which is fine.`
    );
  });
}

async function testResponseEnvelope() {
  console.log('\n📦 Response Envelope Consistency');

  const endpoints = [
    '/api/water/streets',
    '/api/water/schedule',
    '/api/water/alerts/today',
    '/api/power/cuts',
    '/api/power/cuts/today',
    '/api/bus/corridors',
    '/api/hospital/doctors',
    '/api/emergency/contacts',
    '/api/auto/drivers',
  ];

  for (const ep of endpoints) {
    await test(`${ep} returns { success: true, data: ... }`, async () => {
      const { status, body } = await get(ep);
      assert(status === 200, `Expected 200, got ${status}`);
      assert(body.success === true, `Expected success: true in response from ${ep}`);
      assert('data' in body, `Expected 'data' key in response from ${ep}`);
    });
  }
}

// ── Main ──────────────────────────────────────────────────────────────────

async function main() {
  console.log('═══════════════════════════════════════════════');
  console.log('  பண்ணைப்புரம் — API Regression Tests');
  console.log(`  Target: ${API_BASE}`);
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

  await testHealth();
  await testWaterEndpoints();
  await testPowerEndpoints();
  await testBusEndpoints();
  await testHospitalEndpoints();
  await testEmergencyEndpoints();
  await testAutoEndpoints();
  await testDoctorHospitalMapping();
  await testWaterStreetsSync();
  await testResponseEnvelope();

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
