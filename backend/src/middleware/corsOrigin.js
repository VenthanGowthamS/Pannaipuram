// Which browser origins may call the API in production.
// Pure function (env passed in) so it can be unit-tested without a server.
function isAllowedOrigin(origin, env = process.env) {
  // Requests with no origin (mobile apps, curl, server-to-server)
  if (!origin) return true;
  // In development, allow all origins
  if (env.NODE_ENV !== 'production') return true;
  const allowedOrigins = env.ALLOWED_ORIGINS
    ? env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
    : [];
  if (allowedOrigins.includes(origin)) return true;
  // Same-origin requests (admin panel served by Render at /admin/v2/)
  if (env.RENDER_EXTERNAL_HOSTNAME && origin === `https://${env.RENDER_EXTERNAL_HOSTNAME}`) return true;
  // PWA hosted on GitHub Pages (any *.github.io subdomain)
  if (/^https:\/\/[a-z0-9-]+\.github\.io$/i.test(origin)) return true;
  // pannaipuram.com + all subdomains (app / api / admin / school etc.)
  if (/^https:\/\/([a-z0-9-]+\.)?pannaipuram\.(com|in)$/i.test(origin)) return true;
  // Admin panel on Cloudflare Pages — OUR project only (+ its preview builds).
  // Never all of *.pages.dev: anyone can publish a site there.
  if (/^https:\/\/([a-z0-9-]+\.)?pannaipuram-admin\.pages\.dev$/i.test(origin)) return true;
  return false;
}

module.exports = { isAllowedOrigin };
