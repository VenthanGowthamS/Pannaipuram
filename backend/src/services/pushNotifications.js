const admin  = require('firebase-admin');
const { query } = require('../db/pool');

// Initialise Firebase Admin once
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId:    process.env.FIREBASE_PROJECT_ID,
      privateKey:   process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      clientEmail:  process.env.FIREBASE_CLIENT_EMAIL,
    })
  });
}

// Send to ALL registered devices
async function sendToAll(notification) {
  try {
    const result = await query('SELECT fcm_token FROM devices');
    const tokens = result.rows.map(r => r.fcm_token).filter(Boolean);
    if (tokens.length === 0) return;

    await admin.messaging().sendMulticast({
      tokens,
      notification
    });
    console.log(`Push sent to ${tokens.length} devices`);
  } catch (err) {
    console.error('Push notification error:', err.message);
  }
}

// Send to devices on a specific street (streetId null = all)
async function sendToStreet(streetId, notification) {
  if (!streetId) return sendToAll(notification);

  try {
    const result = await query(
      'SELECT fcm_token FROM devices WHERE street_id = $1', [streetId]
    );
    const tokens = result.rows.map(r => r.fcm_token).filter(Boolean);
    if (tokens.length === 0) return;

    await admin.messaging().sendMulticast({ tokens, notification });
    console.log(`Push sent to ${tokens.length} devices on street ${streetId}`);
  } catch (err) {
    console.error('Push notification error:', err.message);
  }
}

module.exports = { sendToAll, sendToStreet };
