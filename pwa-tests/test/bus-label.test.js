const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

// fmtPeriod lives inside bus.js's IIFE; pull the source of just that function
// so the test runs the shipped code rather than a copy.
const src = fs.readFileSync(path.join(__dirname, '..', '..', 'pwa', 'js', 'bus.js'), 'utf8');
const grab = (name) => {
  const m = src.match(new RegExp('function ' + name + '\\([^)]*\\) \\{[\\s\\S]*?\\n  \\}'));
  assert.ok(m, name + ' found in bus.js');
  return m[0];
};
const fmtPeriod = new Function(grab('fmt12') + '\n' + grab('fmtPeriod') + '\nreturn fmtPeriod;')();

test('00:00–05:59 is அதிகாலை (not இரவு)', () => {
  assert.equal(fmtPeriod('01:00'), '1:00 அதிகாலை');
  assert.equal(fmtPeriod('04:30'), '4:30 அதிகாலை');
  assert.equal(fmtPeriod('05:59'), '5:59 அதிகாலை');
});
test('rest of the day', () => {
  assert.equal(fmtPeriod('06:00'), '6:00 காலை');
  assert.equal(fmtPeriod('11:45'), '11:45 காலை');
  assert.equal(fmtPeriod('12:30'), '12:30 பகல்');
  assert.equal(fmtPeriod('16:59'), '4:59 பகல்');
  assert.equal(fmtPeriod('17:00'), '5:00 மாலை');
  assert.equal(fmtPeriod('20:00'), '8:00 இரவு');
  assert.equal(fmtPeriod('23:50'), '11:50 இரவு');
});
