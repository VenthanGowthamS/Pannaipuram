# பண்ணைப்புரம் App — Cross-Validation Status Report
### Requirements × UI Design × Backend Design × Current Codebase

> **Date:** March 2026 | **Validated by:** Claude

---

## Summary

| Layer | Status |
|---|---|
| Flutter App (UI) | 🟡 ~75% complete — core screens done, FCM + notifications missing |
| Backend (Node.js) | 🟡 ~70% complete — all routes scaffolded, not deployed, no DB live |
| Admin Dashboard | 🔴 0% — not started |
| Data Collection | 🔴 ~15% — most real-world data still to be collected |

---

## 1. Flutter App — Screen by Screen

### ✅ Done

| Screen / Feature | Requirements Said | UI Design Said | Code Status |
|---|---|---|---|
| Splash screen | — | First launch | ✅ `splash_screen.dart` |
| Onboarding — street selection | 57 streets, searchable, Tamil list | Screen 1 mockup | ✅ `onboarding_screen.dart` — search, fallback list, skip option |
| Home screen | 5 module tiles, one-tap nav | Screen 2 mockup | ✅ Full-width rectangle tiles, colloquial Tamil labels, scrollable |
| Home — tile order | Power, Water, Bus, Hospital, Emergency | — | ✅ Bus → Auto → Hospital → Electricity → Water |
| Power screen | Status, planned vs fault, TNEB call buttons, "power restored" report | Screen 3 mockup | ✅ Hero tile, status card, active cut detail, report button, call buttons |
| Power — setState crash fix | — | — | ✅ `mounted` guard added |
| Water screen | Schedule per street, community alert button, offline cache | Screen 4 mockup | ✅ Schedule card, "தண்ணீர் வந்தது!" button, today's alerts list |
| Bus screen | Both corridors, next bus, all timings, last bus highlighted | Screen 5 mockup | ✅ Bodi + Kamban tabs, next bus chip, full timetable, last bus in red |
| Bus screen — header fix | — | — | ✅ "எங்கிட்டு போகணும்?" no longer overlaps back arrow |
| Hospital screen | PTV Padmavathy, doctors by day, casualty/ambulance call | Screen 6 mockup | ✅ PTV Padmavathy + SP Clinic cards, doctors inside detail, 108 at bottom |
| Emergency screen | Category tabs, tap-to-call, Tamil labels | Screen 7 mockup | ✅ `emergency_screen.dart` — TNEB + medical + panchayat tabs |
| Auto screen | Not in original requirements | Not in UI design | ✅ Added as bonus — "சார், ஆட்டோ வேணுமா?" |
| Offline banner | Subtle banner when no internet | Screen 8 spec | ✅ `offline_banner.dart` widget |
| Call button widget | One-tap call from all screens | Large tap targets | ✅ `call_button.dart` |
| App icon | Saffron village theme | — | ✅ PNG present, `flutter_launcher_icons` configured |
| Colour system | Deep green primary, module accents | Exact hex codes in ui-design.md | ✅ `app_theme.dart` matches spec |
| Tamil font (NotoSansTamil) | Tamil primary, English small below | Typography table | ✅ Loaded in pubspec.yaml |

---

### ❌ Pending — Flutter App

| Feature | Where Specified | What's Missing |
|---|---|---|
| **Push notification registration** | requirements.md §10, backend-design.md §2.7 | App never sends FCM token to `/api/devices/register` — notifications will never reach users |
| **Firebase Analytics** | requirements.md §10 | Not integrated — no `firebase_analytics` package, no event tracking |
| **Bus reminder** ("Alert me 15 min before bus") | requirements.md §4 Module 3 | UI button exists concept but no local notification scheduling implemented |
| **Last bus push warning** | requirements.md §4 Module 3, backend §4 | Backend sends it but app has no handler to receive and display it |
| **Hospital — full week schedule view** | requirements.md §4 Module 4 | Tile detail shows doctors but no "வாரம் முழுவதும் பார்க்க" week-view button |
| **Water — street change from water screen** | ui-design.md Screen 4 | "(tap to change street)" noted in design, not wired in water_screen.dart |
| **57 streets data** | requirements.md §2, §11 | Onboarding fallback has only Valluvar Street — 56 streets still to be collected and seeded |
| **Empty state messages in Tamil** | ui-design.md §7 | Generic spinners/no-data cards — not using the specific Tamil empty state copy from the design doc |

---

## 2. Backend — Route by Route

### ✅ Done (Scaffolded)

| Route File | Endpoints | Status |
|---|---|---|
| `routes/water.js` | GET schedule, POST alert, GET today's alerts | ✅ File exists |
| `routes/power.js` | GET cuts, POST restored | ✅ File exists |
| `routes/bus.js` | GET corridors, GET timings, GET next bus | ✅ File exists |
| `routes/hospital.js` | GET doctors, GET today's doctors, GET hospital info | ✅ File exists |
| `routes/emergency.js` | GET contacts by category | ✅ File exists |
| `routes/devices.js` | POST register, PUT update street | ✅ File exists |
| `routes/admin/auth.js` | POST login (JWT) | ✅ File exists |
| `routes/admin/power.js` | POST/PUT power cuts | ✅ File exists |
| `routes/admin/water.js` | PUT water schedule | ✅ File exists |
| `routes/admin/bus.js` | POST/PUT bus timings | ✅ File exists |
| `routes/admin/hospital.js` | POST/PUT doctors | ✅ File exists |
| `routes/admin/contacts.js` | POST/PUT emergency contacts | ✅ File exists |
| `services/pushNotifications.js` | Firebase Admin SDK, send to all / by street | ✅ File exists |
| `services/tnebScraper.js` | Cheerio scraper, cron job | ✅ File exists |
| `services/waterScheduler.js` | Schedule-based water notifications | ✅ File exists |
| `db/schema.sql` | All 10 tables (wards, streets, water_schedules, water_alerts, power_cuts, power_restorations, bus_corridors, bus_routes, bus_timings, hospitals, doctors, doctor_schedules, emergency_contacts, devices) | ✅ Complete |
| `db/seed.sql` | Initial data (Valluvar St, TNEB numbers, Dr. Sekar, corridors) | ✅ File exists |
| `middleware/auth.js` | JWT verification | ✅ File exists |

---

### ❌ Pending — Backend

| Item | Where Specified | What's Missing |
|---|---|---|
| **PostgreSQL database provisioned** | backend-design.md §1 | No live DB running anywhere — backend can't work without it |
| **Deployed to Render / Railway** | requirements.md §10, backend-design.md §1 | App API calls hit nothing — need `DATABASE_URL` + server URL live |
| **`.env` configured** | backend-design.md §8 | Firebase credentials, JWT secret, DB URL not filled in |
| **Admin dashboard (web UI)** | backend-design.md §6 | `/admin-dashboard` folder doesn't exist at all — 0% built |
| **TNEB scraper tested** | requirements.md §4 Module 1, backend-design.md §5 | Code exists but never run against real TNEB site — may need selector fixes |
| **FCM credentials wired in** | backend-design.md §8 | `FIREBASE_PROJECT_ID`, `FIREBASE_PRIVATE_KEY` not set — push notifications dead |
| **Bus seed data** | requirements.md §4 Module 3 | `seed.sql` likely has no real bus timings — actual times still TBC from TNSTC |

---

## 3. Data Collection — Ground Work Checklist

Per requirements.md §11 — items Venthan must collect in person:

### PTV Padmavathy Hospital
- [x] Dr. Sekar — Wednesday, morning to evening
- [ ] Dr. Sekar specialisation
- [ ] Other doctors — name, specialisation, days, timing
- [ ] OPD department list and hours
- [ ] Casualty / Emergency phone number ← needed for emergency screen
- [ ] Ambulance number ← needed for emergency screen
- [ ] Hospital address

### SP Clinic (added to app — data needed)
- [ ] Doctors, timings, contact number

### Bus Timings — Both Corridors, Both Directions
- [ ] Pannaipuram → Thevaram → Bodi: all departure times
- [ ] Bodi → Thevaram → Pannaipuram: all return times
- [ ] Pannaipuram → Uthamapalayam → Kamban: all departure times
- [ ] Kamban → Uthamapalayam → Pannaipuram: all return times
- [ ] Last bus each way (highlight in red)
- [ ] Sunday / holiday differences
- [ ] Express buses if any

### Panchayat & Utilities
- [ ] Full 57-street list (get from panchayat office)
- [ ] Water schedule for all 56 remaining streets
- [x] Valluvar Street — every 3 days, 6:00 AM
- [x] TNEB local: 94987 94987
- [ ] Panchayat office phone + hours
- [ ] Water board / supply contact
- [ ] Nearest police station name + number
- [ ] Fire station number
- [ ] Nearest govt hospital / PHC number

---

## 4. What To Do Next — Priority Order

### 🔴 Critical (app is broken without these)
1. **Deploy backend** — provision PostgreSQL on Render/Railway, set `.env`, push backend, get live URL
2. **Update `ApiService.dart` base URL** — currently points to localhost or placeholder
3. **FCM device registration** — wire `firebase_messaging` package into Flutter app, send token to `/api/devices/register` on first launch

### 🟡 High (major features incomplete)
4. **Admin dashboard** — build simple web UI (or even use a REST client like Postman as stopgap) so you can enter hospital/bus/emergency data
5. **Seed real bus timings** into DB once collected from TNSTC / conductors
6. **Add remaining emergency contacts** (hospital casualty, ambulance, police, fire, PHC) to seed.sql
7. **57 streets** — get list from panchayat, add to seed.sql and onboarding fallback

### 🟢 Nice to have (polish)
8. Firebase Analytics — add `firebase_analytics` package, track screen views
9. Bus reminder local notification (flutter_local_notifications)
10. Hospital full-week schedule view
11. Tamil empty state messages from ui-design.md §7
12. Water screen "tap to change street" wired up

---

*Cross-validated against: requirements.md v2.1 · ui-design.md v1.0 · backend-design.md v1.0 · codebase @ commit 59f3bf9*
