# பண்ணைப்புரம் — Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      USER LAYER                             │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  📱 PWA (Vanilla JS)           🤖 Flutter (Android)         │
│  • app.pannaipuram.com         • Native APK                 │
│  • Bus · Auto · Hospital        • Offline-first cache       │
│  • Emergency · More             • SharedPreferences         │
│  • 277 users, 109 installed     • Pull-to-refresh           │
│                                                              │
│  Responsive: 430px → 1280px                                │
│  • Phone: 44px hamburger        • Tablet/Web: 62px button   │
│  • Single column                • Multi-column grids        │
│                                                              │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    CDN / API LAYER                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  GitHub Pages (Static Shell)    Render (Dynamic API)        │
│  • app.pannaipuram.com          • api.pannaipuram.com       │
│  • PWA index.html, CSS, JS      • Node.js + Express         │
│  • Icons, manifests             • REST endpoints            │
│  • Load: <100ms (CDN)           • Batch endpoints           │
│  • Never sleeps                 • Auto-refresh support      │
│                                                              │
│  Service Worker (3-tier cache)                              │
│  • Network-first for /api/*                                 │
│  • Cache-first for shell (.html/.css/.js)                  │
│  • Background sync for feedback                             │
│                                                              │
│  API Rate Limiting (Render)                                 │
│  • /api/feedback: 30 req/10min/IP                          │
│  • /api/pwa/ping: 30 req/10min/IP                          │
│  • /api/water/alert: 30 req/10min/IP                       │
│                                                              │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    DATA LAYER                               │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Supabase (PostgreSQL)          Admin Panel (React + MUI)   │
│  • Bus timings & corridors      • admin.pannaipuram.com     │
│  • Doctor schedules (by hosp)   • Manage all data           │
│  • Auto driver profiles         • User RBAC (super/admin)   │
│  • Emergency contacts           • Analytics dashboard       │
│  • Local services               • Feedback review           │
│  • PWA visitor analytics        • Acting drivers            │
│  • User feedback/registration   • Announcements             │
│                                                              │
│  Region: Asia-Pacific (Singapore)                           │
│  JWT auth, RLS on public tables                             │
│                                                              │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                   INFRASTRUCTURE                            │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Cloudflare (DNS + SSL)                                     │
│  • app.pannaipuram.com → GitHub Pages                       │
│  • api.pannaipuram.com → Render (CNAME)                     │
│  • admin.pannaipuram.com → Render (CNAME)                   │
│  • Redirect pannaipuram.com → app.pannaipuram.com           │
│  • SSL/TLS for all domains                                  │
│                                                              │
│  GitHub (Version Control + PWA Deploy)                      │
│  • Repo: VenthanGowthamS/Pannaipuram                        │
│  • Workflow: deploy-pwa.yml (on pwa/** changes)            │
│  • Auto-sed rewrites /pwa/ → ./ for base path              │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Data Flow

### 1. User Opens App

```
User tap → PWA loads from GitHub Pages (<100ms)
       ↓
Service Worker intercepts
       ↓
Cached shell? Return instantly
       ↓
Fetch live data from Render API in background
       ↓
Data arrives → Service Worker caches it
       ↓
Next visit: cached data + background refresh
```

### 2. User Submits Feedback / Registration

```
User fills form (bus timing correction, auto registration, etc.)
       ↓
offline-first: stored in localStorage if network fails
       ↓
POST /api/feedback (rate-limited, 30 req/10min/IP)
       ↓
Render API validates + inserts into Supabase
       ↓
Admin notified (in Announcements/Feedback tabs)
       ↓
Data live within seconds
```

### 3. Admin Updates Data

```
Admin logs in → admin.pannaipuram.com
       ↓
Edits bus timings, doctor schedules, announcements, etc.
       ↓
Updates stored in Supabase
       ↓
PWA fetches fresh data on next app open (within 10 min)
       ↓
Service Worker caches new version
       ↓
All users see updates on next visit
```

---

## Performance Metrics

| Metric | Target | Actual |
|---|---|---|
| **Initial Load** | <1s | ~500ms (GitHub Pages CDN) |
| **Time to Interactive** | <3s | ~1.2s (cached shell) |
| **API Response** | <1s | ~400–600ms (Render wake-up) |
| **Offline-first fallback** | immediate | instant (localStorage) |
| **Cache strategy** | 3-tier | SW → memory → localStorage ✅ |

---

## Tech Stack Layers

### Frontend (PWA)

- **Vanilla JavaScript** — no framework overhead
- **CSS3** (Flexbox, Grid, Media Queries)
- **Service Worker** — offline-first caching
- **Responsive design:** 430px–1280px (mobile → desktop)
- **Tamil fonts:** Noto Sans Tamil (18sp+ for readability)

### Frontend (Flutter APK)

- **Dart** — compiled to native Android
- **Material Design** — familiar mobile UI
- **SharedPreferences** — offline cache
- **Pull-to-refresh** — user-driven updates

### Backend (API)

- **Node.js** (v18+)
- **Express.js** — REST API
- **Supabase SDK** — PostgreSQL client
- **express-rate-limit** — DDoS protection
- **CORS** — `*.pannaipuram.{com,in}` + `*.github.io`

### Database (Supabase)

- **PostgreSQL** — relational data
- **JWT auth** — stateless sessions
- **RLS** — row-level security on public tables
- **Migrations** — versioned schema changes

### Admin UI (React)

- **React** — component-based
- **MUI (Material-UI)** — design consistency
- **Vite** — fast build tooling
- **axios** — API client

### Infrastructure

- **GitHub Pages** — static PWA hosting (CDN)
- **Render** — Node.js API hosting (free tier)
- **Supabase Cloud** — managed PostgreSQL (Asia-Pacific Singapore)
- **Cloudflare** — DNS, SSL, domain routing

---

## Cache Strategy (Service Worker)

```
Request arrives
       ↓
Is it /api/* ?
  YES → Network-first (try live, fallback to cache)
  NO  → Cache-first (shell assets: .html/.css/.js)
       ↓
Missing → localStorage backup
       ↓
Still missing → hardcoded fallback (emergency contacts, etc.)
```

**Current cache version:** `pannai-pwa-v60`

Every app release bumps both:
- `CACHE` in `pwa/sw.js`
- `CACHE_VERSION` in `pwa/js/api.js`

---

## Security

- **HTTPS everywhere** — Cloudflare SSL
- **CORS scoped** — only allow known origins
- **Rate limiting** — 30 req/10min/IP on public endpoints
- **XSS prevention** — all user input escaped before innerHTML
- **JWT validation** — on admin routes
- **RLS** — database rows protected by user role (super_admin, admin, viewer)

---

## Deployment

### PWA (GitHub Pages)

1. Push to `main` with `pwa/**` changes
2. GitHub Actions runs `.github/workflows/deploy-pwa.yml`
3. Sed rewrites `/pwa/` → `./` (GitHub Pages base path)
4. Files sync to `gh-pages` branch
5. Live at `app.pannaipuram.com` in <2 min

### Backend (Render)

1. Push to `main` with `backend/**` changes
2. Render webhook auto-deploys from GitHub
3. ENV vars (JWT_SECRET, DATABASE_URL) from Render dashboard
4. Live at `api.pannaipuram.com` in <1 min

### Admin UI (Render)

1. Build locally: `npm run build` in `admin-ui/`
2. Output goes to `backend/public/admin-v2/`
3. Push to `main`
4. Render serves static files from `backend/public/`
5. Live at `admin.pannaipuram.com` in <1 min

---

## Scaling Considerations

**Current load:** 12–29 daily active users, ~2,700 total visits

**Bottlenecks:** None observed yet

**If scaling to 1,000 users:**
- Render free tier can handle ~100 req/s; upgrade to paid tier
- Supabase free tier can handle moderate queries; upgrade database
- GitHub Pages unlimited bandwidth (current: ~50MB/day PWA)

**If scaling to 10,000+ users:**
- Move API to dedicated Node.js server (AWS, DigitalOcean)
- Add caching layer (Redis) for popular queries
- Scale database read replicas
- CDN for API endpoints

---

## Monitoring

- **Uptime:** UptimeRobot (5-min pings) — not yet active
- **Analytics:** PWA visitor stats in admin panel (daily uniques, install counts)
- **Errors:** Service Worker offline logs (localStorage)
- **Feedback:** User reports via /api/feedback (admin dashboard)

---

*Last updated: July 2026 — v60 (hamburger responsive fix)*
