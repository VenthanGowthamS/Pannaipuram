-- பண்ணைப்புரம் App — Database Schema
-- Run: psql -d pannaipuram -f schema.sql

-- ─────────────────────────────────────
-- Streets & Wards
-- ─────────────────────────────────────

CREATE TABLE IF NOT EXISTS wards (
  id           SERIAL PRIMARY KEY,
  number       INTEGER NOT NULL UNIQUE,
  name_tamil   VARCHAR(100),
  name_english VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS streets (
  id           SERIAL PRIMARY KEY,
  name_tamil   VARCHAR(150) NOT NULL,
  name_english VARCHAR(150),
  ward_id      INTEGER REFERENCES wards(id),
  created_at   TIMESTAMP DEFAULT NOW()
);

-- ─────────────────────────────────────
-- Water Module
-- ─────────────────────────────────────

CREATE TABLE IF NOT EXISTS water_schedules (
  id               SERIAL PRIMARY KEY,
  street_id        INTEGER REFERENCES streets(id) UNIQUE,
  frequency_days   INTEGER NOT NULL DEFAULT 3,
  supply_time      TIME NOT NULL DEFAULT '06:00:00',
  last_supply_date DATE,
  notes_tamil      VARCHAR(255),
  updated_at       TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS water_alerts (
  id            SERIAL PRIMARY KEY,
  street_id     INTEGER REFERENCES streets(id),
  device_id     VARCHAR(255),
  reported_at   TIMESTAMP DEFAULT NOW(),
  confirmations INTEGER DEFAULT 0
);

-- ─────────────────────────────────────
-- Power Module
-- ─────────────────────────────────────

CREATE TABLE IF NOT EXISTS power_cuts (
  id               SERIAL PRIMARY KEY,
  area_description VARCHAR(255),
  cut_type         VARCHAR(20) NOT NULL DEFAULT 'planned'
                   CHECK (cut_type IN ('planned','unplanned')),
  start_time       TIMESTAMP NOT NULL,
  end_time         TIMESTAMP,
  reason_tamil     VARCHAR(255),
  source           VARCHAR(50) DEFAULT 'admin'
                   CHECK (source IN ('tneb_scraper','admin')),
  is_resolved      BOOLEAN DEFAULT FALSE,
  created_at       TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS power_restorations (
  id           SERIAL PRIMARY KEY,
  power_cut_id INTEGER REFERENCES power_cuts(id),
  device_id    VARCHAR(255),
  reported_at  TIMESTAMP DEFAULT NOW()
);

-- ─────────────────────────────────────
-- Bus Module
-- ─────────────────────────────────────

CREATE TABLE IF NOT EXISTS bus_corridors (
  id            SERIAL PRIMARY KEY,
  name_tamil    VARCHAR(100) NOT NULL,
  name_english  VARCHAR(100),
  color_hex     VARCHAR(7)
);

CREATE TABLE IF NOT EXISTS bus_routes (
  id            SERIAL PRIMARY KEY,
  corridor_id   INTEGER REFERENCES bus_corridors(id),
  direction     VARCHAR(10) CHECK (direction IN ('outbound','inbound')),
  origin_tamil  VARCHAR(100),
  dest_tamil    VARCHAR(100),
  stops_tamil   TEXT,
  notes_tamil   VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS bus_timings (
  id            SERIAL PRIMARY KEY,
  route_id      INTEGER REFERENCES bus_routes(id),
  departs_at    TIME NOT NULL,
  days_of_week  VARCHAR(20) DEFAULT 'daily',
  bus_type      VARCHAR(20) DEFAULT 'ordinary',
  is_last_bus   BOOLEAN DEFAULT FALSE,
  is_active     BOOLEAN DEFAULT TRUE
);

-- ─────────────────────────────────────
-- Hospital Module
-- ─────────────────────────────────────

CREATE TABLE IF NOT EXISTS hospitals (
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

CREATE TABLE IF NOT EXISTS doctors (
  id               SERIAL PRIMARY KEY,
  hospital_id      INTEGER REFERENCES hospitals(id),
  name_tamil       VARCHAR(100) NOT NULL,
  name_english     VARCHAR(100),
  specialisation   VARCHAR(100),
  photo_url        VARCHAR(255),
  is_active        BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS doctor_schedules (
  id          SERIAL PRIMARY KEY,
  doctor_id   INTEGER REFERENCES doctors(id),
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time  TIME,
  end_time    TIME,
  notes_tamil VARCHAR(150)
);

-- ─────────────────────────────────────
-- Emergency Contacts
-- ─────────────────────────────────────

CREATE TABLE IF NOT EXISTS emergency_contacts (
  id            SERIAL PRIMARY KEY,
  category      VARCHAR(30) CHECK (category IN ('power','medical','police','panchayat','fire','other')),
  name_tamil    VARCHAR(150) NOT NULL,
  name_english  VARCHAR(150),
  phone         VARCHAR(20) NOT NULL,
  is_national   BOOLEAN DEFAULT FALSE,
  is_verified   BOOLEAN DEFAULT FALSE,
  display_order INTEGER DEFAULT 0
);

-- ─────────────────────────────────────
-- Auto / Van Drivers
-- ─────────────────────────────────────

CREATE TABLE IF NOT EXISTS auto_drivers (
  id               SERIAL PRIMARY KEY,
  name_tamil       VARCHAR(150) NOT NULL,
  name_english     VARCHAR(150),
  phone            VARCHAR(20) NOT NULL,
  vehicle_type     VARCHAR(20) NOT NULL DEFAULT 'auto'
                   CHECK (vehicle_type IN ('auto','van','car')),
  coverage_tamil   VARCHAR(255),
  coverage_english VARCHAR(255),
  schedule_tamil   VARCHAR(255),
  is_active        BOOLEAN DEFAULT TRUE,
  display_order    INTEGER DEFAULT 0,
  created_at       TIMESTAMP DEFAULT NOW()
);

-- ─────────────────────────────────────
-- Devices (Push Notifications)
-- ─────────────────────────────────────

CREATE TABLE IF NOT EXISTS devices (
  id            SERIAL PRIMARY KEY,
  fcm_token     TEXT UNIQUE NOT NULL,
  street_id     INTEGER REFERENCES streets(id),
  registered_at TIMESTAMP DEFAULT NOW(),
  last_seen     TIMESTAMP DEFAULT NOW()
);

-- ─────────────────────────────────────
-- Admin Users
-- ─────────────────────────────────────

CREATE TABLE IF NOT EXISTS admin_users (
  id            SERIAL PRIMARY KEY,
  email         VARCHAR(150) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at    TIMESTAMP DEFAULT NOW()
);
