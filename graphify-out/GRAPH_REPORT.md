# Graph Report - pannaipuram  (2026-11-21)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 1630 nodes · 2977 edges · 107 communities (76 shown, 31 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 37 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `31278145`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Community 0
- Community 1
- Community 2
- Community 3
- Community 4
- Community 5
- Community 6
- Community 7
- Community 8
- Community 9
- Community 10
- Community 11
- Community 12
- Community 13
- Community 14
- Community 15
- Community 16
- Community 17
- Community 18
- Community 19
- Community 20
- Community 21
- Community 22
- Community 23
- Community 24
- Community 25
- Community 26
- Community 27
- Community 28
- Community 29
- Community 30
- Community 31
- Community 32
- Community 33
- Community 34
- Community 35
- Community 36
- Community 37
- Community 38
- Community 39
- Community 40
- Community 41
- Community 42
- Community 43
- Community 44
- Community 45
- Community 46
- Community 47
- Community 48
- Community 49
- Community 50
- Community 51
- Community 52
- Community 53
- Community 54
- Community 55
- Community 56
- Community 57
- Community 58
- Community 59
- Community 60
- Community 61
- Community 62
- Community 63
- Community 64
- Community 65
- Community 66
- Community 67
- Community 68
- Community 69
- Community 70
- Community 71
- Community 72
- Community 73
- Community 74
- Community 75
- Community 76
- Community 77
- Community 78
- Community 79
- Community 80
- Community 81
- Community 82
- Community 83
- Community 84
- Community 85
- Community 86
- Community 87

## God Nodes (most connected - your core abstractions)
1. `ApiService` - 77 edges
2. `main()` - 33 edges
3. `assert()` - 32 edges
4. `test()` - 32 edges
5. `express` - 31 edges
6. `react` - 26 edges
7. `get()` - 24 edges
8. `ConfirmDialog()` - 21 edges
9. `post()` - 21 edges
10. `@mui/material` - 21 edges

## Surprising Connections (you probably didn't know these)
- `openBulletin()` --calls--> `boot()`  [EXTRACTED]
  pwa-tests/test/bulletin-open.test.js → pwa-tests/test/harness.js
- `openMore()` --calls--> `boot()`  [EXTRACTED]
  pwa-tests/test/more-rows.test.js → pwa-tests/test/harness.js
- `openMore()` --calls--> `boot()`  [EXTRACTED]
  pwa-tests/test/service-categories.test.js → pwa-tests/test/harness.js
- `App()` --calls--> `AuthProvider()`  [EXTRACTED]
  admin-ui/src/App.jsx → admin-ui/src/context/AuthContext.jsx
- `AppContent()` --calls--> `ActingDrivers()`  [EXTRACTED]
  admin-ui/src/App.jsx → admin-ui/src/pages/ActingDrivers.jsx

## Import Cycles
- None detected.

## Communities (107 total, 31 thin omitted)

### Community 1 - "Community 1"
Cohesion: 0.03
Nodes (59): addressTamil, areaDescription, AutoDriver, BusCorridor, busType, category, colorHex, confirmations (+51 more)

### Community 2 - "Community 2"
Cohesion: 0.06
Nodes (41): app, bulletinLikeLimiter, bulletinWriteLimiter, cors, express, helmet, path, publicWriteLimiter (+33 more)

### Community 3 - "Community 3"
Cohesion: 0.11
Nodes (47): assert(), auth(), cleanup(), created, del(), delBody(), errors, freshPhone() (+39 more)

### Community 4 - "Community 4"
Cohesion: 0.05
Nodes (45): _apiLocal, _apiLongDistance, _AutoCard, build, _BusRoute, color, _CorridorMeta, _countdownTimer (+37 more)

### Community 5 - "Community 5"
Cohesion: 0.13
Nodes (49): addLongPressShare(), altSuggestionHtml(), busChipHtml(), busTypeMeta(), cleanOperator(), computeNextBus(), esc(), fmt12() (+41 more)

### Community 6 - "Community 6"
Cohesion: 0.21
Nodes (44): assert(), del(), errors, get(), getAuthHeaders(), http, https, isHttps (+36 more)

### Community 7 - "Community 7"
Cohesion: 0.11
Nodes (23): adminAuth(), jwt, requireRole(), validateIdParam(), isStartBeforeEnd(), isValidPhone(), isValidTime(), trimStr() (+15 more)

### Community 8 - "Community 8"
Cohesion: 0.05
Nodes (39): dependencies, connectivity_plus, firebase_core, firebase_messaging, flutter, http, intl, path (+31 more)

### Community 9 - "Community 9"
Cohesion: 0.06
Nodes (27): _announcements, _autoScroll, _autoScrollTimer, build, _buildHeader, _controller, createState, _currentPage (+19 more)

### Community 10 - "Community 10"
Cohesion: 0.06
Nodes (34): accentColor, _apiDoctors, _buildApiDoctorCard, _buildContactCard, _buildContent, _buildEmptyState, _buildFallbackDoctors, _buildOfflineBanner (+26 more)

### Community 11 - "Community 11"
Cohesion: 0.09
Nodes (30): dependencies, @emotion/react@^11.11.0, @emotion/styled@^11.11.0, @mui/icons-material@^5.14.0, @mui/material@^5.14.0, react@^18.2.0, react-dom@^18.2.0, react-router-dom@^6.20.0 (+22 more)

### Community 12 - "Community 12"
Cohesion: 0.06
Nodes (32): runs-on, steps, concurrency, cancel-in-progress, group, environment, needs, runs-on (+24 more)

### Community 13 - "Community 13"
Cohesion: 0.11
Nodes (19): express, router, express, router, admin, sendInBatches(), sendToAll(), sendToStreet() (+11 more)

### Community 14 - "Community 14"
Cohesion: 0.15
Nodes (27): applyPosterState(), cancelEdit(), checkLink(), compressImage(), deviceId(), esc(), firstUrl(), getPoster() (+19 more)

### Community 15 - "Community 15"
Cohesion: 0.07
Nodes (26): ApiService, _base, confirmWaterAlert, getAllDoctors, getAnnouncements, getAutoContact, getAutoDrivers, getBusCorridors (+18 more)

### Community 16 - "Community 16"
Cohesion: 0.08
Nodes (19): build, createState, didChangeAppLifecycleState, dispose, ensureDefaultStreet, init, initState, main (+11 more)

### Community 17 - "Community 17"
Cohesion: 0.08
Nodes (25): WaterSchedule, _alertSent, build, _buildBody, _buildShimmer, _confirmAlert, _contactAdmin, createState (+17 more)

### Community 18 - "Community 18"
Cohesion: 0.08
Nodes (24): build, _buildBody, _call, _CategoryMeta, _categoryOrder, color, _contactPhone, createState (+16 more)

### Community 19 - "Community 19"
Cohesion: 0.12
Nodes (24): BODI, CHENNAI, CHINNAMANUR, COIMBATORE, del(), findOrCreateCorridor(), get(), https (+16 more)

### Community 20 - "Community 20"
Cohesion: 0.09
Nodes (20): build, _buildBody, _buildCutCard, _buildShimmer, _contactAdmin, createState, _cuts, _formatDatetime (+12 more)

### Community 21 - "Community 21"
Cohesion: 0.14
Nodes (17): annKey(), bindInstall(), closeDrawer(), closeWall(), dismiss(), dismissedIds(), esc(), init() (+9 more)

### Community 22 - "Community 22"
Cohesion: 0.11
Nodes (12): assert, test, assert, openBulletin(), test, boot(), assert, test (+4 more)

### Community 23 - "Community 23"
Cohesion: 0.09
Nodes (21): _apiDrivers, AutoScreen, _AutoScreenState, build, _buildBody, _call, _contactMessage, _contactName (+13 more)

### Community 24 - "Community 24"
Cohesion: 0.09
Nodes (16): build, _buildContactList, _categories, _categoryColor, _contacts, createState, dispose, EmergencyScreen (+8 more)

### Community 25 - "Community 25"
Cohesion: 0.22
Nodes (20): actingRow(), avatarHtml(), catMeta(), esc(), hasPhone(), init(), initRegForm(), load() (+12 more)

### Community 26 - "Community 26"
Cohesion: 0.20
Nodes (15): App(), AppContent(), Layout(), Login(), useAuth(), AutoDrivers(), BusTimings(), Emergency() (+7 more)

### Community 27 - "Community 27"
Cohesion: 0.10
Nodes (16): ensureDefaultStreet, init, isAgreementAccepted, isOnboarded, _keyAgreementAccepted, _keyDeviceId, _keyOnboarded, _keyStreetId (+8 more)

### Community 28 - "Community 28"
Cohesion: 0.11
Nodes (12): activeIcon, build, createState, _currentIndex, _homeNavKey, icon, label, MainShell (+4 more)

### Community 29 - "Community 29"
Cohesion: 0.11
Nodes (18): Street, build, _continue, createState, dispose, _fallbackStreets, _filter, _filtered (+10 more)

### Community 30 - "Community 30"
Cohesion: 0.15
Nodes (18): idx_admin_users_email, idx_admin_users_is_active, admin_users, auto_drivers, bus_corridors, bus_routes, bus_timings, devices (+10 more)

### Community 31 - "Community 31"
Cohesion: 0.32
Nodes (18): assert(), errors, get(), http, https, isHttps, main(), test() (+10 more)

### Community 32 - "Community 32"
Cohesion: 0.11
Nodes (18): BusTiming, _badge, build, BusRouteScreen, color, emoji, _formatGap, gapLabel (+10 more)

### Community 33 - "Community 33"
Cohesion: 0.16
Nodes (14): canWrite, express, router, cleanDeviceId(), express, hasImage(), hasLinkColumn(), hasOpenPosting() (+6 more)

### Community 34 - "Community 34"
Cohesion: 0.12
Nodes (15): build, _buildForm, _buildSuccessState, createState, dispose, _FeedbackHint, FeedbackScreen, _FeedbackScreenState (+7 more)

### Community 35 - "Community 35"
Cohesion: 0.35
Nodes (8): ConfirmDialog(), DAY_FULL_NAMES, DAY_NAMES, Doctors(), formatSchedule(), @mui/icons-material, @mui/material, react

### Community 36 - "Community 36"
Cohesion: 0.12
Nodes (12): _a, build, _c, createState, _ctrl, delay, dispose, _Dot (+4 more)

### Community 37 - "Community 37"
Cohesion: 0.17
Nodes (14): BusScreen, _BusScreenState, _AnnouncementBanner, _AnnouncementBannerState, HomeScreen, _HomeScreenState, _HospitalDetailScreen, _HospitalDetailScreenState (+6 more)

### Community 38 - "Community 38"
Cohesion: 0.12
Nodes (15): background_color, categories, description, display, icons, lang, launch_handler, client_mode (+7 more)

### Community 39 - "Community 39"
Cohesion: 0.22
Nodes (7): API_BASE, SESSION_EXPIRED_EVENT, apiBaseFor(), AuthContext, AuthProvider(), decodeToken(), isExpired()

### Community 40 - "Community 40"
Cohesion: 0.13
Nodes (13): AboutScreen, build, emoji, _green, _InfoCard, _InfoRow, labelEnglish, labelTamil (+5 more)

### Community 41 - "Community 41"
Cohesion: 0.13
Nodes (10): cacheDoctors, cacheEmergencyContacts, cacheLocalServices, CacheService, getCachedDoctors, getCachedEmergencyContacts, getCachedLocalServices, _getPrefs (+2 more)

### Community 42 - "Community 42"
Cohesion: 0.13
Nodes (9): build, _call, CallButton, color, label, phone, sublabel, build (+1 more)

### Community 43 - "Community 43"
Cohesion: 0.13
Nodes (11): app, BUS_CORRIDORS, BUS_TIMINGS, cors, DOCTORS, EMERGENCY_CONTACTS, express, HOSPITAL (+3 more)

### Community 44 - "Community 44"
Cohesion: 0.23
Nodes (10): avatarHtml(), esc(), init(), initContactForm(), loadDrivers(), refresh(), renderCard(), renderGrouped() (+2 more)

### Community 45 - "Community 45"
Cohesion: 0.14
Nodes (12): AppColors, AppTheme, background, busOrange, card, hospitalRed, lastBusRed, powerYellow (+4 more)

### Community 46 - "Community 46"
Cohesion: 0.18
Nodes (9): autoImg, busImg, crossGlyph(), drawIcon(), emojiGlyph(), fs, outDir, path (+1 more)

### Community 47 - "Community 47"
Cohesion: 0.14
Nodes (14): dependencies, axios@^1.6.0, bcryptjs@^2.4.3, cheerio@^1.0.0-rc.12, express@^4.18.2, helmet@^7.1.0, node-cron@^3.0.3, pg@^8.11.3 (+6 more)

### Community 48 - "Community 48"
Cohesion: 0.15
Nodes (10): assert, css, fs, path, test, assert, fs, m (+2 more)

### Community 49 - "Community 49"
Cohesion: 0.33
Nodes (12): contactChips(), dayRangeLabel(), esc(), fmtTime(), init(), load(), refresh(), render() (+4 more)

### Community 50 - "Community 50"
Cohesion: 0.17
Nodes (10): assert, bootBus(), CORRIDORS, fs, HTML, { JSDOM }, path, PWA (+2 more)

### Community 51 - "Community 51"
Cohesion: 0.17
Nodes (10): fs, HTML, { JSDOM }, path, PWA, RAW, SCRIPTS, UA (+2 more)

### Community 52 - "Community 52"
Cohesion: 0.20
Nodes (11): dotenv@^16.3.1, description, devDependencies, canvas@^3.2.3, nodemon@^3.0.2, main, name, version (+3 more)

### Community 53 - "Community 53"
Cohesion: 0.17
Nodes (10): adminAutoRoute, adminHospital, adminHtml, appJs, autoRoute, fs, migration, schema (+2 more)

### Community 54 - "Community 54"
Cohesion: 0.33
Nodes (7): Bulletin(), formatDate(), posterId(), posterName(), STATUS_STYLE, AppHarness(), Harness()

### Community 55 - "Community 55"
Cohesion: 0.18
Nodes (10): background_color, description, display, icons, name, orientation, prefer_related_applications, short_name (+2 more)

### Community 56 - "Community 56"
Cohesion: 0.31
Nodes (9): uq_community_posters_device, community_post_likes, community_posters, community_posts, community_posts_daily, idx_community_likes_post, idx_community_posts_expires, idx_community_posts_live (+1 more)

### Community 57 - "Community 57"
Cohesion: 0.18
Nodes (7): assert, bootSW(), fs, path, SRC, test, vm

### Community 58 - "Community 58"
Cohesion: 0.36
Nodes (7): Announcements(), formatIst(), isExpired(), isoFromIstInput(), istInputFromIso(), ITEM, TYPES

### Community 59 - "Community 59"
Cohesion: 0.38
Nodes (9): esc(), init(), load(), refresh(), render(), renderContactRow(), renderGroup(), telDisplay() (+1 more)

### Community 60 - "Community 60"
Cohesion: 0.20
Nodes (6): assert, fs, path, ROOT, SERVICES, test

### Community 61 - "Community 61"
Cohesion: 0.22
Nodes (8): isValidEmail(), bcrypt, express, jwt, loginLimiter, rateLimit, registerLimiter, router

### Community 62 - "Community 62"
Cohesion: 0.25
Nodes (8): description, devDependencies, jsdom@^25.0.1, jsdom, name, private, scripts, test

### Community 63 - "Community 63"
Cohesion: 0.22
Nodes (8): services, autoDeploy, buildCommand, name, rootDir, runtime, startCommand, type

### Community 64 - "Community 64"
Cohesion: 0.36
Nodes (5): CATEGORIES, CATEGORY_ORDER, getCategoryInfo(), LocalServices(), ROWS

### Community 65 - "Community 65"
Cohesion: 0.39
Nodes (5): fmtDate(), parseUA(), PwaStats(), StatCard(), STATS

### Community 66 - "Community 66"
Cohesion: 0.32
Nodes (5): express, router, express, router, DEFAULT_REG_CONTACT

### Community 67 - "Community 67"
Cohesion: 0.46
Nodes (7): apiFetch(), apiPost(), apiSend(), apiUrl(), lsGet(), lsSet(), networkFetch()

### Community 68 - "Community 68"
Cohesion: 0.25
Nodes (6): assert, fmtPeriod, fs, path, src, test

### Community 69 - "Community 69"
Cohesion: 0.25
Nodes (7): assert, fs, linkLabel, m, path, src, test

### Community 70 - "Community 70"
Cohesion: 0.29
Nodes (6): API_JS, assert, fs, IDENTITY, path, test

### Community 71 - "Community 71"
Cohesion: 0.33
Nodes (6): scripts, build, dev, preview, test, test:watch

### Community 72 - "Community 72"
Cohesion: 0.33
Nodes (6): scripts, db:migrate, dev, start, test, test:local

### Community 73 - "Community 73"
Cohesion: 0.40
Nodes (3): corsMiddleware, isAllowedOrigin(), PROD

### Community 74 - "Community 74"
Cohesion: 0.50
Nodes (4): ActingDrivers(), EMPTY, fileToDataUrl(), VEH_EMOJI

### Community 75 - "Community 75"
Cohesion: 0.40
Nodes (4): _ModuleTile, _ModuleTileState, SplashScreen, _SplashScreenState

### Community 76 - "Community 76"
Cohesion: 0.83
Nodes (3): idx_pwa_visits_last_seen, idx_pwa_visits_visitor, pwa_visits

## Knowledge Gaps
- **406 isolated node(s):** `addressTamil`, `areaDescription`, `AutoDriver`, `BusCorridor`, `busType` (+401 more)
  These have ≤1 connection - possible missing edges. (Counts symbols only; 823 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **31 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `pg` connect `Community 47` to `Community 2`, `Community 3`, `Community 52`?**
  _High betweenness centrality (0.013) - this node is a cross-community bridge._
- **What connects `addressTamil`, `areaDescription`, `AutoDriver` to the rest of the system?**
  _406 weakly-connected nodes found - possible missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.051929824561403506 - nodes in this community are weakly interconnected._
- **Why does `ApiService` connect `Community 0` to `Community 39`?**
  _High betweenness centrality (0.010) - this node is a cross-community bridge._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.03125 - nodes in this community are weakly interconnected._
- **Why does `express` connect `Community 2` to `Community 33`, `Community 66`, `Community 7`, `Community 43`, `Community 13`, `Community 47`, `Community 52`, `Community 61`?**
  _High betweenness centrality (0.007) - this node is a cross-community bridge._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.059506531204644414 - nodes in this community are weakly interconnected._