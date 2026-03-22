# Pannaipuram Community App — Requirements Document

> **Project Codename:** Pannaipuram Connect
> **Version:** 1.0 (Draft)
> **Date:** March 2026
> **Author:** Venthan (Senior Software Engineer)
> **Status:** Requirements Phase (Phase 1 of 6)

---

## 1. Project Vision

Build a simple, Tamil-first Android application that empowers the farming and rural community of **Pannaipuram** by giving them easy access to:

- Agricultural and crop guidance
- Local weather forecasts
- Government schemes and subsidies they are eligible for
- Basic medical and health information

The app must be extremely simple to **download**, **share**, and **use** — even by first-time smartphone users. Distribution happens primarily via **WhatsApp** using a **QR code link**.

---

## 2. Target Users

| User Type | Description |
|---|---|
| Farmers | Primary users; need crop, weather, and subsidy info |
| Elderly residents | Require large text, simple navigation, voice support |
| Women SHG members | Self-Help Group members who apply for financial schemes |
| General public | Medical and government scheme seekers |

**Primary language:** Tamil (தமிழ்)
**Secondary language:** English (small subtitle below Tamil text)
**Literacy assumption:** Low to moderate; icon-first UI design required

---

## 3. Scope and Features

### 3.1 Module 1 — Crop Information (பயிர் தகவல்)
- Crop calendar: sowing and harvest seasons for common crops (paddy, groundnut, cotton, vegetables)
- Crop-specific care tips (watering, fertilizer, spacing)
- Common pest and disease identification with remedy suggestions
- Soil health guidelines
- Latest agricultural news from Tamil Nadu Agriculture Department

### 3.2 Module 2 — Weather (வானிலை)
- Current weather for Pannaipuram / nearest district
- 5-day forecast with icons (sun, rain, storm)
- Extreme weather alerts (drought, cyclone, heavy rain warnings)
- Best days for spraying / harvesting based on weather
- Data source: India Meteorological Department (IMD) API or OpenWeatherMap API

### 3.3 Module 3 — Government Schemes (அரசு திட்டங்கள்)
- Central government schemes: PM-KISAN, PM Fasal Bima Yojana, Kisan Credit Card
- Tamil Nadu state schemes: Chief Minister's Drought Relief, TANHODA, TNAU advisories
- Eligibility checker (simple Q&A: land owned? Yes/No, income level, etc.)
- Application process steps with links / offline form guidance
- Deadline reminders and notifications
- Contact numbers for local agriculture officers

### 3.4 Module 4 — Finance and Subsidies (நிதி உதவி)
- Crop loans and interest subvention schemes
- Seed, fertilizer, and equipment subsidies
- Women SHG microfinance links (NABARD, Tamil Nadu Corporation for Women)
- Bank contact list: nearest branches with agricultural loan desks
- Subsidy application status checker (if government API available)

### 3.5 Module 5 — Medical Information (மருத்துவ தகவல்)
- Nearest government hospitals and PHC (Primary Health Centre) details
- Health camp schedules announced by local panchayat
- Basic first aid information in Tamil
- National health helplines: Arogya Setu, 104 health helpline
- Vaccination drive schedules
- Common seasonal illness awareness (dengue, cholera, heat stroke)

### 3.6 Module 6 — Community Notice Board (ஊர் அறிவிப்பு)
- Local panchayat announcements
- Mela / market day reminders
- Emergency alerts from local administration
- Controlled: only verified admin can post

---

## 4. Non-Functional Requirements

| Category | Requirement |
|---|---|
| Language | Tamil as default; English sub-label on all buttons and headings |
| Offline Mode | Core content (crop tips, scheme list, medical contacts) must work offline |
| Accessibility | Minimum font size 18sp; high contrast; voice-over friendly |
| App Size | Under 20 MB to accommodate low-storage devices |
| Android Version | Support Android 6.0 (API 23) and above |
| Internet | 2G/3G tolerant; lazy loading; compressed images |
| Performance | App launch under 3 seconds on mid-range device |
| Security | No personal data stored without consent; HTTPS only for API calls |

---

## 5. Distribution Strategy

- **APK hosted** on a simple static website or Firebase App Distribution
- **QR Code** generated pointing to APK download URL
- QR Code image shared via **WhatsApp groups** (Panchayat, Farmers, SHG groups)
- No mandatory Play Store account required for the end user
- Admin/Dev uses Google Play Internal Testing for controlled rollout (optional later)

---

## 6. Technical Stack (Proposed)

| Layer | Technology | Reason |
|---|---|---|
| Mobile App | Flutter (Dart) | Single codebase, Tamil font support, fast UI |
| Backend API | Node.js + Express or Python FastAPI | Lightweight, easy to host |
| Database | PostgreSQL (main) + Redis (cache) | Reliable, free tier available |
| Hosting | Railway / Render / AWS Free Tier | Low cost for pilot |
| Weather API | OpenWeatherMap (free tier) | Covers Indian cities, JSON response |
| Storage | Firebase Storage or Cloudinary | For images, PDF scheme documents |
| Auth (Admin) | Firebase Auth | Simple admin login for notice board |
| Analytics | Firebase Analytics | Track which module is most used |

---

## 7. Phased Delivery Plan

### Phase 1 — Requirements ✅ (Current)
- Stakeholder needs identified
- Feature list finalised
- Tech stack decided
- This document

### Phase 2 — Backend Design & API (Week 1–2)
- Database schema design
- REST API endpoints specification
- Weather, scheme data aggregation logic
- Admin panel for notice board
- API documentation (Swagger/OpenAPI)

### Phase 3 — Frontend / App Design (Week 2–3)
- Tamil UI wireframes (Figma or hand-drawn)
- Screen-by-screen design: Home, Crop, Weather, Schemes, Finance, Medical
- Icon set (simple, visual, no text dependency)
- Tamil font integration (Noto Sans Tamil)
- Prototype review with community feedback (if possible)

### Phase 4 — Implementation (Week 3–6)
- Flutter app development
- Backend API development and integration
- Tamil content authoring (crop tips, scheme descriptions)
- QR code generation
- WhatsApp deep link for easy sharing

### Phase 5 — Testing (Week 6–7)
- Unit testing (APIs)
- Widget testing (Flutter screens)
- User testing with 5–10 actual Pannaipuram community members
- Tamil text rendering validation
- Offline mode testing on low-end devices (2 GB RAM phone)
- Performance and load testing

### Phase 6 — Deployment (Week 7–8)
- APK hosted on Firebase App Distribution or static CDN
- QR code printed and distributed via panchayat and WhatsApp
- Backend deployed on cloud (Render or Railway)
- Monitoring and alerting set up (Uptime Robot)
- Feedback collection mechanism (WhatsApp number or simple in-app form)

---

## 8. Risks and Mitigations

| Risk | Mitigation |
|---|---|
| Low internet connectivity | Offline-first design; cache key data locally |
| Low digital literacy | Voice prompts, icon-first UI, community demo sessions |
| Government scheme data changes frequently | Admin panel to update content without app release |
| Tamil content accuracy | Review by a local educated volunteer before publish |
| APK install from unknown sources blocked | Clear step-by-step guide image shared via WhatsApp |

---

## 9. Success Metrics

- **Downloads:** 500+ within first 3 months via QR/WhatsApp sharing
- **Active Users:** At least 200 monthly active users
- **Scheme Awareness:** 50+ users who discover a new scheme they were unaware of
- **Weather Check:** Weather module opened daily by majority of farming users
- **Feedback:** 4/5 or above satisfaction from community members

---

## 10. Next Steps

1. Review and approve this requirements document
2. Identify a local community volunteer to assist with Tamil content
3. Proceed to **Phase 2: Backend Design**
4. Set up project GitHub repository and project board
5. Allocate budget estimate for hosting (~$5–10/month for cloud backend)

---

*Built with ❤️ for Pannaipuram — Technology for Every Tamil Farmer*
