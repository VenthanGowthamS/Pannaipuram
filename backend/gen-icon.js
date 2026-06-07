// Generate PWA icons for Pannaipuram — UNIFIED village info app.
// Flashy blue gradient + 3 white service badges in a triangle:
//   top = hospital (red cross), bottom-left = bus (blue), bottom-right = auto (green).
// Full-bleed background = safe for maskable icons.
const { createCanvas } = require('./node_modules/canvas');
const fs = require('fs');
const path = require('path');

function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function whiteCircle(ctx, cx, cy, r) {
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.22)';
  ctx.shadowBlur = r * 0.28;
  ctx.shadowOffsetY = r * 0.12;
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

// ── Bus glyph ────────────────────────────────────────────
function busGlyph(ctx, cx, cy, r, color) {
  const w = 1.5 * r, h = 1.0 * r, x = cx - w / 2, y = cy - h / 2;
  ctx.fillStyle = color;
  rr(ctx, x, y, w, h * 0.82, r * 0.22); ctx.fill();           // body
  ctx.fillStyle = '#FFFFFF';                                  // windows
  const wy = y + h * 0.12, ww = w * 0.18, wh = h * 0.28, gap = w * 0.07;
  let wx = x + w * 0.1;
  for (let i = 0; i < 3; i++) { rr(ctx, wx, wy, ww, wh, r * 0.06); ctx.fill(); wx += ww + gap; }
  ctx.fillStyle = color;                                      // wheels
  ctx.beginPath(); ctx.arc(x + w * 0.27, y + h * 0.88, r * 0.16, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(x + w * 0.73, y + h * 0.88, r * 0.16, 0, Math.PI * 2); ctx.fill();
}

// ── Auto-rickshaw glyph (clear 3-wheeler, faces right) ───
function autoGlyph(ctx, cx, cy, r, color) {
  ctx.fillStyle = color;
  // Domed cabin + sloped front hood (single silhouette)
  ctx.beginPath();
  ctx.moveTo(cx - 0.55 * r, cy + 0.30 * r);                              // bottom-left
  ctx.lineTo(cx - 0.55 * r, cy - 0.02 * r);                             // left wall
  ctx.quadraticCurveTo(cx - 0.55 * r, cy - 0.52 * r, cx - 0.08 * r, cy - 0.52 * r); // roof up
  ctx.quadraticCurveTo(cx + 0.28 * r, cy - 0.52 * r, cx + 0.34 * r, cy - 0.10 * r); // roof down to front
  ctx.lineTo(cx + 0.60 * r, cy + 0.10 * r);                            // hood slope
  ctx.lineTo(cx + 0.60 * r, cy + 0.30 * r);                            // front bottom
  ctx.closePath();
  ctx.fill();
  // window (white) so it reads as a cabin
  ctx.fillStyle = '#FFFFFF';
  rr(ctx, cx - 0.44 * r, cy - 0.34 * r, 0.40 * r, 0.30 * r, 0.07 * r); ctx.fill();
  // headlight
  ctx.beginPath(); ctx.arc(cx + 0.50 * r, cy + 0.01 * r, 0.06 * r, 0, Math.PI * 2); ctx.fill();
  // wheels: colored tyre + white hub
  ctx.fillStyle = color;
  ctx.beginPath(); ctx.arc(cx - 0.25 * r, cy + 0.36 * r, 0.17 * r, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(cx + 0.42 * r, cy + 0.36 * r, 0.14 * r, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath(); ctx.arc(cx - 0.25 * r, cy + 0.36 * r, 0.07 * r, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(cx + 0.42 * r, cy + 0.36 * r, 0.055 * r, 0, Math.PI * 2); ctx.fill();
}

// ── Hospital cross glyph ─────────────────────────────────
function crossGlyph(ctx, cx, cy, r, color) {
  ctx.fillStyle = color;
  const t = 0.30 * r, L = 0.94 * r;
  rr(ctx, cx - t / 2, cy - L / 2, t, L, t * 0.4); ctx.fill();
  rr(ctx, cx - L / 2, cy - t / 2, L, t, t * 0.4); ctx.fill();
}

const BUS = '#1565C0', AUTO = '#16A34A', HOSP = '#E53935';

function drawIcon(size) {
  const c = createCanvas(size, size), ctx = c.getContext('2d'), u = size / 192;

  // Background: flashy blue gradient
  const bg = ctx.createLinearGradient(0, 0, size, size);
  bg.addColorStop(0, '#2D9CFF'); bg.addColorStop(1, '#0D47A1');
  ctx.fillStyle = bg; ctx.fillRect(0, 0, size, size);

  const cr = 41 * u;
  const top = [96 * u, 60 * u], bl = [56 * u, 130 * u], brr = [136 * u, 130 * u];

  // faint connecting triangle
  ctx.strokeStyle = 'rgba(255,255,255,0.22)'; ctx.lineWidth = 4 * u;
  ctx.beginPath(); ctx.moveTo(top[0], top[1]); ctx.lineTo(bl[0], bl[1]); ctx.lineTo(brr[0], brr[1]); ctx.closePath(); ctx.stroke();

  whiteCircle(ctx, top[0], top[1], cr); crossGlyph(ctx, top[0], top[1], cr, HOSP);
  whiteCircle(ctx, bl[0], bl[1], cr);  busGlyph(ctx, bl[0], bl[1], cr, BUS);
  whiteCircle(ctx, brr[0], brr[1], cr); autoGlyph(ctx, brr[0], brr[1], cr, AUTO);

  // Glossy sheen (flashy)
  ctx.save();
  const g = ctx.createLinearGradient(0, 0, 0, size * 0.6);
  g.addColorStop(0, 'rgba(255,255,255,0.18)'); g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(size, 0); ctx.lineTo(size, size * 0.28);
  ctx.quadraticCurveTo(size * 0.5, size * 0.46, 0, size * 0.32); ctx.closePath(); ctx.fill();
  ctx.restore();

  return c;
}

const outDir = path.join(__dirname, '../pwa/icons');
fs.writeFileSync(path.join(outDir, 'icon-192.png'), drawIcon(192).toBuffer('image/png'));
console.log('✅ icon-192.png written (3-badge: bus + auto + hospital)');
fs.writeFileSync(path.join(outDir, 'icon-512.png'), drawIcon(512).toBuffer('image/png'));
console.log('✅ icon-512.png written (3-badge: bus + auto + hospital)');
