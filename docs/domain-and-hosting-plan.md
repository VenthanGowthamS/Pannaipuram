# Domain & Hosting Plan — pannaipuram.com / .in

> **Status:** ✅ EXECUTED (June 2026). `pannaipuram.com` bought on Cloudflare
> Registrar. app/api/admin subdomains live with SSL. Steps below are kept as a
> reference record of what was done.
> **Key gotcha:** Cloudflare proxy (orange cloud) MUST be DNS-only (grey) for the
> Render + GitHub Pages custom domains — proxy blocks Let's Encrypt cert issuance.
> Saved May 27, 2026 · executed June 2026.

---

## Current State (as of v37)

| Component | Where it lives | URL |
|---|---|---|
| PWA (Bus + Auto) | GitHub Pages (free, instant CDN) | https://venthangowthams.github.io/Pannaipuram/ |
| Backend API | Render.com (free tier, cold starts) | https://pannaipuram-api.onrender.com |
| Admin panel | Render (same backend) | https://pannaipuram-api.onrender.com/admin/v2 |
| Source code | GitHub | https://github.com/VenthanGowthamS/Pannaipuram |

**Problem to solve:** ugly URLs for sharing with villagers. Want a clean
`pannaipuram.com` (or `.in`) brand.

---

## Target Architecture (after domain purchase)

```
pannaipuram.com           → village home / landing (future — separate repo)
app.pannaipuram.com       → Bus + Auto PWA (this app, on GitHub Pages)
school.pannaipuram.com    → school website (future)
services.pannaipuram.com  → local services (future)
api.pannaipuram.com       → backend API (Render)
admin.pannaipuram.com     → admin panel (Render)
```

Each subdomain is independently routable to any hosting (GitHub Pages,
Render, Cloudflare Pages, etc.) — extensible for years.

---

## Static vs Dynamic — How it works

- **Static** = HTML/CSS/JS files, served from GitHub CDN. Instant load,
  never sleeps. These don't change per user.
- **Dynamic** = bus timings, drivers — JavaScript fetches these from
  Render after the page loads. They DO change as admins update data.
- Net effect: instant shell + live data + offline cache fallback when
  Render is cold.

---

## Where to Buy the Domain

| Registrar | Price | Notes |
|---|---|---|
| **Cloudflare Registrar** ⭐ | ~$9.77/yr (.com), at-cost | Best — free DNS, free SSL, free CDN, no upsells |
| BigRock (India) | ₹800-1200/yr (.com) | Indian payment options (UPI) |
| Namecheap | ~$10-13/yr | Decent, popular |
| GoDaddy | ❌ avoid | Expensive renewals |

**Indian alternative:** `pannaipuram.in` ~₹500-700/yr — cheaper, very local-feeling.

**Recommended:** Buy from **Cloudflare** (cloudflare.com → Registrar).
Free DNS management is the killer feature for multi-subdomain setup.

---

## Implementation Steps (run after domain purchased)

### Step 1 — Add DNS records in Cloudflare

In Cloudflare dashboard → DNS → Records, add:

```
Type   Name           Content                              Proxy
─────  ─────────────  ───────────────────────────────────  ──────
A      app            185.199.108.153                      DNS only
A      app            185.199.109.153                      DNS only
A      app            185.199.110.153                      DNS only
A      app            185.199.111.153                      DNS only
CNAME  api            pannaipuram-api.onrender.com         DNS only
CNAME  admin          pannaipuram-api.onrender.com         DNS only
```

(GitHub Pages IPs current as of 2026. Verify at
https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site)

### Step 2 — PWA changes (Claude will do)

**`pwa/CNAME`** — create file with single line: `app.pannaipuram.com`

**`.github/workflows/deploy-pwa.yml`** — already copies `pwa/*` so CNAME
goes along automatically.

**`pwa/js/api.js`** — update `API_BASE` detection:
```js
var API_BASE = (function() {
  var h = location.hostname;
  if (h === 'app.pannaipuram.com') return 'https://api.pannaipuram.com';
  if (h.endsWith('.github.io')) return 'https://pannaipuram-api.onrender.com';
  return '';
})();
```

Same pattern in `pwa/js/app.js` (visitor ping, feedback) and
`pwa/js/auto.js` (feedback).

### Step 3 — Backend changes (Claude will do)

**`backend/src/app.js`** CORS:
```js
// add pannaipuram.com + subdomains to allowed origins
if (/^https:\/\/([a-z0-9-]+\.)?pannaipuram\.(com|in)$/i.test(origin))
  return callback(null, true);
```

**Render dashboard** (Venthan does this):
1. Render → Service → Settings → Custom Domains
2. Add `api.pannaipuram.com` → Render shows DNS record to add
3. Add `admin.pannaipuram.com` → same

### Step 4 — GitHub Pages custom domain

In repo → Settings → Pages → Custom domain → enter `app.pannaipuram.com`
→ Save → check "Enforce HTTPS" once cert provisions (~5 min).

### Step 5 — Update WhatsApp share link

Old: `https://venthangowthams.github.io/Pannaipuram/?install=1`
New: `https://app.pannaipuram.com/?install=1`

Old API URL referenced anywhere → `https://api.pannaipuram.com`

---

## Cost Summary (Year 1)

| Item | Cost |
|---|---|
| Domain (.com via Cloudflare) | ~₹820 ($9.77) |
| Domain (.in via BigRock) | ~₹600 |
| DNS hosting | Free (Cloudflare) |
| GitHub Pages | Free (unlimited bandwidth) |
| SSL certificate | Free (auto-provisioned) |
| Render backend | Free tier (current) |
| **Total** | **~₹600-820/year** |

Future ongoing cost: just the domain renewal. Everything else stays free.

---

## Resume Context

When you come back to this work, tell Claude:
> "Read docs/domain-and-hosting-plan.md — I've now purchased
> [pannaipuram.com / .in] from [Cloudflare / other]. Let's execute
> Steps 2-5."

Claude can pick up immediately without reloading conversation history.
