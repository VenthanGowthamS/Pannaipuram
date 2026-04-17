# Development Guide - Admin Panel V2

## Project Overview

This is a modern React admin panel for managing பண்ணைப்புரம் (Pannaipuram) village services. Built with:
- **React 18** - UI library
- **Vite** - Fast build tool
- **Material UI (MUI)** - Component library
- **React Router** - Navigation with HashRouter

## Getting Started

### Prerequisites
- Node.js 16+ (LTS recommended)
- npm or yarn

### Setup

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# The app will be available at http://localhost:5173
# API calls proxy to http://localhost:3000 (backend)
```

### Build for Production

```bash
npm run build
# Output goes to ../backend/public/admin-v2/
```

## Project Structure

```
src/
├── main.jsx              # React DOM entry point
├── App.jsx              # Main app component (routing, tab management)
├── theme.js             # MUI theme configuration
├── api.js               # API service class with JWT auth
├── context/
│   └── AuthContext.jsx  # Auth state (user, token, login, logout)
├── components/
│   ├── Login.jsx        # Login page with password toggle + spinner
│   ├── Layout.jsx       # Main layout (responsive drawer + bottom nav)
│   └── ConfirmDialog.jsx # Delete confirmation modal
└── pages/
    ├── PowerCuts.jsx    # Power cuts management
    ├── BusTimings.jsx   # Bus timings management
    ├── Doctors.jsx      # Doctors and schedules
    ├── Emergency.jsx    # Emergency contacts
    ├── AutoDrivers.jsx  # Auto/van drivers
    ├── Water.jsx        # Water schedules (inline editing)
    └── Streets.jsx      # Streets management
```

## Key Components

### AuthContext (context/AuthContext.jsx)
Manages authentication state globally. Provides:
- `user` - Current logged-in user object or null
- `token` - JWT token from localStorage
- `loading` - Loading state
- `login(email, password)` - Login function
- `logout()` - Logout function

Usage:
```javascript
import { useAuth } from '../context/AuthContext';

const { user, token, loading, login, logout } = useAuth();
```

### API Service (api.js)
Singleton service for all API calls. Features:
- Automatic JWT token injection in headers
- Consistent error handling
- Response unwrapping (`data` field)

Usage:
```javascript
import api from '../api';

// Login
const { token } = await api.login(email, password);

// Get data
const cuts = await api.getPowerCuts();

// Add data
await api.addPowerCut({ area_description, cut_type, ... });

// Update data
await api.updateEmergencyContact(id, { phone, ... });

// Delete data
await api.deletePowerCut(id);
```

### Layout Component (components/Layout.jsx)
Responsive shell with:
- **Top AppBar** - Always visible with logout button
- **Desktop Drawer** (> 960px) - Left sidebar with navigation
- **Mobile Bottom Nav** (< 600px) - Bottom tab bar with 7 tabs
- **Snackbar** - Toast notifications
- Uses `useMediaQuery` for responsive behavior

### Pages
Each page handles one module's CRUD operations. Standard pattern:
1. State for data array, form, editing ID, etc.
2. Load data on mount with `useEffect`
3. Add/Edit/Delete methods with try-catch
4. Form card + data table layout
5. Loading skeletons while fetching
6. Empty state messages
7. Snackbar notifications via `onSnackbar` prop

Example pattern:
```javascript
const MyModule = ({ onSnackbar }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ /* fields */ });

  const loadData = async () => {
    setLoading(true);
    try {
      const result = await api.getMyData();
      setData(result || []);
    } catch (error) {
      onSnackbar('Failed to load', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await api.addMyData(form);
      onSnackbar('Added successfully', 'success');
      setForm({ /* reset */ });
      loadData();
    } catch (error) {
      onSnackbar('Failed to add', 'error');
    }
  };

  return (
    <Box>
      {/* Form Card */}
      <Card sx={{ p: 3, mb: 3 }}>
        {/* Form JSX */}
      </Card>

      {/* Data Table */}
      <Card>
        <TableContainer>
          {/* Table JSX */}
        </TableContainer>
      </Card>
    </Box>
  );
};
```

## Styling & Theme

### MUI Theme (theme.js)
Configured with:
- **Primary color**: `#1B5E20` (Deep green)
- **Secondary color**: `#388E3C` (Light green)
- **Typography**: Tamil text uses `Noto Sans Tamil`, English uses `Roboto`

Access theme in components:
```javascript
import { useTheme, useMediaQuery } from '@mui/material';

const theme = useTheme();
const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
```

### Responsive Design
```javascript
// Mobile first, then add styles for larger screens
<Grid container spacing={2}>
  <Grid item xs={12} sm={6}>  {/* Full width on mobile, half on 600px+ */}
    <TextField />
  </Grid>
</Grid>

// Or use MUI's responsive utilities
<Box sx={{
  display: { xs: 'block', sm: 'none' }  // Show only on mobile
}}>
  Mobile content
</Box>
```

## Common Tasks

### Add a New Module

1. **Create page component** (`src/pages/MyModule.jsx`):
   ```javascript
   const MyModule = ({ onSnackbar }) => {
     // See pattern above
   };
   export default MyModule;
   ```

2. **Add API methods** (`src/api.js`):
   ```javascript
   getMyData() {
     return this.request('GET', '/api/my/endpoint');
   }
   addMyData(data) {
     return this.request('POST', '/admin/my/endpoint', data);
   }
   ```

3. **Import in App** (`src/App.jsx`):
   ```javascript
   import MyModule from './pages/MyModule';
   ```

4. **Add tab** in `renderTab()`:
   ```javascript
   case 'mymodule':
     return <MyModule {...props} />;
   ```

5. **Add to tabs array** in `Layout.jsx`:
   ```javascript
   const tabs = [
     // ... existing tabs
     { id: 'mymodule', label: 'My Module', icon: '📋' },
   ];
   ```

6. **Rebuild**:
   ```bash
   npm run build
   ```

### Add Form Validation

```javascript
const handleSubmit = async (e) => {
  e.preventDefault();

  // Client-side validation
  if (!form.name || !form.email) {
    onSnackbar('Please fill in all required fields', 'warning');
    return;
  }

  if (form.email && !form.email.includes('@')) {
    onSnackbar('Invalid email address', 'warning');
    return;
  }

  // Proceed with API call
};
```

### Handle Loading States

Use Skeleton for visual feedback while loading:
```javascript
import { Skeleton } from '@mui/material';

{loading ? (
  <Box sx={{ p: 3 }}>
    {[1, 2, 3].map((i) => (
      <Skeleton key={i} height={60} />
    ))}
  </Box>
) : (
  <Table>{/* ... */}</Table>
)}
```

### Add Snackbar Notification

```javascript
import { Snackbar, Alert } from '@mui/material';

// In component
const [snackbar, setSnackbar] = useState({
  open: false,
  message: '',
  severity: 'info',
});

// Show notification
onSnackbar('Operation successful', 'success');
// Options: 'success', 'error', 'warning', 'info'

// In JSX (already in Layout)
<Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => {}}>
  <Alert severity={snackbar.severity}>
    {snackbar.message}
  </Alert>
</Snackbar>
```

## API Integration

### Making API Calls

The `api.js` service handles all HTTP requests with automatic JWT injection.

```javascript
import api from '../api';

// GET requests
const data = await api.getPowerCuts();

// POST requests (create)
await api.addPowerCut({
  area_description: 'North Street',
  cut_type: 'planned',
  start_time: '2024-03-18T10:00',
  end_time: '2024-03-18T12:00',
  reason_tamil: 'பழுது சரிசெய்தல்'
});

// PUT requests (update)
await api.updateEmergencyContact(id, {
  phone: '9876543210'
});

// DELETE requests
await api.deletePowerCut(id);
```

### Error Handling

```javascript
try {
  const result = await api.getSomeData();
  setData(result);
} catch (error) {
  console.error('API Error:', error.message);
  onSnackbar(error.message || 'An error occurred', 'error');
}
```

## Authentication

### JWT Token Flow

1. User logs in via Login page
2. Backend returns token: `{ token: "eyJ..." }`
3. Token stored in `localStorage` as `panToken`
4. `AuthContext` loads token on app mount
5. API service injects token in header: `Authorization: Bearer <token>`
6. All subsequent requests authenticated

### Token Persistence

Token automatically persists across browser sessions. Auto-login triggers if:
- Token exists in localStorage
- App hasn't been explicitly logged out

## Testing Locally

### Start Backend
```bash
cd backend
npm install
npm start
# Runs on http://localhost:3000
```

### Start Frontend Dev Server
```bash
cd admin-ui
npm run dev
# Runs on http://localhost:5173
# Proxies /admin and /api to localhost:3000
```

### Login Credentials
- Email: `venthan89@gmail.com` (pre-filled)
- Password: (check backend .env or deployment config)

## Building & Deployment

### Build
```bash
npm run build
# Creates optimized bundle in ../backend/public/admin-v2/
```

### Deploy
1. Ensure build succeeds: `npm run build`
2. Commit files: `git add -A && git commit -m "..."`
3. Push to main: `git push origin main`
4. Deploy backend (includes built admin-v2 files)
5. Access at `/admin/v2` on deployed backend

### Verifying Deployment
- Visit `https://pannaipuram-api.onrender.com/admin/v2`
- Should see login page with green theme
- Try logging in
- Check browser console for errors (F12 → Console)
- Check Network tab to verify API requests

## Debugging

### Browser DevTools

1. **Console** (F12 → Console)
   - View logs and errors
   - Check API response format
   - Test API calls: `fetch('/api/power/cuts', { headers: { Authorization: 'Bearer ...' } })`

2. **Network** (F12 → Network)
   - Monitor API requests
   - Check response status and payload
   - Verify auth headers sent

3. **Application** (F12 → Application → Storage)
   - View localStorage
   - Check `panToken` exists
   - Clear cache if needed

### Common Issues

**Blank white screen**
- Check browser console for errors
- Clear cache and reload
- Verify vite.config.js build output path

**Login fails**
- Verify backend is running on port 3000
- Check password is correct
- Check Network tab for `/admin/auth/login` response

**API calls return empty**
- Check JWT token is valid
- Verify backend routes exist
- Check API response format: `{ success: true, data: [...] }`

**Styling doesn't apply**
- Clear browser cache (Ctrl+Shift+Del)
- Verify MUI is imported correctly
- Check theme provider wraps app

## Code Style

### Naming Conventions
- **Components**: PascalCase (`LoginPage.jsx`)
- **Functions**: camelCase (`handleSubmit`)
- **Variables**: camelCase (`isLoading`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_ATTEMPTS = 3`)

### File Organization
- One component per file
- Logical grouping in folders
- Imports at top, organized by: React → MUI → custom

### Comments
- Brief comments explaining "why", not "what"
- JSDoc for complex functions
- Remove console.log before committing

## Performance

- **Code splitting**: Not needed for this size
- **Lazy loading**: Optional for modules if app grows
- **Image optimization**: Not applicable (tables/forms only)
- **Bundle analysis**: Check with `vite-plugin-visualizer`

## Further Reading

- [React Docs](https://react.dev)
- [Material UI Docs](https://mui.com)
- [Vite Docs](https://vitejs.dev)
- [React Router Docs](https://reactrouter.com)

---

Happy coding! 🎉
