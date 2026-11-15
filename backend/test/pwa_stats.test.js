/**
 * PWA stats — "Installs Today" card vs the daily table.
 *
 * The card used a cutoff that was converted through the DB SESSION timezone.
 * On Supabase (UTC) "today" therefore began at 11:00 AM IST: a morning install
 * appeared in the daily table and the Recent list, but the card said 0.
 *
 * This test writes install rows straight into the LOCAL test database (with
 * exact install times), so it needs DATABASE_URL as well as API_BASE, plus an
 * admin login in ADMIN_EMAIL / ADMIN_PASSWORD. Start the server with PGTZ=UTC
 * to mirror Supabase — the old code only went wrong when the session zone was
 * not IST.
 *
 *   API_BASE=http://localhost:3000 DATABASE_URL=postgresql://$USER@localhost:5432/pannai_test \
 *   ADMIN_EMAIL=... ADMIN_PASSWORD=... node test/pwa_stats.test.js
 */
const http = require('http');
const https = require('https');
const { Client } = require('pg');

const API_BASE = process.env.API_BASE || 'http://localhost:3000';
const DATABASE_URL = process.env.DATABASE_URL;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

let passed = 0, failed = 0;
function assert(c, m) { if (!c) throw new Error(m); }
async function test(name, fn) {
  try { await fn(); passed++; console.log(`  ✅ ${name}`); }
  catch (e) { failed++; console.log(`  ❌ ${name} — ${e.message}`); }
}

function request(method, path, body, headers = {}) {
  const url = new URL(API_BASE + path);
  const lib = url.protocol === 'https:' ? https : http;
  const data = body ? JSON.stringify(body) : null;
  return new Promise((resolve, reject) => {
    const req = lib.request(url, {
      method,
      headers: { 'Content-Type': 'application/json', ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {}), ...headers },
    }, (res) => {
      let raw = '';
      res.on('data', (c) => { raw += c; });
      res.on('end', () => { try { resolve({ status: res.statusCode, body: JSON.parse(raw) }); } catch (_) { resolve({ status: res.statusCode, body: raw }); } });
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

// Unique per run so repeated runs never collide
const RUN = Date.now().toString(36);
const VID_TODAY_EARLY = `t-stats-early-${RUN}`;
const VID_YESTERDAY_LATE = `t-stats-late-${RUN}`;

async function main() {
  console.log('\n📱 PWA stats — Installs Today');
  if (!DATABASE_URL || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
    console.log('  ⏭  needs DATABASE_URL (local test DB), ADMIN_EMAIL and ADMIN_PASSWORD');
    process.exit(1);
  }
  if (/supabase|pooler|amazonaws/i.test(DATABASE_URL)) {
    console.log('  ⛔ refusing to write test rows into what looks like a production database');
    process.exit(1);
  }

  const db = new Client({ connectionString: DATABASE_URL });
  await db.connect();

  const login = await request('POST', '/admin/auth/login', { email: ADMIN_EMAIL, password: ADMIN_PASSWORD });
  const token = login.body && ((login.body.data && login.body.data.token) || login.body.token);
  const auth = { Authorization: `Bearer ${token}` };

  async function stats() {
    const r = await request('GET', '/admin/pwa/stats', null, auth);
    assert(r.status === 200, `stats → ${r.status}`);
    return r.body.data;
  }

  try {
    await test('GET /admin/pwa/stats rejects a request without a token', async () => {
      const r = await request('GET', '/admin/pwa/stats');
      assert(r.status === 401, `expected 401, got ${r.status}`);
    });

    const before = await stats();
    const istToday = (await db.query(`SELECT (NOW() AT TIME ZONE 'Asia/Kolkata')::date::text AS d`)).rows[0].d;
    const todayRow = (d) => d.daily.find((r) => {
      const v = r.day instanceof Date ? r.day : new Date(r.day);
      return String(r.day).slice(0, 10) === istToday ||
        (!isNaN(v) && `${v.getFullYear()}-${String(v.getMonth() + 1).padStart(2, '0')}-${String(v.getDate()).padStart(2, '0')}` === istToday);
    });
    const beforeRow = todayRow(before);

    // 00:30 IST today (counts) and 23:30 IST yesterday (must not count).
    await db.query(
      `INSERT INTO pwa_visits (visitor_id, user_agent, is_standalone, first_seen_at, last_seen_at, visit_count, installed_at)
       VALUES
        ($1, 'test', TRUE, NOW(), NOW(), 1,
         (date_trunc('day', NOW() AT TIME ZONE 'Asia/Kolkata') + INTERVAL '30 minutes') AT TIME ZONE 'Asia/Kolkata'),
        ($2, 'test', TRUE, NOW(), NOW(), 1,
         (date_trunc('day', NOW() AT TIME ZONE 'Asia/Kolkata') - INTERVAL '30 minutes') AT TIME ZONE 'Asia/Kolkata')`,
      [VID_TODAY_EARLY, VID_YESTERDAY_LATE]
    );
    await db.query(
      `INSERT INTO pwa_visit_days (visitor_id, day, opens)
       VALUES ($1, (NOW() AT TIME ZONE 'Asia/Kolkata')::date, 1)
       ON CONFLICT (visitor_id, day) DO NOTHING`,
      [VID_TODAY_EARLY]
    );

    const after = await stats();

    await test('an install at 00:30 IST counts as today; one at 23:30 IST yesterday does not', async () => {
      const delta = Number(after.totals.installs_today) - Number(before.totals.installs_today);
      assert(delta === 1, `Installs Today changed by ${delta}, expected exactly 1`);
    });

    await test('the daily table also gains exactly 1 install for today', async () => {
      const row = todayRow(after);
      assert(row, `today (${istToday}) missing from the daily table`);
      const delta = Number(row.installs) - Number(beforeRow ? beforeRow.installs : 0);
      assert(delta === 1, `today's row changed by ${delta}, expected exactly 1`);
    });

    await test('"Installs Today" card equals New Installs in today\'s row', async () => {
      const row = todayRow(after);
      assert(Number(row.installs) === Number(after.totals.installs_today),
        `card ${after.totals.installs_today} vs table ${row.installs}`);
    });
  } finally {
    await db.query('DELETE FROM pwa_visit_days WHERE visitor_id = ANY($1)', [[VID_TODAY_EARLY, VID_YESTERDAY_LATE]]);
    await db.query('DELETE FROM pwa_visits WHERE visitor_id = ANY($1)', [[VID_TODAY_EARLY, VID_YESTERDAY_LATE]]);
    await db.end();
  }

  console.log(`\n  passed: ${passed}  failed: ${failed}\n`);
  process.exit(failed ? 1 : 0);
}

main().catch((e) => { console.error(e); process.exit(1); });
