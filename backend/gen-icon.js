// Generate PWA icons for Pannaipuram — UNIFIED village info app
// Navy→green gradient + white cottage + amber location pin.
// Full-bleed background (no transparent corners) = safe for maskable icons.
const { createCanvas } = require('./node_modules/canvas');
const fs = require('fs');
const path = require('path');

function roundedRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function drawIcon(size) {
  const c = createCanvas(size, size);
  const ctx = c.getContext('2d');
  const u = size / 192; // unit: design coords are based on a 192 grid

  // ── Background: full-bleed navy → green gradient ──────────
  const bg = ctx.createLinearGradient(0, 0, size, size);
  bg.addColorStop(0, '#16307A');   // deep navy
  bg.addColorStop(1, '#1B7A3E');   // village green
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, size, size);

  // Soft drop shadow under the cottage for depth
  ctx.save();
  ctx.fillStyle = 'rgba(0,0,0,0.18)';
  ctx.beginPath();
  ctx.ellipse(96 * u, 158 * u, 52 * u, 11 * u, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // ── Cottage roof (triangle) ──────────────────────────────
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.moveTo(96 * u, 50 * u);    // peak
  ctx.lineTo(46 * u, 98 * u);    // left eave
  ctx.lineTo(146 * u, 98 * u);   // right eave
  ctx.closePath();
  ctx.fill();

  // ── Cottage body ─────────────────────────────────────────
  roundedRect(ctx, 60 * u, 96 * u, 72 * u, 56 * u, 6 * u);
  ctx.fillStyle = '#FFFFFF';
  ctx.fill();

  // ── Door (warm green cut-out, arched top) ────────────────
  const doorX = 86 * u, doorW = 20 * u, doorY = 118 * u, doorBottom = 152 * u, doorR = 10 * u;
  ctx.fillStyle = '#1B7A3E';
  ctx.beginPath();
  ctx.moveTo(doorX, doorBottom);
  ctx.lineTo(doorX, doorY + doorR);
  ctx.quadraticCurveTo(doorX, doorY, doorX + doorR, doorY);
  ctx.quadraticCurveTo(doorX + doorW, doorY, doorX + doorW, doorY + doorR);
  ctx.lineTo(doorX + doorW, doorBottom);
  ctx.closePath();
  ctx.fill();

  // ── Window (amber square) ────────────────────────────────
  roundedRect(ctx, 68 * u, 108 * u, 14 * u, 14 * u, 3 * u);
  ctx.fillStyle = '#FFC107';
  ctx.fill();

  // ── Location pin (amber teardrop, top-right) ─────────────
  const pinX = 142 * u, pinHeadY = 54 * u, pinHeadR = 17 * u, pinTipY = 92 * u;
  ctx.fillStyle = '#FFC107';
  ctx.beginPath();
  ctx.arc(pinX, pinHeadY, pinHeadR, Math.PI * 0.85, Math.PI * 0.15, false); // head arc
  ctx.lineTo(pinX, pinTipY);  // taper to point
  ctx.closePath();
  ctx.fill();
  // pin shadow ring + white hole
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(pinX, pinHeadY, pinHeadR * 0.42, 0, Math.PI * 2);
  ctx.fill();

  return c;
}

const outDir = path.join(__dirname, '../pwa/icons');

const c192 = drawIcon(192);
fs.writeFileSync(path.join(outDir, 'icon-192.png'), c192.toBuffer('image/png'));
console.log('✅ icon-192.png written (cottage + pin)');

const c512 = drawIcon(512);
fs.writeFileSync(path.join(outDir, 'icon-512.png'), c512.toBuffer('image/png'));
console.log('✅ icon-512.png written (cottage + pin)');
