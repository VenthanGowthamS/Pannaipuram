/**
 * பண்ணைப்புரம் — Demo Server (No Database Required)
 * Serves all API endpoints with seed data for local testing.
 * Run: node demo-server.js
 */

const express = require('express');
const cors    = require('cors');
const app     = express();

app.use(cors());
app.use(express.json());

// ─────────────────────────────────────────────────────
// SEED DATA
// ─────────────────────────────────────────────────────

const HOSPITAL = {
  id: 1,
  name_tamil:      'பி.டி.வி. பத்மாவதி மருத்துவமனை',
  name_english:    'PTV Padmavathy Hospital',
  address_tamil:   'பண்ணைப்புரம் அருகில், உத்தமபாளையம் தாலுகா, தேனி மாவட்டம் — 625524',
  phone_casualty:  '04546-XXXXXX',   // TODO: collect from hospital
  phone_ambulance: '108',
  phone_general:   '04546-XXXXXX',   // TODO: collect from hospital
  pharmacy_hours:  'காலை 8 மணி — இரவு 9 மணி',
  notes_tamil:     'உத்தமபாளையம் அருகில் உள்ள முதன்மை தனியார் மருத்துவமனை'
};

const DOCTORS = [
  {
    id: 1,
    name_tamil:    'டாக்டர் சேகர்',
    name_english:  'Dr. Sekar',
    specialisation: 'TBC — collect from hospital',
    photo_url:     null,
    schedule: [
      { day: 3, day_name: 'புதன்கிழமை (Wednesday)', start: '09:00', end: '17:00', notes: 'OPD — காலை 9 முதல் மாலை 5 வரை' }
    ]
  }
];

const BUS_CORRIDORS = [
  { id: 1, name_tamil: 'போடி பக்கம்',  name_english: 'Towards Bodi',   color_hex: '#1976D2' },
  { id: 2, name_tamil: 'கம்பம் பக்கம்', name_english: 'Towards Kamban', color_hex: '#388E3C' }
];

// Placeholder timings — to be replaced with real TNSTC schedule
const BUS_TIMINGS = [
  // Bodi side outbound
  { id:1,  corridor_id:1, direction:'outbound', origin_tamil:'பண்ணைப்புரம்', dest_tamil:'போடி (போடிநாயக்கனூர்)', departs_at:'06:00', bus_type:'ordinary',  is_last_bus:false },
  { id:2,  corridor_id:1, direction:'outbound', origin_tamil:'பண்ணைப்புரம்', dest_tamil:'போடி (போடிநாயக்கனூர்)', departs_at:'07:30', bus_type:'ordinary',  is_last_bus:false },
  { id:3,  corridor_id:1, direction:'outbound', origin_tamil:'பண்ணைப்புரம்', dest_tamil:'போடி (போடிநாயக்கனூர்)', departs_at:'09:00', bus_type:'ordinary',  is_last_bus:false },
  { id:4,  corridor_id:1, direction:'outbound', origin_tamil:'பண்ணைப்புரம்', dest_tamil:'போடி (போடிநாயக்கனூர்)', departs_at:'11:00', bus_type:'ordinary',  is_last_bus:false },
  { id:5,  corridor_id:1, direction:'outbound', origin_tamil:'பண்ணைப்புரம்', dest_tamil:'போடி (போடிநாயக்கனூர்)', departs_at:'13:00', bus_type:'ordinary',  is_last_bus:false },
  { id:6,  corridor_id:1, direction:'outbound', origin_tamil:'பண்ணைப்புரம்', dest_tamil:'போடி (போடிநாயக்கனூர்)', departs_at:'15:30', bus_type:'ordinary',  is_last_bus:false },
  { id:7,  corridor_id:1, direction:'outbound', origin_tamil:'பண்ணைப்புரம்', dest_tamil:'போடி (போடிநாயக்கனூர்)', departs_at:'18:00', bus_type:'ordinary',  is_last_bus:false },
  { id:8,  corridor_id:1, direction:'outbound', origin_tamil:'பண்ணைப்புரம்', dest_tamil:'போடி (போடிநாயக்கனூர்)', departs_at:'20:00', bus_type:'ordinary',  is_last_bus:true  },
  // Bodi side inbound
  { id:9,  corridor_id:1, direction:'inbound',  origin_tamil:'போடி',          dest_tamil:'பண்ணைப்புரம்',         departs_at:'06:30', bus_type:'ordinary',  is_last_bus:false },
  { id:10, corridor_id:1, direction:'inbound',  origin_tamil:'போடி',          dest_tamil:'பண்ணைப்புரம்',         departs_at:'08:00', bus_type:'ordinary',  is_last_bus:false },
  { id:11, corridor_id:1, direction:'inbound',  origin_tamil:'போடி',          dest_tamil:'பண்ணைப்புரம்',         departs_at:'10:00', bus_type:'ordinary',  is_last_bus:false },
  { id:12, corridor_id:1, direction:'inbound',  origin_tamil:'போடி',          dest_tamil:'பண்ணைப்புரம்',         departs_at:'14:00', bus_type:'ordinary',  is_last_bus:false },
  { id:13, corridor_id:1, direction:'inbound',  origin_tamil:'போடி',          dest_tamil:'பண்ணைப்புரம்',         departs_at:'17:00', bus_type:'ordinary',  is_last_bus:false },
  { id:14, corridor_id:1, direction:'inbound',  origin_tamil:'போடி',          dest_tamil:'பண்ணைப்புரம்',         departs_at:'20:30', bus_type:'ordinary',  is_last_bus:true  },
  // Kamban side outbound
  { id:15, corridor_id:2, direction:'outbound', origin_tamil:'பண்ணைப்புரம்', dest_tamil:'கம்பம்',               departs_at:'06:15', bus_type:'ordinary',  is_last_bus:false },
  { id:16, corridor_id:2, direction:'outbound', origin_tamil:'பண்ணைப்புரம்', dest_tamil:'கம்பம்',               departs_at:'07:45', bus_type:'ordinary',  is_last_bus:false },
  { id:17, corridor_id:2, direction:'outbound', origin_tamil:'பண்ணைப்புரம்', dest_tamil:'கம்பம்',               departs_at:'09:30', bus_type:'ordinary',  is_last_bus:false },
  { id:18, corridor_id:2, direction:'outbound', origin_tamil:'பண்ணைப்புரம்', dest_tamil:'கம்பம்',               departs_at:'12:00', bus_type:'ordinary',  is_last_bus:false },
  { id:19, corridor_id:2, direction:'outbound', origin_tamil:'பண்ணைப்புரம்', dest_tamil:'கம்பம்',               departs_at:'14:30', bus_type:'ordinary',  is_last_bus:false },
  { id:20, corridor_id:2, direction:'outbound', origin_tamil:'பண்ணைப்புரம்', dest_tamil:'கம்பம்',               departs_at:'17:00', bus_type:'ordinary',  is_last_bus:false },
  { id:21, corridor_id:2, direction:'outbound', origin_tamil:'பண்ணைப்புரம்', dest_tamil:'கம்பம்',               departs_at:'19:30', bus_type:'ordinary',  is_last_bus:true  },
  // Kamban side inbound
  { id:22, corridor_id:2, direction:'inbound',  origin_tamil:'கம்பம்',       dest_tamil:'பண்ணைப்புரம்',         departs_at:'07:00', bus_type:'ordinary',  is_last_bus:false },
  { id:23, corridor_id:2, direction:'inbound',  origin_tamil:'கம்பம்',       dest_tamil:'பண்ணைப்புரம்',         departs_at:'09:00', bus_type:'ordinary',  is_last_bus:false },
  { id:24, corridor_id:2, direction:'inbound',  origin_tamil:'கம்பம்',       dest_tamil:'பண்ணைப்புரம்',         departs_at:'11:30', bus_type:'ordinary',  is_last_bus:false },
  { id:25, corridor_id:2, direction:'inbound',  origin_tamil:'கம்பம்',       dest_tamil:'பண்ணைப்புரம்',         departs_at:'15:00', bus_type:'ordinary',  is_last_bus:false },
  { id:26, corridor_id:2, direction:'inbound',  origin_tamil:'கம்பம்',       dest_tamil:'பண்ணைப்புரம்',         departs_at:'18:00', bus_type:'ordinary',  is_last_bus:false },
  { id:27, corridor_id:2, direction:'inbound',  origin_tamil:'கம்பம்',       dest_tamil:'பண்ணைப்புரம்',         departs_at:'20:45', bus_type:'ordinary',  is_last_bus:true  },
];

const EMERGENCY_CONTACTS = [
  // Power
  { id:1,  category:'power',     name_tamil:'TNEB உள்ளூர் புகார்',        name_english:'TNEB Local Complaint',     phone:'94987 94987', is_national:false, is_verified:true,  display_order:1  },
  { id:2,  category:'power',     name_tamil:'TNEB தேசிய புகார் எண்',      name_english:'TNEB National Fault Line',  phone:'1912',        is_national:true,  is_verified:true,  display_order:2  },
  // Medical
  { id:3,  category:'medical',   name_tamil:'ஆம்புலன்ஸ்',                 name_english:'Ambulance',                 phone:'108',         is_national:true,  is_verified:true,  display_order:3  },
  { id:4,  category:'medical',   name_tamil:'PTV மருத்துவமனை — அவசரம்',  name_english:'PTV Hospital — Casualty',   phone:'04546-XXXXXX',is_national:false, is_verified:false, display_order:4  },
  // Police
  { id:5,  category:'police',    name_tamil:'காவல்',                       name_english:'Police',                    phone:'100',         is_national:true,  is_verified:true,  display_order:5  },
  { id:6,  category:'police',    name_tamil:'பண்ணைப்புரம் காவல் நிலையம்', name_english:'Pannaipuram Police Station', phone:'XXXXXXX',    is_national:false, is_verified:false, display_order:6  },
  // Fire
  { id:7,  category:'fire',      name_tamil:'தீயணைப்பு',                  name_english:'Fire Station',              phone:'101',         is_national:true,  is_verified:true,  display_order:7  },
  // Panchayat
  { id:8,  category:'panchayat', name_tamil:'பண்ணைப்புரம் பஞ்சாயத்து',   name_english:'Pannaipuram Panchayat',     phone:'XXXXXXX',     is_national:false, is_verified:false, display_order:8  },
  { id:9,  category:'panchayat', name_tamil:'தண்ணீர் வாரியம்',             name_english:'Water Board',               phone:'XXXXXXX',     is_national:false, is_verified:false, display_order:9  },
];

// Verified streets (just Valluvar for now — others will be added)
const STREETS = [
  { id:1,  name_tamil:'வள்ளுவர் தெரு',        name_english:'Valluvar Street',       ward_id:1 },
  { id:2,  name_tamil:'காந்தி தெரு',           name_english:'Gandhi Street',          ward_id:1 },
  { id:3,  name_tamil:'அம்பேத்கர் தெரு',       name_english:'Ambedkar Street',        ward_id:2 },
  { id:4,  name_tamil:'நேதாஜி தெரு',           name_english:'Netaji Street',          ward_id:2 },
  { id:5,  name_tamil:'கலைஞர் தெரு',           name_english:'Kalaignar Street',       ward_id:3 },
  { id:6,  name_tamil:'பெரியார் தெரு',         name_english:'Periyar Street',         ward_id:3 },
  { id:7,  name_tamil:'இந்திரா நகர்',          name_english:'Indira Nagar',           ward_id:4 },
  { id:8,  name_tamil:'ராஜாஜி தெரு',           name_english:'Rajaji Street',          ward_id:4 },
  { id:9,  name_tamil:'காமராஜர் தெரு',         name_english:'Kamarajar Street',       ward_id:5 },
  { id:10, name_tamil:'மேட்டுத் தெரு',         name_english:'Mettu Street',           ward_id:5 },
];

const WATER_SCHEDULES = [
  { street_id:1, street_name_tamil:'வள்ளுவர் தெரு', frequency_days:3, supply_time:'06:00', last_supply_date: getTodayMinus(1), notes_tamil:'ஒவ்வொரு 3 நாளுக்கு ஒரு முறை — காலை 6 மணி' },
];

function getTodayMinus(days) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().split('T')[0];
}

function getNextWaterDate(lastDate, frequencyDays) {
  const d = new Date(lastDate);
  d.setDate(d.getDate() + frequencyDays);
  return d.toISOString().split('T')[0];
}

// In-memory water alerts for demo
let waterAlerts = [];

// ─────────────────────────────────────────────────────
// ROUTES
// ─────────────────────────────────────────────────────

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', app: 'பண்ணைப்புரம்', version: '1.0.0-demo', mode: 'demo' });
});

// ── Water ────────────────────────────────────────────

app.get('/api/water/schedule/:streetId', (req, res) => {
  const sid = parseInt(req.params.streetId);
  const schedule = WATER_SCHEDULES.find(s => s.street_id === sid);
  if (!schedule) {
    return res.json({ success: true, data: null, message: 'அட்டவணை இல்லை — soon' });
  }
  const next = getNextWaterDate(schedule.last_supply_date, schedule.frequency_days);
  res.json({ success: true, data: { ...schedule, next_supply_date: next } });
});

app.get('/api/water/alerts', (req, res) => {
  const recent = waterAlerts.slice(-20).reverse();
  res.json({ success: true, data: recent });
});

app.post('/api/water/alert', (req, res) => {
  const { street_id, device_id } = req.body;
  const street = STREETS.find(s => s.id === street_id) || { name_tamil: 'அறியப்படாத தெரு' };
  const alert = {
    id: waterAlerts.length + 1,
    street_id,
    street_name_tamil: street.name_tamil,
    device_id: device_id || 'demo',
    reported_at: new Date().toISOString(),
    confirmations: 0
  };
  waterAlerts.push(alert);
  res.json({ success: true, data: alert, message: 'தண்ணீர் வந்தது அறிவிப்பு அனுப்பப்பட்டது!' });
});

app.get('/api/water/streets', (req, res) => {
  res.json({ success: true, data: STREETS });
});

// ── Power ────────────────────────────────────────────

app.get('/api/power/cuts', (req, res) => {
  // Demo: no active cuts today
  res.json({
    success: true,
    data: [],
    status: 'clear',
    message_tamil: 'இன்று மின் தடை இல்லை',
    message_english: 'No power cuts today'
  });
});

app.get('/api/power/status', (req, res) => {
  res.json({
    success: true,
    status: 'on',
    message_tamil: 'மின்சாரம் இயங்குகிறது',
    next_cut: null
  });
});

// ── Bus ──────────────────────────────────────────────

app.get('/api/bus/corridors', (req, res) => {
  res.json({ success: true, data: BUS_CORRIDORS });
});

app.get('/api/bus/timings/:corridorId', (req, res) => {
  const cid = parseInt(req.params.corridorId);
  const timings = BUS_TIMINGS.filter(t => t.corridor_id === cid);
  res.json({ success: true, data: timings });
});

app.get('/api/bus/next', (req, res) => {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  function timeToMinutes(t) {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
  }

  const result = BUS_CORRIDORS.map(corridor => {
    const outbound = BUS_TIMINGS.filter(t => t.corridor_id === corridor.id && t.direction === 'outbound');
    const next = outbound.find(t => timeToMinutes(t.departs_at) > currentMinutes);
    const minutesAway = next ? timeToMinutes(next.departs_at) - currentMinutes : null;
    return {
      corridor_id: corridor.id,
      name_tamil: corridor.name_tamil,
      name_english: corridor.name_english,
      color_hex: corridor.color_hex,
      next_bus: next ? next.departs_at : null,
      minutes_away: minutesAway,
      dest_tamil: next ? next.dest_tamil : null,
      is_last_bus: next ? next.is_last_bus : false
    };
  });

  res.json({ success: true, data: result });
});

// ── Hospital ─────────────────────────────────────────

app.get('/api/hospital/info', (req, res) => {
  res.json({ success: true, data: HOSPITAL });
});

app.get('/api/hospital/doctors', (req, res) => {
  res.json({ success: true, data: DOCTORS });
});

app.get('/api/hospital/doctors/today', (req, res) => {
  const dayOfWeek = new Date().getDay(); // 0=Sun, 3=Wed
  const available = DOCTORS.filter(d =>
    d.schedule.some(s => s.day === dayOfWeek)
  ).map(d => ({
    ...d,
    today_schedule: d.schedule.find(s => s.day === dayOfWeek)
  }));
  res.json({ success: true, data: available, day: dayOfWeek });
});

// ── Emergency ────────────────────────────────────────

app.get('/api/emergency/contacts', (req, res) => {
  const grouped = EMERGENCY_CONTACTS.reduce((acc, c) => {
    if (!acc[c.category]) acc[c.category] = [];
    acc[c.category].push(c);
    return acc;
  }, {});
  res.json({ success: true, data: grouped });
});

// ── Devices (FCM — stub for demo) ────────────────────

app.post('/api/devices/register', (req, res) => {
  res.json({ success: true, message: 'Device registered (demo mode — FCM disabled)' });
});

// ─────────────────────────────────────────────────────
// START
// ─────────────────────────────────────────────────────

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log('');
  console.log('╔══════════════════════════════════════════════════╗');
  console.log('║   பண்ணைப்புரம் Demo Backend — Running!          ║');
  console.log(`║   http://localhost:${PORT}/health                   ║`);
  console.log('╚══════════════════════════════════════════════════╝');
  console.log('');
  console.log('Endpoints ready:');
  console.log(`  GET  /api/bus/next`);
  console.log(`  GET  /api/bus/corridors`);
  console.log(`  GET  /api/bus/timings/1  (Bodi)`);
  console.log(`  GET  /api/bus/timings/2  (Kamban)`);
  console.log(`  GET  /api/hospital/info`);
  console.log(`  GET  /api/hospital/doctors`);
  console.log(`  GET  /api/hospital/doctors/today`);
  console.log(`  GET  /api/emergency/contacts`);
  console.log(`  GET  /api/water/streets`);
  console.log(`  GET  /api/water/schedule/1`);
  console.log(`  POST /api/water/alert`);
  console.log(`  GET  /api/power/status`);
  console.log('');
  console.log('⚠️  Demo mode: push notifications disabled, data is placeholder');
});
