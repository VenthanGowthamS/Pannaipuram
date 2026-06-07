# பண்ணைப்புரம் App — Requirements Document
### Pannaipuram App — Your Village Information Centre

> **Version:** 4.9 (PWA v39 — custom domain live, Emergency Contacts tab, About village stats)
> **Date:** June 2026
> **Status:** PWA v39 live on the **custom domain**:
> - 🌟 **https://app.pannaipuram.com** (primary — share `?install=1` on WhatsApp)
> - 🔗 API: https://api.pannaipuram.com · 🛠 Admin: https://admin.pannaipuram.com
> - Legacy (still work): https://venthangowthams.github.io/Pannaipuram/ · https://pannaipuram-api.onrender.com
>
> `pannaipuram.com` bought on Cloudflare Registrar (June 2026). Phase 11 (custom
> domain migration) **COMPLETE** — see `docs/domain-and-hosting-plan.md`.

### PWA Recent Changes (v14 → v39, April–June 2026)

#### v38–v39 — Custom domain + Emergency tab (June 2026)
| Feature | Status |
|---|---|
| `pannaipuram.com` bought (Cloudflare Registrar) — app/api/admin subdomains live with SSL | ✅ v38 |
| `pwa/CNAME` = `app.pannaipuram.com`; `API_BASE` routes app.→api.pannaipuram.com | ✅ v38 |
| CORS allows `*.pannaipuram.{com,in}`; hostname-aware root redirect (admin→/admin/v2, api→JSON) | ✅ v38–39 |
| **Emergency Contacts** — new 3rd bottom-nav tab (📞 அவசரம்), grouped one-tap call cards | ✅ v39 |
| **About village stats** — population/households/wards/streets/cardamom in ☰ About sheet | ✅ v39 |
| Bottom nav `grid-auto-flow:column` (auto-fits 3 tabs); XSS-safe esc() in emergency.js | ✅ v39 |
| Cache bump v37 → v39 (`pannai-pwa-v39` / `pannai-v39`) | ✅ v39 |

#### v37 — Hosting & infrastructure (May 2026)
| Feature | Status |
|---|---|
| GitHub Pages deploy via `.github/workflows/deploy-pwa.yml` | ✅ v37 |
| Auto-rewrite `/pwa/` → `./` paths for GitHub Pages base path | ✅ v37 |
| `API_BASE` auto-detects github.io / pages.dev / netlify hostname | ✅ v37 |
| Backend CORS auto-allows `*.github.io` origins | ✅ v37 |
| Render cold-start fix: 2.5s network timeout → cached fallback | ✅ v34 |
| `apiFetch` stale-while-revalidate at app level (memory + localStorage) | ✅ v34 |
| Domain & hosting plan documented (`docs/domain-and-hosting-plan.md`) | ✅ |

#### v35–v36 — One-tap install from WhatsApp share link
| Feature | Status |
|---|---|
| Install wall (`?install=1` URL param) — full-screen install overlay | ✅ v35 |
| Bouncing 👇 arrow + pulsing yellow button with glow ring | ✅ v36 |
| Tamil CTA: "இந்த button-ஐ click பண்ணுங்க!" | ✅ v36 |
| Skip button cleans URL → app loads normally | ✅ v35 |
| Fallback to manual ⋮ steps if no `beforeinstallprompt` after 4s | ✅ v35 |
| One-click Android native install button inside in-app banner | ✅ v34 |

#### v32–v34 — Bus section improvements
| Feature | Status |
|---|---|
| Bigger timetable times (1rem → 1.25rem/800) + bigger icon | ✅ v32 |
| Operator names (Jeyamurugan/PPP/SETC) on all bus types | ✅ v32 |
| Skip gap warning for Chennai night service (one-bus-per-night) | ✅ v32 |
| Bus type chip on collapsed route card | ✅ v33 |
| Bus type chip on "Leaving soon" strip cards | ✅ v34 |
| Long-distance routes never show "டவுன் பஸ்" (Trichy/Palani fix) | ✅ v34 |

#### v27–v31 — Bus card simplification, Auto redesign, Tamil copy
| Feature | Status |
|---|---|
| Bus card simplified — destination + time + countdown only (Steve Jobs UX) | ✅ v31 |
| Route chain ("via") moved to expanded view, alt routes behind toggle | ✅ v31 |
| Driver name truncation with ellipsis (call btn no overlap) | ✅ v30 |
| `phone_verified` flag for auto drivers — admin toggle + PWA "விரைவில்" | ✅ v29 |
| Auto section redesign: amber #F59E0B + charcoal #1C1C1E + green call | ✅ v28 |
| Bus group renames: உள்ளூர் பயணம் / தொலைதூர பயணம் / சென்னை இரவு | ✅ v27 |
| Updated About / Feedback / How-to-use Tamil copy | ✅ v29 |
| Indian mobile phone validation (10 digits, 6/7/8/9 start) | ✅ v27 |

#### v14–v26 — Earlier (April 2026)
| Feature | Status |
|---|---|
| Hamburger menu (Feedback / About / How-to-use / Install) | ✅ v21 |
| Auto + Bus section refresh button ↻ | ✅ v21/v23 |
| Bus title centered (no hamburger overlap) | ✅ v23 |
| PWA visitor analytics (pwa_visits table + admin stats tab) | ✅ v21 |
| Admin PWA Stats tab (unique users, daily, recent 20) | ✅ v21 |
| Auto-hero redesign — black body + yellow ring (TN auto style) | ✅ v21 |
| APK-style feedback form (intro card, hints, success 🙏) | ✅ v22 |
| Permanent cache fix — network-first for HTML/CSS/JS | ✅ v22 |
| Auto-update installed PWAs (SKIP_WAITING + controllerchange reload) | ✅ v23 |
| Android install banner — beforeinstallprompt captured pre-DOM | ✅ v25 |
| Install sheet in hamburger with native button + iOS steps | ✅ v24 |
| Manifest: separate any + maskable icon entries (Chrome requirement) | ✅ v25 |
| Fix install banner after PWA uninstall (clear stale localStorage) | ✅ v26 |
| Remove developer name from About section | ✅ v22 |
> **Tagline:** உங்கள் ஊரின் தகவல் மையம் *(Your Village's Information Centre)*

---

## 1. The Problem We Are Solving

People in Pannaipuram face five daily frustrations that have no easy solution today:

| # | Daily Pain | Current Situation |
|---|---|---|
| 1 | Power cut — why? how long? who to call? | No local info. People guess or ask neighbours |
| 2 | Panchayat water — has it come yet? | People waste water waiting, miss it entirely |
| 3 | Bus to Thevaram / Uthamapalayam — what time? | No timetable available, people miss buses |
| 4 | PTV Padmavathy Hospital — which doctor, what time? | No online listing, people go and come back |
| 5 | Emergency numbers — who do I call right now? | Scattered, not in Tamil, hard to find |

**Every single problem above affects someone in Pannaipuram every single day.**

This app is not for the internet. It is for Pannaipuram.

---

## 2. About Pannaipuram (From Wikipedia)

| Detail | Value |
|---|---|
| District | தேனி (Theni) |
| Taluk | உத்தமபாளையம் (Uthamapalayam) |
| Type | Town Panchayat — பேரூராட்சி |
| Population | ~9,323 (2011 Census) |
| Households | 1,719 |
| Wards | 15 வார்டுகள் (15 Wards) |
| Streets | 57 தெருக்கள் (57 Streets) |
| Area | 15.36 sq km |
| Pincode | 625524 |
| Distance to Uthamapalayam | 11 km |
| Distance to Theni (HQ) | 32 km |
| Assembly Constituency | கம்பம் (Cumbum) |
| Lok Sabha | தேனி (Theni) |
| Known For | Cardamom estate region — ஏலக்காய் தோட்டம் |
| Transport | Public bus, private bus |

**What this tells us for the app:**
- **57 streets pre-loaded** in the water alert module — users select their exact street, no typing needed
- **15 wards** can be used as area groupings for power cut and water alerts
- **Cardamom estates** — many users are estate workers/farmers, confirming agricultural context
- Kamban Assembly constituency — validates our கம்பம் bus corridor as primary route

---

## 3. Product Identity

**App Name:** பண்ணைப்புரம் (Pannaipuram)
**Tagline:** உங்கள் ஊரின் தகவல் மையம்
**Platforms:**
- Android APK (Flutter — no Play Store required)
- PWA / Web App (Bus + Auto + Emergency — works on iPhone Safari, Android Chrome, Mac)
**PWA URL:** https://app.pannaipuram.com
**Distribution:** QR Code → WhatsApp share (both APK link and PWA URL)
**Language:** Tamil primary, small English label below every element
**Target Users:** All 1,719 households across 57 streets of Pannaipuram
**Estimated Download Target:** 500 users (29% household penetration in Year 1)

---

## 4. The Five Modules

---

### Module 1 — மின்சாரம் (Power / Electricity)

**The Pain:** When a power cut happens, nobody knows if it is planned maintenance, a fault, or something bigger. People don't know who to call or when power will return.

**What the App Does:**
- Shows TNEB scheduled maintenance cuts for the Pannaipuram area (fetched from TNEB portal)
- Clearly labels: "திட்டமிட்டது" (Planned) vs "கோளாறு" (Fault/Unplanned)
- Shows estimated restoration time when available
- One-tap call to local TNEB complaint number: **94987 94987**
- One-tap call to TNEB national fault reporting line (1912)
- Push notification: "Tomorrow 9am–1pm power cut for maintenance in your area"
- Admin can manually post alerts when TNEB info is unavailable

**Data Source:**
- TNEB website scraping / RSS feed for scheduled cuts
- Manual admin entry as fallback
- User-reported: "Power is back in my street" community confirmation

---

### Module 2 — தண்ணீர் (Water Supply Alert)

**The Pain:** Panchayat water comes at irregular times. People miss it, waste it waiting, or don't know it came. One person on the street knowing means nothing if others are asleep or working.

**Important:** Each street has its own water supply schedule. Timings differ street by street. The app shows the schedule per street — not one timing for all of பண்ணைப்புரம்.

**Verified Water Schedules (street-by-street — to be collected)**

| தெரு (Street) | அலவு (Frequency) | நேரம் (Time) | Status |
|---|---|---|---|
| வள்ளுவர் தெரு (Valluvar Street) | ஒவ்வொரு 3 நாளுக்கு ஒரு முறை | காலை 6 மணி | ✅ Verified |
| மற்ற தெருக்கள் (Other streets) | TBC | TBC | ⏳ To collect |

**What the App Does:**
- User selects their street once during onboarding — app remembers it
- Shows their street's schedule: "அடுத்த தண்ணீர் — [date] காலை 6 மணி"
- Day-before reminder notification at night: "நாளை காலை 6 மணிக்கு தண்ணீர் வரும்!"
- Morning alert at 5:45 AM on water day: "15 நிமிடத்தில் தண்ணீர் வரும் — தயாராக இருங்கள்!"
- **Community Alert Button — the killer feature:**
  - Any resident taps "தண்ணீர் வந்தது!" (Water came!)
  - Everyone in Pannaipuram gets an instant push notification
  - Shows: which street/area reported it, what time
  - People can confirm: "Yes, came in my street too" ✅
- "தண்ணீர் வரவில்லை" (Water not arrived) flag — if nobody confirms by 7am on water day, app alerts to check or call panchayat
- Panchayat water board contact for complaints

**Why This Feature Is Unique:**
No app in India has a community water alert built for a specific village. This is the feature people will share on WhatsApp. One person alerts the street — everyone benefits. Water is not wasted.

**Data Source:**
- Community-powered (residents post alerts — zero cost, zero API)
- Admin sets baseline schedule
- Panchayat contact info entered manually

---

### Module 3 — பேருந்து (Bus Timings)

**The Pain:** People miss buses on both main corridors out of Pannaipuram because there is no timetable available in Tamil, in one place, that works without internet.

**Two Corridors — Two Directions:**

```
        ← போடி பக்கம் (Towards Bodi)
Thevaram → Bodi (Bodinayakkanur)

        → கம்பம் பக்கம் (Towards Kamban)
Uthamapalayam → Kamban
```

**What the App Does:**
- Complete offline timetable split clearly by direction:

  **போடி பக்கம் — Towards Bodi Side 🔵**
  - Pannaipuram → Thevaram → Bodi (Bodinayakkanur)
  - All departure times from Pannaipuram
  - Last bus time highlighted in red

  **கம்பம் பக்கம் — Towards Kamban Side 🟢**
  - Pannaipuram → Uthamapalayam → Kamban
  - All departure times from Pannaipuram
  - Last bus time highlighted in red

  **திரும்பி வர (Return — Inbound)**
  - Bodi → Thevaram → Pannaipuram
  - Kamban → Uthamapalayam → Pannaipuram

- Home screen shows: **next bus in each direction** at a glance
- "Next bus" widget — "போடி பக்கம் — 14 நிமிடம்" / "கம்பம் பக்கம் — 32 நிமிடம்"
- Set a reminder: "Alert me 15 minutes before the 7:45am Bodi bus"
- Last bus warning: push alert at 8pm — "கடைசி பேருந்து 1 மணி நேரத்தில்!"
- "Bus delayed / not running today" — admin or community can flag
- Notes: frequency, days of operation, express vs ordinary

**Data Source:**
- Manually collected from TNSTC schedule, local conductors, residents
- Stored locally in app — works 100% offline
- Admin updates when schedule changes (infrequent)

---

### Module 4 — PTV பத்மாவதி மருத்துவமனை (PTV Padmavathy Hospital)

**The Pain:** PTV Padmavathy Hospital is the best — often the only good — hospital available to Pannaipuram residents. But nobody knows which doctor is available on which day, what time OPD runs, or what departments exist. People travel there and come back without being seen.

**What the App Does:**
- Doctor listing with photo (optional), specialisation, and availability schedule

| Doctor | Specialisation | Days | Timing |
|---|---|---|---|
| டாக்டர் சேகர் (Dr. Sekar) | TBC | புதன்கிழமை (Wednesday) | காலை முதல் மாலை வரை (Morning to Evening) |
- Department / OPD timings clearly listed
- Emergency / casualty contact number — one tap to call
- Ambulance number — one tap to call
- Address with directions description (for those unfamiliar)
- "Is the doctor available today?" — quick day-based filter
- Health camp / special clinic announcements (admin posts)
- Pharmacy timings if applicable

**Why This Is the App's Secret Weapon:**
This information does not exist anywhere online. It cannot be scraped or fetched from the internet. It must be collected directly from the hospital — which Venthan will do personally. This hyper-local ground truth data is the moat. No competitor can replicate it without being from Pannaipuram.

**Data Source:**
- Manually collected by Venthan from PTV Padmavathy Hospital directly
- Admin panel to update when doctor schedule changes
- Hospital contact to be established for ongoing updates

---

### Module 5 — ஆட்டோ / வண்டி (Auto & Local Transport)

**The Pain:** Need local transport for short trips around Pannaipuram and nearby towns. No central place to find auto-rickshaw and van drivers.

**What the App Does:**
- List of local auto drivers with phone numbers — one tap to call
- Shared van services with schedules (e.g., morning departures to Uthamapalayam)
- Contact info for each driver/service
- Coverage area noted (e.g., "goes up to Kamban")
- If phone not yet added: shows "விரைவில்" (Coming soon) button with friendly snackbar
- Graceful offline fallback with placeholder contact names if API unreachable

**Data Source:**
- Manually collected from Pannaipuram residents
- Updated via admin panel (🚗 Auto/Van tab) — no APK rebuild needed
- API: `GET /api/auto/drivers` — admin CRUD at `/admin/auto/drivers`

---

### Module 6 — அவசர தொலைபேசி (Emergency Contacts)

**The Pain:** In a crisis — power fault, medical emergency, water problem — people don't have the right numbers and can't find them quickly in Tamil.

**What the App Does:**
- Single screen, large tap-to-call buttons in Tamil:
  - TNEB Local Complaint: 94987 94987 ✅ verified
  - TNEB National Fault Line: 1912
  - PTV Padmavathy Hospital — Casualty
  - PTV Padmavathy Hospital — Ambulance
  - Pannaipuram Panchayat Office
  - Panchayat Water Board
  - Nearest Police Station
  - Fire Station
  - Government PHC / nearest Govt Hospital
- All numbers work with one tap — no typing
- Available 100% offline
- Category tabs: மின்சாரம் | மருத்துவம் | போலீஸ் | பஞ்சாயத்து

**Data Source:**
- Manually collected and verified by Venthan from local sources
- Updated via admin panel — no API needed

---

## 5. Home Screen Design Concept — COMPLETE

```
┌─────────────────────────────────────┐
│  பண்ணைப்புரம் (cottage icon)     │
│  உங்கள் ஊரின் தகவல் மையம்         │
├─────────────────────────────────────┤
│  சொல்லுங்க, என்ன வேணும்?            │
│  (What do you need?)                │
├─────────────────────────────────────┤
│  Full-width rectangle tile, row 1:  │
│  🚌 அண்ணே, பஸ் எத்தன மணிக்கு?     │
│     Bus Times & Routes              │
├─────────────────────────────────────┤
│  Full-width rectangle tile, row 2:  │
│  🚗 சார், ஆட்டோ வேணுமா?           │
│     Auto & Car Transport            │
├─────────────────────────────────────┤
│  Full-width rectangle tile, row 3:  │
│  🏥 சிஸ்டர், டாக்டர் வந்துட்டாரா?   │
│     Hospital & Clinic               │
├─────────────────────────────────────┤
│  Full-width rectangle tile, row 4:  │
│  ⚡ அண்ணே, கரண்ட் எப்ப வரும்?     │
│     Electricity Status              │
├─────────────────────────────────────┤
│  Full-width rectangle tile, row 5:  │
│  💧 அக்கா, தண்ணி வந்துருச்சா?      │
│     Water Supply                    │
└─────────────────────────────────────┘
```

✅ **Status:** Full-width rectangle tiles (one per row), colloquial Tamil labels with English sub-labels below, cottage icon in header, no live status chips on home screen. Tile order: Bus → Auto → Hospital → Electricity → Water.

---

## 6. The Community Alert Flow (Water)

```
Resident A opens app
        ↓
Taps 💧 "தண்ணீர் வந்தது!" button
        ↓
App asks: "உங்கள் தெரு?" (Your street?)
[All 57 streets pre-loaded as a scrollable Tamil list]
        ↓
Resident A selects street → Confirms
        ↓
Push notification sent to ALL app users:
"💧 தண்ணீர் வந்தது! — North Street — 6:42am"
        ↓
Other residents open tap immediately
Water is not wasted
```

---

## 7. Data Strategy — What Comes From Where

| Module | Data Source | Online / Offline | Who Updates |
|---|---|---|---|
| Power cuts | TNEB portal scrape + Admin | Online fetch + offline cache | Auto + Admin |
| Water alerts | Community (residents) | Offline capable | Any resident |
| Bus timings | Manually collected from TNSTC / conductors | 100% Offline | Admin (rare) |
| Hospital doctors | Manually collected from hospital | 100% Offline | Admin |
| Emergency contacts | Manually collected | 100% Offline | Admin (rare) |

**Key insight:** 4 out of 5 modules require NO ongoing API or internet dependency. The data is stable, local, and manually sourced. This makes the app extremely cheap to run and highly reliable.

---

## 8. Non-Functional Requirements

| Requirement | Target |
|---|---|
| Primary language | Tamil (தமிழ்) |
| Secondary labels | Small English below Tamil |
| Offline capability | Modules 3, 4, 5 fully offline. Modules 1 & 2 cached |
| App size | Under 15 MB |
| Android support | Android 6.0+ (API 23) |
| Network tolerance | Works on 2G; no heavy assets |
| Font size | Minimum 18sp — readable by elderly |
| Accessibility | High contrast; large tap targets (min 48dp) |
| Push notifications | Firebase Cloud Messaging (FCM) — free tier |
| Launch time | Under 2 seconds |

---

## 9. Architecture — How Everything Connects

```
┌─────────────────────────────────────────────────────────────────┐
│                  500 Village Users                               │
│          Android phones in Pannaipuram                          │
└───────────────────────┬─────────────────────────────────────────┘
                        │ HTTPS (API calls)
                        ▼
┌─────────────────────────────────────────────────────────────────┐
│          Render.com — Node.js + Express Server                   │
│          https://pannaipuram-api.onrender.com                    │
│                                                                  │
│   /api/power/*     → Power cut status                           │
│   /api/water/*     → Water schedule + community alerts          │
│   /api/water/streets → All streets (for street picker)          │
│   /api/bus/*       → Bus timings (departure times from Pannaipuram stop) │
│   /api/hospital/*  → Doctors + schedules (by hospital_id)       │
│   /api/emergency/* → Emergency contacts                         │
│   /api/auto/*      → Auto/van driver list                       │
│   /admin/panel     → Admin web page (Venthan only)              │
│                                                                  │
│   Background jobs:                                               │
│   • TNEB scraper (every 6 hrs) — auto-adds power cuts           │
│   • Water scheduler — sends notifications on water days         │
└───────────────────────┬─────────────────────────────────────────┘
                        │ SQL queries (PostgreSQL)
                        ▼
┌─────────────────────────────────────────────────────────────────┐
│          Supabase — PostgreSQL Database                          │
│          Region: Asia-Pacific, Singapore                         │
│          Project: eoiaexdbnyzysolgwitw                           │
│                                                                  │
│   Tables:                                                        │
│   streets, wards          → 57 streets of Pannaipuram           │
│   power_cuts              → Planned + fault cuts                 │
│   power_restorations      → User reports "power back"           │
│   water_schedules         → Per-street water timing             │
│   water_alerts            → Community "water came" reports       │
│   bus_corridors           → 14 corridors from Pannaipuram       │
│   bus_routes, bus_timings → Departure times from Pannaipuram stop │
│   hospitals, doctors      → PTV (id=1) + SP Clinic (id=2)       │
│   doctor_schedules        → Which doctor, which day             │
│   emergency_contacts      → TNEB, police, fire, panchayat       │
│   auto_drivers            → Auto/van drivers + phone numbers    │
│   devices                 → FCM tokens for push notifications    │
│   admin_users             → Venthan's login (hashed password)   │
└─────────────────────────────────────────────────────────────────┘
                        ▲
                        │ Login + manage content
┌───────────────────────┴─────────────────────────────────────────┐
│          Admin Panel                                             │
│          https://pannaipuram-api.onrender.com/admin/panel        │
│          (Venthan only — JWT login)                              │
│                                                                  │
│   • Add / resolve power cuts                                     │
│   • Add bus departure times from Pannaipuram stop (per corridor) │
│   • Add doctors + weekly schedules (mapped to hospital)         │
│   • Add emergency contacts                                       │
│   • Add/edit auto/van drivers + phone numbers                   │
│   • Add streets (all 57)                                        │
└─────────────────────────────────────────────────────────────────┘

WHY SEPARATE SERVER AND DATABASE?
• Render (server) can restart/redeploy — any data stored there is lost
• Supabase (DB) is built for permanent data storage with backups
• Server = the worker that reads/writes. DB = the permanent filing cabinet.

WHY NOT STATIC DATA IN THE APP?
• If bus timings were hardcoded in the APK, changing one timing = rebuild + redistribute APK to 500 users
• With the API + admin panel, Venthan changes data in 30 seconds from any browser
• App fetches fresh data every time it opens
```

---

## 10. Distribution Plan

- APK hosted on Firebase App Distribution or a simple static link
- **QR code** generated and:
  - Printed on a paper notice at panchayat office, TNEB office, bus stand, hospital entrance
  - Shared in WhatsApp groups (panchayat group, residents groups)
- The water alert feature creates organic sharing: users share the app when they alert their street
- No Google Play account required for the end user to install

---

## 10. Technical Stack — DEPLOYED

| Layer | Choice | Status |
|---|---|---|
| Mobile App | Flutter (Dart) — Android APK | ✅ Built & Deployed |
| Local Storage | SharedPreferences (CacheService for offline) | ✅ Implemented — doctors & emergency cached |
| Push Notifications | Firebase Cloud Messaging (FCM) | ⏳ Deferred (scaffolded, not integrated yet) |
| **PWA Hosting (primary)** | **GitHub Pages — `venthangowthams.github.io/Pannaipuram/`** | ✅ Live (v37, May 2026) — instant load via CDN, never sleeps |
| **PWA Hosting (fallback)** | Render `/pwa/` route | ✅ Kept for old links — same backend |
| **PWA → API routing** | Auto-detected via `API_BASE` in `pwa/js/api.js` | ✅ github.io → Render; same-origin elsewhere |
| **PWA deploy automation** | GitHub Actions (`.github/workflows/deploy-pwa.yml`) | ✅ Triggers on push to `main` touching `pwa/**` |
| Backend | Node.js + Express | ✅ Deployed — https://pannaipuram-api.onrender.com |
| Database | Supabase (PostgreSQL, Asia-Pacific Singapore) | ✅ Live — project: eoiaexdbnyzysolgwitw |
| Backend Hosting | Render.com (free tier Node.js) | ✅ Production URL above — note: cold-starts after 15 min idle |
| Cold-start mitigation | App-level stale-while-revalidate (2.5s timeout → cached fallback) | ✅ v34 |
| Admin Panel | React + MUI (admin-v2) | ✅ Live at /admin/v2 — full CRUD all modules |
| TNEB Data | Manual admin entry (scraper deferred) | ⏳ Scraper code ready, not integrated yet |
| Analytics | Custom PWA visit ping (`/api/pwa/ping`) + admin stats tab | ✅ v21 |
| Custom domain | `app.pannaipuram.com` (planned) | ⏳ Plan in `docs/domain-and-hosting-plan.md` |

---

## 11. Data Collection Checklist (For Venthan — Ground Work)

Before development begins, the following must be collected in person:

### PTV Padmavathy Hospital
- [x] Dr. Sekar — Wednesday, morning to evening ✅
- [ ] Dr. Sekar specialisation (TBC — collect from hospital)
- [ ] Any other doctors — list with specialisation and days
- [ ] Each doctor's exact OPD timings
- [ ] Department list and their hours
- [ ] Casualty / Emergency number
- [ ] Ambulance number
- [ ] Hospital address
- [ ] Pharmacy timings

### Bus Routes — Outbound Timings (Collected March 2026 from local residents)

| Corridor | # | Timings Collected | Status |
|---|---|---|---|
| போடி / Bodi (#2) | 23 | Handwritten image | ✅ In SQL |
| கம்பம் / Cumbum (#3) | 25 | Handwritten image | ✅ In SQL |
| சின்னமனூர் / Chinnamanur (#4) | 17 | Typed by Venthan + image | ✅ In SQL |
| மதுரை / Madurai (#5) | 5 | Typed by Venthan | ✅ In SQL |
| குமுளி / Kumily (#9) | 2 | Handwritten image | ✅ In SQL |
| கூடலூர் / Gudalur (#11) | 9 | Handwritten image | ✅ In SQL |
| மேட்டுப்பாளையம் / Mettupalayam (#12) | 1 | Typed by Venthan | ✅ In SQL |
| சுருளி தீர்த்தம் / Suruli Theertham (#13) | 1 | Typed by Venthan | ✅ In SQL |
| தேவாரம் / Thevaram (#14) | 23 | Collected Apr 2026 | ✅ In DB |
| திண்டுக்கல் / Dindigul (#10) | ⏳ | Pending | ⏳ Needs timings |
| தேனி / Theni (#1) | 2 | Collected — frequent service, few fixed departures | ✅ In DB |
| கோயம்புத்தூர் / Coimbatore (#6) | 3 | Collected Apr 2026 | ✅ In DB |
| திருச்சி / Trichy (#7) | 3 | Collected Apr 2026 | ✅ In DB |
| பழனி / Palani (#8) | 6 | Collected Apr 2026 | ✅ In DB |

**ℹ️ Note:** Pannaipuram is a bus stop, not a terminus. There is no "inbound/outbound" distinction — every timing recorded is simply when a bus departs from the Pannaipuram stop heading toward the corridor destination. One set of timings per corridor is all that's needed.

### Panchayat & Utilities
- [ ] Panchayat office contact number and hours
- [ ] Water board / supply contact
- [x] வள்ளுவர் தெரு — every 3 days, 6:00 AM ✅
- [ ] Water schedule for all remaining 56 streets (collect from panchayat / residents)
- [ ] Full street name list for பண்ணைப்புரம் — 57 streets (get from panchayat office or theni.nic.in/wardwise-street-list)
- [x] TNEB local complaint number: 94987 94987 ✅
- [ ] Nearest police station name and number
- [ ] Fire station number
- [ ] Nearest government hospital / PHC number

---

## 12. Phased Delivery Plan — Current Status

### Phase 1 — Requirements ✅ COMPLETE
Vision locked. 6 modules defined: Power, Water, Bus, Hospital, Auto, Emergency.

### Phase 2 — Backend Design ✅ COMPLETE
Database schema, REST API endpoints, TNEB scraper design, admin dashboard spec — all documented in backend-design.md.

### Phase 3 — App UI Design ✅ COMPLETE
Tamil wireframes for all screens, icon design, home screen with full-width tiles, community alert flow — all defined in ui-design.md.

### Phase 4 — Build ✅ COMPLETE
- ✅ Flutter app: all 6 modules built (Power, Water, Bus, Hospital, Auto, Emergency)
- ✅ All screens converted from hardcoded to live API with offline fallback
- ✅ Home screen: full-width rectangle tiles, colloquial Tamil labels, cottage header
- ✅ Offline banner, call buttons, water street selector
- ✅ Hospital: two-hospital layout (PTV Padmavathy id=1 + SP Clinic id=2)
- ✅ Bus screen: API-first with corridor metadata + offline fallback
- ✅ Bus route screen: fixed crash when no timings (empty list guard)
- ✅ Auto screen: API-first, graceful "விரைவில்" when phone not yet added
- ✅ Water screen: fetches ALL streets (not just ones with schedules) via /api/water/streets
- ✅ Backend: all routes including /api/auto/* built and deployed
- ✅ Admin panel: full CRUD on all modules including Auto/Van tab

### Phase 5 — Deployment & Content Entry 🟡 IN PROGRESS

**Completed:**
- ✅ Backend deployed to Render.com — https://pannaipuram-api.onrender.com
- ✅ Database on Supabase (Asia-Pacific Singapore, project eoiaexdbnyzysolgwitw)
- ✅ All DB tables: power_cuts, water_schedules, bus_corridors, bus_routes, bus_timings, doctors, doctor_schedules, hospitals, emergency_contacts, streets, auto_drivers, admin_users
- ✅ Admin panel live — https://pannaipuram-api.onrender.com/admin/panel
- ✅ Admin panel login with JWT (venthan89@gmail.com)
- ✅ Admin panel tabs: Power Cuts | Bus Timings | Doctors | Emergency Contacts | Auto/Van | Water | Streets
- ✅ Admin panel full CRUD (List + Add + Edit + Delete) on every tab
- ✅ Flutter app pointing to production API URL
- ✅ API regression test suite — run with `npm test` from backend/

**Admin Panel — Quick Reference:**

| Detail | Value |
|---|---|
| URL (v1) | https://pannaipuram-api.onrender.com/admin/panel |
| URL (v2) | https://pannaipuram-api.onrender.com/admin/v2/ |
| Login | venthan89@gmail.com + password you set |
| First-time setup | POST /admin/auth/setup (only works once when no admin exists) |
| JWT expires | 7 days (re-login required after) |

**Admin Panel Features:**
- ✅ Password visibility toggle on login screen
- ✅ Empty credential validation (prevents blank email/password submission)
- ✅ Admin panel v2 (React + Material-UI) at `/admin/v2/` with modern UI
- ✅ RBAC implemented — super_admin / admin / viewer roles (Phase 8 complete)

**Admin Panel Tabs:**

| Tab | What You Can Do |
|---|---|
| ⚡ Power Cuts | Add planned/unplanned cuts, mark resolved, delete |
| 🚌 Bus Timings | Select corridor, add departure times (dropdown for daily/weekdays/weekends), delete |
| 🏥 Doctors | **Add/edit/delete hospitals** (Tamil+English name, address, phone fields). Add doctors linked to hospital with dropdown. Set/replace schedule (multi-day checkboxes, replaces all at once). Clear schedule. Schedule column shows grouped days & times. |
| 📞 Emergency | Add contacts by category, edit/verify phone numbers, delete |
| 🚗 Auto/Van | Edit registration contact (Gowtham) at top + add drivers with phone + coverage, edit, delete |
| 💧 Water | Set per-street supply frequency, time (IST), notes — inline edit |
| 🏘 Streets | Add new streets (Tamil + English name), inline edit, delete with confirm |
| 🛍 Services | Add local service contacts by category (milk, post, flower, plumber, electrician), edit, delete |
| 📢 Announce | Post community announcements (info/warning/urgent/event), toggle active, set expiry, delete |
| 👥 Users | (super_admin only) Manage admin users, change roles, activate/deactivate, invite new users |

**⚠️ One-time setup needed — Run in Supabase SQL Editor:**
```sql
-- File: backend/src/db/migrate_auto_drivers.sql
-- Creates auto_drivers table + seeds 3 placeholder drivers
```

**Remaining for Phase 5:**
- ✅ `migrate_auto_drivers.sql` — auto_drivers table live
- ✅ Bus timings SQL: `seed_bus_timings_complete.sql` — 96 timings across 8 corridors in DB
- ✅ Emergency contacts: `migration_emergency_contacts.sql` run — police, medical, fire, helplines
- ✅ Local services: `migration_local_services.sql` run — local_services table live
- ✅ Hospitals seeded: PTV Padmavathy (id=1), SP Clinic (id=2)
- ✅ `migration_user_feedback.sql` run — user_feedback table live in Supabase
- ✅ Doctors: Dr. Sekar + Dr. Shanmugapriya added via admin panel
- ⏳ Add real auto/van driver phone numbers via Admin → 🚗 Auto/Van tab
- ⏳ Enter all 57 streets via Streets tab (currently partial)
- ⏳ Collect and enter departure timings for remaining corridors: Thevaram (#14), Dindigul (#10), Theni (#1), Coimbatore (#6), Trichy (#7), Palani (#8) — ask conductors at the stop or TNSTC office
- ⏳ Set water schedules per street via Water tab (only வள்ளுவர் தெரு confirmed so far)
- ⏳ Add panchayat office contact number and hours to Emergency tab
- ⏳ Test on physical Android device (Tamil rendering check)
- ⏳ QR code generation for WhatsApp APK sharing

### Phase 6 — Testing 🔴 PENDING
- Test on low-end Android devices (2GB RAM)
- Offline mode testing
- Community water alert end-to-end test
- Push notification delivery test
- FCM device registration testing

### Phase 7 — Launch 🔴 PENDING
- Share QR code via WhatsApp
- Print and post at panchayat, bus stand, hospital, TNEB office
- Collect feedback from first users

### Phase 9 — PWA Steve Jobs UX Improvements ✅ COMPLETE (April 2026)

Steve Jobs critique identified these as the highest-impact improvements:

**Critical (removes the 2-tap problem):**
- [x] **"Now departing" smart strip** — top 3 imminent buses across ALL routes shown at page top. Color-coded urgency rails (red ≤5 min, amber ≤15 min, green >15 min). No taps needed.
- [x] **Auto-open group by time of day** — 6–9am and 4–7pm (peak travel): auto-opens Local Routes. Off-peak: shows all collapsed or remembers last open.
- [x] **Search / filter** — Tamil search box below header. Type "தே" → shows Theni, Thevaram. Clear (×) button, 16px font (no iOS zoom), 48px touch target.

**High value:**
- [x] **Data freshness indicator** — "X நிமிடம் முன்பு புதுப்பிக்கப்பட்டது" below bus header. 10-minute auto-refresh via setInterval.
- [x] **Remember last-opened group** in localStorage — persists user's accordion preference across sessions.
- [x] **WhatsApp share per timing row** — long-press on any bus time → prefilled WhatsApp share message in Tamil with bus time and route.

**Polish:**
- [x] **Fix duplicate CSS in bus.css** — deduplicated tt-stats, tt-toggle, tt-gap definitions.
- [x] **Fix "coming soon" dead state** — shows "தகவல் இல்லை — admin-ஐ தொடர்பு கொள்ளுங்கள்" when API returns empty.
- [x] **Night bus boarding point** — Chennai overnight buses show "ஏறும் இடம்: தேனி பேருந்து நிலையம்" boarding note.
- [x] **Install banner polish** — reduced size with clear close button; permanently dismissed after user installs via `appinstalled` event.

**Bonus (design critique fixes):**
- [x] **Google Translate disable** — `translate="no"` on `<html>` and `<body>`, `notranslate` class, `<meta name="google" content="notranslate">`. Stops Android Chrome auto-translate of Tamil.
- [x] **Design token scale** — `tokens.css` updated with `--ta-xs` through `--ta-xxl`, darkened `--color-muted` for WCAG AA contrast.
- [x] **Focus ring** — gold 3px `:focus-visible` ring in `base.css` for keyboard/a11y.
- [x] **Tamil group names aligned** — Bus groups: `உள்ளூர் பயணம்` / `தொலைதூர பயணம்` / `சென்னை இரவு பேருந்து`. Flutter APK updated to match.
- [x] **Route alts verified** — ROUTE_ALTS corrected with actual TNSTC geography (Thevaram→Bodi→Theni sequence confirmed; Kumily↔Bodi alts removed as opposite direction).

**Cache:** SW and localStorage bumped to **v14** (`pannai-pwa-v14` / `pannai-v14`).

---

### Phase 8 — RBAC & New Features ✅ COMPLETE (March 2026)

**RBAC (Role-Based Access Control) — ✅ IMPLEMENTED**
- Three roles: `super_admin`, `admin`, `viewer`
- Super admin manages users: invite via signup, change roles, activate/deactivate
- Admin: full CRUD on all data modules
- Viewer: read-only access
- JWT token carries role, middleware enforces permissions
- Admin panel shows role badge, hides restricted tabs (Users = super_admin only)
- Signup flow: new users register as 'viewer', admin promotes

**Community Announcements — ✅ IMPLEMENTED**
- Admin posts announcements (type: info/warning/urgent/event)
- Auto-scrolling banner on app home screen with page indicators
- Toggle active/inactive, set expiry date
- Priority-based ordering

**Local Services Module — ✅ IMPLEMENTED**
- Categories: milk man (🥛), postman (📮), flower seller (🌺), plumber (🔧), electrician (⚡)
- Admin CRUD via Services tab
- Flutter screen with call buttons, grouped by category

**About Screen — ✅ IMPLEMENTED**
- Village stats from official data (population, area, wards, streets)
- Cardamom estate heritage info
- App modules overview
- 7-step Tamil how-to-use guide
- Village footer: "பண்ணைப்புரம் மக்களால், மக்களுக்காக"

**Auto Registration Contact — ✅ IMPLEMENTED**
- Editable from admin panel (name, phone)
- Shown in app's Auto section with call button

**Audit History / Admin Logs**
- All admin actions logged to `audit_log` table: who did what, when
- Tracks: insertions, updates, deletions (power cuts, bus timings, doctors, emergency contacts, auto drivers, water schedules)
- Audit dashboard shows recent activity: "Venthan added 3 bus timings (Bodi corridor) at 2026-03-18 14:22 UTC"
- Helps troubleshoot data issues and accountability

**WhatsApp Integration — ✅ IMPLEMENTED**
- Auto/Van: WhatsApp contact number per driver, "Message on WhatsApp" button
- Power screen: WhatsApp share button (shares current cut info in Tamil)
- Power + Water screens: "Contact admin" via WhatsApp if info missing

**App Lifecycle Fix — ✅ IMPLEMENTED**
- Black screen on app resume fixed (WidgetsBindingObserver in main.dart)
- App rebuilds properly when resumed from background

**Feedback Module — ✅ IMPLEMENTED (March 2026)**
- Villagers submit feedback/suggestions from app (💬 கருத்து — 4th bottom nav tab)
- Simple Tamil form: message text area + optional name/contact
- Anonymous submission supported
- DB: `user_feedback` table ✅ created in Supabase
- Backend: `POST /api/feedback` (public), `GET/PUT/DELETE /admin/feedback` (admin)
- Admin panel: 💬 Feedback tab — lists all submissions, unread badge, mark-as-read, delete
- **Email notification (deferred — later phase):** Gmail SMTP via Nodemailer to notify venthan89@gmail.com on each submission. Requires one-time Gmail App Password setup. Not implemented yet — admin checks panel manually for now.

**Coming Soon Banners — ✅ IMPLEMENTED**
- Power screen: yellow banner "விரைவில் — நேரடி TNEB தகவல் வரும்!"
- Water screen: blue banner "விரைவில் — ஊராட்சி நேர அட்டவணை வரும்!"

**Offline Caching — ✅ IMPLEMENTED**
- CacheService using SharedPreferences
- Doctors and Emergency Contacts cached on first load
- Pull-to-refresh in hospital screen
- Emergency fallback data covers all categories (medical, police, fire, helplines)

**Bug Fixes — March 2026 — ✅ DONE**
- Doctor schedule admin: day name → integer conversion (Monday → 1 etc.)
- Hospital dropdown: fetches hospitals from DB dynamically (not hardcoded)
- Services admin: edit/pencil icon added
- Doctors admin: schedule column shows days & times in table
- About screen: Assembly constituency English spelling corrected to "Cumbum"
- Admin UI error messages: show actual API errors instead of generic text

---

### Phase 10 — PWA Polish + Infrastructure Hardening ✅ COMPLETE (April–May 2026)

**Auto Section Redesign (v27–v30) — ✅ COMPLETE**
- New palette: amber `#F59E0B` + charcoal `#1C1C1E` + green call button `#16A34A` (replaced "vomit" neon yellow/black + purple form)
- Driver name truncation with ellipsis — call button never overlaps long names
- `phone_verified` BOOLEAN column on `auto_drivers` table; admin toggle in UI
- PWA shows "விரைவில்" placeholder (no call button) when `phone_verified = false`
- Phone number validation: Indian mobile (10 digits starting with 6/7/8/9)

**Bus Section Steve Jobs Simplification (v31–v34) — ✅ COMPLETE**
- Collapsed route card now shows ONLY destination + next time + countdown
- Route chain ("பண்ணைப்புரம் → தேவாரம் → போடி → தேனி") moved to expanded view
- Alt-route suggestions hidden behind explicit toggle (progressive disclosure)
- Bus type chip (Jeyamurugan/PPP/மொஃபசல்/டவுன் பஸ்) on:
  - Route card subtitle (v33)
  - "Leaving soon" strip cards (v34)
  - Timetable rows for ALL types, not just private (v32)
- Long-distance routes never labeled "டவுன் பஸ்" — Trichy/Palani show as மொஃபசல்
- Bigger timetable times (1rem → 1.25rem/800), bigger icons (36px → 42px)
- Chennai night-service skips the "9 மணி இடைவெளி" gap warning (one-bus-per-night by design)

**Tamil Copy Refresh (v27, v29) — ✅ COMPLETE**
- About section: நம்ம ஊரின் தகவல் மையம், 'இது என்ன?', 'ஏன் உருவாக்கப்பட்டது?', முக்கிய அம்சங்கள்
- Feedback intro: hint cards explaining what to share
- How-to-use: 7 steps with formal Tamil
- Bus group names: உள்ளூர் பயணம் / தொலைதூர பயணம் / சென்னை இரவு பேருந்து

**Install Wall — One-Tap from WhatsApp (v34–v36) — ✅ COMPLETE**
- Share link format: `?install=1` URL param triggers full-screen install overlay
- Full-screen navy gradient blocks app UI until user taps the install button
- Big yellow button (#FFD600) with pulsing glow ring + bouncing 👇 arrow
- Tamil CTA: "இந்த button-ஐ click பண்ணுங்க!"
- One tap fires native `beforeinstallprompt.prompt()` — no banner-hunt
- 4s fallback: if no native prompt (Samsung/Firefox), button shows ⋮ manual steps
- Skip button closes overlay and cleans URL → normal app loads
- iOS unchanged: still shows Share → Add to Home Screen 3-step instructions

**Hosting Migration: Render → GitHub Pages (v37) — ✅ COMPLETE**

| Aspect | Before (Render only) | After (GitHub Pages primary) |
|---|---|---|
| First load | 30–60s if Render cold | <1s from GitHub CDN |
| Cold-start splash | "Allocating resources…" visible | Never seen by user |
| API calls | Same origin (relative URLs) | Cross-origin to Render (auto-detected) |
| Deploy | `git push` → Render redeploy | `git push` → GitHub Actions runs deploy-pwa.yml |
| URL | `pannaipuram-api.onrender.com/pwa/` | `venthangowthams.github.io/Pannaipuram/` |

- New workflow `.github/workflows/deploy-pwa.yml` — on push to `main` touching `pwa/**`:
  1. Copies `pwa/*` to deploy artifact
  2. Sed-rewrites `/pwa/` → `./` so paths work at `/Pannaipuram/` base
  3. Adds `build-info.json` with timestamp + SHA for verification
  4. Uses `actions/deploy-pages@v4` to publish
- `pwa/js/api.js`: `API_BASE` detects `*.github.io` / `*.pages.dev` / `*.netlify.app` hostnames and routes API to Render
- `pwa/js/app.js` + `auto.js`: same pattern for `/api/feedback` and `/api/pwa/ping` direct fetches
- `backend/src/app.js`: CORS auto-allows `^https://[a-z0-9-]+\.github\.io$`
- Both URLs work — Render version retained for backward compat with old WhatsApp shares

**Render Cold-Start Resilience (v34) — ✅ COMPLETE**
- `apiFetch` rewritten as stale-while-revalidate at app level
- If cache (memory or localStorage) exists → 2.5s network timeout → serve cache
- Network keeps running after timeout to silently refresh cache for next load
- `/api/bus/next` stays network-only (stale countdowns would mislead)
- Combined effect with GitHub Pages: user never sees Render's loading splash

**Cache versioning:** SW + localStorage bumped to **v37** (`pannai-pwa-v37` / `pannai-v37`).

---

### Phase 11 — Custom Domain Migration ✅ COMPLETE (June 2026)

> **Plan reference:** `docs/domain-and-hosting-plan.md` (now executed).

**Done:** `pannaipuram.com` bought on Cloudflare Registrar (auto-renew on).
Branded subdomains all live with auto-provisioned SSL:

```
app.pannaipuram.com    → PWA (GitHub Pages)        ✅ live
api.pannaipuram.com    → Backend (Render)          ✅ live (JSON landing at /)
admin.pannaipuram.com  → Admin panel (Render)      ✅ live (root → /admin/v2)
pannaipuram.com / www  → placeholder A records      ⏳ redirect rule not yet set
school./services.       → reserved for future sites
```

**Executed:**
1. ✅ Cloudflare DNS: `app` = 4× GitHub Pages A records; `api`/`admin` = CNAME → `pannaipuram-api.onrender.com` — **all DNS-only (grey cloud)** so Render/GitHub issue their own SSL
2. ✅ GitHub repo Settings → Pages → custom domain `app.pannaipuram.com` + Enforce HTTPS
3. ✅ Render Service → Custom Domains: `api.` + `admin.` (Certificate Issued)
4. ✅ Code: `pwa/CNAME`, `API_BASE` 3-way detection (api.js/app.js/auto.js), CORS regex `*.pannaipuram.{com,in}`, hostname-aware root redirect in `app.js`

**Gotcha learned:** Cloudflare proxy (orange cloud) MUST be off for Render/GitHub
custom domains — it blocks Let's Encrypt cert issuance (was the cause of an early 403).

**Cost:** ~₹820/year (domain only). Everything else stays free.

---

### Phase 12 — Future Roadmap (Beyond Phase 11) 🔴 NOT STARTED

These are deferred items still on the wishlist:

**Data Entry (Venthan's ongoing task):**
- ⏳ Dindigul (#10) bus timings — only corridor with no data
- ⏳ Auto driver real phone numbers (all currently `phone_verified=false`)
- ⏳ All 57 street names in Streets tab (partial entered)
- ⏳ Water schedules per street (only வள்ளுவர் தெரு confirmed)
- ⏳ Panchayat office contact + water board numbers in Emergency tab

**Engineering — Security (recommended next):**
- ⏳ Rate-limit public POST endpoints (`/api/feedback`, `/api/pwa/ping`, `/api/water/alert`) — `express-rate-limit` already used on admin auth only
- ⏳ Re-enable scoped CSP for `/pwa/` + `/api/` (currently disabled globally)
- ⏳ Confirm Supabase RLS on all public tables (Security Advisor flagged `rls_disabled_in_public`)

**Engineering — Backend/Infrastructure:**
- ⏳ Email notifications for feedback (Nodemailer + Gmail App Password)
- ⏳ Push notifications via FCM — Phase 7+ (device table exists, integration pending)
- ⏳ Live TNEB power cut feed integration (scraper code exists, not wired up)
- ⏳ Postgres backups automation (currently relying on Supabase defaults)

**Engineering — Mobile App:**
- ⏳ Flutter APK rebuild — release with v27–v39 features (bus card simplification, operator chips, etc.)
- ⏳ Port Emergency Contacts + About village stats to APK ↔ PWA parity (Emergency already in APK; About stats already in APK)
- ⏳ QR code generation script for WhatsApp APK distribution (encode `https://app.pannaipuram.com/?install=1`)
- ⏳ Bus departure reminders (local notifications) — chosen feature, deferred (needs APK rebuild + notification permission)
- ⏳ iOS build — not planned yet

**Future village ecosystem (under pannaipuram.com umbrella):**
- ⏳ School website — separate repo, deployed to `school.pannaipuram.com`
- ⏳ Local services directory — separate repo, deployed to `services.pannaipuram.com`
- ⏳ Village home landing page — `pannaipuram.com` apex domain
- ⏳ Photo/event archive (could be a static gallery on Cloudflare R2)

---

### Resume-from-Cold-Start Guide for Future Sessions

When Venthan returns after time away, the fastest way to resume work:

1. `cd ~/Documents/VenthanDocuments/Workspace/Projects/Pannaipuram`
2. `git pull origin main` — pick up any changes
3. `claude` — start session
4. Tell Claude: **"Read `CLAUDE.md` and `docs/requirements.md` Phase 10/11/12 — what's the current status and what's next?"**

Claude reads the canonical state from disk (not chat history), and can pick up exactly where we left off. Conversation history is per-machine — but every important decision is committed to git, so the repo IS the memory.

**Hospital/Doctor Admin Redo — March 2026 — ✅ DONE**
- Backend: Full Hospital CRUD (POST/PUT/DELETE /admin/hospital, GET /admin/hospital/list)
- Backend: Schedule replace endpoint (PUT /admin/hospital/doctors/:id/schedule) — replaces all at once
- Backend: Schedule clear endpoint (DELETE /admin/hospital/doctors/:id/schedule)
- Backend: Doctor POST validates hospital_id exists before inserting
- Backend: parseDayOfWeek() — handles string day names → integer (no more type mismatch)
- Admin UI: Hospital management section — add/edit/delete hospitals from Doctors page
- Admin UI: "Replace Schedule" replaces all days at once — no duplicate schedules ever
- Admin UI: Pre-fills existing schedule when editing, "Clear All" button, shows info alert
- Admin UI: formatSchedule() — fixed null handling (no more "undefined" in table)
- Admin UI: Alert shown when no hospitals exist (prevents saving doctor with no hospital)
- Flutter app: RefreshIndicator + CacheService already working (pull-to-refresh, offline cache)

**Google Play Store & App Store Distribution**
- Publish app on Google Play Store ($25 one-time developer fee)
- Later: Apple App Store distribution ($99/year developer account)
- Removes need for manual QR code sharing and APK file hosting
- In-app auto-update capability via Play Store
- Wider reach to users outside Pannaipuram who may know someone there

---

## 13. Why This Will Work

> **It solves problems people have today — not someday.**

- Someone will miss the power cut tomorrow. This app tells them before it happens.
- Someone's mother will miss the water today. This app alerts her.
- Someone will miss the last bus to Uthamapalayam. This app prevents it.
- Someone will travel to the hospital on the wrong day. This app saves that trip.
- Someone won't know who to call when the power doesn't come back. This app has the number.

Every feature in this app solves something that happened to someone in Pannaipuram last week.

---

*Built with ❤️ for Pannaipuram by Venthan — Technology for Real People*
