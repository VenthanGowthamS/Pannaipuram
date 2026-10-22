/**
 * Push batching — pure unit test (fake firebase-admin + fake DB, no server).
 * FCM rejects a multicast of more than 500 tokens, so 1,200 devices must go
 * out as 500 + 500 + 200, and one failing batch must not stop the rest.
 *   node test/push.test.js
 */
const Module = require('module');
let passed = 0, failed = 0;
function check(name, got, want) {
  if (JSON.stringify(got) === JSON.stringify(want)) { passed++; console.log('  ✅', name); }
  else { failed++; console.log('  ❌', name, '— got', JSON.stringify(got), 'want', JSON.stringify(want)); }
}

const calls = [];
let failBatch = -1;
const fakeAdmin = {
  apps: [{}],
  initializeApp() {}, credential: { cert: () => ({}) },
  messaging: () => ({
    sendEachForMulticast: async ({ tokens }) => {
      calls.push(tokens.length);
      if (calls.length - 1 === failBatch) throw new Error('boom');
      return { successCount: tokens.length, failureCount: 0 };
    },
  }),
};
let tokenRows = [];
const origLoad = Module._load;
Module._load = function (request, parent, isMain) {
  if (request === 'firebase-admin') return fakeAdmin;
  if (request.endsWith('/db/pool')) return { query: async () => ({ rows: tokenRows }) };
  return origLoad.apply(this, arguments);
};
process.env.FIREBASE_PROJECT_ID = 'p'; process.env.FIREBASE_PRIVATE_KEY = 'k'; process.env.FIREBASE_CLIENT_EMAIL = 'e@x';
const { sendToAll, sendToStreet } = require('../src/services/pushNotifications');
const mk = (n) => Array.from({ length: n }, (_, i) => ({ fcm_token: 't' + i }));

(async () => {
  console.log('\n📣 Push batching');
  tokenRows = mk(1200); calls.length = 0;
  await sendToAll({ title: 'a', body: 'b' });
  check('1,200 devices → batches of 500, 500, 200', calls, [500, 500, 200]);

  tokenRows = mk(500); calls.length = 0;
  await sendToStreet(7, { title: 'a', body: 'b' });
  check('exactly 500 devices → one call', calls, [500]);

  tokenRows = mk(1200); calls.length = 0; failBatch = 0;
  await sendToAll({ title: 'a', body: 'b' });
  check('a failing first batch does not stop the others', calls, [500, 500, 200]);

  tokenRows = []; calls.length = 0; failBatch = -1;
  await sendToAll({ title: 'a', body: 'b' });
  check('no devices → no call', calls, []);
  console.log(`\n  passed: ${passed}  failed: ${failed}`);
  process.exit(failed ? 1 : 0);
})();
