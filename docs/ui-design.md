# பண்ணைப்புரம் App — UI Design
### Phase 3 of 7

> **Version:** 1.1 — IMPLEMENTED
> **Date:** March 2026
> **Status:** Phase 3 — UI Design COMPLETE & BUILT

---

## 1. Design Principles

- **Tamil first** — every label in Tamil, small English below
- **One tap** — every critical action reachable in one tap from home
- **Large text** — minimum 18sp, readable by elderly without glasses
- **Icon-first** — icons carry meaning, text confirms it
- **High contrast** — dark text on light background always
- **Offline-aware** — clear indicator when showing cached data

---

## 2. Colour System

| Name | Hex | Used For |
|---|---|---|
| Primary | `#1B5E20` (deep green) | Header, primary buttons |
| Power Yellow | `#F9A825` | Electricity module accent |
| Water Blue | `#0277BD` | Water module accent |
| Bus Orange | `#E65100` | Bus module accent |
| Hospital Red | `#B71C1C` | Hospital / emergency accent |
| Background | `#F5F5F5` | App background |
| Card | `#FFFFFF` | Module cards |
| Text Primary | `#212121` | All body text |
| Text Secondary | `#757575` | English sub-labels |

---

## 3. Typography

| Style | Font | Size | Weight |
|---|---|---|---|
| App Title | Noto Sans Tamil | 22sp | Bold |
| Module Title | Noto Sans Tamil | 20sp | Bold |
| Body Tamil | Noto Sans Tamil | 18sp | Regular |
| Sub-label English | Roboto | 12sp | Regular |
| Button | Noto Sans Tamil | 18sp | Medium |
| Status Card | Noto Sans Tamil | 16sp | Regular |

---

## 4. Screen Designs

---

### Screen 1 — Onboarding (First launch only)

```
┌─────────────────────────────────┐
│                                 │
│         பண்ணைப்புரம்            │
│    உங்கள் ஊரின் தகவல் மையம்    │
│                                 │
│   ┌─────────────────────────┐   │
│   │  உங்கள் தெருவை தேர்வு   │   │
│   │  செய்யுங்கள்            │   │
│   │  Select your street     │   │
│   ├─────────────────────────┤   │
│   │  🔍 தெரு தேடு...        │   │
│   ├─────────────────────────┤   │
│   │  வள்ளுவர் தெரு          │   │
│   │  [next 56 streets...]   │   │
│   └─────────────────────────┘   │
│                                 │
│  [ தொடரவும் — Continue ]        │
│                                 │
└─────────────────────────────────┘
```

- User picks their street once — app remembers it forever
- Searchable scrollable list of all 57 streets in Tamil
- Skip option: "என் தெரு இல்லை / My street is not listed"

---

### Screen 2 — Home Screen ✅ IMPLEMENTED

```
┌─────────────────────────────────┐
│  🏠 பண்ணைப்புரம்              │
│  உங்கள் ஊரின் தகவல் மையம்     │
├─────────────────────────────────┤
│  சொல்லுங்க, என்ன வேணும்?        │
├─────────────────────────────────┤
│ ┌─────────────────────────────┐ │
│ │ 🚌 அண்ணே பஸ்...           │ │
│ │    Bus Times & Routes       │ │
│ └─────────────────────────────┘ │
│ ┌─────────────────────────────┐ │
│ │ 🚗 சார், ஆட்டோ வேணுமா?   │ │
│ │    Auto & Car Transport     │ │
│ └─────────────────────────────┘ │
│ ┌─────────────────────────────┐ │
│ │ 🏥 சிஸ்டர், டாக்டர்...     │ │
│ │    Hospital & Clinic        │ │
│ └─────────────────────────────┘ │
│ ┌─────────────────────────────┐ │
│ │ ⚡ அண்ணே, கரண்ட்...       │ │
│ │    Electricity Status       │ │
│ └─────────────────────────────┘ │
│ ┌─────────────────────────────┐ │
│ │ 💧 அக்கா, தண்ணி...        │ │
│ │    Water Supply             │ │
│ └─────────────────────────────┘ │
└─────────────────────────────────┘
```

**✅ Status:** Full-width rectangle tiles (one per row), colloquial Tamil labels with English sub-labels, cottage icon in header, NO live status chips on home screen. Tile order: Bus → Auto → Hospital → Electricity → Water

---

### Screen 3 — Power / மின்சாரம்

```
┌─────────────────────────────────┐
│ ←  மின்சாரம்   Electricity   ⚡ │
├─────────────────────────────────┤
│                                 │
│  ┌─────────────────────────┐   │
│  │  🟢 இன்று மின் தடை இல்லை│   │
│  │     No cut today         │   │
│  └─────────────────────────┘   │
│                                 │
│  ┌─────────────────────────┐   │
│  │  📅 அடுத்த திட்டமிட்ட  │   │
│  │     மின் தடை            │   │
│  │  ─────────────────────  │   │
│  │  தேதி   : [date]         │   │
│  │  நேரம்  : [time–time]   │   │
│  │  காரணம் : பராமரிப்பு    │   │
│  │  Maintenance work        │   │
│  └─────────────────────────┘   │
│                                 │
│  ┌─────────────────────────┐   │
│  │  📞 புகார் செய்ய அழைக்க │   │
│  ├─────────────────────────┤   │
│  │  📱 94987 94987          │   │
│  │  TNEB உள்ளூர் புகார்    │   │
│  │     Local Complaint      │   │
│  ├─────────────────────────┤   │
│  │  📱 1912                 │   │
│  │  TNEB தேசிய எண்         │   │
│  │     National Helpline    │   │
│  └─────────────────────────┘   │
│                                 │
│  [ ✅ என் தெருவில் மின்சாரம்  ]  │
│  [    வந்துவிட்டது             ]  │
│  [  Power restored in my street]  │
└─────────────────────────────────┘
```

---

### Screen 4 — Water / தண்ணீர்

```
┌─────────────────────────────────┐
│ ←  தண்ணீர்   Water Supply    💧 │
├─────────────────────────────────┤
│                                 │
│  வள்ளுவர் தெரு  |  Valluvar St  │
│  (tap to change street)        │
│                                 │
│  ┌─────────────────────────┐   │
│  │  📅 அடுத்த தண்ணீர்      │   │
│  │  ─────────────────────  │   │
│  │  திங்கட்கிழமை, காலை 6   │   │
│  │  Monday, 6:00 AM         │   │
│  │  (3 நாளுக்கு ஒரு முறை)  │   │
│  └─────────────────────────┘   │
│                                 │
│  ┌─────────────────────────┐   │
│  │  💧 தண்ணீர் வந்துவிட்டதா│   │
│  │     Has water arrived?   │   │
│  │                          │   │
│  │  [ ✅ தண்ணீர் வந்தது!  ] │   │
│  │  [  Water has come!     ] │   │
│  └─────────────────────────┘   │
│                                 │
│  ┌─────────────────────────┐   │
│  │  🕐 இன்றைய அறிவிப்புகள் │   │
│  │  Today's community alerts│   │
│  │  ─────────────────────  │   │
│  │  💧 வள்ளுவர் தெரு 6:42   │   │
│  │     confirmed by 3 ✅     │   │
│  └─────────────────────────┘   │
└─────────────────────────────────┘
```

---

### Screen 5 — Bus / பேருந்து

```
┌─────────────────────────────────┐
│ ←  பேருந்து   Bus Timings    🚌 │
├─────────────────────────────────┤
│ ┌─────────────┐ ┌─────────────┐ │
│ │ 🔵 போடி பக்கம்│ │🟢கம்பம்பக்கம்│ │
│ │  Bodi Side  │ │ Kamban Side │ │
│ └─────────────┘ └─────────────┘ │
├─────────────────────────────────┤
│                                 │
│  🔵 போடி பக்கம் — Towards Bodi  │
│  பண்ணைப்புரம் → தேவாரம் → போடி  │
│                                 │
│  ┌─────────────────────────┐   │
│  │  ⏱ அடுத்த பேருந்து      │   │
│  │     Next bus            │   │
│  │  ─────────────────────  │   │
│  │      7:45 காலை          │   │
│  │    in 12 நிமிடம்        │   │
│  └─────────────────────────┘   │
│                                 │
│  அனைத்து நேரங்கள் — All Times   │
│  ┌─────────────────────────┐   │
│  │  5:30  காலை  Ordinary   │   │
│  │  7:45  காலை  Ordinary   │   │
│  │  9:00  காலை  Express 🚀 │   │
│  │  11:30 பகல்  Ordinary   │   │
│  │  2:00  மாலை  Ordinary   │   │
│  │  5:30  மாலை  Ordinary   │   │
│  │  8:00  இரவு  🔴 கடைசி   │   │
│  └─────────────────────────┘   │
│                                 │
│  [ 🔔 கடைசி பேருந்து அறிவிப்பு ]  │
│  [  Alert for last bus          ]  │
└─────────────────────────────────┘
```

---

### Screen 6 — Hospital / மருத்துவமனை ✅ IMPLEMENTED (Two Hospitals)

```
┌─────────────────────────────────┐
│ ←  உடம்பு நல்லருக்கா?         🏥 │
│    Hospital & Clinic            │
├─────────────────────────────────┤
│  எந்த மருத்துவமனைக்கு போகணும்? │
│                                 │
│  ┌─────────────────────────────┐ │
│  │  PTV பத்மாவதி மருத்துவமனை │ │
│  │  PTV Padmavathy Hospital    │ │
│  │  தேவாரம் அருகில்            │ │
│  └─────────────────────────────┘ │
│                                 │
│  ┌─────────────────────────────┐ │
│  │  S P Clinic                 │ │
│  │  Dr. Shanmugapriya          │ │
│  │  பெண்கள் நலம் • பொது        │ │
│  └─────────────────────────────┘ │
│                                 │
│  ┌─────────────────────────────┐ │
│  │  அவசர உதவி                 │ │
│  │  108 — Ambulance            │ │
│  │  104 — Health Helpline      │ │
│  └─────────────────────────────┘ │
└─────────────────────────────────┘

Doctor Detail (tap hospital card):
- PTV: Dr. Sekar (General, Wednesday)
- SP Clinic: Dr. Shanmugapriya (Women's • General • Diabetes, 7 days 4pm–8pm)
```

**✅ Status:** Two-hospital layout (PTV Padmavathy + SP Clinic), doctor details with scheduling, one-tap call buttons

---

### Screen 7 — Auto & Transport / ஆட்டோ ✅ IMPLEMENTED

```
┌─────────────────────────────────┐
│ ←  ஆட்டோ / வண்டி             🚗 │
├─────────────────────────────────┤
│  🚗                             │
│  சார், ஆட்டோ வேணுமா?            │
│  வண்டி வேணும்னா கீழ இருக்காங்க   │
│                                 │
│  ┌─────────────────────────────┐ │
│  │  ஆட்டோ — முருகேசன்          │ │
│  │  உத்தமபாளையம் வரை          │ │
│  │              [ அழைக்க ]     │ │
│  └─────────────────────────────┘ │
│                                 │
│  ┌─────────────────────────────┐ │
│  │  ஆட்டோ — கதிரவன்           │ │
│  │  போடி / கம்பம் வரை         │ │
│  │              [ அழைக்க ]     │ │
│  └─────────────────────────────┘ │
│                                 │
│  ┌─────────────────────────────┐ │
│  │  வேன் சேவை                  │ │
│  │  காலை 7 மணி — உத்தமபாளையம் │ │
│  │              [ அழைக்க ]     │ │
│  └─────────────────────────────┘ │
│                                 │
│  📞 உங்க ஊர்ல ஆட்டோ ஓட்டுனர் │
│  இருந்தா வேந்தனிடம் சொல்லுங்க  │
└─────────────────────────────────┘
```

**✅ Status:** Auto/van driver contacts with coverage areas, one-tap call buttons, note to contact Venthan for new drivers

---

## 5. Navigation Structure

```
App Launch
    ↓
First Time? → Onboarding (street selection) → Home
Returning?  → Home directly
                  ↓
        ┌─────────┼──────────┬──────────┬──────────┐
        ⚡        💧         🚌         🏥         📞
     Power      Water       Bus     Hospital   Emergency
     Screen     Screen    Screen     Screen     Screen
```

No bottom navigation bar — home screen IS the navigation. Back arrow returns to home from any screen.

---

## 6. Notification UI (On Device)

```
Power Cut Alert:
┌────────────────────────────────┐
│ பண்ணைப்புரம் App          ⚡  │
│ நாளை காலை 9 – பகல் 1 மின் தடை │
│ Scheduled maintenance cut      │
└────────────────────────────────┘

Water Alert:
┌────────────────────────────────┐
│ பண்ணைப்புரம் App          💧  │
│ தண்ணீர் வந்தது! — வள்ளுவர் தெரு│
│ Reported at 6:42 AM            │
└────────────────────────────────┘

Last Bus Warning:
┌────────────────────────────────┐
│ பண்ணைப்புரம் App          🚌  │
│ கடைசி போடி பேருந்து — 1 மணி   │
│ Last Bodi bus in 1 hour        │
└────────────────────────────────┘
```

---

## 7. Empty States

When data is missing or loading, show helpful messages in Tamil:

| Screen | Empty State Message |
|---|---|
| Power | "இன்று மின் தடை தகவல் இல்லை — TNEB அறிவிக்கவில்லை" |
| Water | "இன்று தண்ணீர் நாள் இல்லை — அடுத்த தண்ணீர் [date]" |
| Bus | "இந்த நேரத்தில் பேருந்து இல்லை — அடுத்த பேருந்து [time]" |
| Hospital | "இன்று டாக்டர் இல்லை — நாளை வருகின்றனர்" |
| Emergency | "தொலைபேசி எண்கள் ஏற்றப்படுகின்றன..." |

---

## 8. Offline Banner

When internet is unavailable, a subtle banner appears at top of each screen:

```
┌─────────────────────────────────┐
│ 📵 இணைப்பு இல்லை — பழைய தகவல் │
│    Offline — showing cached data │
└─────────────────────────────────┘
```

Bus, hospital, and emergency screens work fully offline.
Power and water show last cached data with timestamp.

---

## 9. Next Step — Phase 5: Deployment & Testing

✅ UI design complete and fully implemented in Flutter app.

Current work:
1. Deploy backend to Render (Node.js) + Supabase PostgreSQL
2. Seed real data (hospital, bus times, streets, emergency contacts)
3. Test FCM push notifications
4. Full end-to-end testing on actual Android devices
5. Launch QR code + WhatsApp sharing

---

*Built with ❤️ for பண்ணைப்புரம் by Venthan — Technology for Real People*
