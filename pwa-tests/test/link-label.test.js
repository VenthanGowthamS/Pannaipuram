const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

// linkLabel lives inside bulletin.js's IIFE — run the shipped function, not a copy.
const src = fs.readFileSync(path.join(__dirname, '..', '..', 'pwa', 'js', 'bulletin.js'), 'utf8');
const m = src.match(/function linkLabel\(host\) \{[\s\S]*?\n  \}/);
assert.ok(m, 'linkLabel found in bulletin.js');
const linkLabel = new Function(m[0] + '\nreturn linkLabel;')();

test('Dailyhunt / Tamil news links → "முழு செய்தியைப் படிக்க"', () => {
  for (const h of ['dhunt.in', 'm.dailyhunt.in', 'hindutamil.in', 'www.thehindu.com', 'dinamalar.com']) {
    assert.equal(linkLabel(h.replace(/^www\./, '')).ta, 'முழு செய்தியைப் படிக்க', h);
  }
});
test('other link kinds', () => {
  assert.equal(linkLabel('youtu.be').ta, 'வீடியோவைப் பார்க்க');
  assert.equal(linkLabel('wa.me').ta, 'WhatsApp-ல் திறக்க');
  assert.equal(linkLabel('tn.gov.in').ta, 'அரசு இணையதளத்தைத் திறக்க');
});
test('unknown site → "இணைப்பைத் திறக்க" (no transliterated "லிங்க்")', () => {
  assert.equal(linkLabel('example.com').ta, 'இணைப்பைத் திறக்க');
  assert.ok(!/லிங்க்/.test(src.match(/function linkLabel[\s\S]*?\n  \}/)[0]));
});
