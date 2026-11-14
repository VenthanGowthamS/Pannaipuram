const test = require('node:test');
const assert = require('node:assert/strict');
const { boot } = require('./harness');

// The registration form used to be wired only AFTER the driver list had
// loaded. On a cold server that can take a minute; a villager submitting in
// that window got a plain browser submit — the page reloaded and the form was
// lost. The handler must be in place as soon as the app starts.
test('driver registration form is handled before the driver list has loaded', () => {
  const t = boot();   // boot() returns synchronously — no network reply has arrived yet
  const form = t.$('auto-contact-form');
  const ev = new t.w.Event('submit', { cancelable: true, bubbles: true });
  form.dispatchEvent(ev);
  assert.equal(ev.defaultPrevented, true, 'submit is intercepted (no page reload)');
});

test('an empty phone number is rejected with a Tamil message, nothing is sent', () => {
  const t = boot();
  const sent = [];
  const realFetch = t.w.fetch;
  t.w.fetch = (url, init) => { if (String(url).includes('/api/feedback')) sent.push(url); return realFetch(url, init); };
  t.$('auto-contact-form').dispatchEvent(new t.w.Event('submit', { cancelable: true, bubbles: true }));
  assert.equal(t.$('acf-phone-err').hidden, false);
  assert.match(t.$('acf-phone-err').textContent, /தொலைபேசி எண்/);
  assert.equal(sent.length, 0);
});
