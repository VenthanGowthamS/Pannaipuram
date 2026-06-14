// Generate PWA icons for Pannaipuram — "Village hub" design.
// Three roads converge on the glowing gold Pannaipuram stop; white markers
// hold the three core services: hospital (red cross), bus (hero) and
// auto-rickshaw. The bus + auto markers carry the EXACT Google Noto emoji
// artwork (🚌/🛺) the app shows in its bottom-nav tabs, so the icon matches
// what villagers see on Android. Premium navy gradient + glow, full-bleed
// (maskable-safe). Run: node gen-icon.js
const { createCanvas, loadImage } = require('./node_modules/canvas');
const fs = require('fs');
const path = require('path');

// Real Noto-emoji PNGs (🚌 / 🛺) downloaded into ./icon-assets — loaded once.
const busImg = path.join(__dirname, 'icon-assets/bus.png');
const autoImg = path.join(__dirname, 'icon-assets/auto.png');

function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

// Composite a square emoji image centred on a marker, scaled to sit inside
// the white circle (its corners are transparent so it never spills).
function emojiGlyph(ctx, img, cx, cy, r, f) {
  const d = (f || 1.7) * r;      // draw box side — clipped to the 2r circle
  ctx.save();
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.clip();
  ctx.drawImage(img, cx - d / 2, cy - d / 2, d, d);
  ctx.restore();
}

function crossGlyph(ctx, cx, cy, s, color) {
  ctx.fillStyle = color;
  const t = s * 0.34, L = s * 0.95;
  rr(ctx, cx - t / 2, cy - L / 2, t, L, t * 0.35); ctx.fill();
  rr(ctx, cx - L / 2, cy - t / 2, L, t, t * 0.35); ctx.fill();
}

function drawIcon(size, bus, auto) {
  const c = createCanvas(size, size);
  const ctx = c.getContext('2d');
  const u = size / 192;

  // Premium navy gradient + glow (same family as the bus icon)
  const bg = ctx.createLinearGradient(0, 0, size, size);
  bg.addColorStop(0, '#283593');
  bg.addColorStop(0.55, '#1A237E');
  bg.addColorStop(1, '#0D1B5E');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, size, size);
  const glow = ctx.createRadialGradient(96 * u, 86 * u, 8 * u, 96 * u, 96 * u, 135 * u);
  glow.addColorStop(0, 'rgba(99, 125, 255, 0.30)');
  glow.addColorStop(1, 'rgba(99, 125, 255, 0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, size, size);

  const hub = { x: 96 * u, y: 152 * u };
  const stops = [
    { x: 42 * u,  y: 62 * u },   // hospital (left)
    { x: 96 * u,  y: 44 * u },   // bus (top centre — the hero)
    { x: 150 * u, y: 62 * u },   // auto (right)
  ];

  // Roads: light arcs from hub to each stop + dashed centre line
  stops.forEach(function(s, i) {
    const mid = { x: (hub.x + s.x) / 2 + (i === 0 ? -14 * u : i === 2 ? 14 * u : 0), y: (hub.y + s.y) / 2 + 8 * u };
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.13)';
    ctx.lineWidth = 16 * u;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(hub.x, hub.y);
    ctx.quadraticCurveTo(mid.x, mid.y, s.x, s.y);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.32)';
    ctx.lineWidth = 2.2 * u;
    ctx.setLineDash([7 * u, 7 * u]);
    ctx.beginPath();
    ctx.moveTo(hub.x, hub.y);
    ctx.quadraticCurveTo(mid.x, mid.y, s.x, s.y);
    ctx.stroke();
    ctx.setLineDash([]);
  });

  // White service markers (soft shadow) + glyphs
  function marker(cx, cy, r) {
    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.30)';
    ctx.shadowBlur = 9 * u;
    ctx.shadowOffsetY = 4 * u;
    const mg = ctx.createLinearGradient(0, cy - r, 0, cy + r);
    mg.addColorStop(0, '#FFFFFF');
    mg.addColorStop(1, '#E9EDF5');
    ctx.fillStyle = mg;
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }
  marker(stops[0].x, stops[0].y, 27 * u);
  marker(stops[1].x, stops[1].y, 31 * u);   // bus slightly bigger (hero)
  marker(stops[2].x, stops[2].y, 27 * u);

  crossGlyph(ctx, stops[0].x, stops[0].y, 34 * u, '#E53935');
  emojiGlyph(ctx, bus,  stops[1].x, stops[1].y, 31 * u, 1.62);   // 🚌 Noto emoji (hero)
  emojiGlyph(ctx, auto, stops[2].x, stops[2].y, 27 * u, 1.58);   // 🛺 Noto emoji

  // The glowing gold Pannaipuram stop (hub) — from the original icon
  ctx.save();
  ctx.shadowColor = 'rgba(255, 193, 7, 0.9)';
  ctx.shadowBlur = 14 * u;
  ctx.fillStyle = '#FFC107';
  ctx.beginPath(); ctx.arc(hub.x, hub.y, 10 * u, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath(); ctx.arc(hub.x, hub.y, 4 * u, 0, Math.PI * 2); ctx.fill();

  // Top gloss sheen
  ctx.save();
  const gl = ctx.createLinearGradient(0, 0, 0, size * 0.5);
  gl.addColorStop(0, 'rgba(255, 255, 255, 0.14)');
  gl.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = gl;
  ctx.beginPath();
  ctx.moveTo(0, 0); ctx.lineTo(size, 0); ctx.lineTo(size, size * 0.22);
  ctx.quadraticCurveTo(size * 0.5, size * 0.38, 0, size * 0.26);
  ctx.closePath(); ctx.fill();
  ctx.restore();

  return c;
}

const outDir = path.join(__dirname, '../pwa/icons');

(async function () {
  const [bus, auto] = await Promise.all([loadImage(busImg), loadImage(autoImg)]);
  fs.writeFileSync(path.join(outDir, 'icon-192.png'), drawIcon(192, bus, auto).toBuffer('image/png'));
  console.log('✅ icon-192.png written (village hub: Noto 🚌 + hospital + 🛺)');
  fs.writeFileSync(path.join(outDir, 'icon-512.png'), drawIcon(512, bus, auto).toBuffer('image/png'));
  console.log('✅ icon-512.png written (village hub: Noto 🚌 + hospital + 🛺)');
})().catch(function (e) { console.error('❌ icon generation failed:', e); process.exit(1); });
