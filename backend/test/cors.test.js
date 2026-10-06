/**
 * CORS origin rules (production) — pure unit test, no server or DB needed.
 *
 * The server allows EVERY origin when NODE_ENV !== 'production', so the
 * API suites running against a local server can never see a CORS mistake.
 * This file checks the production rules directly. It matters most for the
 * admin panel on Cloudflare Pages, which calls the API cross-origin with
 * the admin's JWT.
 *
 * Run: node test/cors.test.js
 */
const { isAllowedOrigin } = require('../src/middleware/corsOrigin');

const PROD = { NODE_ENV: 'production', RENDER_EXTERNAL_HOSTNAME: 'pannaipuram-api.onrender.com' };
let passed = 0, failed = 0;

function check(name, actual, expected) {
  if (actual === expected) { passed++; console.log(`  ✅ ${name}`); }
  else { failed++; console.log(`  ❌ ${name} — expected ${expected}, got ${actual}`); }
}

console.log('\n🌐 CORS origins (production)');

// Allowed
check('admin custom domain (Cloudflare Pages)', isAllowedOrigin('https://admin.pannaipuram.com', PROD), true);
check('our Pages project URL', isAllowedOrigin('https://pannaipuram-admin.pages.dev', PROD), true);
check('our Pages preview build URL', isAllowedOrigin('https://3f2a1b.pannaipuram-admin.pages.dev', PROD), true);
check('PWA custom domain', isAllowedOrigin('https://app.pannaipuram.com', PROD), true);
check('PWA on GitHub Pages', isAllowedOrigin('https://venthangowthams.github.io', PROD), true);
check('Render same-origin', isAllowedOrigin('https://pannaipuram-api.onrender.com', PROD), true);
check('no Origin header (curl / mobile app)', isAllowedOrigin(undefined, PROD), true);
check('ALLOWED_ORIGINS env list', isAllowedOrigin('https://x.example', { ...PROD, ALLOWED_ORIGINS: 'https://a.example, https://x.example' }), true);
check('development allows anything', isAllowedOrigin('https://evil.example', { NODE_ENV: 'development' }), true);

// Rejected
check('someone else\'s *.pages.dev site', isAllowedOrigin('https://evil.pages.dev', PROD), false);
check('lookalike Pages project', isAllowedOrigin('https://pannaipuram-admin-evil.pages.dev', PROD), false);
check('our name as a prefix of another domain', isAllowedOrigin('https://pannaipuram-admin.pages.dev.evil.com', PROD), false);
check('lookalike pannaipuram domain', isAllowedOrigin('https://admin.pannaipuram.com.evil.com', PROD), false);
check('plain http admin', isAllowedOrigin('http://admin.pannaipuram.com', PROD), false);
check('random origin', isAllowedOrigin('https://evil.example', PROD), false);

console.log(`\n  Results: ${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
