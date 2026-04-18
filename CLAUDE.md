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
| PWA | Vanilla JS + CSS (no framework) | `pwa/` |
| Backend API | Node.js + Express | `backend/` |
| Admin Panel | React + MUI (Vite) | `admin-ui/` |
| Database | Supabase (PostgreSQL) | Cloud — Asia-Pacific Singapore |
| Hosting | Render.com (Node.js) | https://pannaipuram-api.onrender.com |
| Docs | Markdown | `docs/` |

### PWA — Key Architecture Facts
- **Source lives at:** `pwa/` (repo root) — NOT inside `backend/`
- **Served by:** `backend/src/app.js` line 56: `express.static(path.join(__dirname, '../../pwa'))`
- **URL:** https://pannaipuram-api.onrender.com/pwa/
- **Render config:** `render.yaml` at repo root with `rootDir: .` ensures full repo is deployed
- **NEVER edit files inside `backend/public/pwa/`** — that folder was deleted. Edit only in `pwa/`
- **Cache versioning:** Bump `CACHE` in `pwa/sw.js` AND `CACHE_VERSION` in `pwa/js/api.js` together on every release
- **Icon generation:** Run `node backend/gen-icon.js` to regenerate `pwa/icons/icon-192.png` + `icon-512.png`
- **Service Worker:** 3-tier cache — SW (stale-while-revalidate for /api/*) → api.js memory → localStorage fallback

---

## Environment (Mac)

- **Machine:** M1 MacBook Air (Apple Silicon)
- **Local path:** `~/Documents/VenthanDocuments/Workspace/Projects/Pannaipuram`
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
- **Git commands** always start with `cd ~/Documents/VenthanDocuments/Workspace/Projects/Pannaipuram &&` — never bare `git` commands

---

## Git Pull & Push Rules — When to Do What

### 🔽 PULL — Do this first, every time you open a session
```bash
cd ~/Documents/VenthanDocuments/Workspace/Projects/Pannaipuram && git pull origin main
```
**Pull when:**
- Starting any new session — always, no exceptions
- Before making any changes — avoids merge conflicts
- After Venthan has made changes from a different machine or directly on GitHub
- After Claude has pushed in a previous session and you're continuing work

**Never skip pull at session start — if you do and then push, you risk overwriting newer work.**

---

### 🔼 PUSH — Do this after every meaningful change

```bash
cd ~/Documents/VenthanDocuments/Workspace/Projects/Pannaipuram && git push origin main
```
**Push when:**
- After every commit that has been tested and verified
- After completing a feature, fix, or data entry session
- At end of every session (always — part of Skill 5 Git Checkpoint)
- After fixing a bug and confirming the fix works

**Always push from your Mac terminal** — Cowork VM does not have GitHub credentials and cannot push.

**Push order — always this sequence:**
```bash
# 1. Check what's changed
git status

# 2. Stage only source files
git add app/lib/ backend/src/ admin-ui/src/ docs/ CLAUDE.md

# 3. Commit with a clear message
git commit -m "what you did"

# 4. Push
git push origin main

# 5. Confirm
git log --oneline -3
```

**Never push:**
- Without running the relevant test/build first
- `.DS_Store`, `build/`, `.gradle/`, `*.apk`, `node_modules/`, `.env`
- Directly to `main` with broken code — commit a checkpoint branch if unsure

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
6. Run `cd ~/Documents/VenthanDocuments/Workspace/Projects/Pannaipuram/backend && npm install` → install backend deps
7. Run `cd ~/Documents/VenthanDocuments/Workspace/Projects/Pannaipuram/admin-ui && npm install` → install admin deps
8. Report what was installed vs already present

---

## Skill 2 — Build Flutter APK
*Use when ready to build the Android APK*

1. Navigate: `cd ~/Documents/VenthanDocuments/Workspace/Projects/Pannaipuram/app`
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

1. Navigate: `cd ~/Documents/VenthanDocuments/Workspace/Projects/Pannaipuram/backend`
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

1. Navigate: `cd ~/Documents/VenthanDocuments/Workspace/Projects/Pannaipuram/admin-ui`
2. Build: `npm run build`
   - Output goes to: `../backend/public/admin-v2/`
   - Must complete with **zero errors**
3. Test locally: open `http://localhost:3000/admin/v2` (if backend running locally)
4. Or verify live at: `https://pannaipuram-api.onrender.com/admin/v2`
5. Login and check each tab loads correctly

---

## Skill 5 — Git Checkpoint
*Use before any risky change and at end of every session*

1. Run: `cd ~/Documents/VenthanDocuments/Workspace/Projects/Pannaipuram && git status`
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
1. Open Terminal → `cd ~/Documents/VenthanDocuments/Workspace/Projects/Pannaipuram`
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
cd ~/Documents/VenthanDocuments/Workspace/Projects/Pannaipuram/backend && node -c src/app.js && echo "✅ OK"
```

### 2. All API tests (52 tests) — run from Mac terminal only
```bash
cd ~/Documents/VenthanDocuments/Workspace/Projects/Pannaipuram/backend && node test/admin_crud.test.js
```
> Note: Tests target https://pannaipuram-api.onrender.com — cannot run from Cowork VM (outbound proxy blocks Render). Run from your Mac terminal.

### 3. Admin UI build
```bash
cd ~/Documents/VenthanDocuments/Workspace/Projects/Pannaipuram/admin-ui && npm run build
```

### 4. Flutter analyze (zero errors required)
```bash
cd ~/Documents/VenthanDocuments/Workspace/Projects/Pannaipuram/app && flutter analyze
```

### 5. Flutter APK build test
```bash
cd ~/Documents/VenthanDocuments/Workspace/Projects/Pannaipuram/app && flutter build apk --debug
```

---

## Current Status (April 2026)

### ✅ Live & Complete — Flutter App (9 Modules)

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

### ✅ Live & Complete — PWA (Bus + Auto)

| Feature | File | Status |
|---|---|---|
| Bus section — grouped routes (Local / Long / Night) | pwa/js/bus.js | ✅ Live |
| Accordion groups — one open at a time | pwa/js/bus.js | ✅ Live |
| Next-bus badge with time + countdown pill | pwa/js/bus.js | ✅ Live |
| Timetable expand with "Next Bus" header card | pwa/js/bus.js | ✅ Live |
| Gap warnings + alternate route suggestions | pwa/js/bus.js | ✅ Live |
| Auto section — driver list + registration form | pwa/js/auto.js | ✅ Live |
| Offline 3-tier cache (SW + memory + localStorage) | pwa/sw.js + api.js | ✅ Live |
| Tamil install-to-home-screen banner (iOS/Android) | pwa/js/app.js | ✅ Live |
| New bus icon (navy + bus silhouette + route dots) | pwa/icons/ | ✅ Live |
| SW cache v10 / localStorage key pannai-v10 | pwa/sw.js + api.js | ✅ Live |

### ✅ Infrastructure
- JWT auth + RBAC (super_admin, admin, viewer)
- User management tab in admin panel
- Streets management (57 streets, admin tab ready)
- Offline cache (CacheService with SharedPreferences — Flutter)
- Pull-to-refresh with AlwaysScrollableScrollPhysics
- Coming-soon banners on Power + Water screens
- Admin panel mobile: hamburger drawer (not broken bottom nav)
- About screen with 7-step how-to-use guide in Tamil
- "விரைவில்" banners for live power/water alerts
- `render.yaml` at repo root — controls Render deployment (rootDir: .)

### 🔜 Next Up (In Priority Order)

**Phase 9 — PWA Steve Jobs UX Improvements (PLANNED)**
These improvements eliminate the 2-tap problem and make the app feel smart:
1. **"Now departing" smart strip** — surface next 2–3 buses across ALL routes instantly at top (no taps needed)
2. **Auto-open group by time of day** — peak hours (6–9am, 4–7pm) auto-open Local Routes
3. **Remember last-opened group** — localStorage persists user's preference
4. **Data freshness indicator** — "5 நிமிடம் முன்பு புதுப்பிக்கப்பட்டது" below header
5. **WhatsApp share per timing row** — long-press → share this bus time
6. **Fix "coming soon"** — show a contact fallback instead of "விரைவில்" forever
7. **Fix duplicate CSS** in bus.css (tt-stats, tt-toggle, tt-gap defined twice)
8. **Night bus boarding point** — show "Theni bus stand" or departure context

**Data Entry (Venthan's task — via Admin Panel)**
- ⏳ Bus timings for pending corridors: Thevaram, Theni, Coimbatore, Trichy, Palani, Dindigul
- ⏳ Auto driver phone numbers (all registered drivers)
- ⏳ All 57 street names in Streets tab
- ⏳ Water schedules (only வள்ளுவர் தெரு done so far)
- ⏳ Panchayat office contact + water board numbers in Emergency tab

**Other Pending**
- ⏳ APK rebuild — release APK with all recent changes
- ⏳ QR code for WhatsApp APK distribution
- ⏳ Email notifications for feedback (Nodemailer + Gmail App Password)
- ⏳ Push notifications — Phase 7+ (FCM, device table exists)
- ⏳ Live TNEB power cuts — Phase 7+ (needs TNEB feed)
- ⏳ iOS build — not planned yet

---

## Quick Command Reference

```bash
# Start a session
cd ~/Documents/VenthanDocuments/Workspace/Projects/Pannaipuram && git pull && git status

# Backend syntax check
cd ~/Documents/VenthanDocuments/Workspace/Projects/Pannaipuram/backend && node -c src/app.js && echo "✅ OK"

# Backend tests (Mac terminal only — VM can't reach Render)
cd ~/Documents/VenthanDocuments/Workspace/Projects/Pannaipuram/backend && node test/admin_crud.test.js

# Admin UI build
cd ~/Documents/VenthanDocuments/Workspace/Projects/Pannaipuram/admin-ui && npm run build

# PWA — syntax check all JS
cd ~/Documents/VenthanDocuments/Workspace/Projects/Pannaipuram && node -c pwa/js/bus.js && node -c pwa/js/app.js && node -c pwa/js/api.js && node -c pwa/sw.js && echo "✅ PWA OK"

# PWA — regenerate icons
cd ~/Documents/VenthanDocuments/Workspace/Projects/Pannaipuram/backend && node gen-icon.js

# PWA — verify deployed version (SW cache version should match pwa/sw.js)
curl -s https://pannaipuram-api.onrender.com/pwa/sw.js | head -2

# Flutter analyze
cd ~/Documents/VenthanDocuments/Workspace/Projects/Pannaipuram/app && flutter analyze

# Flutter release APK
cd ~/Documents/VenthanDocuments/Workspace/Projects/Pannaipuram/app && flutter build apk --release

# Git checkpoint — always include pwa/ and render.yaml
cd ~/Documents/VenthanDocuments/Workspace/Projects/Pannaipuram && git add app/lib/ backend/src/ admin-ui/src/ pwa/ docs/ CLAUDE.md render.yaml && git commit -m "checkpoint" && git push origin main

# APK output location
~/Documents/VenthanDocuments/Workspace/Projects/Pannaipuram/app/build/app/outputs/flutter-apk/app-release.apk
```

---

## Contact

- **Developer:** Venthan
- **Email:** venthan89@gmail.com
- **Admin panel:** https://pannaipuram-api.onrender.com/admin/v2
- **Production API:** https://pannaipuram-api.onrender.com

---

*Last updated: April 18, 2026*
*Built with ❤️ for பண்ணைப்புரம் — உங்கள் ஊரின் தகவல் மையம்*
