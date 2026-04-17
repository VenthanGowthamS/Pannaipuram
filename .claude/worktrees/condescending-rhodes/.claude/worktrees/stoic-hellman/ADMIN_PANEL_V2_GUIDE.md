# Admin Panel V2 Quick Start Guide

## Access

- **Development**: `http://localhost:3000/admin/v2`
- **Production**: `https://pannaipuram-api.onrender.com/admin/v2`

## Login

- **Email**: `venthan89@gmail.com` (pre-filled)
- **Password**: (set during backend deployment)
- Features:
  - Password visibility toggle (eye icon)
  - Loading spinner on login button
  - Auto-login with valid JWT token

## Features at a Glance

### 7 Management Modules

| Module | Path | Features |
|--------|------|----------|
| ⚡ Power Cuts | `/admin/v2#` | Add/resolve/delete power cuts |
| 🚌 Bus Timings | `/admin/v2#` | Manage bus schedules by corridor |
| 🏥 Doctors | `/admin/v2#` | Add doctors and their schedules |
| 📞 Emergency | `/admin/v2#` | Manage emergency contacts by category |
| 🚗 Auto/Van | `/admin/v2#` | Manage auto/van drivers |
| 💧 Water | `/admin/v2#` | Edit water supply schedules (inline) |
| 🏘 Streets | `/admin/v2#` | Add and list streets |

### Desktop vs Mobile

- **Desktop** (> 960px): Side drawer navigation on left, content on right
- **Tablet** (600-960px): Responsive layout adapts
- **Mobile** (< 600px): Bottom navigation bar with 7 tabs

## Common Tasks

### Add a Power Cut
1. Go to Power Cuts tab
2. Fill in: Area, Type, Start/End time, Reason
3. Click "Add Power Cut"

### Update Bus Timings
1. Go to Bus Timings tab
2. Select corridor from dropdown
3. Fill in: Departure time, Days, Bus type
4. Click "Add Bus Timing"

### Add a Doctor
1. Go to Doctors tab
2. Fill in: Hospital, Name (Tamil/English), Specialisation
3. Click "Add Doctor"
4. Use "+" icon to add doctor's schedule

### Edit Water Schedule
1. Go to Water tab
2. Click edit icon on any street row
3. Change: Frequency (days), Supply time, Notes
4. Click save or cancel

### Add Emergency Contact
1. Go to Emergency tab
2. Fill in: Category, Names (Tamil/English), Phone
3. Click "Add Contact"
4. Edit existing: Click edit icon
5. Delete: Click delete icon

## Project Structure

```
admin-ui/
├── package.json            # Dependencies (React, MUI, Vite)
├── vite.config.js         # Builds to ../backend/public/admin-v2/
├── src/
│   ├── api.js             # All API calls with JWT auth
│   ├── context/           # Auth state management
│   ├── components/        # Login, Layout, ConfirmDialog
│   └── pages/             # 7 module pages
```

## Development

### First Time Setup
```bash
cd admin-ui
npm install
npm run build
```

### Modify Code
1. Edit files in `admin-ui/src/`
2. Run `npm run build` to rebuild
3. Commit to git: `git add -A && git commit -m "..."`
4. Rebuild backend to deploy

### Add New Feature
1. Create new page in `admin-ui/src/pages/`
2. Import in `App.jsx`
3. Add tab configuration in `Layout.jsx`
4. Add API methods in `api.js`
5. Run `npm run build`

## API Integration

### Base URL
- All requests go to relative paths (same origin)
- Token sent in header: `Authorization: Bearer <token>`

### Response Format
```javascript
// Success
{ success: true, data: [...] }

// Error
{ success: false, error: 'message' }
```

## Key Points

- ✅ Fully responsive (mobile, tablet, desktop)
- ✅ All CRUD operations working
- ✅ Tamil + English labels throughout
- ✅ Password visibility toggle on login
- ✅ Loading spinners and skeletons
- ✅ Snackbar notifications
- ✅ Delete confirmation dialogs
- ✅ Inline editing for water schedules
- ✅ Dropdown corridors for bus timing
- ✅ Dialog for adding doctor schedules

## Troubleshooting

### Can't log in
- Check password is correct
- Check backend is running at port 3000
- Check network tab for `/admin/auth/login` response

### Tables show empty
- Check backend is running
- Check JWT token in localStorage
- Check network requests for errors

### CSS/Styling issues
- Clear browser cache (Ctrl+Shift+Del)
- Check MUI theme is applied (primary color should be green #1B5E20)

## Original Admin Panel

The old HTML admin panel is still available at `/admin/panel` (unchanged). The new React panel is completely separate.

---

For source code changes, see: `/sessions/hopeful-peaceful-wozniak/mnt/Pannaipuram/admin-ui/`
Built with React 18, Vite, and Material UI
