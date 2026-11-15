// The ONE list of local-service categories the API accepts.
// Must match the CHECK constraint in migration_services_categories.sql, the
// admin panel (admin-ui/src/pages/LocalServices.jsx) and the PWA (pwa/js/more.js
// SVC_CATS) — pwa-tests/test/service-categories.test.js checks all four agree.
const SERVICE_CATEGORIES = [
  'milk', 'grocery', 'flower',
  'vehicle', 'esevai', 'logistics',
  'post', 'plumber', 'electrician', 'carpenter',
  'other',
];

module.exports = { SERVICE_CATEGORIES };
