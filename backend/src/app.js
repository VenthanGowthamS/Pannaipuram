require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const helmet  = require('helmet');
const path    = require('path');

// Routes — Mobile API
const waterRoutes     = require('./routes/water');
const powerRoutes     = require('./routes/power');
const busRoutes       = require('./routes/bus');
const hospitalRoutes  = require('./routes/hospital');
const emergencyRoutes = require('./routes/emergency');
const autoRoutes      = require('./routes/auto');
const deviceRoutes    = require('./routes/devices');
const servicesRoutes       = require('./routes/services');
const announcementsRoutes  = require('./routes/announcements');
const feedbackRoutes       = require('./routes/feedback');

// Routes — Admin API
const adminAuthRoutes     = require('./routes/admin/auth');
const adminPowerRoutes    = require('./routes/admin/power');
const adminWaterRoutes    = require('./routes/admin/water');
const adminBusRoutes      = require('./routes/admin/bus');
const adminHospitalRoutes = require('./routes/admin/hospital');
const adminContactRoutes  = require('./routes/admin/contacts');
const adminStreetRoutes   = require('./routes/admin/streets');
const adminAutoRoutes     = require('./routes/admin/auto');
const adminServicesRoutes       = require('./routes/admin/services');
const adminAnnouncementsRoutes  = require('./routes/admin/announcements');
const adminFeedbackRoutes       = require('./routes/admin/feedback');

// Services
const { startWaterScheduler } = require('./services/waterScheduler');

const app = express();

// ── Environment Validation ───────────────────────────────
const requiredEnvVars = ['JWT_SECRET', 'DATABASE_URL'];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`FATAL: ${envVar} environment variable is not set`);
    process.exit(1);
  }
}

// ── Middleware ──────────────────────────────────────────
app.use(helmet({ contentSecurityPolicy: false })); // CSP off so admin HTML loads

// ── Serve Admin Panel (static — before CORS so module scripts load) ──
app.use('/admin/v2', express.static(path.join(__dirname, '../public/admin-v2')));
// Redirect old v1 URL and /admin shortcut to v2
app.get('/admin/panel', (req, res) => res.redirect('/admin/v2/'));
app.get('/admin', (req, res) => res.redirect('/admin/v2/'));

// ── Serve PWA (static) ──────────────────────────────────────
app.use('/pwa', express.static(path.join(__dirname, '../../pwa')));
app.get('/', (req, res) => res.redirect('/pwa/'));

// CORS — restrict origins in production
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
  : [];
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, server-to-server)
    if (!origin) return callback(null, true);
    // In development, allow all origins
    if (process.env.NODE_ENV !== 'production') return callback(null, true);
    // In production, check whitelist
    if (allowedOrigins.includes(origin)) return callback(null, true);
    // Allow same-origin requests (admin panel JS modules)
    if (origin === `https://${process.env.RENDER_EXTERNAL_HOSTNAME}`) return callback(null, true);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

app.use(express.json());

// ── Mobile API Routes ───────────────────────────────────
app.use('/api/water',     waterRoutes);
app.use('/api/power',     powerRoutes);
app.use('/api/bus',       busRoutes);
app.use('/api/hospital',  hospitalRoutes);
app.use('/api/emergency', emergencyRoutes);
app.use('/api/auto',      autoRoutes);
app.use('/api/devices',   deviceRoutes);
app.use('/api/services',       servicesRoutes);
app.use('/api/announcements',  announcementsRoutes);
app.use('/api/feedback',       feedbackRoutes);

// ── Admin API Routes ────────────────────────────────────
app.use('/admin/auth',     adminAuthRoutes);
app.use('/admin/power',    adminPowerRoutes);
app.use('/admin/water',    adminWaterRoutes);
app.use('/admin/bus',      adminBusRoutes);
app.use('/admin/hospital', adminHospitalRoutes);
app.use('/admin/contacts', adminContactRoutes);
app.use('/admin/streets',  adminStreetRoutes);
app.use('/admin/auto',     adminAutoRoutes);
app.use('/admin/services',      adminServicesRoutes);
app.use('/admin/announcements', adminAnnouncementsRoutes);
app.use('/admin/feedback',      adminFeedbackRoutes);

// ── Health Check ────────────────────────────────────────
const { query: dbQuery } = require('./db/pool');
app.get('/health', async (req, res) => {
  try {
    const result = await dbQuery('SELECT NOW() as time, current_database() as db');
    res.json({
      status: 'ok',
      app: 'பண்ணைப்புரம்',
      version: '1.0.0',
      db: 'connected',
      db_time: result.rows[0].time,
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      app: 'பண்ணைப்புரம்',
      db: 'disconnected',
    });
  }
});

// ── Start Background Services ───────────────────────────
// Note: TNEB scraper removed — TNEB does not provide a public API/stable URL.
// Power cuts are entered manually via the Admin Panel.
startWaterScheduler();

// ── Start Server ────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`பண்ணைப்புரம் backend running on port ${PORT}`);
});

module.exports = app;
