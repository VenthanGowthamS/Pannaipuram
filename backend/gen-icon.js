// Generate PWA icons for Pannaipuram — UNIFIED village info app
// Flashy vivid-blue gradient + glossy highlight + white house + amber location pin.
// Full-bleed background (no transparent corners) = safe for maskable icons.
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

function drawIcon(size) {
  const c = createCanvas(size, size);
  const ctx = c.getContext('2d');
  const u = size / 192;

  // ── Background: full-bleed vivid blue gradient ───────────
  const bg = ctx.createLinearGradient(0, 0, size, size);
  bg.addColorStop(0, '#2D9CFF');   // bright sky blue
  bg.addColorStop(1, '#0D47A1');   // deep blue
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, size, size);

  // ── Cottage shadow ───────────────────────────────────────
  ctx.save();
  ctx.fillStyle = 'rgba(0,0,0,0.18)';
  ctx.beginPath();
  ctx.ellipse(96 * u, 158 * u, 50 * u, 10 * u, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // ── Roof ─────────────────────────────────────────────────
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.moveTo(96 * u, 52 * u);
  ctx.lineTo(48 * u, 98 * u);
  ctx.lineTo(144 * u, 98 * u);
  ctx.closePath();
  ctx.fill();

  // ── Body ─────────────────────────────────────────────────
  rr(ctx, 62 * u, 96 * u, 68 * u, 56 * u, 6 * u);
  ctx.fillStyle = '#FFFFFF';
  ctx.fill();

  // ── Door (blue cut-out, arched) ──────────────────────────
  const dx = 86 * u, dw = 20 * u, dy = 118 * u, db = 152 * u, dr = 10 * u;
  ctx.fillStyle = '#1565C0';
  ctx.beginPath();
  ctx.moveTo(dx, db);
  ctx.lineTo(dx, dy + dr);
  ctx.quadraticCurveTo(dx, dy, dx + dr, dy);
  ctx.quadraticCurveTo(dx + dw, dy, dx + dw, dy + dr);
  ctx.lineTo(dx + dw, db);
  ctx.closePath();
  ctx.fill();

  // ── Window (amber) ───────────────────────────────────────
  rr(ctx, 70 * u, 108 * u, 13 * u, 13 * u, 3 * u);
  ctx.fillStyle = '#FFC107';
  ctx.fill();

  // ── Location pin (amber teardrop, top-right) ─────────────
  const px = 142 * u, headY = 54 * u, headR = 17 * u, tipY = 92 * u;
  ctx.fillStyle = '#FFC107';
  ctx.beginPath();
  ctx.arc(px, headY, headR, Math.PI * 0.85, Math.PI * 0.15, false);
  ctx.lineTo(px, tipY);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(px, headY, headR * 0.42, 0, Math.PI * 2);
  ctx.fill();

  // ── Glossy highlight (flashy sheen, top) ─────────────────
  ctx.save();
  const g = ctx.createLinearGradient(0, 0, 0, size * 0.6);
  g.addColorStop(0, 'rgba(255,255,255,0.22)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(size, 0);
  ctx.lineTo(size, size * 0.30);
  ctx.quadraticCurveTo(size * 0.5, size * 0.5, 0, size * 0.34);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  return c;
}

const outDir = path.join(__dirname, '../pwa/icons');

const c192 = drawIcon(192);
fs.writeFileSync(path.join(outDir, 'icon-192.png'), c192.toBuffer('image/png'));
console.log('✅ icon-192.png written (flashy blue house + pin)');

const c512 = drawIcon(512);
fs.writeFileSync(path.join(outDir, 'icon-512.png'), c512.toBuffer('image/png'));
console.log('✅ icon-512.png written (flashy blue house + pin)');
