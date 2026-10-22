const admin  = require('firebase-admin');
const { query } = require('../db/pool');

// Initialise Firebase Admin only if credentials are present
// Without Firebase the API still works — push notifications are just skipped
const firebaseReady = !!(
  process.env.FIREBASE_PROJECT_ID &&
  process.env.FIREBASE_PRIVATE_KEY &&
  process.env.FIREBASE_CLIENT_EMAIL
);

if (firebaseReady && !admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId:   process.env.FIREBASE_PROJECT_ID,
        privateKey:  process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      })
    });
    console.log('Firebase Admin initialised ✅');
  } catch (err) {
    console.warn('Firebase Admin init failed — push notifications disabled:', err.message);
  }
} else if (!firebaseReady) {
  console.warn('Firebase credentials not set — push notifications disabled (API still works)');
}

// FCM accepts at most 500 tokens per multicast call — a single call with every
// device would fail outright once the village has more than 500 installs.
const FCM_BATCH = 500;
async function sendInBatches(tokens, notification) {
  const messaging = admin.messaging();
  // sendMulticast is deprecated in firebase-admin 11+; sendEachForMulticast replaces it
  const send = (batch) => (messaging.sendEachForMulticast || messaging.sendMulticast).call(messaging, { tokens: batch, notification });
  let ok = 0, failed = 0;
  for (let i = 0; i < tokens.length; i += FCM_BATCH) {
    try {
      const res = await send(tokens.slice(i, i + FCM_BATCH));
      ok += res.successCount; failed += res.failureCount;
    } catch (err) {
      failed += Math.min(FCM_BATCH, tokens.length - i);
      console.error('Push batch error:', err.message);
    }
  }
  return { ok, failed };
}

// Send to ALL registered devices
async function sendToAll(notification) {
  if (!firebaseReady || !admin.apps.length) return;
  try {
    const result = await query('SELECT fcm_token FROM devices');
    const tokens = result.rows.map(r => r.fcm_token).filter(Boolean);
    if (tokens.length === 0) return;

    const r = await sendInBatches(tokens, notification);
    console.log(`Push sent: ${r.ok} ok, ${r.failed} failed (of ${tokens.length} devices)`);
  } catch (err) {
    console.error('Push notification error:', err.message);
  }
}

// Send to devices on a specific street (streetId null = all)
async function sendToStreet(streetId, notification) {
  if (!streetId) return sendToAll(notification);
  if (!firebaseReady || !admin.apps.length) return;

  try {
    const result = await query(
      'SELECT fcm_token FROM devices WHERE street_id = $1', [streetId]
    );
    const tokens = result.rows.map(r => r.fcm_token).filter(Boolean);
    if (tokens.length === 0) return;

    const r = await sendInBatches(tokens, notification);
    console.log(`Push to street ${streetId}: ${r.ok} ok, ${r.failed} failed (of ${tokens.length} devices)`);
  } catch (err) {
    console.error('Push notification error:', err.message);
  }
}

module.exports = { sendToAll, sendToStreet };
