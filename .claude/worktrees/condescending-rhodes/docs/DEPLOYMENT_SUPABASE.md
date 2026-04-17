# பண்ணைப்புரம் Backend Deployment — Supabase + Render
### Fast track to live backend (30 minutes)

> **Target:** Live API endpoint by end of this document
> **Cost:** $0 (free tier)
> **Region:** Asia-Pacific (Singapore) — 40-80ms latency from India

---

## Part 1 — Supabase Database Setup (10 min)

### 1.1 Create Supabase Account
- Go to **supabase.com**
- Click **Start Your Project**
- Sign up with GitHub (VenthanGowthamS)
- Authorize Supabase to access your account

### 1.2 Create a New Project
- Org: your personal org
- **Project name:** `pannaipuram`
- **Database password:** create a strong one, save it
- **Region:** Asia-Pacific (Singapore) ← closest to India
- Click **Create new project** — wait 2-3 minutes

### 1.3 Get Your Connection String
Once the project loads:
- Left sidebar → **Project Settings** (gear icon)
- **Database** tab
- Copy the **POSTGRESQL_URL** (starts with `postgresql://`)
- Also note the **Host** — you'll use this in `.env`

**Example:**
```
postgresql://postgres.xyzabc:password@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres
```

---

## Part 2 — Run Database Schema (5 min)

### Option A — Use Supabase Web Console (easier)
1. In Supabase dashboard → **SQL Editor**
2. Click **+ New Query**
3. Paste contents of `backend/src/db/schema.sql`
4. Click **Run**
5. Wait for success ✅
6. Create another query, paste `backend/src/db/seed.sql`
7. Click **Run**

### Option B — Use psql from Mac terminal (if you have it)
```bash
# Get the connection string from Supabase Project Settings → Database
psql "postgresql://postgres.YOUR_PASSWORD@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres" \
  -f backend/src/db/schema.sql

psql "postgresql://postgres.YOUR_PASSWORD@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres" \
  -f backend/src/db/seed.sql
```

**Expected output:** Tables created, 3 rows inserted (Valluvar Street, water schedule, TNEB contacts) ✅

---

## Part 3 — Deploy Backend to Render (10 min)

### 3.1 Prepare Environment Variables
Create a file `backend/.env` (for local testing first):
```env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres
JWT_SECRET=pannaipuram_jwt_secret_2026_change_later
ADMIN_EMAIL=venthan89@gmail.com
NODE_ENV=production
PORT=3000
```

**Save this** — you'll need it for Render.

### 3.2 Render Deployment
1. Go to **render.com** → Sign up with GitHub
2. Click **New +** → **Web Service**
3. Connect to GitHub → Select **Pannaipuram** repo
4. Configure:
   - **Name:** `pannaipuram-api`
   - **Root Directory:** `backend` ← important
   - **Build Command:** `npm install`
   - **Start Command:** `node src/app.js`
   - **Plan:** Free
5. **Environment Variables** — add these:

   | Key | Value |
   |---|---|
   | `DATABASE_URL` | Paste from Supabase (above) |
   | `JWT_SECRET` | `pannaipuram_jwt_secret_2026` |
   | `ADMIN_EMAIL` | `venthan89@gmail.com` |
   | `NODE_ENV` | `production` |

6. Click **Create Web Service**
7. Wait 2-3 minutes for build and deploy ✅

### 3.3 Get Your Live API URL
Once deployed, Render shows a URL like:
```
https://pannaipuram-api.onrender.com
```

**Save this URL** — you'll use it in the Flutter app.

---

## Part 4 — Test the API (2 min)

Open this in your browser:
```
https://pannaipuram-api.onrender.com/health
```

You should see:
```json
{
  "status": "ok",
  "app": "பண்ணைப்புரம்",
  "version": "1.0.0"
}
```

If you see this → **API is live!** ✅

---

## Part 5 — Connect Flutter App (3 min)

### 5.1 Update API URL
Open `app/lib/services/api_service.dart`:

Find this line:
```dart
static const _base = 'https://pannaipuram-api.onrender.com'; // Production ← update this
```

Replace `pannaipuram-api.onrender.com` with your actual Render URL (from Part 3.3).

**Example:**
```dart
static const _base = 'https://pannaipuram-api-xyz123.onrender.com';
```

### 5.2 Rebuild and Run
```bash
cd app
flutter clean
flutter pub get
flutter run
```

### 5.3 Test on Emulator
- Open the **Power** screen
- You should see real data from the backend (TNEB numbers, status)
- Try the **Bus** screen — should see bus corridors + timings
- Try the **Hospital** screen — should see doctors

If data loads → **App is connected!** ✅

---

## Part 6 — Verify Everything Works (2 min)

**Checklist:**

- [ ] Supabase project created, region: Asia-Pacific
- [ ] Schema + seed data loaded into Supabase ✅
- [ ] Render web service deployed ✅
- [ ] `https://your-url.onrender.com/health` returns JSON ✅
- [ ] API URL updated in `api_service.dart` ✅
- [ ] `flutter run` loads real data on screens ✅

---

## What's Now Live

| Component | Status | URL |
|---|---|---|
| **Database** | 🟢 Live | Supabase Singapore |
| **API Server** | 🟢 Live | `https://pannaipuram-api.onrender.com` |
| **Flutter App** | 🟢 Connected | Points to live API |
| **Push Notifications** | 🟡 Disabled (Firebase optional) | Add later |

---

## Next Steps (After Launch)

1. **Add real data** — once you collect bus timings, hospital doctors, more streets
   - Use Supabase **Table Editor** to add rows directly
   - Or write SQL INSERT statements

2. **Set up admin panel** — simple web UI for you to manage content
   - Use Supabase **Auth** for login
   - Use Supabase **API** to read/write data

3. **Add Firebase** (optional, for push notifications) — when you have 50+ users

---

## Troubleshooting

### "Connection refused" or API doesn't respond
- Check Render build logs (Render dashboard → your service → **Logs**)
- Verify `DATABASE_URL` is correct in Render env vars
- Wait 1-2 minutes after deploy, Render can be slow to start

### Data not showing on Flutter app
- Verify `api_service.dart` has correct URL
- Check Supabase **SQL Editor** — verify tables exist (`select * from streets;`)
- Check Render logs for API errors

### Schema fails to run
- Make sure you're running it against the right database (check connection string)
- Check Supabase **SQL Editor** for error messages

---

*You now have a live backend. Data flows: Flutter App → Render API Server → Supabase Database ✅*

