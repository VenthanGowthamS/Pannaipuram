const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const PWA = path.join(__dirname, '..', '..', 'pwa');
const HTML = fs.readFileSync(path.join(PWA, 'index.html'), 'utf8').replace(/<script[\s\S]*?<\/script>/g, '');
const read = (f) => fs.readFileSync(path.join(PWA, 'js', f), 'utf8');

const CORRIDORS = [
  { id: 1, name_english: 'Theni', name_tamil: 'தேனி' },
  { id: 2, name_english: 'Bodi', name_tamil: 'போடி' },
  { id: 3, name_english: 'Madurai', name_tamil: 'மதுரை' },
];
const T = (h, m = 0) => ({ departs_at: String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0') + ':00', bus_type: 'ordinary' });

// Boots bus.js with fixed corridors/timings and a frozen "now" (IST wall-clock h:m).
async function bootBus({ now = [10, 0], timings, saved }) {
  const dom = new JSDOM(HTML, { url: 'https://app.pannaipuram.com/', runScripts: 'outside-only', pretendToBeVisual: true });
  const w = dom.window;
  if (saved) w.localStorage.setItem('pannai:last-group-v1', saved);
  const RealDate = w.Date;
  w.Date = class extends RealDate {
    constructor(...a) { if (a.length) super(...a); else { super(2026, 9, 24, now[0], now[1], 0); } }
    static now() { return new RealDate(2026, 9, 24, now[0], now[1], 0).getTime(); }
  };
  w.setInterval = () => 0;
  w.scrollBy = () => {};
  w.eval(read('api.js'));
  w.PannaiAPI.getBusAll = async () => ({ corridors: CORRIDORS, timings });
  w.PannaiAPI.getBusCorridors = async () => CORRIDORS;
  w.PannaiAPI.getBusTimings = async (id) => timings[id] || [];
  w.eval(read('bus.js'));
  await w.Bus.init();
  await new Promise((r) => setImmediate(r));
  const $ = (s) => w.document.querySelector(s);
  return { w, $, strip: () => $('#bus-now-strip'), group: (k) => $('[data-group="' + k + '"]') };
}

test('Local Routes group is open by default at any hour (midday, no saved choice)', async () => {
  const t = await bootBus({ now: [13, 0], timings: { 1: [T(15)], 2: [T(16)], 3: [T(18)] } });
  assert.equal(t.group('local').querySelector('.group-body').hidden, false);
  assert.equal(t.group('long').querySelector('.group-body').hidden, true);
});

test('a saved last-opened group still wins over the default', async () => {
  const t = await bootBus({ now: [13, 0], timings: { 1: [T(15)], 2: [T(16)], 3: [T(18)] }, saved: 'long' });
  assert.equal(t.group('long').querySelector('.group-body').hidden, false);
  assert.equal(t.group('local').querySelector('.group-body').hidden, true);
});

test('collapsed group header shows the soonest bus; open group does not', async () => {
  const t = await bootBus({ now: [13, 0], timings: { 1: [T(15)], 2: [T(13, 30)], 3: [T(18)] } });
  const longNext = t.group('long').querySelector('.group-next');
  assert.equal(longNext.hidden, false);
  assert.match(longNext.textContent, /அடுத்தது: மதுரை/);
  assert.equal(t.group('local').querySelector('.group-next').hidden, true);
  // soonest local would be Bodi, 30 min away
  assert.match(t.group('local').querySelector('.group-next').textContent, /போடி/);
});

test('group header village list is shortened to 4 names', async () => {
  const t = await bootBus({ now: [13, 0], timings: { 1: [T(15)], 2: [T(16)], 3: [T(18)] } });
  assert.match(t.group('local').querySelector('.group-hint').textContent, /…$/);
});

test('strip lists up to 3 buses leaving within 3 hours', async () => {
  const t = await bootBus({ now: [13, 0], timings: { 1: [T(13, 10)], 2: [T(14)], 3: [T(15)] } });
  assert.equal(t.strip().hidden, false);
  assert.equal(t.strip().querySelectorAll('.strip-card').length, 3);
});

test('nothing in the next 3 hours but one later today → strip says when the next bus is (not hidden)', async () => {
  const t = await bootBus({ now: [13, 0], timings: { 1: [T(18)], 2: [T(19)], 3: [T(20)] } });
  assert.equal(t.strip().hidden, false);
  assert.equal(t.strip().querySelectorAll('.strip-card').length, 0);
  assert.match(t.strip().textContent, /தேனி/);
  assert.match(t.strip().textContent, /next bus in/);
});

test('all of today\'s buses are gone → strip shows tomorrow\'s first bus', async () => {
  const t = await bootBus({ now: [23, 30], timings: { 1: [T(5, 30)], 2: [T(4, 45)], 3: [T(6)] } });
  // 23:30 — all departures are earlier in the day
  assert.equal(t.strip().hidden, false);
  assert.match(t.strip().textContent, /இன்று பேருந்துகள் முடிந்தது/);
  assert.match(t.strip().textContent, /போடி/);              // earliest is Bodi 4:45
  assert.match(t.strip().textContent, /4:45 அதிகாலை/);
});

test('1 AM with a 1:30 bus → normal strip card labelled அதிகாலை', async () => {
  const t = await bootBus({ now: [1, 0], timings: { 1: [T(1, 30)], 2: [T(5)], 3: [T(9)] } });
  assert.match(t.strip().textContent, /1:30 அதிகாலை/);
});

test('no timings loaded at all → strip stays hidden (no misleading message)', async () => {
  const t = await bootBus({ now: [13, 0], timings: { 1: [], 2: [], 3: [] } });
  assert.equal(t.strip().hidden, true);
});

test('every route card carries the "எல்லா நேரமும்" hint (and a close label for when it is open)', async () => {
  const t = await bootBus({ now: [13, 0], timings: { 1: [T(15)], 2: [T(16)], 3: [T(18)] } });
  const cards = t.w.document.querySelectorAll('.route-card');
  assert.ok(cards.length >= 3);
  cards.forEach((c) => {
    assert.match(c.querySelector('.more-show').textContent, /எல்லா நேரமும்/);
    assert.match(c.querySelector('.more-hide').textContent, /மூடு/);
  });
});

test('first-time tip shows until a timetable has been opened, then never again', async () => {
  const t = await bootBus({ now: [13, 0], timings: { 1: [T(15)], 2: [T(16)], 3: [T(18)] } });
  assert.ok(t.$('.bus-tip'), 'tip shown to a new user');
  t.w.document.querySelector('.route-card').click();
  await new Promise((r) => setImmediate(r));
  assert.equal(t.$('.bus-tip'), null, 'tip removed once a timetable is opened');
  assert.equal(t.w.localStorage.getItem('pannai:tt-opened'), '1');
  // a re-render (e.g. 10-min refresh) must not bring it back
  await t.w.Bus.refresh();
  assert.equal(t.$('.bus-tip'), null);
});

test('tip is not shown to a returning user who already opened a timetable', async () => {
  const dom = await bootBus({ now: [13, 0], timings: { 1: [T(15)], 2: [T(16)], 3: [T(18)] } });
  dom.w.localStorage.setItem('pannai:tt-opened', '1');
  await dom.w.Bus.refresh();
  assert.equal(dom.$('.bus-tip'), null);
});
