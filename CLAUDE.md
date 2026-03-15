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

### After Each Task

1. **Commit with clear message:**
   ```bash
   git add [files]
   git commit -m "Update home screen Tamil labels to use colloquial text"
   ```

2. **Push to main:**
   ```bash
   git push origin main
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

---

## Common Tasks

### Add or update an auto/van driver
1. Admin panel → 🚗 Auto/Van tab → fill in name (Tamil), phone, vehicle type, coverage
2. Flutter: `auto_screen.dart` fetches from `/api/auto/drivers`
3. Phone number empty = shows "விரைவில்" button (no crash)
4. Run regression tests: `cd backend && npm test`

### Add a new emergency contact
1. Backend: Add to `routes/emergency.js` or database
2. Flutter: Emergency screen reads from API
3. Update `requirements.md` data collection checklist

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

*Last updated: March 15, 2026*
*Built with ❤️ for பண்ணைப்புரம்*
