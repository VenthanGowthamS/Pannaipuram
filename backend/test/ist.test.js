// Unit test for src/utils/ist.js — pure, needs no server or DB.
//   node test/ist.test.js
const { istNow, istDateStr } = require('../src/utils/ist');
let passed = 0, failed = 0;
function eq(name, got, want) {
  if (JSON.stringify(got) === JSON.stringify(want)) { passed++; console.log('  ✅', name); }
  else { failed++; console.log('  ❌', name, '— got', JSON.stringify(got), 'want', JSON.stringify(want)); }
}
console.log('\n🕐 IST helpers');
// 2026-10-22 20:30 UTC = 2026-10-23 02:00 IST (Friday): UTC says Thursday, IST says Friday
eq('late-evening UTC is already tomorrow in IST', istNow(new Date('2026-10-22T20:30:00Z')), { date: '2026-10-23', time: '02:00', dow: 5 });
// 2026-10-22 18:29 UTC = 23:59 IST (Thursday) — still today
eq('18:29 UTC is 23:59 IST, same day', istNow(new Date('2026-10-22T18:29:00Z')), { date: '2026-10-22', time: '23:59', dow: 4 });
// 18:30 UTC = 00:00 IST — midnight must be 00:xx, not 24:xx
eq('midnight IST renders as 00:00', istNow(new Date('2026-10-22T18:30:00Z')).time, '00:00');
eq('Sunday is 0', istNow(new Date('2026-10-25T06:00:00Z')).dow, 0);
eq('istDateStr(+1) crosses a month end', istDateStr(1, new Date('2026-10-31T10:00:00Z')), '2026-11-01');
eq('istDateStr(+1) uses the IST day, not the UTC day', istDateStr(1, new Date('2026-10-22T20:30:00Z')), '2026-10-24');
eq('istDateStr(0) is the IST day', istDateStr(0, new Date('2026-10-22T20:30:00Z')), '2026-10-23');
console.log(`\n  passed: ${passed}  failed: ${failed}`);
process.exit(failed ? 1 : 0);
