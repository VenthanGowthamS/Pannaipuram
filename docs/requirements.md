# பண்ணைப்புரம் App — Requirements Document
### Pannaipuram App — Your Village Information Centre

> **Version:** 2.4 (Auto module API-backed, Water street sync fixed, Tests added)
> **Date:** March 2026
> **Author:** Venthan (Senior Software Engineer)
> **Status:** Phase 5 In Progress — All Modules API-Live, Data Entry Underway
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
| Assembly Constituency | கம்பம் (Kamban) |
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
**Platform:** Android (APK — no Play Store required)
**Distribution:** QR Code → WhatsApp share
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
│   /api/bus/*       → Bus timings (outbound from Pannaipuram)    │
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
│   bus_routes, bus_timings → Outbound departure times            │
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
│   • Add bus timings (outbound only from Pannaipuram)            │
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
| Mobile App | Flutter (Dart) — Android APK | ✅ Built & Tested |
| Local Storage | SQLite (via Drift) + SharedPreferences | ✅ Implemented |
| Push Notifications | Firebase Cloud Messaging (FCM) | ⏳ Deferred (app scaffolded, not integrated yet) |
| Backend | Node.js + Express (lightweight) | ⏳ Scaffolded, not deployed |
| Database | Supabase (PostgreSQL, Asia-Pacific Singapore) | ⏳ Project: eoiaexdbnyzysolgwitw |
| Hosting | Render.com (free tier Node.js) | ✅ Production URL: https://pannaipuram-api.onrender.com |
| Admin Panel | REST API + simple web UI | ⏳ Postman/REST client can be used as stopgap |
| TNEB Data | Web scraping (Cheerio/Puppeteer) | ✅ Code ready, not tested against live site yet |
| Analytics | Firebase Analytics | ⏳ Deferred for later phases |

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
| தேவாரம் / Thevaram (#14) | ⏳ | Pending | ⏳ Needs timings |
| திண்டுக்கல் / Dindigul (#10) | ⏳ | Pending | ⏳ Needs timings |
| தேனி / Theni (#1) | — | Frequent service, no fixed times | ⏳ TBC |
| கோயம்புத்தூர் / Coimbatore (#6) | ⏳ | Pending | ⏳ Needs timings |
| திருச்சி / Trichy (#7) | ⏳ | Pending | ⏳ Needs timings |
| பழனி / Palani (#8) | ⏳ | Pending | ⏳ Needs timings |

**⚠️ Note:** Return (inbound) timings not yet collected for any corridor. Manually add via Admin Panel → Bus Timings tab once available.

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
- 🔄 Multi-admin support planned (RBAC coming in Phase 8)

**Admin Panel Tabs:**

| Tab | What You Can Do |
|---|---|
| ⚡ Power Cuts | Add planned/unplanned cuts, mark resolved, delete |
| 🚌 Bus Timings | Select corridor, add outbound departure times, delete |
| 🏥 Doctors | Add doctors to hospital (PTV=1 / SP Clinic=2), schedule, edit, delete |
| 📞 Emergency | Add contacts by category, edit/verify phone numbers, delete |
| 🚗 Auto/Van | Add drivers with phone + coverage area, edit, delete |
| 💧 Water | Set per-street supply frequency, time, notes — inline edit |
| 🏘 Streets | Add new streets (Tamil + English name), view all |

**⚠️ One-time setup needed — Run in Supabase SQL Editor:**
```sql
-- File: backend/src/db/migrate_auto_drivers.sql
-- Creates auto_drivers table + seeds 3 placeholder drivers
```

**Remaining for Phase 5:**
- ⏳ Run `migrate_auto_drivers.sql` in Supabase SQL Editor (creates auto_drivers table)
- ⏳ Add real phone numbers via Admin → 🚗 Auto/Van tab
- ⏳ Enter all 57 streets via Streets tab (currently ~10 fallback streets seeded)
- ✅ Bus timings SQL ready: 96 timings across 8 corridors in `seed_bus_timings_complete.sql`
- ⏳ Run `seed_bus_timings_complete.sql` in Supabase SQL Editor to insert all bus timings
- ⏳ Collect and add timings for: Thevaram (#14), Dindigul (#10), Theni (#1), Coimbatore (#6), Trichy (#7), Palani (#8)
- ⏳ Collect return (inbound) timings for all corridors
- ⏳ Enter hospital doctors with correct hospital mapping (1=PTV, 2=SP Clinic)
- ⏳ Enter all emergency contacts (police, fire, PHC, panchayat, TNEB)
- ⏳ Set water schedules per street via Water tab
- ⏳ Test on physical Android device (Tamil rendering)
- ⏳ QR code generation for WhatsApp sharing

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

### Phase 8 — Future Enhancements 🔴 PLANNED

**RBAC (Role-Based Access Control)**
- Multiple admin users with different roles: `super_admin`, `editor`, `viewer`
- Super admin manages other admins: invite, revoke, assign roles
- Editor: can add/edit/delete content (power cuts, bus timings, doctors, etc.)
- Viewer: read-only access to dashboard and reports
- Admin panel v2 (React + Material-UI) at `/admin/v2/` with role-based UI

**Audit History / Admin Logs**
- All admin actions logged to `audit_log` table: who did what, when
- Tracks: insertions, updates, deletions (power cuts, bus timings, doctors, emergency contacts, auto drivers, water schedules)
- Audit dashboard shows recent activity: "Venthan added 3 bus timings (Bodi corridor) at 2026-03-18 14:22 UTC"
- Helps troubleshoot data issues and accountability

**WhatsApp Integration for Auto/Van Module**
- Add WhatsApp contact number field to auto drivers (in addition to phone number)
- Display WhatsApp icon + "Message on WhatsApp" button in Auto screen
- One-tap click opens WhatsApp direct message chat with driver
- Example: User taps → app opens WhatsApp pre-filled with: "Hi, need an auto from Pannaipuram to Kamban"
- Drivers can reply directly without giving out personal phone numbers first

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
