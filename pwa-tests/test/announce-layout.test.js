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
  assert.match(rule[1], /padding:\s*calc\(62px \+ env\(safe-area-inset-top\)\)/);
});

test('no first-card text indent that squeezes the message', () => {
  assert.doesNotMatch(css, /ann-card:first-child\s*\{\s*padding-left:\s*(108|136)px/);
});

test('with the install strip showing, the announcement just follows it', () => {
  assert.match(css, /#install-banner:not\(\[hidden\]\) ~ main #announce-host:not\(:empty\)\s*\{\s*padding-top:\s*8px/);
});
