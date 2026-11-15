const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const m = JSON.parse(fs.readFileSync(path.join(__dirname, '..', '..', 'pwa', 'manifest.json'), 'utf8'));

// A link tapped while the installed app is already open should reuse that
// window instead of opening a second copy. Browsers that do not know
// launch_handler ignore it; those that do pick the first mode they support,
// so "auto" must stay last as the fallback.
test('a tapped link reuses the app window that is already open (launch_handler)', () => {
  assert.deepEqual(m.launch_handler, { client_mode: ['navigate-existing', 'auto'] });
});

test('scope and start_url stay on the /pwa/ app (the deploy rewrites them for app.pannaipuram.com)', () => {
  assert.equal(m.scope, '/pwa/');
  assert.equal(m.start_url, '/pwa/');
  assert.equal(m.display, 'standalone');
});
