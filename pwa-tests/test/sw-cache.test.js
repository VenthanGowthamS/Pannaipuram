const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

// Runs the REAL pwa/sw.js inside a fake service-worker global and drives its
// fetch handler, so the caching rules are tested as shipped.
const SRC = fs.readFileSync(path.join(__dirname, '..', '..', 'pwa', 'sw.js'), 'utf8');
const ORIGIN = 'https://app.pannaipuram.com';

function bootSW(respond) {
  const store = new Map();          // cache key (url string) → Response
  const listeners = {};
  const cache = {
    put(key, resp) {
      const k = typeof key === 'string' ? key : key.url;
      if (typeof key !== 'string' && key.method !== 'GET') return Promise.reject(new TypeError('unsupported method'));
      store.set(k, resp);
      return Promise.resolve();
    },
    match(key) {
      const k = typeof key === 'string' ? key : key.url;
      const hit = store.get(k);
      return Promise.resolve(hit ? hit.clone() : undefined);
    },
  };
  const fetched = [];
  const ctx = {
    self: { location: { href: ORIGIN + '/sw.js', origin: ORIGIN }, addEventListener(t, fn) { listeners[t] = fn; }, clients: { claim() {} }, skipWaiting() {} },
    caches: { open: () => Promise.resolve(cache), match: (k) => cache.match(k), keys: () => Promise.resolve([]), delete: () => Promise.resolve(true) },
    fetch(req) { fetched.push(typeof req === 'string' ? req : req.url); return respond(typeof req === 'string' ? req : req.url); },
    URL, Request, Response, Promise, Date,
  };
  vm.createContext(ctx);
  vm.runInContext(SRC, ctx);

  // Dispatch a fetch event; resolves to the Response the worker answered with,
  // or null when the worker did not call respondWith (browser handles it).
  async function request(url, init) {
    let answer = null;
    listeners.fetch({ request: new Request(url, init), respondWith(p) { answer = Promise.resolve(p); } });
    const resp = answer ? await answer : null;
    await new Promise((r) => setImmediate(r));   // let background cache.put settle
    return resp;
  }
  return { request, store, fetched };
}

const ok = (body) => Promise.resolve(new Response(JSON.stringify(body), { status: 200 }));
const API = 'https://api.pannaipuram.com/api/bus/all';

test('forced refreshes (?_t=…) do not pile up as separate cache entries', async () => {
  const sw = bootSW(() => ok({ success: true, data: [] }));
  await sw.request(API);
  await sw.request(API + '?_t=1111');
  await sw.request(API + '?_t=2222');
  await sw.request(API + '?_t=3333');
  assert.deepEqual([...sw.store.keys()], [API]);
});

test('a forced refresh updates the copy that is served offline afterwards', async () => {
  let version = 'old';
  const sw = bootSW(() => ok({ v: version }));
  await sw.request(API);                       // caches "old"
  version = 'new';
  const fresh = await sw.request(API + '?_t=1');
  assert.equal((await fresh.json()).v, 'new'); // forced → network answer
  const cached = await sw.request(API);        // normal read → served from cache
  assert.equal((await cached.json()).v, 'new');
});

test('other query params stay part of the cache key (bulletin feed per device)', async () => {
  const sw = bootSW(() => ok({}));
  const feed = 'https://api.pannaipuram.com/api/bulletin?device_id=v-abc';
  await sw.request(feed + '&_t=5');
  assert.deepEqual([...sw.store.keys()], [feed]);
});

test('an error response is never stored as the cached answer', async () => {
  const sw = bootSW(() => Promise.resolve(new Response('{"success":false}', { status: 500 })));
  const resp = await sw.request(API);
  assert.equal(resp.status, 500);
  assert.equal(sw.store.size, 0);
});

test('cached data is served when the network is down', async () => {
  let up = true;
  const sw = bootSW(() => (up ? ok({ v: 1 }) : Promise.reject(new TypeError('offline'))));
  await sw.request(API);
  up = false;
  const resp = await sw.request(API);
  assert.equal((await resp.json()).v, 1);
});

test('writes (POST) are left to the network — not intercepted, not cached', async () => {
  const sw = bootSW(() => ok({ success: true }));
  const resp = await sw.request('https://api.pannaipuram.com/api/feedback', { method: 'POST', body: '{}' });
  assert.equal(resp, null);
  assert.equal(sw.store.size, 0);
  assert.equal(sw.fetched.length, 0);
});
