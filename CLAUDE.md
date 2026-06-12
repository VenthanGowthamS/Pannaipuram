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

### PWA — Key Architecture Facts (v56, June 2026)
- **Source lives at:** `pwa/` (repo root) — NOT inside `backend/`
- **Custom domain LIVE (June 2026):** `pannaipuram.com` bought on Cloudflare Registrar (auto-renew on). Subdomains:
  - 🌟 **PWA (share this):** https://app.pannaipuram.com — GitHub Pages, ships `pwa/CNAME` = `app.pannaipuram.com`
  - 🔗 **API:** https://api.pannaipuram.com — Render custom domain
  - 🛠 **Admin:** https://admin.pannaipuram.com — Render custom domain
  - **Cloudflare DNS:** `app` = 4× GitHub Pages A records; `api`/`admin` = CNAME → `pannaipuram-api.onrender.com` (these = DNS-only/grey — Render & GitHub issue their own SSL; proxy breaks cert issuance). Root `@` + `www` = placeholder A `192.0.2.1` **Proxied (orange)** + a Cloudflare Redirect Rule `(http.host eq "pannaipuram.com" or http.host eq "www.pannaipuram.com")` → 301 `concat("https://app.pannaipuram.com", http.request.uri.path)` — bare/www now redirect to the app (✅ live, June 2026).
- **Legacy URLs (still work, backward compat):** https://venthangowthams.github.io/Pannaipuram/ and https://pannaipuram-api.onrender.com/pwa/
- **GitHub Pages deploy:** `.github/workflows/deploy-pwa.yml` runs on push to `main` touching `pwa/**`. Sed-rewrites `/pwa/` → `./` so paths work at `/Pannaipuram/` base path. `pwa/CNAME` ships custom domain.
- **Render serving:** `backend/src/app.js` `express.static(path.resolve(__dirname, '../../pwa'))`
- **Hostname-aware root redirect (`backend/src/app.js` `app.get('/')`):** `admin.pannaipuram.com` → `/admin/v2/`; `api.pannaipuram.com` → JSON API landing (name/endpoints/links); any other host → `/pwa/`
- **API routing — `pwa/js/api.js` `API_BASE`:** auto-detects hostname:
  - `app.pannaipuram.com` → `https://api.pannaipuram.com`
  - `*.github.io` / `*.pages.dev` / `*.netlify.app` → `https://pannaipuram-api.onrender.com`
  - Same-origin (Render, localhost) → `''` (relative)
  - Same 3-way detection duplicated in `pwa/js/app.js` (ping + feedback) and `pwa/js/auto.js` (feedback)
- **Backend CORS:** auto-allows any `*.github.io` subdomain AND `*.pannaipuram.{com,in}` (two regexes in `backend/src/app.js`)
- **Cold-start resilience (v34):** `apiFetch` has 2.5s timeout — if Render is cold, cached data served instantly; network keeps running to refresh
- **One-tap install share link:** `https://app.pannaipuram.com/?install=1` triggers full-screen install wall (Android only)
- **PWA sections (v46+):** 5 bottom-nav tabs — 🚌 பேருந்து (`bus.js`) · 🛺 ஆட்டோ (`auto.js`) · 🏥 மருத்துவம் (`hospital.js`: doctors by hospital, day-chips, "இன்று கிடைக்கும்" today badge, contact call chips) · 📞 அவசரம் (`emergency.js`) · ➕ மேலும் (`more.js`: acting drivers + local services). Hospital/Emergency/More lazy-init on first open. About sheet in ☰ menu has village stats.
- **Bus data loading (v53):** `GET /api/bus/all` returns corridors + ALL timings grouped by corridor in ONE request (was 1+17 round trips). `bus.js` `loadAllData()` uses it for initial load, 10-min auto-refresh, and the ↻ button — with automatic fallback to `/corridors` + per-corridor `/timings/:id` if the batch endpoint errors.
- **Perf (v53):** `index.html` preconnects to `https://api.pannaipuram.com` (+ dns-prefetch onrender.com) so the first API call skips DNS+TLS setup.
- **Security (v53):** `express-rate-limit` on public POSTs — `/api/feedback`, `/api/pwa/ping`, `/api/water/alert` (30 req / 10 min / IP). `app.set('trust proxy', 1)` so limiters see the real client IP behind Render. All PWA renderers (`bus/auto/hospital/emergency/more`) escape DB strings before innerHTML (XSS-safe); `emergency.js` dedupes contacts by name+phone.
- **App identity (v55):** icon = "village hub" — three roads converge on the glowing gold Pannaipuram stop; white markers hold hospital (red cross), bus (blue + amber stripe, hero) and auto-rickshaw (green) on a premium navy gradient (`backend/gen-icon.js`, run `node gen-icon.js` to regen). Manifest `short_name` = **"Pannaipuram"** (English, searchable without Tamil keyboard); `name` = "Pannaipuram பண்ணைப்புரம்".
- **Phone validation:** Indian mobile = EXACTLY 10 digits starting 6/7/8/9. Auto reg form (`pwa/js/auto.js`) strips non-digits + caps at 10; input `maxlength=10`.
- **Section colours (v56):** every section keeps its OWN identity colour — bus navy `#1A237E→#283593`, auto amber, hospital teal `#00838F→#006064`, emergency red `#C62828→#8E1B1B`, more purple `#5E35B1→#3949AB`. The hamburger drawer + sheet headers DYNAMICALLY match the current page via `body[data-section]` rules in `nav.css` (bus/default = navy).
- **Web hamburger (v55–56):** ≥700px the menu button is 62px (28px bars), drawer = 380px dropdown panel under the button with larger items; sheets open as centred modals. `#menu-install-btn / #install-banner / #install-wall` are `display:none !important` on desktop (`responsive.css`) + JS `_isPhone()` gate — install UI is PHONES ONLY, and must stay visible on phones.
- **Acting driver registration (v55):** collapsible `<details>` form in the More panel ("நீங்களும் ஓட்டுநரா?") → POST `/api/feedback` tagged `[மாற்று ஓட்டுநர் பதிவு]`; shares `.auto-form-*` styles RE-THEMED light via `.acting-reg-form` overrides (the auto originals are white-on-dark).
- **SW shell rule (v56) — IMPORTANT:** never match shell paths with a `'/pwa/'` string literal inside `sw.js` — the GH Pages deploy sed-rewrites it to `'./'`, which silently disabled network-first on app.pannaipuram.com (stale UI). The fetch handler now matches same-origin `.html/.css/.js` or trailing `/` paths, excluding `/api/`.
- **Doctor today badge (v56):** "✅ டாக்டர் இன்று இருக்காங்க" / "டாக்டர் இன்று இல்லை" (multi-line pill, max-width 104px).
- **Responsive (v46):** `pwa/css/responsive.css` (loaded LAST so it wins). Mobile ≤699px unchanged (single column). ≥700px: fluid container (max 1000/1140px), flat card lists (`#driver-list`, `.em-group-cards`, `.hd-docs`, `#more-acting`, `.more-svc-cards`) become multi-column grids; bus stays a centered 640px column (accordion+sibling timetables don't grid). Uses `html body` specificity to beat base `body{max-width:480}`.
- **Install prompts = PHONES ONLY (v46):** `window._isPhone()` in `app.js` gates the install banner + `?install=1` wall + hamburger install item. iPhone/iPod → yes; Android WITH "Mobile" → yes; iPad / Android tablet / desktop / laptop → no.
- **Acting drivers:** `acting_drivers` table (mirrors `auto_drivers`); migration `backend/src/db/migration_acting_drivers.sql`; admin tab "🔄 Acting Drivers"; shown in PWA மேலும் tab.
- **Bottom nav (`pwa/css/nav.css`):** uses `grid-auto-flow: column` — auto-fits any number of tabs (don't hardcode column count).
- **Render config:** `render.yaml` at repo root with `rootDir: .` ensures full repo is deployed
- **NEVER edit files inside `backend/public/pwa/`** — that folder was deleted. Edit only in `pwa/`
- **Cache versioning:** Bump `CACHE` in `pwa/sw.js` AND `CACHE_VERSION` in `pwa/js/api.js` together on every release. **Currently v56.** Also add any NEW js/css to the `SHELL` array in `sw.js`.
- **Icon generation:** Run `node backend/gen-icon.js` to regenerate `pwa/icons/icon-192.png` + `icon-512.png`
- **Service Worker:** 3-tier cache — SW (stale-while-revalidate for /api/*) → api.js memory → localStorage fallback
- **Domain plan reference:** `docs/domain-and-hosting-plan.md` — original migration plan (now executed)

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

**Flutter APK bus group names (bus_screen.dart):**
- Line 328: `உள்ளூர் பயணம்` — Local Routes ✅
- Line 344: `தொலைதூர பயணம்` — Long Distance ✅ (updated April 2026)
- No night/Chennai section in Flutter APK (PWA-only feature)

### ✅ Live & Complete — PWA (unified: Bus + Auto + Hospital + Emergency + More) — v53 (June 2026)

| Feature | File | Status |
|---|---|---|
| **Icon** — original navy-blue bus restored (new unified icon TBD) | backend/gen-icon.js + pwa/icons | ✅ v44 |
| **English searchable name** — manifest short_name "Pannaipuram" | pwa/manifest.json | ✅ v40 |
| **Hospital & Doctors tab** (🏥 மருத்துவம்) — doctors by hospital, day-chips, "இன்று கிடைக்கும்" today badge | pwa/js/hospital.js + css | ✅ v40 |
| **Auto phone fix** — exactly 10 digits (6-9 start), was maxlength=15 | pwa/js/auto.js + index.html | ✅ v40 |
| **Custom domain:** app/api/admin.pannaipuram.com all live (Cloudflare + Render + GH Pages) | pwa/CNAME + backend/src/app.js | ✅ v38–39 |
| **Emergency Contacts tab** (📞 அவசரம்) — grouped call cards from `/api/emergency/contacts` | pwa/js/emergency.js + css | ✅ v39 |
| **About village stats** — population/wards/streets/cardamom in ☰ About sheet | pwa/index.html + css/emergency.css | ✅ v39 |
| **Bottom nav** — `grid-auto-flow:column` auto-fits 3 tabs | pwa/css/nav.css | ✅ v39 |
| **api.pannaipuram.com/** → JSON API landing; **admin.** → /admin/v2 | backend/src/app.js | ✅ v39 |
| **Hosting:** GitHub Pages CDN — instant load, never sleeps | .github/workflows/deploy-pwa.yml | ✅ v37 |
| **Hosting:** Render fallback URL still works | backend/src/app.js | ✅ |
| **API routing:** `API_BASE` auto-detects app.pannaipuram.com / github.io / Render | pwa/js/api.js | ✅ v37–39 |
| **Backend CORS:** auto-allows `*.github.io` + `*.pannaipuram.{com,in}` origins | backend/src/app.js | ✅ v37–39 |
| **Install wall** (`?install=1`) — full-screen Android one-tap install | pwa/index.html + app.js | ✅ v35–36 |
| **Bouncing 👇 + pulsing yellow button** on install wall | pwa/css/base.css | ✅ v36 |
| **Cold-start fix:** 2.5s timeout → cached fallback | pwa/js/api.js | ✅ v34 |
| **Bus type chip** on route card + Leaving-soon strip + timetable | pwa/js/bus.js | ✅ v33–34 |
| Long-distance never labeled "டவுன் பஸ்" (Trichy/Palani fix) | pwa/js/bus.js | ✅ v34 |
| Bigger timetable times (1.25rem/800) + 42px icons | pwa/css/bus.css | ✅ v32 |
| No gap warning for Chennai night service | pwa/js/bus.js | ✅ v32 |
| Bus card simplified — destination + time only (Steve Jobs UX) | pwa/js/bus.js | ✅ v31 |
| Driver name truncation — call btn never overlaps | pwa/css/auto.css | ✅ v30 |
| Auto driver `phone_verified` toggle — admin UI + PWA "விரைவில்" | admin-ui + pwa/js/auto.js | ✅ v29 |
| Auto section: amber #F59E0B + charcoal + green call | pwa/css/auto.css | ✅ v28 |
| Updated About / Feedback / How-to-use Tamil copy | pwa/index.html | ✅ v29 |
| Bus section — grouped routes (Local / Long / Night) | pwa/js/bus.js | ✅ |
| Tamil group names: உள்ளூர் பயணம்/தொலைதூர பயணம்/சென்னை இரவு | pwa/js/bus.js | ✅ |
| Accordion groups — one open at a time | pwa/js/bus.js | ✅ |
| "Now departing" smart strip — top 3 imminent buses with urgency | pwa/js/bus.js | ✅ |
| Tamil search bar — 16px input, 48px target, live filter | pwa/js/bus.js | ✅ |
| Data freshness indicator + 10-minute auto-refresh | pwa/js/bus.js | ✅ |
| Auto-update installed PWAs (SKIP_WAITING + controllerchange reload) | pwa/js/app.js | ✅ v23 |
| PWA visitor analytics (pwa_visits table + admin stats tab) | backend + admin-ui | ✅ v21 |
| WhatsApp long-press share on every timing row | pwa/js/bus.js | ✅ |
| Chennai overnight boarding note (Theni bus stand) | pwa/js/bus.js | ✅ |
| Offline 3-tier cache (SW + memory + localStorage) | pwa/sw.js + api.js | ✅ |
| Hamburger menu drawer (Feedback/About/How-to-use/Install sheets) | pwa/js/app.js | ✅ v21 |
| Tamil install-to-home-screen banner (iOS/Android) | pwa/js/app.js | ✅ |
| Google Translate disabled (translate=no + notranslate meta) | pwa/index.html | ✅ |
| Design token scale (--ta-xs through --ta-xxl) | pwa/css/tokens.css | ✅ |
| Focus ring a11y (gold 3px :focus-visible) | pwa/css/base.css | ✅ |
| New bus icon (navy + bus silhouette + route dots) | pwa/icons/ | ✅ |
| **SW cache v53 / localStorage key pannai-v53** | pwa/sw.js + api.js | ✅ v53 |

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
- `/health` endpoint returns `env: { jwt_secret_set, database_url_set }` for test diagnostics

### 🔜 Next Up (In Priority Order)

**✅ Custom Domain — Phase 11 DONE (June 2026)**
- ✅ `pannaipuram.com` bought on Cloudflare Registrar (auto-renew on)
- ✅ `app.pannaipuram.com` (PWA), `api.pannaipuram.com` (backend), `admin.pannaipuram.com` (admin) all live with SSL
- ⏳ Optional leftover: redirect bare `pannaipuram.com` + `www` → `app.` (Cloudflare Redirect Rule; placeholder A records already added). Not urgent.

**Security hardening**
- ✅ Rate-limit public POSTs (`/api/feedback`, `/api/pwa/ping`, `/api/water/alert` — 30/10min/IP) + `trust proxy` (v53, June 2026)
- ✅ XSS escaping on all PWA renderers; emergency contact dedupe (v53)
- ⏳ Re-enable a scoped CSP for `/pwa/` + `/api/` (currently `contentSecurityPolicy:false` globally)
- ⏳ Confirm Supabase RLS enabled on all public tables (Security Advisor flagged `rls_disabled_in_public` — backend uses superuser so unaffected, but Data API was exposed; Venthan ran the bulk-enable SQL — verify in Security Advisor)
- ⏳ Remove duplicate emergency row in DB (Thevaram Police, ids 26 & 55 — PWA already dedupes client-side)

**Data Entry (Venthan's task — via Admin Panel)**
- ⏳ Bus timings — only **Dindigul** still pending (Thevaram ✅23, Theni ✅2, Coimbatore ✅3, Trichy ✅3, Palani ✅6, Bodi/Cumbum/Chinnamanur/Madurai/Kumily/Gudalur/Mettupalayam/Suruli ✅ all in DB)
- ⏳ Auto driver phone numbers (currently all `phone_verified=false` → PWA shows "விரைவில்")
- ⏳ All 57 street names in Streets tab
- ⏳ Water schedules (only வள்ளுவர் தெரு done so far)
- ⏳ Panchayat office contact + water board numbers in Emergency tab

**Other Pending**
- ⏳ APK rebuild — release APK with all v27–v39 features (run `flutter build apk --release`)
- ⏳ QR code for WhatsApp APK distribution (encode `https://app.pannaipuram.com/?install=1`)
- ⏳ Email notifications for feedback (Nodemailer + Gmail App Password)
- ⏳ Push notifications — Phase 7+ (FCM, device table exists)
- ⏳ Live TNEB power cuts — Phase 7+ (needs TNEB feed)
- ⏳ iOS build — not planned yet
- ⏳ UptimeRobot 5-min ping to keep Render warm (alternative since GitHub Pages already solves cold-start UX)

**ROUTE_ALTS Geography Notes (verified April 2026):**
- Thevaram → Bodi → Theni (Bodi is between Thevaram and Theni on the same route)
- Kumily is via Kambam direction — NOT the same direction as Bodi
- Do NOT suggest Bodi bus for Kumily passengers (opposite direction)

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

# PWA — verify deployed version on both hosts (SW cache version should match pwa/sw.js)
curl -s https://venthangowthams.github.io/Pannaipuram/sw.js | head -2   # GitHub Pages (primary)
curl -s https://pannaipuram-api.onrender.com/pwa/sw.js | head -2        # Render (fallback)

# PWA — verify GitHub Pages deploy succeeded
curl -s https://venthangowthams.github.io/Pannaipuram/build-info.json   # shows deployed_at + sha

# PWA — check GitHub Actions workflow runs
curl -s "https://api.github.com/repos/VenthanGowthamS/Pannaipuram/actions/runs?per_page=3" | python3 -c "import json,sys;[print(r['name'],r['status'],r['conclusion']) for r in json.load(sys.stdin)['workflow_runs']]"

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

## Contact & URLs

- **Developer:** Venthan
- **Email:** venthan89@gmail.com
- **PWA (share this on WhatsApp):** https://app.pannaipuram.com/?install=1
- **PWA (legacy GitHub Pages):** https://venthangowthams.github.io/Pannaipuram/
- **PWA (legacy Render fallback):** https://pannaipuram-api.onrender.com/pwa/
- **Admin panel:** https://admin.pannaipuram.com (or https://pannaipuram-api.onrender.com/admin/v2)
- **Production API:** https://api.pannaipuram.com (or https://pannaipuram-api.onrender.com)

---

*Last updated: June 12, 2026 — PWA v56: per-page colours + colour-matching hamburger, village-hub icon, acting-driver registration, web menu sizing, SW shell fix*
*Built with ❤️ for பண்ணைப்புரம் — உங்கள் ஊரின் தகவல் மையம்*
