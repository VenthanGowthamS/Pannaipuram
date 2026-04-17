const cron   = require('node-cron');
const { query } = require('../db/pool');
const { sendToStreet } = require('./pushNotifications');

// Run every day at 8 PM — send next-day water reminders
async function sendWaterReminders() {
  try {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    // Find streets whose next supply date is tomorrow
    const result = await query(`
      SELECT ws.street_id, ws.supply_time, s.name_tamil,
             ws.last_supply_date + (ws.frequency_days || ' days')::interval AS next_date
      FROM water_schedules ws
      JOIN streets s ON ws.street_id = s.id
      WHERE (ws.last_supply_date + (ws.frequency_days || ' days')::interval)::date = $1
    `, [tomorrowStr]);

    for (const row of result.rows) {
      const timeStr = row.supply_time?.slice(0, 5) || '06:00';
      await sendToStreet(row.street_id, {
        title: 'பண்ணைப்புரம் 💧',
        body:  `நாளை காலை ${timeStr} மணிக்கு தண்ணீர் வரும்! — ${row.name_tamil}`
      });
      console.log(`Water reminder sent for street: ${row.name_tamil}`);
    }
  } catch (err) {
    console.error('Water reminder error:', err.message);
  }
}

// Run every day at 5:45 AM — send morning alert on water day
async function sendMorningWaterAlert() {
  try {
    const today = new Date().toISOString().split('T')[0];

    const result = await query(`
      SELECT ws.street_id, s.name_tamil
      FROM water_schedules ws
      JOIN streets s ON ws.street_id = s.id
      WHERE (ws.last_supply_date + (ws.frequency_days || ' days')::interval)::date = $1
    `, [today]);

    for (const row of result.rows) {
      await sendToStreet(row.street_id, {
        title: 'பண்ணைப்புரம் 💧',
        body:  `15 நிமிடத்தில் தண்ணீர் வரும்! தயாராக இருங்கள் — ${row.name_tamil}`
      });
    }
  } catch (err) {
    console.error('Morning water alert error:', err.message);
  }
}

// Run every day at 7 AM — check if no water alert confirmed
async function checkWaterNoShow() {
  try {
    const today = new Date().toISOString().split('T')[0];

    // Streets that should have water today but no alert posted
    const result = await query(`
      SELECT ws.street_id, s.name_tamil
      FROM water_schedules ws
      JOIN streets s ON ws.street_id = s.id
      WHERE (ws.last_supply_date + (ws.frequency_days || ' days')::interval)::date = $1
        AND NOT EXISTS (
          SELECT 1 FROM water_alerts wa
          WHERE wa.street_id = ws.street_id
            AND wa.reported_at::date = $1
        )
    `, [today]);

    for (const row of result.rows) {
      await sendToStreet(row.street_id, {
        title: 'பண்ணைப்புரம் 💧',
        body:  `இன்னும் தண்ணீர் வரவில்லை — ${row.name_tamil} — பஞ்சாயத்தை தொடர்பு கொள்ளுங்கள்`
      });
    }
  } catch (err) {
    console.error('Water no-show check error:', err.message);
  }
}

function startWaterScheduler() {
  cron.schedule('0 20 * * *',  sendWaterReminders);    // 8:00 PM daily — next day reminder
  cron.schedule('45 5 * * *',  sendMorningWaterAlert); // 5:45 AM daily — morning alert
  cron.schedule('0 7 * * *',   checkWaterNoShow);      // 7:00 AM daily — no-show check
  console.log('Water scheduler started');
}

module.exports = { startWaterScheduler };
