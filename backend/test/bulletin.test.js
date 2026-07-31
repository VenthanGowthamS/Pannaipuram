#!/usr/bin/env node
/**
 * பண்ணைப்புரம் — Community Bulletin (சங்கமம்) Test Suite
 *
 * Covers the full villager journey and every guard around it:
 *   PUBLIC   registration · validation · post submit · daily limit
 *            image accept/reject · like toggle · live feed
 *   MODERATION  pending by default · admin approve → appears in feed
 *               trusted poster → instant publish · blocked poster → 403
 *   SECURITY    every /admin/bulletin route rejects an unauthenticated call
 *
 * ⚠️  This suite WRITES to the database. It creates throwaway villagers and
 *     posts, then deletes them in cleanup. Test phone numbers are checked
 *     against the live poster list first, so a real villager's record can
 *     never be picked up and renamed.
 *
 * Usage:
 *   node test/bulletin.test.js                                  # localhost:3000
 *   API_BASE=https://api.pannaipuram.com node test/bulletin.test.js
 *   ADMIN_PASSWORD=yourpass node test/bulletin.test.js
 */

const http  = require('http');
const https = require('https');

const API_BASE       = process.env.API_BASE       || 'http://localhost:3000';
const ADMIN_EMAIL    = process.env.ADMIN_EMAIL    || 'venthan89@gmail.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

const isHttps = API_BASE.startsWith('https');
const fetcher = isHttps ? https : http;

let passed = 0, failed = 0;
const errors = [];
let authToken = null;

// Everything created during the run, torn down in cleanup()
const created = { posterIds: [], postIds: [] };

// ── HTTP helpers ───────────────────────────────────────────────────
function request(method, path, body, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(`${API_BASE}${path}`);
    const payload = body == null ? null : JSON.stringify(body);
    const opts = {
      hostname: url.hostname,
      port: url.port || (isHttps ? 443 : 80),
      path: url.pathname + url.search,
      method,
      timeout: 30000,
      headers: {
        ...(payload ? {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload),
        } : {}),
        ...headers,
      },
    };
    const req = fetcher.request(opts, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
        catch { reject(new Error(`Invalid JSON from ${method} ${path}: ${data.slice(0, 200)}`)); }
      });
    });
    req.on('error', reject);
    req.on('timeout', () => reject(new Error(`Timeout on ${method} ${path}`)));
    if (payload) req.write(payload);
    req.end();
  });
}

const get   = (p, h)    => request('GET', p, null, h);
const post  = (p, b, h) => request('POST', p, b, h);
const patch = (p, b, h) => request('PATCH', p, b, h);
const del   = (p, h)    => request('DELETE', p, null, h);
// Villager self-delete proves ownership with a body (poster_id + phone).
const delBody = (p, b, h) => request('DELETE', p, b, h);

const auth = () => ({ Authorization: `Bearer ${authToken}` });

function assert(cond, msg) { if (!cond) throw new Error(msg); }

async function test(name, fn) {
  try { await fn(); passed++; console.log(`  ✅ ${name}`); }
  catch (e) { failed++; console.log(`  ❌ ${name} — ${e.message}`); errors.push(`${name} — ${e.message}`); }
}

// ── Fixtures ───────────────────────────────────────────────────────
// A 1x1 JPEG as a data-URL — smallest thing that passes the image guard.
const TINY_JPEG =
  'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsL' +
  'DBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/wAALCAABAAEBAREA/8QAFAAB' +
  'AAAAAAAAAAAAAAAAAAAACf/EABQQAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQEAAD8AKp//2Q==';

let knownPhones = new Set();

// Never reuse a real villager's number — the register endpoint upserts on
// phone, so colliding would rename an actual person's record.
function freshPhone() {
  for (let i = 0; i < 50; i++) {
    const p = '9' + String(Math.floor(Math.random() * 1e9)).padStart(9, '0');
    if (!knownPhones.has(p)) { knownPhones.add(p); return p; }
  }
  throw new Error('Could not allocate an unused test phone number');
}

async function registerVillager(nameTamil) {
  const phone = freshPhone();
  const { body } = await post('/api/bulletin/register', {
    phone, name_tamil: nameTamil, name_english: 'Test Villager',
  });
  if (!body.success) throw new Error(`register failed: ${body.error}`);
  created.posterIds.push(body.data.poster_id);
  return { phone, posterId: body.data.poster_id };
}

async function submit(posterId, overrides = {}) {
  const { status, body } = await post('/api/bulletin/submit', {
    poster_id: posterId,
    title_tamil: 'ஊர் கூட்டம் நாளைக்கு',
    content_tamil: 'நாளைக்கு காலை 10 மணிக்கு பஞ்சாயத்து அலுவலகத்துல ஊர் கூட்டம்.',
    ...overrides,
  });
  if (body.success && body.data && body.data.id) created.postIds.push(body.data.id);
  return { status, body };
}

// ── Suites ─────────────────────────────────────────────────────────
async function setup() {
  console.log('\n🔐 Setup');
  await test('POST /admin/auth/login authenticates', async () => {
    const { status, body } = await post('/admin/auth/login', {
      email: ADMIN_EMAIL, password: ADMIN_PASSWORD,
    });
    assert(status === 200, `Expected 200, got ${status}`);
    authToken = body.data ? body.data.token : body.token;
    assert(!!authToken, 'No token returned');
  });

  await test('GET /admin/bulletin/posters/list loads existing villagers', async () => {
    const { status, body } = await get('/admin/bulletin/posters/list', auth());
    assert(status === 200, `Expected 200, got ${status}`);
    assert(Array.isArray(body.data), 'Expected an array');
    knownPhones = new Set(body.data.map(p => p.phone));
  });
}

async function testAdminAuthGuards() {
  console.log('\n🛡  Admin routes reject unauthenticated callers');

  await test('GET /admin/bulletin without a token → 401', async () => {
    const { status } = await get('/admin/bulletin');
    assert(status === 401, `Expected 401, got ${status}`);
  });

  await test('GET /admin/bulletin/posters/list without a token → 401', async () => {
    const { status } = await get('/admin/bulletin/posters/list');
    assert(status === 401, `Expected 401, got ${status}`);
  });

  await test('PATCH /admin/bulletin/1/status without a token → 401', async () => {
    const { status } = await patch('/admin/bulletin/1/status', { status: 'approved' });
    assert(status === 401, `Expected 401, got ${status}`);
  });

  await test('DELETE /admin/bulletin/1 without a token → 401', async () => {
    const { status } = await del('/admin/bulletin/1');
    assert(status === 401, `Expected 401, got ${status}`);
  });

  await test('An invalid token is rejected → 403', async () => {
    const { status } = await get('/admin/bulletin', { Authorization: 'Bearer not-a-real-token' });
    assert(status === 403, `Expected 403, got ${status}`);
  });
}

async function testRegistration() {
  console.log('\n✍️  Registration');

  await test('Valid phone + Tamil name registers', async () => {
    const { status, body } = await post('/api/bulletin/register', {
      phone: freshPhone(), name_tamil: 'முருகன்', name_english: 'Murugan',
    });
    assert(status === 200, `Expected 200, got ${status}`);
    assert(body.success === true, 'Expected success');
    assert(Number.isInteger(body.data.poster_id), 'Expected a numeric poster_id');
    assert(body.data.is_trusted === false, 'A new villager must not start trusted');
    created.posterIds.push(body.data.poster_id);
  });

  await test('9-digit phone is rejected', async () => {
    const { status, body } = await post('/api/bulletin/register', { phone: '987654321', name_tamil: 'சோதனை' });
    assert(status === 400, `Expected 400, got ${status}`);
    assert(body.success === false, 'Expected failure');
  });

  await test('Phone starting with 5 is rejected', async () => {
    const { status } = await post('/api/bulletin/register', { phone: '5987654321', name_tamil: 'சோதனை' });
    assert(status === 400, `Expected 400, got ${status}`);
  });

  await test('Phone with letters is rejected', async () => {
    const { status } = await post('/api/bulletin/register', { phone: '98abc43210', name_tamil: 'சோதனை' });
    assert(status === 400, `Expected 400, got ${status}`);
  });

  await test('Missing name is rejected', async () => {
    const { status } = await post('/api/bulletin/register', { phone: freshPhone() });
    assert(status === 400, `Expected 400, got ${status}`);
  });

  await test('Re-registering the same phone returns the same poster_id', async () => {
    const phone = freshPhone();
    const first  = await post('/api/bulletin/register', { phone, name_tamil: 'கண்ணன்' });
    const second = await post('/api/bulletin/register', { phone, name_tamil: 'கண்ணன் புதுசு' });
    assert(first.body.data.poster_id === second.body.data.poster_id, 'poster_id must be stable per phone');
    assert(second.body.data.name_tamil === 'கண்ணன் புதுசு', 'Name should update on re-register');
    created.posterIds.push(first.body.data.poster_id);
  });
}

async function testSubmitValidation() {
  console.log('\n🧪 Post validation');
  const { posterId } = await registerVillager('சோதனை ஒன்று');

  await test('Unknown poster_id → 404', async () => {
    const { status } = await submit(999999999);
    assert(status === 404, `Expected 404, got ${status}`);
  });

  await test('Non-numeric poster_id → 400', async () => {
    const { status } = await post('/api/bulletin/submit', {
      poster_id: 'abc', title_tamil: 'தலைப்பு ஒன்று', content_tamil: 'விபரம் இங்கே இருக்கு',
    });
    assert(status === 400, `Expected 400, got ${status}`);
  });

  await test('Title under 5 characters → 400', async () => {
    const { status } = await submit(posterId, { title_tamil: 'ஊர்' });
    assert(status === 400, `Expected 400, got ${status}`);
  });

  await test('Content under 10 characters → 400', async () => {
    const { status } = await submit(posterId, { content_tamil: 'சின்னது' });
    assert(status === 400, `Expected 400, got ${status}`);
  });

  await test('Non-image data-URL → 400', async () => {
    const { status } = await submit(posterId, { image_url: 'data:text/html;base64,PHNjcmlwdD4=' });
    assert(status === 400, `Expected 400, got ${status}`);
  });

  await test('Oversized image (>150KB) → 400', async () => {
    const huge = 'data:image/jpeg;base64,' + 'A'.repeat(160 * 1024);
    const { status } = await submit(posterId, { image_url: huge });
    assert(status === 400, `Expected 400, got ${status}`);
  });

  // ── image makes title/content optional ──
  // A villager sharing a photo of a burst pipe shouldn't have to also type
  // a paragraph — the photo IS the content.
  await test('No image AND no title/content → 400', async () => {
    const { status } = await submit(posterId, { title_tamil: '', content_tamil: '' });
    assert(status === 400, `Expected 400, got ${status}`);
  });

  await test('An image with NO title and NO content → 200 (image is enough)', async () => {
    const { status, body } = await submit(posterId, {
      title_tamil: '', content_tamil: '', image_url: TINY_JPEG,
    });
    assert(status === 200, `Expected 200, got ${status} (${body.error})`);
    assert(body.data && Number.isInteger(body.data.id), 'Expected a created post id');
  });

  await test('An image with a title but NO content → 200', async () => {
    // Fresh poster: the previous test already used posterId's one-per-day
    // allowance, and this checks the validation rule, not the daily limit.
    const { posterId: freshId } = await registerVillager('சோதனை மூணு');
    const { status, body } = await submit(freshId, {
      title_tamil: 'குட்டி தலைப்பு', content_tamil: '', image_url: TINY_JPEG,
    });
    assert(status === 200, `Expected 200, got ${status} (${body.error})`);
  });
}

async function testModerationFlow() {
  console.log('\n📋 Moderation — pending → approved → visible');
  const { posterId } = await registerVillager('சோதனை இரண்டு');
  let postId = null;

  await test("A new villager's post lands in 'pending'", async () => {
    const { status, body } = await submit(posterId, { image_url: TINY_JPEG });
    assert(status === 200, `Expected 200, got ${status}`);
    assert(body.data.status === 'pending', `Expected pending, got ${body.data.status}`);
    postId = body.data.id;
  });

  await test('A pending post is NOT in the public feed', async () => {
    const { body } = await get('/api/bulletin');
    assert(!body.data.some(p => p.id === postId), 'Pending post must stay hidden');
  });

  await test('Daily limit — a second post the same day → 429', async () => {
    const { status } = await submit(posterId);
    assert(status === 429, `Expected 429, got ${status}`);
  });

  await test('Admin sees the pending post in the queue', async () => {
    const { status, body } = await get('/admin/bulletin?status=pending', auth());
    assert(status === 200, `Expected 200, got ${status}`);
    assert(body.data.some(p => p.id === postId), 'Pending post missing from admin queue');
  });

  await test('Admin approves it', async () => {
    const { status, body } = await patch(`/admin/bulletin/${postId}/status`, { status: 'approved' }, auth());
    assert(status === 200, `Expected 200, got ${status}`);
    assert(body.data.status === 'approved', 'Status should be approved');
  });

  await test('An approved post IS in the public feed', async () => {
    const { body } = await get('/api/bulletin');
    assert(body.data.some(p => p.id === postId), 'Approved post should be visible');
  });

  await test('The uploaded image survives the round trip', async () => {
    const { body } = await get('/api/bulletin');
    const mine = body.data.find(p => p.id === postId);
    assert(mine, 'Post not found in feed');
    assert(typeof mine.image_url === 'string' && mine.image_url.startsWith('data:image/'),
      'image_url should come back as an image data-URL');
  });

  await test('The feed never exposes the poster phone number', async () => {
    const { body } = await get('/api/bulletin');
    const mine = body.data.find(p => p.id === postId);
    assert(mine.phone === undefined, 'Public feed must not leak phone numbers');
  });

  await test('An invalid status value → 400', async () => {
    const { status } = await patch(`/admin/bulletin/${postId}/status`, { status: 'banana' }, auth());
    assert(status === 400, `Expected 400, got ${status}`);
  });

  return postId;
}

async function testLikes(postId) {
  console.log('\n❤️  Likes');
  const device = 'test-device-' + Date.now();

  await test('Liking a post increments the count', async () => {
    const { status, body } = await post(`/api/bulletin/${postId}/like`, { device_id: device });
    assert(status === 200, `Expected 200, got ${status}`);
    assert(body.data.liked === true, 'Expected liked: true');
    assert(body.data.like_count >= 1, `Expected count >= 1, got ${body.data.like_count}`);
  });

  await test('The same device liking again un-likes (toggle)', async () => {
    const { body } = await post(`/api/bulletin/${postId}/like`, { device_id: device });
    assert(body.data.liked === false, 'Expected liked: false on second tap');
  });

  await test('liked_by_me is false in the feed after un-liking', async () => {
    const { body } = await get(`/api/bulletin?device_id=${encodeURIComponent(device)}`);
    const mine = body.data.find(p => p.id === postId);
    assert(mine.liked_by_me === false, 'Expected liked_by_me false');
  });

  await test('liked_by_me is true in the feed after liking', async () => {
    await post(`/api/bulletin/${postId}/like`, { device_id: device });
    const { body } = await get(`/api/bulletin?device_id=${encodeURIComponent(device)}`);
    const mine = body.data.find(p => p.id === postId);
    assert(mine.liked_by_me === true, 'Expected liked_by_me true');
    assert(mine.like_count >= 1, 'Expected a like count');
  });

  await test('Two devices produce two likes', async () => {
    const { body } = await post(`/api/bulletin/${postId}/like`, { device_id: device + '-b' });
    assert(body.data.like_count >= 2, `Expected >= 2, got ${body.data.like_count}`);
  });

  await test('Liking without a device_id → 400', async () => {
    const { status } = await post(`/api/bulletin/${postId}/like`, {});
    assert(status === 400, `Expected 400, got ${status}`);
  });

  await test('Liking a non-existent post → 404', async () => {
    const { status } = await post('/api/bulletin/999999999/like', { device_id: device });
    assert(status === 404, `Expected 404, got ${status}`);
  });
}

async function testTrustedAndBlocked() {
  console.log('\n⭐ Trusted & blocked villagers');

  const trusted = await registerVillager('நம்பகமான ஆள்');
  await test('Admin marks a villager trusted', async () => {
    const { status, body } = await patch(`/admin/bulletin/posters/${trusted.posterId}`,
      { is_trusted: true }, auth());
    assert(status === 200, `Expected 200, got ${status}`);
    assert(body.data.is_trusted === true, 'Expected is_trusted true');
  });

  await test("A trusted villager's post goes live instantly", async () => {
    const { status, body } = await submit(trusted.posterId);
    assert(status === 200, `Expected 200, got ${status}`);
    assert(body.data.status === 'approved', `Expected approved, got ${body.data.status}`);
  });

  const blocked = await registerVillager('தடை செய்யப்பட்டவர்');
  await test('Admin blocks a villager', async () => {
    const { status, body } = await patch(`/admin/bulletin/posters/${blocked.posterId}`,
      { is_blocked: true }, auth());
    assert(status === 200, `Expected 200, got ${status}`);
    assert(body.data.is_blocked === true, 'Expected is_blocked true');
  });

  await test('A blocked villager cannot post → 403', async () => {
    const { status } = await submit(blocked.posterId);
    assert(status === 403, `Expected 403, got ${status}`);
  });

  await test('A blocked villager cannot re-register their way out → 403', async () => {
    const { status } = await post('/api/bulletin/register', {
      phone: blocked.phone, name_tamil: 'வேற பேரு',
    });
    assert(status === 403, `Expected 403, got ${status}`);
  });

  await test('Sending neither flag → 400', async () => {
    const { status } = await patch(`/admin/bulletin/posters/${trusted.posterId}`, {}, auth());
    assert(status === 400, `Expected 400, got ${status}`);
  });
}

async function testOfficialAccount() {
  console.log('\n📢 Official village account');
  let officialPostId = null;
  let officialPosterId = null;

  await test('Admin can publish as the official account, live immediately', async () => {
    const { status, body } = await post('/admin/bulletin/post', {
      title_tamil: 'ஊர் கூட்ட அறிவிப்பு',
      title_english: 'Village meeting notice',
      content_tamil: 'வரும் ஞாயிறு காலை 10 மணிக்கு ஊர் கூட்டம் நடக்கும். எல்லாரும் வரணும்.',
    }, auth());
    assert(status === 200, `Expected 200, got ${status}`);
    assert(body.data.status === 'approved', `Expected approved, got ${body.data.status}`);
    officialPostId = body.data.id;
    created.postIds.push(officialPostId);
  });

  await test('It appears in the public feed flagged is_official', async () => {
    const { body } = await get('/api/bulletin');
    const mine = body.data.find(p => p.id === officialPostId);
    assert(mine, 'Official post missing from feed');
    assert(mine.is_official === true, 'Expected is_official true');
    assert(mine.name_tamil === 'admin', `Unexpected name: ${mine.name_tamil}`);
  });

  await test('Publishing officially without a token → 401', async () => {
    const { status } = await post('/admin/bulletin/post', {
      title_tamil: 'போலி அறிவிப்பு', content_tamil: 'இது ஒரு போலி செய்தி ஆகும்.',
    });
    assert(status === 401, `Expected 401, got ${status}`);
  });

  await test('Official post still validates title/content length', async () => {
    const { status } = await post('/admin/bulletin/post', { title_tamil: 'ஊர்', content_tamil: 'சின்னது' }, auth());
    assert(status === 400, `Expected 400, got ${status}`);
  });

  await test('Official post with an image and NO title/content → 200', async () => {
    const { status, body } = await post('/admin/bulletin/post', {
      title_tamil: '', content_tamil: '', image_url: TINY_JPEG,
    }, auth());
    assert(status === 200, `Expected 200, got ${status} (${body.error})`);
    created.postIds.push(body.data.id);
  });

  // ── Impersonation guards ──
  await test('The official phone cannot be registered from the public form', async () => {
    const { status } = await post('/api/bulletin/register', {
      phone: '1234567890', name_tamil: 'போலி நிர்வாகம்',
    });
    assert(status === 400 || status === 403, `Expected 400/403, got ${status}`);
  });

  await test('Nobody can post as the official account via the public route', async () => {
    const { body: posters } = await get('/admin/bulletin/posters/list', auth());
    const official = posters.data.find(p => p.is_official === true);
    assert(official, 'Official poster row not found');
    officialPosterId = official.id;

    // poster_id is a small sequential int — this is the guessing attack
    const { status } = await post('/api/bulletin/submit', {
      poster_id: officialPosterId,
      title_tamil: 'போலி அதிகாரப்பூர்வ செய்தி',
      content_tamil: 'இது நிர்வாகம் போல் நடிக்கும் ஒரு போலி செய்தி.',
    });
    assert(status === 403, `Expected 403, got ${status} — anyone could impersonate the admin`);
  });

  await test('The official account is never left blocked or untrusted', async () => {
    const { body } = await get('/admin/bulletin/posters/list', auth());
    const official = body.data.find(p => p.is_official === true);
    assert(official.is_trusted === true, 'Official account must be trusted');
    assert(official.is_blocked === false, 'Official account must not be blocked');
  });
}

async function testPublicFeedShape() {
  console.log('\n📰 Public feed');

  await test('GET /api/bulletin returns an array', async () => {
    const { status, body } = await get('/api/bulletin');
    assert(status === 200, `Expected 200, got ${status}`);
    assert(body.success === true, 'Expected success');
    assert(Array.isArray(body.data), 'Expected an array');
  });

  await test('Every feed row carries the fields the PWA renders', async () => {
    const { body } = await get('/api/bulletin');
    if (!body.data.length) return;                       // empty feed is valid
    for (const p of body.data) {
      assert('id' in p && 'title_tamil' in p && 'content_tamil' in p, 'Missing core fields');
      assert('name_tamil' in p, 'Missing poster name');
      assert(typeof p.like_count === 'number', 'like_count must be a number');
      assert(typeof p.liked_by_me === 'boolean', 'liked_by_me must be a boolean');
    }
  });

  await test('The feed only ever contains approved posts', async () => {
    const { body: pub } = await get('/api/bulletin');
    const { body: all } = await get('/admin/bulletin', auth());
    const approved = new Set(all.data.filter(p => p.status === 'approved').map(p => p.id));
    for (const p of pub.data) {
      assert(approved.has(p.id), `Post ${p.id} is public but not approved`);
    }
  });
}

// ── Cleanup ────────────────────────────────────────────────────────
// ── Villager self-service edit / delete ────────────────────────────
// The rule under test: an UNTRUSTED villager's edit sends the post back to
// 'pending'. Without that, someone gets a harmless post approved and then
// rewrites it into spam that is already live in the village feed.
async function testVillagerEditDelete() {
  console.log('\n✏️  Villager edit & delete');

  const EDIT = {
    title_tamil: 'திருத்தப்பட்ட தலைப்பு',
    content_tamil: 'இது திருத்தப்பட்ட விபரம் — போதுமான நீளம் இருக்கு.',
  };

  // ── owner can edit, and an untrusted edit re-queues ──
  const v = await registerVillager('திருத்தும் நபர்');
  const { body: sub } = await submit(v.posterId);
  const postId = sub.data && sub.data.id;

  await test('PATCH /api/bulletin/:id — owner edits their own post', async () => {
    const { status, body } = await patch(`/api/bulletin/${postId}`, {
      poster_id: v.posterId, phone: v.phone, ...EDIT,
    });
    assert(status === 200, `Expected 200, got ${status} (${body.error})`);
    assert(body.success === true, 'Expected success');
  });

  await test('an untrusted villager\'s edit sends the post back to pending', async () => {
    const { body } = await patch(`/api/bulletin/${postId}`, {
      poster_id: v.posterId, phone: v.phone, ...EDIT,
    });
    assert(body.data.status === 'pending', `Expected pending, got ${body.data.status}`);
    assert(body.data.requeued === true, 'Expected requeued=true so the PWA can explain the wait');
  });

  // ── the re-queued post must still be visible to ITS OWN author ──
  await test('GET /api/bulletin?poster_id= shows the author their own pending post', async () => {
    const { body } = await get(`/api/bulletin?poster_id=${v.posterId}`);
    const mine = body.data.find(p => p.id === postId);
    assert(mine, 'Author could not see their own pending post — it would look deleted');
    assert(mine.status === 'pending', `Expected pending, got ${mine.status}`);
  });

  await test('GET /api/bulletin (no poster_id) hides pending posts from everyone else', async () => {
    const { body } = await get('/api/bulletin');
    assert(!body.data.some(p => p.id === postId), 'A pending post leaked into the public feed');
  });

  await test('GET /api/bulletin?poster_id= does NOT expose another villager\'s pending post', async () => {
    const other = await registerVillager('வேறு நபர்');
    const { body } = await get(`/api/bulletin?poster_id=${other.posterId}`);
    assert(!body.data.some(p => p.id === postId), 'Passing a different poster_id revealed someone else\'s pending post');
  });

  // ── ownership guards ──
  await test('PATCH rejects a wrong phone with 403', async () => {
    const { status } = await patch(`/api/bulletin/${postId}`, {
      poster_id: v.posterId, phone: '9000000001', ...EDIT,
    });
    assert(status === 403, `Expected 403, got ${status}`);
  });

  await test('PATCH rejects a mismatched poster_id with 403', async () => {
    const { status } = await patch(`/api/bulletin/${postId}`, {
      poster_id: v.posterId + 99999, phone: v.phone, ...EDIT,
    });
    assert(status === 403, `Expected 403, got ${status}`);
  });

  await test('PATCH without poster_id/phone is rejected', async () => {
    const { status } = await patch(`/api/bulletin/${postId}`, EDIT);
    assert(status === 400 || status === 403, `Expected 400/403, got ${status}`);
  });

  await test('PATCH on a non-existent post returns 404', async () => {
    const { status } = await patch('/api/bulletin/99999999', {
      poster_id: v.posterId, phone: v.phone, ...EDIT,
    });
    assert(status === 404, `Expected 404, got ${status}`);
  });

  // ── validation still applies to edits ──
  await test('PATCH rejects a too-short title', async () => {
    const { status } = await patch(`/api/bulletin/${postId}`, {
      poster_id: v.posterId, phone: v.phone, title_tamil: 'கு', content_tamil: EDIT.content_tamil,
    });
    assert(status === 400, `Expected 400, got ${status}`);
  });

  await test('PATCH rejects too-short content', async () => {
    const { status } = await patch(`/api/bulletin/${postId}`, {
      poster_id: v.posterId, phone: v.phone, title_tamil: EDIT.title_tamil, content_tamil: 'சின்ன',
    });
    assert(status === 400, `Expected 400, got ${status}`);
  });

  await test('PATCH rejects a non-image data URL', async () => {
    const { status } = await patch(`/api/bulletin/${postId}`, {
      poster_id: v.posterId, phone: v.phone, ...EDIT,
      image_url: 'data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==',
    });
    assert(status === 400, `Expected 400, got ${status}`);
  });

  await test('PATCH rejects an oversized image', async () => {
    const { status } = await patch(`/api/bulletin/${postId}`, {
      poster_id: v.posterId, phone: v.phone, ...EDIT,
      image_url: 'data:image/jpeg;base64,' + 'A'.repeat(200 * 1024),
    });
    assert(status === 400, `Expected 400, got ${status}`);
  });

  // ── image makes title/content optional on edit too ──
  await test('PATCH with an image and NO title/content → 200 (image is enough)', async () => {
    const { status, body } = await patch(`/api/bulletin/${postId}`, {
      poster_id: v.posterId, phone: v.phone,
      title_tamil: '', content_tamil: '', image_url: TINY_JPEG,
    });
    assert(status === 200, `Expected 200, got ${status} (${body.error})`);
  });

  await test('PATCH with NO image and NO title/content → 400', async () => {
    const { status } = await patch(`/api/bulletin/${postId}`, {
      poster_id: v.posterId, phone: v.phone, title_tamil: '', content_tamil: '',
    });
    assert(status === 400, `Expected 400, got ${status}`);
  });

  // ── a trusted villager's edit stays live ──
  await test('a TRUSTED villager\'s edit stays approved (no re-queue)', async () => {
    const t = await registerVillager('நம்பகமான நபர்');
    const { body: s } = await submit(t.posterId);
    await patch(`/admin/bulletin/posters/${t.posterId}`, { is_trusted: true }, auth());
    const { body } = await patch(`/api/bulletin/${s.data.id}`, {
      poster_id: t.posterId, phone: t.phone, ...EDIT,
    });
    assert(body.data.status === 'approved', `Expected approved, got ${body.data.status}`);
    assert(body.data.requeued === false, 'A trusted poster should not be re-queued');
  });

  // ── the official account is admin-only, even with its phone ──
  await test('the official account cannot be edited through the public route', async () => {
    const { body: list } = await get('/admin/bulletin/posters/list', auth());
    const official = (list.data || []).find(p => p.is_official);
    if (!official) return;                       // migration not applied — nothing to assert
    const { body: posts } = await get('/admin/bulletin?status=approved', auth());
    const offPost = (posts.data || []).find(p => p.poster_id === official.id);
    if (!offPost) return;                        // no official post exists yet
    const { status } = await patch(`/api/bulletin/${offPost.id}`, {
      poster_id: official.id, phone: official.phone, ...EDIT,
    });
    assert(status === 403, `Expected 403, got ${status}`);
  });

  // ── delete ──
  await test('DELETE rejects a wrong phone with 403', async () => {
    const { status } = await delBody(`/api/bulletin/${postId}`, {
      poster_id: v.posterId, phone: '9000000002',
    });
    assert(status === 403, `Expected 403, got ${status}`);
  });

  await test('DELETE on a non-existent post returns 404', async () => {
    const { status } = await delBody('/api/bulletin/99999999', {
      poster_id: v.posterId, phone: v.phone,
    });
    assert(status === 404, `Expected 404, got ${status}`);
  });

  await test('DELETE /api/bulletin/:id — owner removes their own post', async () => {
    const { status, body } = await delBody(`/api/bulletin/${postId}`, {
      poster_id: v.posterId, phone: v.phone,
    });
    assert(status === 200, `Expected 200, got ${status} (${body.error})`);
    const { body: feed } = await get(`/api/bulletin?poster_id=${v.posterId}`);
    assert(!feed.data.some(p => p.id === postId), 'Post still in the feed after delete');
  });

  await test('deleting a post does NOT refund the one-per-day allowance', async () => {
    // Otherwise post -> delete -> post loops around the daily limit forever.
    const { status } = await submit(v.posterId);
    assert(status === 429, `Expected 429 after delete, got ${status} — the daily limit is bypassable`);
  });
}

async function cleanup() {
  console.log('\n🧹 Cleanup');
  let removed = 0;
  for (const id of created.postIds) {
    try { await del(`/admin/bulletin/${id}`, auth()); removed++; } catch { /* already gone */ }
  }
  for (const id of new Set(created.posterIds)) {
    try { await del(`/admin/bulletin/posters/${id}`, auth()); } catch { /* already gone */ }
  }
  console.log(`  🗑  removed ${removed} post(s) and ${new Set(created.posterIds).size} test villager(s)`);
}

// ── Runner ─────────────────────────────────────────────────────────
(async () => {
  console.log('═'.repeat(64));
  console.log('  பண்ணைப்புரம் — Community Bulletin (சங்கமம்) tests');
  console.log(`  Target: ${API_BASE}`);
  console.log('═'.repeat(64));

  try {
    await setup();
    if (!authToken) {
      console.log('\n❌ Could not authenticate — aborting.');
      process.exit(1);
    }
    await testAdminAuthGuards();
    await testRegistration();
    await testSubmitValidation();
    const postId = await testModerationFlow();
    if (postId) await testLikes(postId);
    await testTrustedAndBlocked();
    await testOfficialAccount();
    await testVillagerEditDelete();
    await testPublicFeedShape();
  } catch (e) {
    console.error('\n💥 Suite crashed:', e.message);
    failed++;
  } finally {
    try { await cleanup(); } catch (e) { console.log(`  ⚠️  cleanup issue: ${e.message}`); }
  }

  console.log('\n' + '═'.repeat(64));
  console.log(`  ✅ passed: ${passed}    ❌ failed: ${failed}`);
  console.log('═'.repeat(64));
  if (errors.length) {
    console.log('\nFailures:');
    errors.forEach(e => console.log(`  • ${e}`));
  }
  process.exit(failed > 0 ? 1 : 0);
})();
