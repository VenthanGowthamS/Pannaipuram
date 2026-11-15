const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { boot } = require('./harness');

// The category list lives in four places that cannot share code (API, the
// Supabase CHECK constraint, the React admin and the vanilla PWA). When they
// drifted apart before, the database only accepted 6 categories and every
// car wash / e-Sevai / logistics entry ended up under "Others".
const ROOT = path.join(__dirname, '..', '..');
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');

const API = require(path.join(ROOT, 'backend/src/utils/serviceCategories.js')).SERVICE_CATEGORIES;
const quoted = (s) => [...s.matchAll(/'([a-z]+)'/g)].map((m) => m[1]);

test('API, Supabase migration, admin panel and PWA list the same categories in the same order', () => {
  const sql = read('backend/src/db/migration_services_categories.sql');
  const check = /CHECK \(category IN \(([\s\S]*?)\)\)/.exec(sql)[1];
  assert.deepEqual(quoted(check), API, 'migration CHECK constraint');

  const admin = read('admin-ui/src/pages/LocalServices.jsx');
  const adminIds = [...admin.matchAll(/\{ id: '([a-z]+)',/g)].map((m) => m[1]);
  assert.deepEqual(adminIds, API, 'admin CATEGORIES');

  const more = read('pwa/js/more.js');
  const block = /var SVC_CATS = \{([\s\S]*?)\n  \};/.exec(more)[1];
  const pwaKeys = [...block.matchAll(/^\s{4}([a-z]+):/gm)].map((m) => m[1]);
  assert.deepEqual(pwaKeys, API, 'PWA SVC_CATS');
});

test('the new categories are there: vehicle (car wash), e-Sevai / net centre, logistics', () => {
  for (const k of ['vehicle', 'esevai', 'logistics', 'grocery']) assert.ok(API.includes(k), k);
});

// ── More tab rendering ────────────────────────────────────────────
const S = (id, cat, name) => ({ id, category: cat, name_tamil: name, phone: '9000000' + String(id).padStart(3, '0') });
const SERVICES = {
  other: [S(1, 'other', 'மற்ற கடை')],
  esevai: [S(2, 'esevai', 'வாஞ்சி இ சேவை'), S(3, 'esevai', 'ஏழுமலையன் நெட் வொர்க்ஸ்')],
  vehicle: [S(4, 'vehicle', 'கார் வாட்டர் சர்வீஸ்')],
  milk: [S(5, 'milk', 'பால்காரர்')],
};

async function openMore(acting = [{ id: 9, name_tamil: 'சரவணன்', phone: '9000000099' }]) {
  const t = boot();
  t.w.PannaiAPI.getActingDrivers = async () => acting;
  t.w.PannaiAPI.getServices = async () => SERVICES;
  t.w.More.init();
  await new Promise((r) => setImmediate(r));
  return t;
}

test('services come BEFORE acting drivers in the More tab', async () => {
  const t = await openMore();
  const head = t.$('more-services-head');
  const acting = t.$('more-acting-panel');
  assert.ok(head.compareDocumentPosition(acting) & t.w.Node.DOCUMENT_POSITION_FOLLOWING);
});

test('panels follow the category order, "Others" last, each with an id to jump to', async () => {
  const t = await openMore();
  const ids = [...t.w.document.querySelectorAll('#more-services .svc-panel')].map((p) => p.id);
  assert.deepEqual(ids, ['svc-milk', 'svc-vehicle', 'svc-esevai', 'svc-other']);
});

test('a panel says what it covers (vehicle → கார் வாஷ்…)', async () => {
  const t = await openMore();
  assert.match(t.$('svc-vehicle').querySelector('.svc-panel-hint').textContent, /கார் \/ பைக் வாஷ்/);
  assert.equal(t.$('svc-other').querySelector('.svc-panel-hint'), null, 'no empty hint line');
});

test('jump chips: one per category with a count, plus acting drivers', async () => {
  const t = await openMore();
  const nav = t.$('more-jump');
  assert.equal(nav.hidden, false);
  const chips = [...nav.querySelectorAll('.more-jump-chip')];
  assert.deepEqual(chips.map((c) => c.getAttribute('data-jump')),
    ['svc-milk', 'svc-vehicle', 'svc-esevai', 'svc-other', 'more-acting-panel']);
  assert.equal(chips[2].querySelector('.more-jump-n').textContent, '2');
});

test('tapping a chip scrolls its panel into view', async () => {
  const t = await openMore();
  let scrolled = null;
  t.$('svc-esevai').scrollIntoView = function () { scrolled = this.id; };
  t.w.document.querySelector('[data-jump="svc-esevai"]').click();
  assert.equal(scrolled, 'svc-esevai');
});

test('no acting drivers → no acting chip', async () => {
  const t = await openMore([]);
  assert.equal(t.w.document.querySelector('[data-jump="more-acting-panel"]'), null);
});

test('the service registration form offers the new categories', () => {
  const t = boot();
  const opts = [...t.$('srf-type').options].map((o) => o.textContent).join(' | ');
  assert.match(opts, /கார் வாஷ்/);
  assert.match(opts, /இ-சேவை/);
  assert.match(opts, /லாஜிஸ்டிக்ஸ்/);
});
