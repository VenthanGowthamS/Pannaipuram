// The village runs on IST; the API server (Render) runs on UTC. Anything that
// means "now / today / this weekday" for a villager must be computed here, never
// with new Date().getDay() / toISOString() / toTimeString().
const TZ = 'Asia/Kolkata';

// → { date: 'YYYY-MM-DD', time: 'HH:MM', dow: 0 (Sun) … 6 (Sat) } in IST
function istNow(at = new Date()) {
  const date = at.toLocaleDateString('en-CA', { timeZone: TZ });
  const time = at.toLocaleTimeString('en-GB', { timeZone: TZ, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });
  const dow = new Date(date + 'T00:00:00Z').getUTCDay();
  return { date, time, dow };
}

// IST calendar date shifted by whole days, as 'YYYY-MM-DD'
function istDateStr(offsetDays = 0, at = new Date()) {
  const d = new Date(istNow(at).date + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

module.exports = { TZ, istNow, istDateStr };
