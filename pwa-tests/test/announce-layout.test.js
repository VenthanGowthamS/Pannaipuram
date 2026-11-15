const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

// jsdom does no layout, so this pins the CSS rules that stopped announcement
// cards sliding UNDER the fixed ☰ / theme buttons (the first card used to sit
// at the very top of the page whenever the install strip was not showing,
// with its text squeezed into a ~165px column by a 108px left indent).
const css = fs.readFileSync(path.join(__dirname, '..', '..', 'pwa', 'css', 'base.css'), 'utf8');

test('the announcement host starts below the fixed ☰ / theme buttons', () => {
  const rule = /#announce-host:not\(:empty\)\s*\{([^}]*)\}/.exec(css);
  assert.ok(rule, 'rule found');
  assert.match(rule[1], /padding:\s*62px 12px 0/);
});

// <main> already starts with `padding-top: env(safe-area-inset-top)`, so the
// host (inside <main>) must NOT add the inset again. v111 did, and every
// iPhone with a notch / Dynamic Island got ~59px of empty space on top.
test('the host does not count the iPhone notch inset a second time', () => {
  assert.match(css, /\nmain\s*\{\s*padding-top:\s*env\(safe-area-inset-top\)/, 'main owns the inset');
  const host = /#announce-host:not\(:empty\)\s*\{([^}]*)\}/.exec(css)[1];
  assert.doesNotMatch(host, /safe-area-inset/);
  const wide = /@media \(min-width: 560px\)\s*\{\s*#announce-host:not\(:empty\)\s*\{([^}]*)\}/.exec(css)[1];
  assert.doesNotMatch(wide, /safe-area-inset/);
});

test('no first-card text indent that squeezes the message', () => {
  assert.doesNotMatch(css, /ann-card:first-child\s*\{\s*padding-left:\s*(108|136)px/);
});

test('with the install strip showing, the announcement just follows it', () => {
  assert.match(css, /#install-banner:not\(\[hidden\]\) ~ main #announce-host:not\(:empty\)\s*\{\s*padding-top:\s*8px/);
});
