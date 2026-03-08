# பண்ணைப்புரம் App — Backend Design
### Phase 2 of 7

> **Version:** 1.0
> **Date:** March 2026
> **Author:** Venthan (Senior Software Engineer)
> **Status:** Phase 2 — Backend Design

---

## 1. Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    Flutter Android App                   │
└───────────────────────┬─────────────────────────────────┘
                        │ HTTPS REST API
┌───────────────────────▼─────────────────────────────────┐
│                 Node.js + Express Server                  │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────┐  │
│  │  API Routes  │  │  TNEB Scraper│  │  FCM Service   │  │
│  │  (Mobile)   │  │  (Cron Job)  │  │  (Push Notif.) │  │
│  └──────┬──────┘  └──────┬───────┘  └───────┬────────┘  │
└─────────┼────────────────┼──────────────────┼───────────┘
          │                │                  │
┌─────────▼────────────────▼──────────────────▼───────────┐
│                      PostgreSQL DB                        │
└─────────────────────────────────────────────────────────┘
          │
┌─────────▼──────────────────┐
│   Admin Web Dashboard      │
│   (Venthan manages content)│
└────────────────────────────┘
```

**Hosting:** Render.com free tier (backend + DB) — ~$0/month for village-scale traffic
**Push Notifications:** Firebase Cloud Messaging (FCM) — free
**TNEB Scraper:** Cron job runs every 6 hours inside the same server

---

## 2. Database Schema

### 2.1 Streets & Wards

```sql
-- 15 wards of பண்ணைப்புரம்
CREATE TABLE wards (
  id          SERIAL PRIMARY KEY,
  number      INTEGER NOT NULL,        -- 1 to 15
  name_tamil  VARCHAR(100),
  name_english VARCHAR(100)
);

-- 57 streets of பண்ணைப்புரம்
CREATE TABLE streets (
  id           SERIAL PRIMARY KEY,
  name_tamil   VARCHAR(150) NOT NULL,
  name_english VARCHAR(150),
  ward_id      INTEGER REFERENCES wards(id),
  created_at   TIMESTAMP DEFAULT NOW()
);

-- Seed data (1 known so far)
INSERT INTO streets (name_tamil, name_english)
VALUES ('வள்ளுவர் தெரு', 'Valluvar Street');
-- Remaining 56 streets to be added from panchayat list
```

---

### 2.2 Water Module

```sql
-- Water supply schedule per street
CREATE TABLE water_schedules (
  id              SERIAL PRIMARY KEY,
  street_id       INTEGER REFERENCES streets(id),
  frequency_days  INTEGER NOT NULL,   -- e.g. 3 (every 3 days)
  supply_time     TIME NOT NULL,       -- e.g. 06:00:00
  last_supply_date DATE,               -- to calculate next supply date
  notes_tamil     VARCHAR(255),
  updated_at      TIMESTAMP DEFAULT NOW()
);

-- Seed: Valluvar Street
INSERT INTO water_schedules (street_id, frequency_days, supply_time, last_supply_date)
VALUES (1, 3, '06:00:00', CURRENT_DATE);

-- Community water alerts (resident taps "water came")
CREATE TABLE water_alerts (
  id              SERIAL PRIMARY KEY,
  street_id       INTEGER REFERENCES streets(id),
  device_id       VARCHAR(255),        -- anonymous device ID
  reported_at     TIMESTAMP DEFAULT NOW(),
  confirmations   INTEGER DEFAULT 0   -- how many others confirmed
);
```

---

### 2.3 Power Module

```sql
-- Power cut schedule (from TNEB scraper or admin entry)
CREATE TABLE power_cuts (
  id               SERIAL PRIMARY KEY,
  area_description VARCHAR(255),       -- "Pannaipuram and surrounding areas"
  cut_type         VARCHAR(20) NOT NULL CHECK (cut_type IN ('planned','unplanned')),
  start_time       TIMESTAMP NOT NULL,
  end_time         TIMESTAMP,          -- NULL if unknown
  reason_tamil     VARCHAR(255),
  source           VARCHAR(50),        -- 'tneb_scraper' or 'admin'
  is_resolved      BOOLEAN DEFAULT FALSE,
  created_at       TIMESTAMP DEFAULT NOW()
);

-- User confirmation "power is back"
CREATE TABLE power_restorations (
  id           SERIAL PRIMARY KEY,
  power_cut_id INTEGER REFERENCES power_cuts(id),
  device_id    VARCHAR(255),
  reported_at  TIMESTAMP DEFAULT NOW()
);
```

---

### 2.4 Bus Module

```sql
-- Two corridors
CREATE TABLE bus_corridors (
  id            SERIAL PRIMARY KEY,
  name_tamil    VARCHAR(100) NOT NULL,  -- 'போடி பக்கம்'
  name_english  VARCHAR(100),           -- 'Towards Bodi'
  color_hex     VARCHAR(7)              -- '#2196F3' (blue) or '#4CAF50' (green)
);

-- Seed corridors
INSERT INTO bus_corridors (name_tamil, name_english, color_hex) VALUES
  ('போடி பக்கம்', 'Towards Bodi', '#2196F3'),
  ('கம்பம் பக்கம்', 'Towards Kamban', '#4CAF50');

-- Bus routes (e.g. Pannaipuram → Thevaram → Bodi)
CREATE TABLE bus_routes (
  id            SERIAL PRIMARY KEY,
  corridor_id   INTEGER REFERENCES bus_corridors(id),
  direction     VARCHAR(10) CHECK (direction IN ('outbound','inbound')),
  origin_tamil  VARCHAR(100),
  dest_tamil    VARCHAR(100),
  stops_tamil   TEXT,                  -- comma-separated stop names
  notes_tamil   VARCHAR(255)
);

-- Individual bus departure times
CREATE TABLE bus_timings (
  id           SERIAL PRIMARY KEY,
  route_id     INTEGER REFERENCES bus_routes(id),
  departs_at   TIME NOT NULL,          -- e.g. 07:45:00
  days_of_week VARCHAR(20) DEFAULT 'daily',  -- 'daily', 'weekdays', 'sundays'
  bus_type     VARCHAR(20) DEFAULT 'ordinary', -- 'ordinary', 'express', 'SETC'
  is_last_bus  BOOLEAN DEFAULT FALSE,
  is_active    BOOLEAN DEFAULT TRUE
);
```

---

### 2.5 Hospital Module

```sql
-- Hospitals (PTV Padmavathy for now)
CREATE TABLE hospitals (
  id               SERIAL PRIMARY KEY,
  name_tamil       VARCHAR(150) NOT NULL,
  name_english     VARCHAR(150),
  address_tamil    TEXT,
  phone_casualty   VARCHAR(20),
  phone_ambulance  VARCHAR(20),
  phone_general    VARCHAR(20),
  pharmacy_hours   VARCHAR(100),
  notes_tamil      TEXT
);

-- Seed: PTV Padmavathy Hospital
INSERT INTO hospitals (name_tamil, name_english)
VALUES ('PTV பத்மாவதி மருத்துவமனை', 'PTV Padmavathy Hospital');

-- Doctors
CREATE TABLE doctors (
  id               SERIAL PRIMARY KEY,
  hospital_id      INTEGER REFERENCES hospitals(id),
  name_tamil       VARCHAR(100) NOT NULL,
  name_english     VARCHAR(100),
  specialisation   VARCHAR(100),        -- TBC for Dr. Sekar
  photo_url        VARCHAR(255),
  is_active        BOOLEAN DEFAULT TRUE
);

-- Seed: Dr. Sekar
INSERT INTO doctors (hospital_id, name_tamil, name_english)
VALUES (1, 'டாக்டர் சேகர்', 'Dr. Sekar');

-- Doctor availability schedule
CREATE TABLE doctor_schedules (
  id          SERIAL PRIMARY KEY,
  doctor_id   INTEGER REFERENCES doctors(id),
  day_of_week INTEGER NOT NULL,   -- 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
  start_time  TIME,               -- NULL = 'morning' until confirmed
  end_time    TIME,               -- NULL = 'evening' until confirmed
  notes_tamil VARCHAR(150)
);

-- Seed: Dr. Sekar — Wednesday
INSERT INTO doctor_schedules (doctor_id, day_of_week, notes_tamil)
VALUES (1, 3, 'காலை முதல் மாலை வரை');
-- start_time / end_time to be updated when exact times confirmed
```

---

### 2.6 Emergency Contacts

```sql
CREATE TABLE emergency_contacts (
  id           SERIAL PRIMARY KEY,
  category     VARCHAR(30) CHECK (category IN ('power','medical','police','panchayat','fire','other')),
  name_tamil   VARCHAR(150) NOT NULL,
  name_english VARCHAR(150),
  phone        VARCHAR(20) NOT NULL,
  is_national  BOOLEAN DEFAULT FALSE,  -- national helpline vs local number
  is_verified  BOOLEAN DEFAULT FALSE,
  display_order INTEGER DEFAULT 0
);

-- Seed: Verified contacts so far
INSERT INTO emergency_contacts (category, name_tamil, name_english, phone, is_verified) VALUES
  ('power', 'TNEB உள்ளூர் புகார் எண்', 'TNEB Local Complaint', '9498794987', TRUE),
  ('power', 'TNEB தேசிய புகார் எண்', 'TNEB National Fault Line', '1912', TRUE);
-- Remaining contacts to be added as collected
```

---

### 2.7 Devices (Push Notifications)

```sql
-- Anonymous device registration for push notifications
CREATE TABLE devices (
  id           SERIAL PRIMARY KEY,
  fcm_token    TEXT UNIQUE NOT NULL,
  street_id    INTEGER REFERENCES streets(id),  -- user's street
  registered_at TIMESTAMP DEFAULT NOW(),
  last_seen    TIMESTAMP DEFAULT NOW()
);
```

---

## 3. REST API Endpoints

### 3.1 Mobile App APIs (Public — no auth required)

#### Water
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/water/schedule/:streetId` | Get water schedule for a street |
| GET | `/api/water/schedule` | Get all street schedules |
| POST | `/api/water/alert` | Report "water came" for a street |
| GET | `/api/water/alerts/today` | Get today's community water alerts |

#### Power
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/power/cuts` | Get upcoming + active power cuts |
| GET | `/api/power/cuts/today` | Today's power cut status |
| POST | `/api/power/restored` | Report "power is back" |

#### Bus
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/bus/corridors` | Get both corridors |
| GET | `/api/bus/timings/:corridorId` | All timings for a corridor |
| GET | `/api/bus/next` | Next bus in each direction right now |

#### Hospital
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/hospital/doctors` | All doctors with schedules |
| GET | `/api/hospital/doctors/today` | Doctors available today |
| GET | `/api/hospital/info` | Hospital contact info |

#### Emergency
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/emergency/contacts` | All emergency contacts by category |

#### Devices
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/devices/register` | Register device + FCM token + street |
| PUT | `/api/devices/street` | Update device's selected street |

---

### 3.2 Admin APIs (Auth required — Venthan only)

| Method | Endpoint | Description |
|---|---|---|
| POST | `/admin/power/cuts` | Add new power cut (manual) |
| PUT | `/admin/power/cuts/:id` | Update power cut |
| POST | `/admin/doctors` | Add new doctor |
| PUT | `/admin/doctors/:id` | Update doctor info / schedule |
| POST | `/admin/bus/timings` | Add bus timing |
| PUT | `/admin/bus/timings/:id` | Update bus timing |
| POST | `/admin/streets` | Add new street |
| PUT | `/admin/water/schedule/:streetId` | Update water schedule for a street |
| POST | `/admin/emergency/contacts` | Add emergency contact |
| PUT | `/admin/emergency/contacts/:id` | Update emergency contact |
| GET | `/admin/dashboard` | Overview — active alerts, device count |

---

## 4. Push Notification Strategy

| Trigger | Who Gets It | Message (Tamil) |
|---|---|---|
| Power cut scheduled | All devices | "நாளை [time] மின் தடை — [duration]" |
| Water coming tomorrow | Devices on that street | "நாளை காலை 6 மணிக்கு தண்ணீர் வரும்!" |
| Water day morning (5:45am) | Devices on that street | "15 நிமிடத்தில் தண்ணீர் வரும்!" |
| Community water alert | All devices | "💧 தண்ணீர் வந்தது! — [street] — [time]" |
| Water no-show by 7am | Devices on that street | "இன்னும் தண்ணீர் வரவில்லை — பஞ்சாயத்தை தொடர்பு கொள்ளுங்கள்" |
| Last bus alert | All devices | "கடைசி பேருந்து 1 மணி நேரத்தில்!" |

**Implementation:** Firebase Admin SDK sends notifications via FCM tokens stored in the `devices` table. Street-specific notifications filter by `street_id`.

---

## 5. TNEB Scraper Design

```
Cron job: Runs every 6 hours
    ↓
Fetch TNEB Tamil Nadu power cut page
(Target: tnebltd.gov.in scheduled shutdown notices)
    ↓
Parse HTML — extract:
  - Date / time of cut
  - Area description
  - Duration
    ↓
Check: Is "Pannaipuram" or "Uthamapalayam" mentioned?
    ↓
YES → Save to power_cuts table
      → Send push notification to all app devices
NO  → Discard, log run
    ↓
Admin can always override / add manually
```

**Tech:** Node.js + Cheerio (HTML parsing) + node-cron (scheduling)

---

## 6. Admin Dashboard

Simple web UI for Venthan to manage all content remotely without touching code.

**Pages:**
- **Dashboard** — active power cuts, today's water alerts, device count
- **Power Cuts** — add/edit/delete scheduled and manual cuts
- **Water Schedules** — set per-street frequency and timing
- **Bus Timings** — manage both corridors, add/remove timings
- **Doctors** — add doctors, update schedules, mark unavailable
- **Emergency Contacts** — add/update/verify contact numbers
- **Streets** — manage the 57 streets list
- **Send Notification** — manual push notification to all or specific streets

**Auth:** Simple email + password login (Venthan only). JWT token.

---

## 7. Folder Structure

```
Pannaipuram/
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   │   ├── water.js
│   │   │   ├── power.js
│   │   │   ├── bus.js
│   │   │   ├── hospital.js
│   │   │   ├── emergency.js
│   │   │   ├── devices.js
│   │   │   └── admin/
│   │   │       ├── auth.js
│   │   │       ├── power.js
│   │   │       ├── water.js
│   │   │       ├── bus.js
│   │   │       ├── hospital.js
│   │   │       └── contacts.js
│   │   ├── services/
│   │   │   ├── tnebScraper.js
│   │   │   ├── pushNotifications.js
│   │   │   └── waterScheduler.js
│   │   ├── db/
│   │   │   ├── schema.sql
│   │   │   └── seed.sql
│   │   ├── middleware/
│   │   │   └── auth.js
│   │   └── app.js
│   ├── package.json
│   └── .env.example
├── admin-dashboard/       ← Phase 3
├── app/                   ← Flutter app, Phase 3
└── docs/
    ├── requirements.md    ✅
    └── backend-design.md  ✅ (this file)
```

---

## 8. Environment Variables

```env
# Database
DATABASE_URL=postgresql://user:password@host:5432/pannaipuram

# Firebase
FIREBASE_PROJECT_ID=pannaipuram-app
FIREBASE_PRIVATE_KEY=...
FIREBASE_CLIENT_EMAIL=...

# Auth
JWT_SECRET=...
ADMIN_EMAIL=venthan89@gmail.com

# Server
PORT=3000
NODE_ENV=production
```

---

## 9. Next Step — Phase 3: App UI Design

Backend design is complete. Before writing code, the next phase is:
- Wireframes for all 5 screens in Tamil
- Home screen layout with live status cards
- Bus screen with corridor tabs
- Water alert community flow
- Doctor availability "today" screen

---

*Built with ❤️ for பண்ணைப்புரம் by Venthan — Technology for Real People*
