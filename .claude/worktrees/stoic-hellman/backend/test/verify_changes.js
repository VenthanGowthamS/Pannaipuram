#!/usr/bin/env node
// Static verification of all code changes
const fs = require('fs');

let passed = 0, failed = 0;

function check(desc, condition) {
  if (condition) { passed++; console.log('  ✅ ' + desc); }
  else { failed++; console.log('  ❌ ' + desc); }
}

console.log('\n═══ பண்ணைப்புரம் — Static Verification ═══\n');

const appJs = fs.readFileSync('src/app.js', 'utf8');
const schema = fs.readFileSync('src/db/schema.sql', 'utf8');
const adminHtml = fs.readFileSync('public/admin/index.html', 'utf8');
const waterRoute = fs.readFileSync('src/routes/water.js', 'utf8');
const adminHospital = fs.readFileSync('src/routes/admin/hospital.js', 'utf8');
const autoRoute = fs.readFileSync('src/routes/auto.js', 'utf8');
const adminAutoRoute = fs.readFileSync('src/routes/admin/auto.js', 'utf8');

console.log('1. Auto Module');
check('auto route file exists', autoRoute.includes('/drivers'));
check('admin auto route file exists', adminAutoRoute.includes('POST'));
check('app.js imports auto route', appJs.includes("require('./routes/auto')"));
check('app.js imports admin auto route', appJs.includes("require('./routes/admin/auto')"));
check('app.js mounts /api/auto', appJs.includes('/api/auto'));
check('app.js mounts /admin/auto', appJs.includes('/admin/auto'));
check('schema has auto_drivers table', schema.includes('auto_drivers'));
check('schema has vehicle_type column', schema.includes('vehicle_type'));

console.log('\n2. Admin Panel — Auto Tab');
check('admin HTML has auto section', adminHtml.includes('sec-auto'));
check('admin HTML has loadAutoDrivers()', adminHtml.includes('loadAutoDrivers'));
check('admin HTML has addAutoDriver()', adminHtml.includes('addAutoDriver'));
check('admin HTML has editAutoDriver()', adminHtml.includes('editAutoDriver'));
check('admin HTML has deleteAutoDriver()', adminHtml.includes('deleteAutoDriver'));
check('admin HTML has Auto/Van tab button', adminHtml.includes("switchTab('auto')"));

console.log('\n3. Bus — Inbound/Outbound Removed');
check('bt-direction dropdown removed', !adminHtml.includes('id="bt-direction"'));
check('direction hardcoded to outbound', adminHtml.includes("const direction   = 'outbound'"));

console.log('\n4. Doctor-Hospital Fix');
check('admin PUT doctors updates hospital_id', adminHospital.includes('hospital_id   = COALESCE'));
check('editDoctor includes hospital_id param', adminHtml.includes('Hospital (1 = PTV'));

console.log('\n5. Water Streets Fix');
check('/api/water/streets endpoint exists', waterRoute.includes("'/streets'"));
check('streets query fetches FROM streets s', waterRoute.includes('FROM streets s'));
check('streets query uses no JOIN (gets ALL)', !waterRoute.match(/\/streets'[\s\S]*?JOIN water_schedules/));

console.log('\n6. Migration File');
const migration = fs.readFileSync('src/db/migrate_auto_drivers.sql', 'utf8');
check('migration creates auto_drivers table', migration.includes('CREATE TABLE IF NOT EXISTS auto_drivers'));
check('migration seeds sample drivers', migration.includes('முருகேசன்'));

console.log('\n7. Test File');
const testFile = fs.readFileSync('test/api_regression.test.js', 'utf8');
check('test file covers all modules',
  testFile.includes('testWaterEndpoints') &&
  testFile.includes('testPowerEndpoints') &&
  testFile.includes('testBusEndpoints') &&
  testFile.includes('testHospitalEndpoints') &&
  testFile.includes('testEmergencyEndpoints') &&
  testFile.includes('testAutoEndpoints'));
check('test file checks doctor-hospital mapping', testFile.includes('testDoctorHospitalMapping'));
check('test file checks water-streets sync', testFile.includes('testWaterStreetsSync'));

console.log('\n═══════════════════════════════════════════');
console.log(`  Results: ${passed} passed, ${failed} failed`);
console.log('═══════════════════════════════════════════\n');

process.exit(failed > 0 ? 1 : 0);
