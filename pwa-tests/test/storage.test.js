const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { boot } = require('./harness');

const API_JS = fs.readFileSync(path.join(__dirname, '..', '..', 'pwa', 'js', 'api.js'), 'utf8');
const CURRENT = /var CACHE_VERSION = '(pannai-v\d+)'/.exec(API_JS)[1];

const IDENTITY = {
  'pannai:visitor-id': 'v-abc-12345678',
  'pannai:theme': 'dark',
  'pannai:bulletin-poster': '{"poster_id":7,"phone":"9000000001","name_tamil":"சோதனை"}',
  'pannai:ann-dismissed': '["3:123"]',
  'pannai:last-group-v1': 'long',
};

test('cached API data from OLDER releases is removed at startup', () => {
  const t = boot({ storage: {
    'pannai-v1:pannai:/api/bus/all': '{"old":1}',
    'pannai-v107:pannai:/api/bulletin?device_id=v-abc': '{"old":2}',
    ...IDENTITY,
  } });
  const keys = Object.keys(t.w.localStorage);
  assert.equal(keys.filter((k) => /^pannai-v(1|107):/.test(k)).length, 0);
});

test('the current release\'s cached data survives the cleanup', () => {
  const key = CURRENT + ':pannai:/api/bus/all';
  const t = boot({ storage: { [key]: '{"keep":true}' } });
  assert.equal(t.w.localStorage.getItem(key), '{"keep":true}');
});

test('identity keys (visitor id, theme, poster, dismissals) are never touched', () => {
  const t = boot({ storage: { 'pannai-v50:pannai:/api/services': '{}', ...IDENTITY } });
  for (const [k, v] of Object.entries(IDENTITY)) assert.equal(t.w.localStorage.getItem(k), v, k);
});

test('force update clears cached API data but keeps identity', async () => {
  // An endpoint the booted app does not fetch by itself, so nothing re-writes
  // the key while the test is looking at it.
  const cached = CURRENT + ':pannai:/api/bus/timings/999';
  const t = boot({ storage: { [cached]: '{"stale":true}', ...IDENTITY } });
  // Stop at the reload: jsdom cannot navigate, and the test is about storage.
  t.w.fetch = () => Promise.resolve({ ok: true, text: () => Promise.resolve('<html></html>') });
  await t.w.PannaiForceUpdate();
  assert.equal(t.w.localStorage.getItem(cached), null);
  for (const [k, v] of Object.entries(IDENTITY)) assert.equal(t.w.localStorage.getItem(k), v, k);
});
