#!/usr/bin/env node
/**
 * Complete bus data reset + fresh insert from docs/pannaipuram_bus_lists.md
 * Clears all existing routes/timings, creates missing corridors, inserts ~173 timings.
 */

const https = require('https');

const API_BASE = process.env.API_BASE || 'https://pannaipuram-api.onrender.com';
const ADMIN_EMAIL = 'venthan89@gmail.com';
const ADMIN_PASSWORD = 'admin123';

let authToken = null;

function req(method, path, body) {
  return new Promise((resolve, reject) => {
    const url = new URL(`${API_BASE}${path}`);
    const headers = {};
    let bodyString = '';
    if (body) {
      bodyString = JSON.stringify(body);
      headers['Content-Type'] = 'application/json';
      headers['Content-Length'] = Buffer.byteLength(bodyString);
    }
    if (authToken) headers['Authorization'] = `Bearer ${authToken}`;
    const options = {
      hostname: url.hostname, port: 443, path: url.pathname,
      method, headers, timeout: 45000,
    };
    const r = https.request(options, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
        catch (e) { reject(new Error(`Bad JSON from ${path} [${res.statusCode}]: ${data.substring(0,200)}`)); }
      });
    });
    r.on('error', reject);
    r.on('timeout', () => reject(new Error(`Timeout on ${path}`)));
    if (bodyString) r.write(bodyString);
    r.end();
  });
}
const post = (p, b) => req('POST', p, b);
const get  = (p)    => req('GET', p);
const del  = (p)    => req('DELETE', p);

function typeOf(op) {
  if (op === 'Town Bus') return 'ordinary';
  if (op === 'Mofussil') return 'express';
  return 'private';
}

// ── Data — parsed from docs/pannaipuram_bus_lists.md ───────────────────

const CHINNAMANUR = [
  {t:'05:00',o:'Town Bus'}, {t:'06:00',o:'Town Bus'}, {t:'07:00',o:'Town Bus'},
  {t:'08:30',o:'TAT Private Bus'}, {t:'09:10',o:'Town Bus'},
  {t:'10:10',o:'Town Bus'}, {t:'11:10',o:'TAT Private Bus'},
  {t:'12:30',o:'Town Bus'}, {t:'14:10',o:'TAT Private Bus'},
  {t:'14:30',o:'Town Bus'}, {t:'14:50',o:'Town Bus'},
  {t:'16:15',o:'Town Bus'}, {t:'17:10',o:'TAT Private Bus'},
  {t:'18:10',o:'Town Bus'}, {t:'19:00',o:'TAT Private Bus'},
  {t:'19:40',o:'Town Bus'},
];

const THEVARAM = [
  {t:'05:50',o:'Town Bus'}, {t:'06:40',o:'Town Bus'}, {t:'07:40',o:'Town Bus'},
  {t:'08:35',o:'Town Bus'}, {t:'08:50',o:'Mofussil'},
  {t:'09:20',o:'Town Bus'}, {t:'09:40',o:'Town Bus'},
  {t:'09:45',o:'Rathinam Private Bus'},
  {t:'12:00',o:'Town Bus'}, {t:'13:10',o:'Town Bus'},
  {t:'14:00',o:'Town Bus'}, {t:'14:05',o:'Town Bus'},
  {t:'15:40',o:'Town Bus'}, {t:'17:20',o:'Town Bus'},
  {t:'17:40',o:'Town Bus'}, {t:'18:00',o:'Rathinam Private Bus'},
  {t:'18:30',o:'Sokkan Private Bus'}, {t:'19:20',o:'Town Bus'},
  {t:'19:50',o:'Town Bus'}, {t:'20:30',o:'Town Bus'},
  {t:'20:50',o:'Town Bus'}, {t:'22:00',o:'Town Bus'},
  {t:'22:35',o:'Sokkan Private Bus'},
];

const BODI = [
  {t:'06:30',o:'Town Bus'}, {t:'07:30',o:'Town Bus'},
  {t:'07:50',o:'S.P.T Private Bus'}, {t:'08:10',o:'Town Bus'},
  {t:'08:30',o:'Town Bus'}, {t:'09:35',o:'Town Bus'},
  {t:'10:10',o:'Mofussil'}, {t:'10:50',o:'Town Bus'},
  {t:'11:10',o:'Mofussil'}, {t:'11:35',o:'Town Bus'},
  {t:'12:10',o:'Town Bus'}, {t:'13:00',o:'Town Bus'},
  {t:'13:30',o:'Town Bus'}, {t:'14:30',o:'Mofussil'},
  {t:'16:30',o:'Town Bus'}, {t:'17:10',o:'Town Bus'},
  {t:'18:15',o:'Mofussil'}, {t:'18:45',o:'Mofussil'},
  {t:'19:10',o:'Town Bus'}, {t:'20:00',o:'Mofussil'},
  {t:'20:45',o:'Mofussil'}, {t:'21:20',o:'Mofussil'},
  {t:'21:35',o:'Town Bus'}, {t:'22:45',o:'Mofussil'},
];

const THENI = [
  {t:'12:50',o:'S.P.T Private Bus'},
  {t:'19:50',o:'Sokkan Private Bus'},
];

const PERIYAKULAM = [
  {t:'07:00',o:'TAT Srinivasa Private Bus'},
  {t:'08:40',o:'P.P.S Private Bus'},
  {t:'09:30',o:'Subaa Private Bus'},
  {t:'10:30',o:'Shareef Private Bus'},
  {t:'10:35',o:'P.P.P Private Bus'},
  {t:'11:25',o:'Kaja Private Bus'},
  {t:'11:50',o:'Sri Nivasa Private Bus'},
  {t:'12:30',o:'S.P.T Private Bus'},
  {t:'14:50',o:'Shareef Private Bus'},
  {t:'15:00',o:'Venkateswara Private Bus'},
  {t:'15:35',o:'Subaa Private Bus'},
  {t:'16:00',o:'P.P.S Private Bus'},
  {t:'16:40',o:'Kaja Private Bus'},
  {t:'17:45',o:'P.P.P Private Bus'},
  {t:'19:00',o:'Shareef Private Bus'},
  {t:'19:45',o:'S.P.T Private Bus'},
  {t:'21:10',o:'Shareef Private Bus'},
];

const COIMBATORE = [
  {t:'09:10',o:'Mofussil'}, {t:'11:00',o:'Mofussil'}, {t:'20:20',o:'Mofussil'},
];

const KUMILY = [
  {t:'03:30',o:'Mofussil'}, {t:'04:40',o:'S.P.T Private Bus'},
  {t:'08:00',o:'Kaja Roadways Private Bus'}, {t:'09:30',o:'S.P.T Private Bus'},
  {t:'11:45',o:'Mofussil'}, {t:'14:00',o:'Kaja Roadways Private Bus'},
  {t:'14:40',o:'Mofussil'}, {t:'15:35',o:'S.P.T Private Bus'},
];

const MADURAI = [
  {t:'04:00',o:'Mofussil'}, {t:'07:35',o:'Sokkan Private Bus'},
  {t:'10:35',o:'Rathinam Private Bus'}, {t:'16:30',o:'Mofussil'},
  {t:'19:10',o:'Rathinam Private Bus'},
];

const UTHAMAPALAYAM = [
  {t:'05:10',o:'Mofussil'}, {t:'06:30',o:'P.P.S Private Bus'},
  {t:'06:50',o:'Town Bus'}, {t:'07:50',o:'Town Bus'},
  {t:'09:10',o:'Mofussil'}, {t:'10:20',o:'Town Bus'},
  {t:'11:20',o:'Town Bus'}, {t:'12:00',o:'Town Bus'},
  {t:'12:20',o:'Town Bus'}, {t:'12:40',o:'Town Bus'},
  {t:'13:50',o:'Town Bus'}, {t:'14:50',o:'Town Bus'},
  {t:'15:25',o:'Town Bus'}, {t:'15:40',o:'Town Bus'},
  {t:'16:10',o:'Town Bus'}, {t:'17:10',o:'Town Bus'},
  {t:'18:30',o:'Town Bus'}, {t:'20:10',o:'Town Bus'},
  {t:'20:45',o:'Town Bus'}, {t:'21:10',o:'Town Bus'},
  {t:'21:25',o:'P.P.S Private Bus'},
];

const KAMBAM = [
  {t:'05:30',o:'Mofussil'}, {t:'06:00',o:'Town Bus'},
  {t:'06:35',o:'Jayamurugan Private Bus'}, {t:'07:30',o:'Mofussil'},
  {t:'08:10',o:'Town Bus'}, {t:'08:30',o:'Town Bus'},
  {t:'08:40',o:'Mofussil'}, {t:'09:00',o:'Mofussil'},
  {t:'09:20',o:'Town Bus'}, {t:'09:40',o:'Jayamurugan Private Bus'},
  {t:'09:50',o:'Town Bus'}, {t:'10:10',o:'Town Bus'},
  {t:'10:40',o:'Town Bus'}, {t:'11:00',o:'Mofussil'},
  {t:'11:30',o:'Town Bus'}, {t:'12:30',o:'Jayamurugan Private Bus'},
  {t:'13:00',o:'Town Bus'}, {t:'13:10',o:'Mofussil'},
  {t:'13:20',o:'Mofussil'}, {t:'14:20',o:'Mofussil'},
  {t:'15:10',o:'Jayamurugan Private Bus'}, {t:'16:00',o:'Mofussil'},
  {t:'18:00',o:'Mofussil'}, {t:'18:10',o:'Jayamurugan Private Bus'},
  {t:'18:20',o:'Mofussil'}, {t:'18:45',o:'Mofussil'},
  {t:'19:20',o:'Mofussil'}, {t:'19:40',o:'Shareef Private Bus'},
  {t:'20:30',o:'Mofussil'}, {t:'21:00',o:'Jayamurugan Private Bus'},
  {t:'21:15',o:'Town Bus'}, {t:'21:40',o:'Town Bus'},
  {t:'22:00',o:'Town Bus'},
];

const KOODALUR = [
  {t:'06:15',o:'P.P.P Private Bus'}, {t:'07:10',o:'Subaa Private Bus'},
  {t:'08:20',o:'Venkateswara Private Bus'}, {t:'09:35',o:'S.P.T Private Bus'},
  {t:'12:05',o:'Shareef Private Bus'}, {t:'12:50',o:'P.P.S Private Bus'},
  {t:'13:35',o:'Subaa Private Bus'}, {t:'15:15',o:'P.P.P Private Bus'},
  {t:'16:35',o:'Shareef Private Bus'}, {t:'16:45',o:'S.P.T Private Bus'},
];

const METTUPALAYAM = [ {t:'06:20',o:'Mofussil'} ];
const SURULI       = [ {t:'07:20',o:'Shareef Private Bus'} ];

const CHENNAI = [
  {t:'18:30',o:'Subam Overnight Express'},
  {t:'18:32',o:'Geetham Overnight Express'},
  {t:'19:00',o:'Subam Overnight Express'},
  {t:'19:15',o:'Subam Overnight Express'},
  {t:'19:20',o:'Mannan Overnight Express'},
  {t:'19:45',o:'Sri Krishna Overnight Express'},
  {t:'20:00',o:'Subam Overnight Express'},
];

// ── Helpers ────────────────────────────────────────────────────────────

async function findOrCreateCorridor(nameTamil, nameEnglish, colorHex) {
  const r = await post('/admin/bus/corridors', { name_tamil: nameTamil, name_english: nameEnglish, color_hex: colorHex });
  if (!r.body.success) throw new Error(`Corridor create failed (${nameEnglish}): ${r.body.error}`);
  return r.body.data.id;
}

async function wipeRoutesForDirections(corridorId, directions) {
  for (const direction of directions) {
    const r = await post('/admin/bus/routes', {
      corridor_id: corridorId, direction,
      origin_tamil: 'x', dest_tamil: 'x',
    });
    if (r.body.success && r.body.data?.id) {
      await del(`/admin/bus/routes/${r.body.data.id}`);
    }
  }
}

async function insertRoute(corridorId, direction, destTamil, stopsTamil, timings) {
  // Delete any lingering route with this direction
  await wipeRoutesForDirections(corridorId, [direction]);
  // Create fresh route
  const r = await post('/admin/bus/routes', {
    corridor_id: corridorId, direction,
    origin_tamil: 'பண்ணைப்புரம்', dest_tamil: destTamil, stops_tamil: stopsTamil,
  });
  if (!r.body.success) throw new Error(`Route create failed (${destTamil}): ${r.body.error}`);
  const routeId = r.body.data.id;

  const sorted = [...timings].sort((a,b) => a.t.localeCompare(b.t));
  const lastTime = sorted.length > 0 ? sorted[sorted.length - 1].t : null;

  let ok = 0;
  for (const timing of timings) {
    const tr = await post('/admin/bus/timings', {
      route_id: routeId, departs_at: timing.t + ':00',
      bus_type: typeOf(timing.o), operator_name: timing.o,
      is_last_bus: timing.t === lastTime,
    });
    if (tr.body.success) ok++;
    else console.error(`  ✗ ${destTamil} ${timing.t}: ${tr.body.error}`);
  }
  console.log(`  ✓ ${destTamil} [${direction}]: ${ok}/${timings.length}`);
  return ok;
}

async function main() {
  console.log('🔐 Authenticating...');
  const a = await post('/admin/auth/login', { email: ADMIN_EMAIL, password: ADMIN_PASSWORD });
  if (a.status !== 200 || !a.body.success) throw new Error('Auth failed');
  authToken = a.body.data?.token || a.body.token;
  console.log('✅ Authenticated\n');

  console.log('🗺️  Ensuring corridors exist...');
  const periyakulamId   = await findOrCreateCorridor('பெரியக்குளம்', 'Periyakulam', '#558B2F');
  const uthamapalayamId = await findOrCreateCorridor('உத்தமபாளையம்', 'Uthamapalayam', '#AD1457');
  const chennaiId       = await findOrCreateCorridor('சென்னை', 'Chennai', '#E64A19');
  console.log(`  ✓ Periyakulam: ${periyakulamId}, Uthamapalayam: ${uthamapalayamId}, Chennai: ${chennaiId}\n`);

  console.log('🧹 Clearing stale routes on all corridors...');
  // Clear common direction variants on every corridor we touch
  const allCorridorIds = [1,2,3,4,5,6,9,11,12,13,14, periyakulamId, uthamapalayamId, chennaiId];
  const directionsToWipe = ['outbound', 'outbound-periyakulam', 'outbound-thirupur', 'outbound-thanjavur', 'outbound-uthamapalayam', 'outbound-chennai', 'outbound-via'];
  for (const cid of allCorridorIds) {
    await wipeRoutesForDirections(cid, directionsToWipe);
  }
  console.log('  ✓ wiped\n');

  console.log('🚌 Inserting fresh bus data...\n');

  let total = 0;
  total += await insertRoute(4, 'outbound', 'சின்னமனூர்', 'பண்ணைப்புரம் → பல்லவராயன்பட்டி → சின்னமனூர்', CHINNAMANUR);
  total += await insertRoute(14, 'outbound', 'தேவாரம்', 'பண்ணைப்புரம் → சங்கராபுரம் → தேவாரம்', THEVARAM);
  total += await insertRoute(2, 'outbound', 'போடி', 'பண்ணைப்புரம் → சங்கராபுரம் → தேவாரம் → போடி', BODI);
  total += await insertRoute(1, 'outbound', 'தேனி', 'பண்ணைப்புரம் → போடி → தேனி', THENI);
  total += await insertRoute(periyakulamId, 'outbound', 'பெரியக்குளம்', 'பண்ணைப்புரம் → போடி → தேனி → பெரியக்குளம்', PERIYAKULAM);
  total += await insertRoute(6, 'outbound', 'கோயம்புத்தூர்', 'பண்ணைப்புரம் → போடி → தேனி → கோயம்புத்தூர்', COIMBATORE);
  total += await insertRoute(9, 'outbound', 'குமுளி', 'பண்ணைப்புரம் → கம்பம் → குமுளி', KUMILY);
  total += await insertRoute(5, 'outbound', 'மதுரை', 'பண்ணைப்புரம் → தேனி → மதுரை', MADURAI);
  total += await insertRoute(uthamapalayamId, 'outbound', 'உத்தமபாளையம்', 'பண்ணைப்புரம் → கம்பம் → உத்தமபாளையம்', UTHAMAPALAYAM);
  total += await insertRoute(3, 'outbound', 'கம்பம்', 'பண்ணைப்புரம் → தேவாரம் → உத்தமபாளையம் → கம்பம்', KAMBAM);
  total += await insertRoute(11, 'outbound', 'கூடலூர்', 'பண்ணைப்புரம் → கம்பம் → கூடலூர்', KOODALUR);
  total += await insertRoute(12, 'outbound', 'மேட்டுப்பாளையம்', 'பண்ணைப்புரம் → மேட்டுப்பாளையம்', METTUPALAYAM);
  total += await insertRoute(13, 'outbound', 'சுருளி தீர்த்தம்', 'பண்ணைப்புரம் → தேவாரம் → சுருளி தீர்த்தம்', SURULI);
  total += await insertRoute(chennaiId, 'outbound', 'சென்னை', 'பண்ணைப்புரம் → திருச்சி → சென்னை', CHENNAI);

  console.log(`\n🎉 Inserted ${total} timings across 14 routes.`);
  console.log('⏭️  Skipped: Thanjavur (1 bus), Thirupur (1 bus) — no suitable corridor.\n');
}

main().catch(err => { console.error(`\n❌ ${err.message}\n`); process.exit(1); });
