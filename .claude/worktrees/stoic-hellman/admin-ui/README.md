# பண்ணைப்புரம் Admin Panel V2 (React + MUI)

A modern React admin panel for managing பண்ணைப்புரம் (Pannaipuram) village services. Built with Vite, React, and Material UI.

## Project Structure

```
admin-ui/
├── package.json                  # Project dependencies
├── vite.config.js               # Vite build configuration
├── index.html                   # HTML entry point
├── src/
│   ├── main.jsx                 # React DOM render
│   ├── App.jsx                  # Main app component
│   ├── theme.js                 # MUI theme with green palette
│   ├── api.js                   # API service with auth headers
│   ├── context/
│   │   └── AuthContext.jsx      # Auth state management
│   ├── components/
│   │   ├── Login.jsx            # Login page (email + password visibility toggle)
│   │   ├── Layout.jsx           # Responsive layout (drawer on desktop, bottom nav on mobile)
│   │   └── ConfirmDialog.jsx    # Reusable delete confirmation dialog
│   └── pages/
│       ├── PowerCuts.jsx        # ⚡ Power cuts management
│       ├── BusTimings.jsx       # 🚌 Bus timings management
│       ├── Doctors.jsx          # 🏥 Doctor and schedule management
│       ├── Emergency.jsx        # 📞 Emergency contacts management
│       ├── AutoDrivers.jsx      # 🚗 Auto/Van drivers management
│       ├── Water.jsx            # 💧 Water supply schedules (inline editing)
│       └── Streets.jsx          # 🏘 Streets management
```

## Features

### Authentication
- Clean Material Design login page
- Green gradient background (#1B5E20 to #388E3C)
- Email pre-filled with `venthan89@gmail.com`
- **Password visibility toggle (eye icon)**
- **Loading spinner on login button**
- JWT token stored in localStorage (`panToken`)
- Auto-login if valid token exists

### Dashboard Layout
- **Responsive design** - works on desktop, tablet, and mobile
- **Top AppBar** with app name and logout button
- **Desktop**: Side drawer navigation (240px wide)
- **Mobile**: Bottom navigation bar with 7 tabs
- **Snackbar notifications** for user feedback
- Loading skeletons while data fetches

### Modules (7 Tabs)

#### 1. ⚡ Power Cuts
- **Add**: Area description, cut type (planned/unplanned), start/end time, reason (Tamil)
- **Table**: Type badge, area, times, reason, status, resolve/delete actions
- Mark as resolved button
- Delete confirmation dialog

#### 2. 🚌 Bus Timings
- **Corridor selector**: Dropdown to switch between corridors
- **Add**: Departure time, days of week, bus type (ordinary/express/SETC), last bus checkbox
- **Table**: Departure time, type badge, days, status

#### 3. 🏥 Doctors
- **Add**: Hospital (PTV/SP Clinic), name (Tamil/English), specialisation
- **Add Schedule**: Day of week, start/end time, notes (Tamil) via dialog
- **Table**: Hospital, names, specialisation, action buttons (add schedule, delete)

#### 4. 📞 Emergency
- **Add**: Category (Police/Ambulance/Fire/Doctor/Other), name (Tamil/English), phone
- **Edit**: Click edit icon to modify existing contacts
- **Table**: Category chip, names, phone, edit/delete actions
- Categories with emoji badges

#### 5. 🚗 Auto/Van
- **Add**: Name (Tamil/English), phone, vehicle type (Auto/Van/Taxi), coverage (Tamil), schedule
- **Edit**: Click edit icon to modify drivers
- **Table**: Type emoji, names, phone, coverage, schedule, edit/delete actions

#### 6. 💧 Water
- **Inline Editing**: Click edit icon on any row
- **Fields**: Frequency (days), supply time (time input), notes (Tamil)
- **Save/Cancel**: Action buttons appear during edit
- **Table**: Street name, frequency, supply time, notes

#### 7. 🏘 Streets
- **Add**: Street name (Tamil/English)
- **Table**: Numbered list with Tamil name, English name, ward

## Development

### Install dependencies
```bash
npm install
```

### Run development server
```bash
npm run dev
```
Serves at `http://localhost:5173` with proxy to backend at `http://localhost:3000`

### Build for production
```bash
npm run build
```
Output goes to `../backend/public/admin-v2/`

## API Integration

### Base URL
All API calls are relative to the same origin. The app runs at `/admin/v2` on the Express backend.

### Authentication
- Login: `POST /admin/auth/login` → returns `{ token: "..." }`
- Token stored in `localStorage` as `panToken`
- Sent in header: `Authorization: Bearer <token>`

### API Response Format
```javascript
// Success
{ success: true, data: [...] }

// Error
{ success: false, error: 'message' }
```

### Endpoints Used
```
POST   /admin/auth/login
GET    /api/power/cuts
POST   /admin/power/cuts
PUT    /admin/power/cuts/:id
DELETE /admin/power/cuts/:id

GET    /admin/bus/corridors
GET    /api/bus/timings/:corridorId
POST   /admin/bus/routes
POST   /admin/bus/timings
DELETE /admin/bus/timings/:id

GET    /api/hospital/doctors
POST   /admin/hospital/doctors
POST   /admin/hospital/doctors/:id/schedule
PUT    /admin/hospital/doctors/:id
DELETE /admin/hospital/doctors/:id

GET    /api/emergency/contacts
POST   /admin/contacts
PUT    /admin/contacts/:id
DELETE /admin/contacts/:id

GET    /admin/auto/drivers
POST   /admin/auto/drivers
PUT    /admin/auto/drivers/:id
DELETE /admin/auto/drivers/:id

GET    /admin/water/streets
PUT    /admin/water/schedule/:streetId

GET    /admin/streets
POST   /admin/streets
```

## Technologies

- **React 18**: UI framework
- **Vite**: Fast build tool
- **Material UI (MUI)**: Component library
- **React Router**: Navigation (HashRouter for static files)
- **Emotion**: CSS-in-JS styling

## Styling

### Theme Colors
- Primary: `#1B5E20` (Deep green)
- Secondary: `#388E3C` (Light green)
- Typography: Tamil text uses `Noto Sans Tamil`, English uses `Roboto`

### Responsive Breakpoints
- Mobile: < 600px (bottom navigation)
- Tablet: 600-960px
- Desktop: > 960px (side drawer)

## Deployment

The admin panel is built to `../backend/public/admin-v2/` and served at `/admin/v2` by the Express backend.

### Build & Deploy Steps
1. `cd admin-ui && npm run build`
2. Commit built files to git (or let CI/CD handle it)
3. Deploy backend (build output automatically included)
4. Access at `https://pannaipuram-api.onrender.com/admin/v2`

## Notes

- **HashRouter**: Used because app is served as static files from `/admin/v2`
- **Offline Support**: API service catches errors gracefully
- **Validation**: Client-side validation on all forms
- **Mobile First**: Layout optimized for phones first, scales up
- **Old Admin Panel**: Original HTML panel at `/admin/panel` remains intact

## Original Admin Panel

The original vanilla HTML/JS admin panel is still available at `/admin/panel`. The new React panel coexists without affecting it.

---

Built with ❤️ for பண்ணைப்புரம்
