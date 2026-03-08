# பன்னைபுரம் App — Requirements Document
### Pannaipuram App — Your Village Information Centre

> **Version:** 2.0 (Final Vision Draft)
> **Date:** March 2026
> **Author:** Venthan (Senior Software Engineer)
> **Status:** Phase 1 Complete — Ready for Backend Design
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

## 2. Product Identity

**App Name:** பன்னைபுரம் (Pannaipuram)
**Tagline:** உங்கள் ஊரின் தகவல் மையம்
**Platform:** Android (APK — no Play Store required)
**Distribution:** QR Code → WhatsApp share
**Language:** Tamil primary, small English label below every element
**Target Users:** All residents of Pannaipuram — farmers, families, elderly, students

---

## 3. The Five Modules

---

### Module 1 — மின்சாரம் (Power / Electricity)

**The Pain:** When a power cut happens, nobody knows if it is planned maintenance, a fault, or something bigger. People don't know who to call or when power will return.

**What the App Does:**
- Shows TNEB scheduled maintenance cuts for the Pannaipuram area (fetched from TNEB portal)
- Clearly labels: "திட்டமிட்டது" (Planned) vs "கோளாறு" (Fault/Unplanned)
- Shows estimated restoration time when available
- One-tap call button to local TNEB subdivision office
- One-tap call to TNEB fault reporting line (1912)
- Push notification: "Tomorrow 9am–1pm power cut for maintenance in your area"
- Admin can manually post alerts when TNEB info is unavailable

**Data Source:**
- TNEB website scraping / RSS feed for scheduled cuts
- Manual admin entry as fallback
- User-reported: "Power is back in my street" community confirmation

---

### Module 2 — தண்ணீர் (Water Supply Alert)

**The Pain:** Panchayat water comes at irregular times. People miss it, waste it waiting, or don't know it came. One person on the street knowing means nothing if others are asleep or working.

**What the App Does:**
- Shows the official expected daily water timing (set by admin / panchayat)
- **Community Alert Button — the killer feature:**
  - Any resident taps "தண்ணீர் வந்தது!" (Water came!)
  - Everyone in Pannaipuram gets an instant push notification
  - Shows: which street/area reported it, what time
  - People can confirm: "Yes, came in my street too" ✅
- "Water not yet today" flag — if nobody has confirmed by 10am, app shows a reminder
- Weekly water schedule if panchayat provides one
- Panchayat water board contact for complaints

**Why This Feature Is Unique:**
No app in India has a community water alert built for a specific village. This is the feature people will share on WhatsApp. One person alerts the street — everyone benefits. Water is not wasted.

**Data Source:**
- Community-powered (residents post alerts — zero cost, zero API)
- Admin sets baseline schedule
- Panchayat contact info entered manually

---

### Module 3 — பேருந்து (Bus Timings)

**The Pain:** People miss buses to Thevaram, Uthamapalayam, and other key routes because there is no timetable available in Tamil, in one place, that works without internet.

**What the App Does:**
- Complete offline timetable for key routes from Pannaipuram:
  - Pannaipuram ↔ Thevaram
  - Pannaipuram ↔ Uthamapalayam
  - Pannaipuram ↔ Bus Stand (connecting routes)
  - Any other key routes collected from ground sources
- "Next bus" widget on home screen — shows how many minutes until next departure
- Set a reminder: "Alert me 15 minutes before the 7:45am bus"
- Notes: Last bus timing, frequency, days of operation
- "Bus delayed / not running today" — admin or community can flag

**Data Source:**
- Manually collected from TNSTC schedule, local conductors, residents
- Stored locally in app — works 100% offline
- Admin updates when schedule changes (infrequent)

---

### Module 4 — PTV பத்மாவதி மருத்துவமனை (PTV Padmavathy Hospital)

**The Pain:** PTV Padmavathy Hospital is the best — often the only good — hospital available to Pannaipuram residents. But nobody knows which doctor is available on which day, what time OPD runs, or what departments exist. People travel there and come back without being seen.

**What the App Does:**
- Doctor listing with photo (optional), specialisation, and availability schedule
  - Example: "Dr. [Name] — General Medicine — Mon, Wed, Fri — 9am to 12pm"
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

### Module 5 — அவசர தொலைபேசி (Emergency Contacts)

**The Pain:** In a crisis — power fault, medical emergency, water problem — people don't have the right numbers and can't find them quickly in Tamil.

**What the App Does:**
- Single screen, large tap-to-call buttons in Tamil:
  - TNEB Fault Line: 1912
  - TNEB Local Subdivision Office
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

## 4. Home Screen Design Concept

```
┌─────────────────────────────────────┐
│  பன்னைபுரம்                    🔔   │
│  உங்கள் ஊரின் தகவல் மையம்         │
├─────────────────────────────────────┤
│  ⚡ மின் தடை இல்லை இன்று           │
│  💧 தண்ணீர் — இன்னும் வரவில்லை     │
├──────────────┬──────────────────────┤
│              │                      │
│  ⚡           │  💧                  │
│  மின்சாரம்    │  தண்ணீர்             │
│  Electricity  │  Water               │
│              │                      │
├──────────────┼──────────────────────┤
│              │                      │
│  🚌           │  🏥                  │
│  பேருந்து     │  மருத்துவமனை         │
│  Bus Times   │  Hospital            │
│              │                      │
├──────────────┴──────────────────────┤
│  📞  அவசர தொலைபேசி  Emergency       │
└─────────────────────────────────────┘
```

Large icons, Tamil first, English small below. No clutter. One tap to any module.

---

## 5. The Community Alert Flow (Water)

```
Resident A opens app
        ↓
Taps 💧 "தண்ணீர் வந்தது!" button
        ↓
App asks: "உங்கள் தெரு?" (Your street?)
[North Street] [South Street] [Main Road] [Other]
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

## 6. Data Strategy — What Comes From Where

| Module | Data Source | Online / Offline | Who Updates |
|---|---|---|---|
| Power cuts | TNEB portal scrape + Admin | Online fetch + offline cache | Auto + Admin |
| Water alerts | Community (residents) | Offline capable | Any resident |
| Bus timings | Manually collected from TNSTC / conductors | 100% Offline | Admin (rare) |
| Hospital doctors | Manually collected from hospital | 100% Offline | Admin |
| Emergency contacts | Manually collected | 100% Offline | Admin (rare) |

**Key insight:** 4 out of 5 modules require NO ongoing API or internet dependency. The data is stable, local, and manually sourced. This makes the app extremely cheap to run and highly reliable.

---

## 7. Non-Functional Requirements

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

## 8. Distribution Plan

- APK hosted on Firebase App Distribution or a simple static link
- **QR code** generated and:
  - Printed on a paper notice at panchayat office, TNEB office, bus stand, hospital entrance
  - Shared in WhatsApp groups (panchayat group, residents groups)
- The water alert feature creates organic sharing: users share the app when they alert their street
- No Google Play account required for the end user to install

---

## 9. Technical Stack

| Layer | Choice | Reason |
|---|---|---|
| Mobile App | Flutter (Dart) | Tamil font support, offline-first, single codebase |
| Local Storage | SQLite (via Drift) | Offline bus times, hospital data, emergency contacts |
| Push Notifications | Firebase Cloud Messaging | Free, reliable, works on Android |
| Backend | Node.js + Express (lightweight) | For water alerts, admin panel |
| Database | PostgreSQL | Community alerts, admin content |
| Hosting | Render / Railway (free tier) | Low cost for village-scale traffic |
| Admin Panel | Simple web dashboard | For Venthan to update content remotely |
| TNEB Data | Web scraping (Cheerio/Puppeteer) | Scheduled maintenance cuts |
| Analytics | Firebase Analytics | Track which module used most |

---

## 10. Data Collection Checklist (For Venthan — Ground Work)

Before development begins, the following must be collected in person:

### PTV Padmavathy Hospital
- [ ] List of doctors with specialisation
- [ ] Each doctor's OPD days and timings
- [ ] Department list and their hours
- [ ] Casualty / Emergency number
- [ ] Ambulance number
- [ ] Hospital address
- [ ] Pharmacy timings

### Bus Routes
- [ ] Pannaipuram → Thevaram: all departure times
- [ ] Pannaipuram → Uthamapalayam: all departure times
- [ ] Any connecting routes via main bus stand
- [ ] Last bus timings for each route
- [ ] Confirm with local conductor / TNSTC office

### Panchayat & Utilities
- [ ] Panchayat office contact number and hours
- [ ] Water board / supply contact
- [ ] Normal water supply timing (morning / evening)
- [ ] TNEB local subdivision office number
- [ ] Nearest police station name and number
- [ ] Fire station number
- [ ] Nearest government hospital / PHC number

---

## 11. Phased Delivery Plan

### Phase 1 — Requirements ✅ DONE
This document. Vision locked.

### Phase 2 — Backend Design (Week 1)
- Database schema
- REST API endpoints (water alerts, admin panel, push notifications)
- TNEB scraping design
- Admin dashboard specification

### Phase 3 — App UI Design (Week 2)
- Tamil wireframes for all 5 screens
- Icon design (simple, visual)
- Home screen with live status cards
- Community alert flow mockup

### Phase 4 — Build (Week 3–6)
- Flutter app: all 5 modules
- Backend: water alert API, push notification service
- Admin panel: content management for hospital, bus, contacts
- TNEB scraper

### Phase 5 — Content Entry (Week 6)
- Enter all manually collected data (hospital, bus, contacts)
- Test Tamil text rendering on actual devices
- QR code generation

### Phase 6 — Test (Week 7)
- Test on low-end Android devices (2GB RAM)
- Offline mode testing
- Community water alert end-to-end test
- Push notification delivery test

### Phase 7 — Launch (Week 8)
- Deploy backend
- Generate QR code
- Print and post at panchayat, bus stand, hospital, TNEB office
- Share in WhatsApp groups
- Collect feedback from first 50 users

---

## 12. Why This Will Work

> **It solves problems people have today — not someday.**

- Someone will miss the power cut tomorrow. This app tells them before it happens.
- Someone's mother will miss the water today. This app alerts her.
- Someone will miss the last bus to Uthamapalayam. This app prevents it.
- Someone will travel to the hospital on the wrong day. This app saves that trip.
- Someone won't know who to call when the power doesn't come back. This app has the number.

Every feature in this app solves something that happened to someone in Pannaipuram last week.

---

*Built with ❤️ for Pannaipuram by Venthan — Technology for Real People*
