# பண்ணைப்புரம் — Claude Development Rules

**Project:** பண்ணைப்புரம் (Pannaipuram) Village Information App
**Developer:** Venthan (venthan89@gmail.com)
**Last Updated:** March 2026

---

## Documentation First

Before making ANY changes to the codebase:

1. **Always read these documents in order:**
   - `/docs/requirements.md` — What the app does and current phase status
   - `/docs/ui-design.md` — Screen layouts and visual design (implemented)
   - `/docs/backend-design.md` — Database, API, deployment info

2. **Always check the current code** before editing
   - Read the file you're about to edit
   - Understand the existing pattern
   - Don't break existing functionality

3. **After ANY change, update relevant docs**
   - If you modify a feature → update `requirements.md` phase status
   - If you change a screen → update `ui-design.md`
   - If you change an API endpoint → update `backend-design.md`

---

## Language & Localization

### Tamil Text Rules

- **Always use colloquial Tamil** (not formal/literary)
- **Never use formal "வணக்கம்" or similar** — use street-level Tamil like "சார்", "சிஸ்டர்", "அண்ணை", "அக்கா"
- **Example colloquial phrases already in app:**
  - "சொல்லுங்க, என்ன வேணும்?" (What do you need?)
  - "சார், ஆட்டோ வேணுமா?" (Sir, need an auto?)
  - "சிஸ்டர், டாக்டர் வந்துட்டாரா?" (Sister, did the doctor come?)

- **ALWAYS include English sub-label below Tamil**
  - Tamil: 22–24sp, bold, `NotoSansTamil`
  - English: 12sp, regular, `Roboto`
  - Example:
    ```dart
    Text('சார், ஆட்டோ வேணுமா?', style: TextStyle(fontFamily: 'NotoSansTamil', fontSize: 20, fontWeight: FontWeight.bold))
    Text('Auto & Car Transport', style: TextStyle(fontFamily: 'Roboto', fontSize: 12))
    ```

### Font Rules

- **Tamil text:** Always use `NotoSansTamil` (already in `pubspec.yaml`)
- **English text:** Use `Roboto` (standard Material font)
- **Minimum font size:** 18sp for body text (readable for elderly)
- **Minimum tap target:** 48dp (Material Design accessibility standard)

---

## Code Standards

### Flutter

- **Always check `mounted` before `setState` in async methods**
  ```dart
  Future<void> _load() async {
    try {
      final data = await someApiCall();
      if (!mounted) return;  // ← REQUIRED
      setState(() => _data = data);
    } catch (_) {
      if (!mounted) return;  // ← REQUIRED
      setState(() => _error = true);
    }
  }
  ```

- **Always use NotoSansTamil for Tamil text:**
  ```dart
  Text('பண்ணைப்புரம்',
    style: TextStyle(fontFamily: 'NotoSansTamil', fontSize: 22, fontWeight: FontWeight.bold))
  ```

- **Icon sizing:** 48dp minimum for tap targets
  - Large icons in hero tiles: 44–52px
  - Header icons: 26–28px

- **Colors:** Use values from `app_theme.dart`
  - `AppColors.primary` = deep green
  - `AppColors.powerYellow`, `AppColors.waterBlue`, `AppColors.busOrange`, `AppColors.hospitalRed`

### Backend (Node.js)

- **API Response Format — ALWAYS use this envelope:**
  ```javascript
  res.json({ success: true, data: [...] })
  // For errors:
  res.status(500).json({ success: false, error: 'message' })
  ```

- **All routes expect this format** — Flutter's `ApiService` unwraps the `data` field
  - Water, Power, Bus, Hospital, Emergency, Devices routes
  - Admin routes

---

## Data Validation — Internet Verification Rules

**EVERY TIME** data is added or modified in this project, Claude MUST follow these validation steps:

### 1. Place Names & Geography

- **Search the internet** to verify Tamil place names, English spellings, and correct district/taluk before inserting
- Cross-check with Google Maps or official Tamil Nadu government sources
- Verify that the Tamil spelling (e.g., கூடலூர்) matches the official English name (e.g., Gudalur)
- Confirm geographic relationships: which district, which corridor, nearby towns
- **Example:** When "கடலூர்" appeared in handwritten notes, we searched and confirmed it was கூடலூர் (Gudalur/Koodalur) near Cumbum — NOT Cuddalore (கடலூர்) on the coast

### 2. Bus Routes & Transport Data

- Verify bus corridor destinations exist on actual TNSTC (Tamil Nadu State Transport) routes
- Cross-check town distances and route order (e.g., Pannaipuram → Cumbum → Gudalur → Kumily)
- Validate that bus timings are reasonable (e.g., first bus not before 3:30 AM, last bus not after 9:30 PM for rural routes)
- If reading handwritten Tamil schedules, flag any ambiguous characters and ask Venthan before inserting
- **Never assume** a destination name — if the handwriting is unclear, mark it as ❓ VERIFY

### 3. Phone Numbers & Contacts

- Verify phone number format: Indian mobile = 10 digits starting with 6/7/8/9
- Landline numbers should include STD code (e.g., 04554 for Theni district)
- Search online to validate hospital/police/fire station numbers against official directories
- **Never insert a phone number without verifying format**

### 4. Doctor & Hospital Data

- Verify doctor names and specializations against hospital websites or health department listings when available
- Cross-check GH (Government Hospital) names with Tamil Nadu Health Department data
- Validate hospital timings against standard government hospital schedules (typically 8 AM–8 PM for OPD)

### 5. General Validation Checklist

Before ANY data insertion into Supabase:

1. **Search internet** for the data point (place name, phone number, schedule, etc.)
2. **Cross-reference** with at least one official source (government site, Google Maps, TNSTC)
3. **Show Venthan** any data that couldn't be verified online — don't guess
4. **Document** the source of verification in commit messages or SQL comments
5. **Flag uncertainties** with `-- ⚠️ NEEDS VERIFICATION` comments in SQL

### 6. Tamil Handwriting Reading Rules

When extracting data from handwritten Tamil images:

- **Always show extracted data to Venthan** before inserting into database
- Tamil characters that look similar must be flagged: க/கா, ப/பா, ம/மா, சி/கி, etc.
- Place name abbreviations (போடிநாய் = போடிநாயக்கனூர்) must be confirmed
- If a word appears as a destination but doesn't match any known corridor, **create a verification list** — don't create new corridors without Venthan's approval
- Time readings: verify AM/PM context from surrounding entries (e.g., if previous entry is 17:00, next entry "6:10" is likely 18:10 not 06:10)

---

## Feature Management

### Before Removing a Feature

- **NEVER remove features without asking Venthan first**
- This is Venthan's village app — all features serve real people
- If a feature seems unused, clarify with Venthan before deleting code

### Adding New Modules

1. Define in `requirements.md`
2. Design screen in `ui-design.md`
3. Add API endpoints in `backend-design.md`
4. Build Flutter screen + backend route
5. Update all 3 docs when done

---

## Git & Version Control

### Git Command Rules

- **ALWAYS include full path** — every git command must start with `cd /full/path && git ...`
- **Never give a bare git command** without the cd prefix
- **Project path:** `/sessions/hopeful-peaceful-wozniak/mnt/Pannaipuram`
- **Example — correct:**
  ```bash
  cd /sessions/hopeful-peaceful-wozniak/mnt/Pannaipuram && git status
  cd /sessions/hopeful-peaceful-wozniak/mnt/Pannaipuram && git add backend/src/db/seed_bus_timings_complete.sql && git commit -m "Update bus timings"
  cd /sessions/hopeful-peaceful-wozniak/mnt/Pannaipuram && git push origin main
  ```
- **Example — wrong (never do this):**
  ```bash
  git status          ← ❌ no cd
  git push origin main  ← ❌ no cd
  ```

### After Each Task

1. **Commit with clear message:**
   ```bash
   cd /sessions/hopeful-peaceful-wozniak/mnt/Pannaipuram && git add [files] && git commit -m "Update home screen Tamil labels to use colloquial text"
   ```

2. **Push to main:**
   ```bash
   cd /sessions/hopeful-peaceful-wozniak/mnt/Pannaipuram && git push origin main
   ```

3. **Always push after completing a task** — keeps the repo up to date for Venthan

---

## Deployment & Production

### Production Settings

- **App name:** பண்ணைப்புரம் (Pannaipuram)
- **Production API:** https://pannaipuram-api.onrender.com
- **Database:** Supabase (eoiaexdbnyzysolgwitw), region: Asia-Pacific Singapore
- **Backend:** Hosted on Render.com (Node.js)

### Before Deploying

1. Ensure all unit tests pass
2. Verify Tamil text rendering on actual Android device
3. Test offline mode (no network)
4. Check API responses format: `{success: true, data: [...]}`

---

## Modules Checklist

| Module | Status | Screens | API Routes |
|---|---|---|---|
| Power (மின்சாரம்) | ✅ Complete | power_screen.dart | /api/power/* |
| Water (தண்ணீர்) | ✅ Complete | water_screen.dart | /api/water/* |
| Bus (பேருந்து) | ✅ Complete | bus_screen.dart + bus_route_screen.dart | /api/bus/* |
| Hospital (மருத்துவமனை) | ✅ Complete (2 hospitals) | hospital_screen.dart | /api/hospital/* |
| Auto (ஆட்டோ / வண்டி) | ✅ Complete | auto_screen.dart | /api/auto/* |
| Emergency (அவசர தொலைபேசி) | ✅ Complete | emergency_screen.dart | /api/emergency/* |
| Services (ஊரு சேவை) | ✅ Complete | services_screen.dart | /api/services/* |
| Announcements (அறிவிப்புகள்) | ✅ Complete | home_screen.dart (banner) | /api/announcements/* |

---

## Common Tasks

### Add or update an auto/van driver
1. Admin panel → 🚗 Auto/Van tab → fill in name (Tamil), phone, vehicle type, coverage
2. Flutter: `auto_screen.dart` fetches from `/api/auto/drivers`
3. Phone number empty = shows "விரைவில்" button (no crash)
4. WhatsApp Contact: admin sets number + message from admin panel → app uses dynamically
5. Run regression tests: `cd backend && npm test`

### Add a new emergency contact
1. Admin panel → 📞 Emergency tab → fill in category, Tamil/English name, phone
2. Flutter: Emergency screen reads from API, categories scroll horizontally
3. Update `requirements.md` data collection checklist

### Add a local service contact
1. Admin panel → 🛍 Services tab → pick category (horizontal tiles), fill name + phone
2. **IMPORTANT:** `local_services` table must exist in Supabase — run migration SQL first
3. Flutter: `services_screen.dart` fetches from `/api/services`
4. Categories: milk, post, flower, plumber, electrician, other

### Update a doctor's schedule
1. Edit hospital in `hospital_screen.dart` (temp) or database (prod)
2. Test on actual device
3. Document in `requirements.md`

### Change bus timings
1. Backend: Update `bus_timings` table
2. Flutter: `bus_screen.dart` fetches from API
3. Mark data collection status in `requirements.md`

### Modify home screen
1. Edit `home_screen.dart`
2. Keep colloquial Tamil labels
3. Update `ui-design.md` with new layout

### Build Release APK

**MANDATORY: Generate APK after every fix.** The APK is the final deliverable.

```bash
cd /path/to/Pannaipuram/app && flutter build apk --release
```

APK output path:
```
app/build/app/outputs/flutter-apk/app-release.apk
```

For debug APK (faster build, larger file):
```bash
cd /path/to/Pannaipuram/app && flutter build apk --debug
```

### Quick Test Commands (copy-paste ready)

```bash
# Pull latest, build admin UI, run backend tests
cd /path/to/Pannaipuram && git pull origin main

# Backend tests
cd backend && node test/admin_crud.test.js

# Admin UI build
cd ../admin-ui && npm run build

# Flutter run (debug on connected device)
cd ../app && flutter run

# Flutter release APK
cd ../app && flutter build apk --release
```

### Push Changes to GitHub

```bash
cd /path/to/Pannaipuram && git add -A && git commit -m "description" && git push origin main
```

---

## Testing — MANDATORY After Every Change

**Every feature or bug fix MUST be tested before committing.** Follow these steps:

### 1. Backend Syntax Check

```bash
cd /sessions/hopeful-peaceful-wozniak/mnt/Pannaipuram/backend && node -c src/app.js && echo "✅ app.js OK"
```

Check every modified route file:
```bash
node -c src/routes/admin/auth.js && echo "✅ OK"
node -c src/routes/admin/services.js && echo "✅ OK"
# ... repeat for each modified file
```

### 2. Admin CRUD Tests (52 tests)

```bash
cd /sessions/hopeful-peaceful-wozniak/mnt/Pannaipuram/backend && node test/admin_crud.test.js
```

Tests cover:
- 🔐 Authentication (login, token)
- ⚡ Power Cuts CRUD
- 🚌 Bus Timings CRUD
- 👨‍⚕️ Doctors CRUD
- 📞 Emergency Contacts CRUD
- 🚗 Auto Drivers CRUD + Registration Contact GET/PUT
- 🛣️ Streets CRUD
- 💧 Water Schedule Update
- 🛍 Local Services CRUD
- 📢 Announcements CRUD
- 👥 Auth Signup & RBAC User Management
- 🔒 RBAC Viewer Restrictions

### 3. Admin UI Build

```bash
cd /sessions/hopeful-peaceful-wozniak/mnt/Pannaipuram/admin-ui && npm run build
```

- Must complete with zero errors
- Output goes to `../backend/public/admin-v2/`
- After build, verify admin panel loads at `/admin/v2`

### 4. Flutter Dart Analysis

```bash
cd /sessions/hopeful-peaceful-wozniak/mnt/Pannaipuram/app && flutter analyze
```

- Zero errors required (warnings OK)
- If `flutter` not available in VM, manually verify:
  - All imports resolve (check file paths exist)
  - All braces `{}` and parentheses `()` are balanced
  - All `setState` calls have `mounted` check in async methods
  - Tamil text uses `fontFamily: 'NotoSansTamil'`

### 5. Flutter App Build Test

```bash
cd /sessions/hopeful-peaceful-wozniak/mnt/Pannaipuram/app && flutter build apk --debug
```

### 6. Admin Panel Manual Test Checklist

After deploying, verify in browser at `https://pannaipuram-api.onrender.com/admin/v2`:

- [ ] Login works with correct password → shows "Login successful ✅"
- [ ] Login fails with wrong password → shows error message
- [ ] Login fails when server down → shows "Server unreachable" message
- [ ] Each admin tab loads without errors (Power, Bus, Doctors, Emergency, Auto, Water, Streets, Services, Announcements)
- [ ] CRUD: Can create, edit, delete items in each tab
- [ ] Users tab visible only for super_admin role
- [ ] Logout works and returns to login screen

### 7. Flutter App Manual Test Checklist

After `flutter run`:

- [ ] Home screen loads with status dashboard cards (power, bus, water)
- [ ] Shimmer loading shows while data loads
- [ ] Pull-to-refresh works on home screen
- [ ] Each module tile navigates with smooth slide transition
- [ ] Power screen: shows current status, correct IST times (not UTC)
- [ ] Water screen: street picker works, times display in IST
- [ ] Bus screen: timings load for each corridor
- [ ] Hospital screen: doctor schedules display
- [ ] Auto screen: drivers list + Gowtham contact card with call button
- [ ] Services screen: shows services + Gowtham contact footer card
- [ ] Emergency screen: contacts grouped by category
- [ ] About screen: village info displays
- [ ] Announcements banner: scrolls auto if multiple announcements
- [ ] Offline banner shows when no network

### 8. When Adding New Features

For any new module, ALL of the following must be created:

1. **DB Migration SQL** in `backend/src/db/migration_*.sql`
2. **Public API route** in `backend/src/routes/`
3. **Admin API route** in `backend/src/routes/admin/`
4. **Register routes** in `backend/src/app.js`
5. **Admin UI page** in `admin-ui/src/pages/`
6. **API methods** in `admin-ui/src/api.js`
7. **Layout tab** in `admin-ui/src/components/Layout.jsx`
8. **App.jsx switch case** in `admin-ui/src/App.jsx`
9. **Flutter screen** in `app/lib/screens/`
10. **API methods** in `app/lib/services/api_service.dart`
11. **Home screen tile** in `app/lib/screens/home_screen.dart`
12. **CRUD tests** added to `backend/test/admin_crud.test.js`
13. **Docs updated**: `requirements.md`, `ui-design.md`, `backend-design.md`

### 9. Quick Fix Verification

For bug fixes, run the relevant SQL to verify in Supabase SQL Editor:

```sql
-- Check if user is active
SELECT id, email, role, is_active FROM admin_users;

-- Fix deactivated user
UPDATE admin_users SET is_active = TRUE WHERE email = 'venthan89@gmail.com';

-- Check announcements
SELECT * FROM announcements WHERE is_active = TRUE ORDER BY priority DESC;

-- Check local services
SELECT * FROM local_services ORDER BY category, display_order;
```

---

## Important Notes

- **No internet required for:** Bus, Hospital, Auto, Emergency (offline-capable)
- **Requires internet for:** Power cuts, Water alerts (real-time)
- **Offline banner:** Shows when no network available (widget: `offline_banner.dart`)
- **Street selection:** User selects once in onboarding, app remembers via `PrefsService.streetId`
- **Device registration:** Optional (deferred) — for push notifications later

---

## Contact

- **Developer:** Venthan
- **Email:** venthan89@gmail.com
- **Questions about design/features:** Check the docs first, then contact Venthan

---

*Last updated: March 19, 2026*
*Built with ❤️ for பண்ணைப்புரம்*
