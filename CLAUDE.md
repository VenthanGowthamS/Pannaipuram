# CLAUDE.md — பண்ணைப்புரம் (Pannaipuram) Project

## Project
**பண்ணைப்புரம்** — Village Information App for Pannaipuram, Theni District, Tamil Nadu.
Repo: https://github.com/VenthanGowthamS/Pannaipuram
Goal: Give every household in Pannaipuram a Tamil-first app for power cuts, water, buses, doctors, auto, emergency contacts, and local services.

---

## Tech Stack

| Layer | Tech | Location |
|---|---|---|
| Mobile App | Flutter (Dart) | `app/` |
| Backend API | Node.js + Express | `backend/` |
| Admin Panel | React + MUI (Vite) | `admin-ui/` |
| Database | Supabase (PostgreSQL) | Cloud — Asia-Pacific Singapore |
| Hosting | Render.com (Node.js) | https://pannaipuram-api.onrender.com |
| Docs | Markdown | `docs/` |

---

## Environment (Mac)

- **Machine:** M1 MacBook Air (Apple Silicon)
- **Local path:** `~/Project1/Pannaipuram`
- **Java:** JDK 17 (for Flutter Android builds)
- **Flutter:** Stable channel, ARM64 native
- **Node.js:** v18+ (LTS)
- **Android Studio:** For emulator + SDK
- **Supabase project ID:** `eoiaexdbnyzysolgwitw`

---

## Rules (Always Follow These)

- Fix **ONE issue at a time** — don't chain multiple fixes without checking with Venthan
- After each fix, **run the relevant test/build** to verify it worked
- If a fix fails twice, **STOP** and explain the problem instead of trying again
- **Never modify more than 3 files in one go** without asking first
- Before any risky change, commit a checkpoint: `git add . && git commit -m "checkpoint: <describe state>"`
- **Never commit:** `.DS_Store`, `build/`, `.gradle/`, `*.apk`, `node_modules/`, `.env`
- Before installing anything, check if already installed: `which <tool>` or `<tool> --version`
- **Always use Homebrew** for macOS package installs
- If a command fails, show the **FULL error** — don't summarize it
- **Git commands** always start with `cd ~/Project1/Pannaipuram &&` — never bare `git` commands

---

## Language & Localization Rules

- **Always use colloquial Tamil** — not formal/literary
- **Never use "வணக்கம்"** — use "சார்", "அண்ணை", "அக்கா", "சிஸ்டர்"
- **Every Tamil label needs an English sub-label:**
  ```dart
  Text('சார், ஆட்டோ வேணுமா?', style: TextStyle(fontFamily: 'NotoSansTamil', fontSize: 20, fontWeight: FontWeight.bold))
  Text('Auto & Car Transport', style: TextStyle(fontFamily: 'Roboto', fontSize: 12))
  ```
- **Tamil font:** `NotoSansTamil` — minimum 18sp for body, 22–24sp for headers
- **English font:** `Roboto` — 12sp for sub-labels
- **Minimum tap target:** 48dp (accessibility)

---

## Skill 1 — Environment Setup
*Use when starting fresh or on a new machine*

1. Check Flutter: `flutter --version` → if missing, install from flutter.dev (ARM64 build)
2. Check Node.js: `node --version` → if missing: `brew install node`
3. Check Java: `java -version` → if missing: `brew install openjdk@17`
4. Set environment variables in `~/.zshrc`:
   ```bash
   export JAVA_HOME=$(/usr/libexec/java_home -v 17)
   export ANDROID_HOME=$HOME/Library/Android/sdk
   export PATH=$PATH:$ANDROID_HOME/emulator:$ANDROID_HOME/tools:$ANDROID_HOME/platform-tools
   ```
5. Run `flutter doctor` → fix any issues shown
6. Run `cd ~/Project1/Pannaipuram/backend && npm install` → install backend deps
7. Run `cd ~/Project1/Pannaipuram/admin-ui && npm install` → install admin deps
8. Report what was installed vs already present

---

## Skill 2 — Build Flutter APK
*Use when ready to build the Android APK*

1. Navigate: `cd ~/Project1/Pannaipuram/app`
2. Get dependencies: `flutter pub get`
3. Analyze for errors: `flutter analyze` → fix any errors (warnings OK)
4. Build debug APK (faster): `flutter build apk --debug`
5. Build release APK (final): `flutter build apk --release`
6. If build fails, show the FULL error log — don't summarize
7. APK output path: `app/build/app/outputs/flutter-apk/app-release.apk`
8. Report the APK size
9. Share via WhatsApp: send APK + QR code to village WhatsApp group

---

## Skill 3 — Backend Deploy
*Use when backend changes are ready*

1. Navigate: `cd ~/Project1/Pannaipuram/backend`
2. Run syntax check: `node -c src/app.js && echo "✅ app.js OK"`
3. Run all tests: `node test/admin_crud.test.js`
   - Tests cover: auth, power, bus, doctors, emergency, auto, streets, water, services, announcements, RBAC
   - Must pass all 52 tests before deploy
4. If tests pass: push to GitHub → Render auto-deploys from `main` branch
5. Verify live at: https://pannaipuram-api.onrender.com
6. Note: Render free tier sleeps after inactivity — first request may take 60s to wake

---

## Skill 4 — Admin Panel Build
*Use when admin UI changes are ready*

1. Navigate: `cd ~/Project1/Pannaipuram/admin-ui`
2. Build: `npm run build`
   - Output goes to: `../backend/public/admin-v2/`
   - Must complete with **zero errors**
3. Test locally: open `http://localhost:3000/admin/v2` (if backend running locally)
4. Or verify live at: `https://pannaipuram-api.onrender.com/admin/v2`
5. Login and check each tab loads correctly

---

## Skill 5 — Git Checkpoint
*Use before any risky change and at end of every session*

1. Run: `cd ~/Project1/Pannaipuram && git status`
2. Stage only source files (no .DS_Store, build/, .gradle/, *.apk, node_modules/):
   ```bash
   git add app/lib/ backend/src/ admin-ui/src/ docs/ CLAUDE.md
   ```
3. Commit with clear message: `git commit -m "describe what changed"`
4. Push: `git push origin main`
5. Confirm: `git log --oneline -3`

---

## Skill 6 — Troubleshoot Build Failure
*Use when any build fails*

1. Show the **last 50 lines** of the error log
2. Identify root cause (dependency issue, SDK mismatch, missing file, syntax error)
3. Suggest **ONE fix at a time** — don't fix everything at once
4. After each fix, re-run the failing command to verify
5. If still failing after 3 attempts, summarize what was tried and what the blocker is

---

## Skill 7 — Database Migration
*Use when adding new tables or columns to Supabase*

1. Write the migration SQL in `backend/src/db/migration_<feature>.sql`
2. Always use `CREATE TABLE IF NOT EXISTS` and `ADD COLUMN IF NOT EXISTS`
3. Paste the SQL into **Supabase SQL Editor** (cloud) and run it there
4. Verify with: `SELECT * FROM <table> LIMIT 5;`
5. Update `docs/backend-design.md` with new schema

**Supabase project:** `eoiaexdbnyzysolgwitw` (Asia-Pacific Singapore)

---

## Skill 8 — Data Entry (Venthan's Task)
*Use when adding real village data via Admin Panel*

1. Open: https://pannaipuram-api.onrender.com/admin/v2
2. Login with Venthan's credentials

**Priority data still needed:**
- 🚌 **Bus timings** — 6 corridors pending: Thevaram, Dindigul, Theni, Coimbatore, Trichy, Palani
  - Only 1 set of timings per corridor (Pannaipuram is a STOP, not a terminus — no inbound/outbound)
- 💧 **Water schedules** — 56 streets pending (only வள்ளுவர் தெரு done)
- 🚗 **Auto drivers** — fill phone numbers for all registered drivers
- 📞 **Emergency** — add Panchayat office + water board numbers
- 🛣️ **Streets** — enter all 57 street names in Streets tab

---

## Control Prompts (Use During Sessions)

**When Claude goes off track:**
> "Stop. Summarize what you've changed so far and what the current error is. Don't make any more changes yet."

**Before a risky fix:**
> "Before touching anything, commit a checkpoint of the current working state."

**To narrow focus:**
> "Ignore everything else. Focus only on this one error: [paste error]. What is the single most likely cause?"

**To recover from a bad fix:**
```bash
git revert HEAD        # undo last commit
git checkout .         # discard all uncommitted changes
```

---

## Session Workflow

### Every Session Start:
1. Open Terminal → `cd ~/Project1/Pannaipuram`
2. `git pull origin main` — get latest
3. `git status` — see current state
4. Tell Claude: *"Read CLAUDE.md and tell me the current project status"*

### During Session:
- Use Skill prompts above for each task type
- Commit checkpoints before risky changes
- If something breaks → `git revert`, don't switch tools

### Every Session End:
- Run **Skill 5 (Git Checkpoint)** before closing
- Note what was done and what's next in the commit message

---

## Documentation First Rule

Before making ANY changes to the codebase, always read:
1. `docs/requirements.md` — current phase and feature status
2. `docs/ui-design.md` — screen layouts and design (implemented)
3. `docs/backend-design.md` — database, API, deployment

After ANY change:
- Modified a feature → update `requirements.md`
- Changed a screen → update `ui-design.md`
- Changed an API endpoint → update `backend-design.md`

---

## Code Standards

### Flutter (Dart)

```dart
// ALWAYS check mounted before setState in async methods
Future<void> _load() async {
  try {
    final data = await someApiCall();
    if (!mounted) return;
    setState(() => _data = data);
  } catch (_) {
    if (!mounted) return;
    setState(() => _error = true);
  }
}

// ALWAYS use NotoSansTamil for Tamil text
Text('பண்ணைப்புரம்',
  style: TextStyle(fontFamily: 'NotoSansTamil', fontSize: 22, fontWeight: FontWeight.bold))
```

### Backend (Node.js)

```javascript
// ALWAYS use this API response envelope
res.json({ success: true, data: [...] })
// For errors:
res.status(500).json({ success: false, error: 'message' })

// Day name → integer for doctor schedules
const DAY_MAP = { 'sunday':0,'monday':1,'tuesday':2,'wednesday':3,'thursday':4,'friday':5,'saturday':6 };
function parseDayOfWeek(val) {
  if (typeof val === 'number') return val;
  return DAY_MAP[String(val).toLowerCase()] ?? null;
}

// Schedule replace = DELETE all then INSERT (NEVER just INSERT — creates duplicates)
await client.query('DELETE FROM doctor_schedules WHERE doctor_id = $1', [doctorId]);
```

### Colors (use from `app_theme.dart`)
- `AppColors.primary` — deep green (main brand)
- `AppColors.powerYellow` — power module
- `AppColors.waterBlue` — water module
- `AppColors.busOrange` — bus module
- `AppColors.hospitalRed` — hospital module

---

## Data Validation Rules

**EVERY TIME** data is added, Claude must:

1. **Search the internet** to verify Tamil place names, English spellings, district/taluk
2. **Verify bus corridors** exist on actual TNSTC routes — cross-check town distances
3. **Validate phone numbers** — Indian mobile = 10 digits starting with 6/7/8/9
4. **Show Venthan** any data that couldn't be verified online — never guess
5. **Flag uncertainties** with `-- ⚠️ NEEDS VERIFICATION` in SQL comments

**Bus route rule:** Pannaipuram is a **STOP**, not a terminus. One set of departure timings per corridor only. No "inbound/outbound" distinction.

**Tamil handwriting rule:** When reading handwritten Tamil images, always show extracted data to Venthan before inserting into the database. Never assume ambiguous characters — flag them.

---

## Hospital & Doctor Admin — Architecture Rules

```javascript
// Schedule replace = DELETE all then INSERT (NEVER just INSERT — creates duplicates)
await client.query('DELETE FROM doctor_schedules WHERE doctor_id = $1', [doctorId]);
// then insert each schedule one by one

// Time from DB is "HH:MM:SS" — always slice to "HH:MM" for display
const start = s.start_time ? s.start_time.slice(0,5) : '??';
```

```jsx
// Hospital dropdown is ALWAYS dynamic — fetched from API, never hardcoded
// formatSchedule() must always guard for null times
const formatSchedule = (s) => `${s.start_time?.slice(0,5) ?? '??'} – ${s.end_time?.slice(0,5) ?? '??'}`;
```

```dart
// Fetch → cache → on error load from cache → last resort: hardcoded fallback
Future<void> _fetchDoctors() async {
  try {
    final allDoctors = await ApiService.getAllDoctors();
    await CacheService.cacheDoctors(allDoctors);
    if (!mounted) return;
    setState(() { _apiDoctors = allDoctors; _offline = false; });
  } catch (_) {
    final cached = await CacheService.getCachedDoctors();
    if (!mounted) return;
    setState(() { _apiDoctors = cached; _offline = true; });
  }
}
```

---

## Testing — Run After Every Change

### 1. Backend syntax check
```bash
cd ~/Project1/Pannaipuram/backend && node -c src/app.js && echo "✅ OK"
```

### 2. All API tests (52 tests) — run from Mac terminal only
```bash
cd ~/Project1/Pannaipuram/backend && node test/admin_crud.test.js
```
> Note: Tests target https://pannaipuram-api.onrender.com — cannot run from Cowork VM (outbound proxy blocks Render). Run from your Mac terminal.

### 3. Admin UI build
```bash
cd ~/Project1/Pannaipuram/admin-ui && npm run build
```

### 4. Flutter analyze (zero errors required)
```bash
cd ~/Project1/Pannaipuram/app && flutter analyze
```

### 5. Flutter APK build test
```bash
cd ~/Project1/Pannaipuram/app && flutter build apk --debug
```

---

## Current Status (March 2026)

### ✅ Live & Complete (9 Modules)

| Module | Flutter Screen | Backend Route | Admin Tab |
|---|---|---|---|
| ⚡ Power | power_screen.dart | /api/power | PowerCuts.jsx |
| 💧 Water | water_screen.dart | /api/water | Water.jsx |
| 🚌 Bus | bus_screen.dart + bus_route_screen.dart | /api/bus | BusTimings.jsx |
| 🏥 Hospital + Doctors | hospital_screen.dart | /api/hospital, /admin/hospital | Doctors.jsx |
| 🚗 Auto/Van | auto_screen.dart | /api/auto | AutoDrivers.jsx |
| 📞 Emergency | emergency_screen.dart | /api/emergency | Emergency.jsx |
| 🛍 Local Services | services_screen.dart | /api/services | LocalServices.jsx |
| 📢 Announcements | home_screen.dart (banner) | /api/announcements | Announcements.jsx |
| 💬 Feedback | feedback_screen.dart | /api/feedback | Feedback.jsx |

### ✅ Infrastructure
- JWT auth + RBAC (super_admin, admin, viewer)
- User management tab in admin panel
- Streets management (57 streets, admin tab ready)
- Offline cache (CacheService with SharedPreferences)
- Pull-to-refresh with AlwaysScrollableScrollPhysics
- Coming-soon banners on Power + Water screens
- Admin panel mobile: hamburger drawer (not broken bottom nav)
- About screen with 7-step how-to-use guide in Tamil
- "விரைவில்" banners for live power/water alerts

### 🔜 Next Up (In Priority Order)

1. **APK rebuild** — build new release APK with all recent changes (Feedback, banners, About screen)
2. **Data entry** — Venthan enters real data via Admin panel (bus, water, streets, drivers)
3. **QR code** — generate APK QR code for WhatsApp distribution
4. **Email notifications for feedback** — Phase 6+ (Nodemailer + Gmail App Password)
5. **Push notifications** — Phase 7+ (FCM, device registration table already exists)
6. **Live TNEB power cuts** — Phase 7+ (needs TNEB data feed integration)
7. **Live water schedule** — Phase 7+ (needs Panchayat coordination)
8. **iOS build** — not planned yet

---

## Quick Command Reference

```bash
# Start a session
cd ~/Project1/Pannaipuram && git pull && git status

# Backend tests (Mac terminal only — VM can't reach Render)
cd ~/Project1/Pannaipuram/backend && node test/admin_crud.test.js

# Admin UI build
cd ~/Project1/Pannaipuram/admin-ui && npm run build

# Flutter analyze
cd ~/Project1/Pannaipuram/app && flutter analyze

# Flutter release APK
cd ~/Project1/Pannaipuram/app && flutter build apk --release

# Git checkpoint
cd ~/Project1/Pannaipuram && git add app/lib/ backend/src/ admin-ui/src/ docs/ CLAUDE.md && git commit -m "checkpoint" && git push origin main

# APK output location
~/Project1/Pannaipuram/app/build/app/outputs/flutter-apk/app-release.apk
```

---

## Contact

- **Developer:** Venthan
- **Email:** venthan89@gmail.com
- **Admin panel:** https://pannaipuram-api.onrender.com/admin/v2
- **Production API:** https://pannaipuram-api.onrender.com

---

*Last updated: March 23, 2026*
*Built with ❤️ for பண்ணைப்புரம் — உங்கள் ஊரின் தகவல் மையம்*
