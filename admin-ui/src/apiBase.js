// On Cloudflare Pages the panel is a static site on its own origin, so API
// calls must go to the API host. Served by Render (/admin/v2/) or the Vite
// dev proxy, the API is same-origin → relative URLs.
export function apiBaseFor(hostname) {
  const h = String(hostname || '');
  if (h === 'admin.pannaipuram.com' || h.endsWith('.pages.dev')) return 'https://api.pannaipuram.com';
  return '';
}
