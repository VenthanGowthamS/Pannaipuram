const test = require('node:test');
const assert = require('node:assert/strict');
const { boot, UA } = require('./harness');

const INSTALLED_PING = (p) => p.is_standalone === true;

test('opening in the browser pings with is_standalone=false and stores a visitor id', () => {
  const t = boot({ ua: UA.androidPhone });
  assert.equal(t.pings.length, 1);
  assert.equal(t.pings[0].is_standalone, false);
  assert.match(t.pings[0].visitor_id, /^v-[a-z0-9]+-[a-z0-9]+$/);
  assert.equal(t.w.localStorage.getItem('pannai:visitor-id'), t.pings[0].visitor_id);
});

test('opening the installed app (standalone) pings is_standalone=true', () => {
  const t = boot({ ua: UA.androidPhone, standalone: true });
  assert.ok(t.pings.some(INSTALLED_PING));
});

test('Android app launcher (referrer android-app://) counts as installed', () => {
  const t = boot({ ua: UA.androidPhone, referrer: 'android-app://com.android.chrome' });
  assert.ok(t.pings.some(INSTALLED_PING));
});

test('the browser appinstalled event sends an installed ping', () => {
  const t = boot({ ua: UA.androidPhone });
  t.pings.length = 0;
  t.w.dispatchEvent(new t.w.Event('appinstalled'));
  assert.ok(t.pings.some(INSTALLED_PING));
});

test('visitor id is reused, not regenerated, on the next open', () => {
  const t = boot({ ua: UA.androidPhone, storage: { 'pannai:visitor-id': 'v-keepme12-abcdefgh' } });
  assert.equal(t.pings[0].visitor_id, 'v-keepme12-abcdefgh');
});
