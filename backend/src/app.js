require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const helmet  = require('helmet');

// Routes — Mobile API
const waterRoutes     = require('./routes/water');
const powerRoutes     = require('./routes/power');
const busRoutes       = require('./routes/bus');
const hospitalRoutes  = require('./routes/hospital');
const emergencyRoutes = require('./routes/emergency');
const deviceRoutes    = require('./routes/devices');

// Routes — Admin API
const adminAuthRoutes     = require('./routes/admin/auth');
const adminPowerRoutes    = require('./routes/admin/power');
const adminWaterRoutes    = require('./routes/admin/water');
const adminBusRoutes      = require('./routes/admin/bus');
const adminHospitalRoutes = require('./routes/admin/hospital');
const adminContactRoutes  = require('./routes/admin/contacts');

// Services
const { startTnebScraper }     = require('./services/tnebScraper');
const { startWaterScheduler }  = require('./services/waterScheduler');

const app = express();

// ── Middleware ──────────────────────────────────────────
app.use(helmet());
app.use(cors());
app.use(express.json());

// ── Mobile API Routes ───────────────────────────────────
app.use('/api/water',     waterRoutes);
app.use('/api/power',     powerRoutes);
app.use('/api/bus',       busRoutes);
app.use('/api/hospital',  hospitalRoutes);
app.use('/api/emergency', emergencyRoutes);
app.use('/api/devices',   deviceRoutes);

// ── Admin API Routes ────────────────────────────────────
app.use('/admin/auth',     adminAuthRoutes);
app.use('/admin/power',    adminPowerRoutes);
app.use('/admin/water',    adminWaterRoutes);
app.use('/admin/bus',      adminBusRoutes);
app.use('/admin/hospital', adminHospitalRoutes);
app.use('/admin/contacts', adminContactRoutes);

// ── Health Check ────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'ok', app: 'பண்ணைப்புரம்', version: '1.0.0' });
});

// ── Start Background Services ───────────────────────────
startTnebScraper();
startWaterScheduler();

// ── Start Server ────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`பண்ணைப்புரம் backend running on port ${PORT}`);
});

module.exports = app;
