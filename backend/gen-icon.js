// Generate PWA icons for Pannaipuram — "Village hub" design.
// Three roads converge on the glowing gold Pannaipuram stop; white markers
// hold the three core services: hospital (red cross), bus (blue, hero),
// auto-rickshaw (green). Premium navy gradient + glow, full-bleed
// (maskable-safe). Run: node gen-icon.js
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

// Side-view bus: rounded body, windshield + passenger windows, amber
// stripe, wheels with hubs, headlight. Facing right.
function busGlyph(ctx, cx, cy, r, color) {
  const w = 1.5 * r, h = 0.92 * r, x = cx - w / 2, y = cy - h / 2;
  ctx.fillStyle = color;
  rr(ctx, x, y, w, h * 0.82, r * 0.18); ctx.fill();
  ctx.fillStyle = '#FFFFFF';
  const wy = y + h * 0.13, wh = h * 0.3;
  rr(ctx, x + w * 0.08, wy, w * 0.22, wh, r * 0.05); ctx.fill();
  rr(ctx, x + w * 0.36, wy, w * 0.22, wh, r * 0.05); ctx.fill();
  ctx.beginPath();                                      // windshield (slanted front)
  ctx.moveTo(x + w * 0.64, wy);
  ctx.lineTo(x + w * 0.82, wy);
  ctx.quadraticCurveTo(x + w * 0.9, wy, x + w * 0.9, wy + wh * 0.45);
  ctx.lineTo(x + w * 0.9, wy + wh);
  ctx.lineTo(x + w * 0.64, wy + wh);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#FFC107';                            // amber side stripe
  rr(ctx, x + w * 0.06, y + h * 0.52, w * 0.88, h * 0.1, r * 0.04); ctx.fill();
  ctx.fillStyle = '#FFD54F';                            // headlight
  ctx.beginPath(); ctx.arc(x + w * 0.93, y + h * 0.68, r * 0.06, 0, 7); ctx.fill();
  [x + w * 0.24, x + w * 0.74].forEach(function(wx) {   // wheels
    ctx.fillStyle = '#1C2233';
    ctx.beginPath(); ctx.arc(wx, y + h * 0.84, r * 0.16, 0, 7); ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath(); ctx.arc(wx, y + h * 0.84, r * 0.07, 0, 7); ctx.fill();
  });
}

// FRONT-view auto-rickshaw (like the classic 🛺 silhouette): domed roof,
// big windshield, central headlight, single front wheel under a mudguard.
function autoGlyph(ctx, cx, cy, r, color) {
  // body: rounded-dome cabin
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(cx - 0.52 * r, cy + 0.30 * r);            // bottom-left
  ctx.lineTo(cx - 0.52 * r, cy - 0.10 * r);            // left wall
  ctx.quadraticCurveTo(cx - 0.52 * r, cy - 0.60 * r, cx, cy - 0.60 * r);   // roof left
  ctx.quadraticCurveTo(cx + 0.52 * r, cy - 0.60 * r, cx + 0.52 * r, cy - 0.10 * r); // roof right
  ctx.lineTo(cx + 0.52 * r, cy + 0.30 * r);            // right wall
  ctx.closePath(); ctx.fill();
  // windshield: wide rounded glass across the upper body
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.moveTo(cx - 0.38 * r, cy + 0.02 * r);
  ctx.lineTo(cx - 0.38 * r, cy - 0.18 * r);
  ctx.quadraticCurveTo(cx - 0.38 * r, cy - 0.46 * r, cx, cy - 0.46 * r);
  ctx.quadraticCurveTo(cx + 0.38 * r, cy - 0.46 * r, cx + 0.38 * r, cy - 0.18 * r);
  ctx.lineTo(cx + 0.38 * r, cy + 0.02 * r);
  ctx.closePath(); ctx.fill();
  // headlight: single round lamp centred on the cowl
  ctx.fillStyle = '#FFD54F';
  ctx.beginPath(); ctx.arc(cx, cy + 0.17 * r, 0.085 * r, 0, 7); ctx.fill();
  // mudguard arc over the single front wheel
  ctx.strokeStyle = color;
  ctx.lineWidth = 0.09 * r;
  ctx.beginPath();
  ctx.arc(cx, cy + 0.42 * r, 0.21 * r, Math.PI * 1.05, Math.PI * 1.95);
  ctx.stroke();
  // single front wheel: dark tyre + white hub
  ctx.fillStyle = '#1C2233';
  ctx.beginPath(); ctx.arc(cx, cy + 0.46 * r, 0.155 * r, 0, 7); ctx.fill();
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath(); ctx.arc(cx, cy + 0.46 * r, 0.065 * r, 0, 7); ctx.fill();
}

function crossGlyph(ctx, cx, cy, s, color) {
  ctx.fillStyle = color;
  const t = s * 0.34, L = s * 0.95;
  rr(ctx, cx - t / 2, cy - L / 2, t, L, t * 0.35); ctx.fill();
  rr(ctx, cx - L / 2, cy - t / 2, L, t, t * 0.35); ctx.fill();
}

function drawIcon(size) {
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
  busGlyph(ctx,  stops[1].x, stops[1].y, 30 * u, '#1565C0');
  autoGlyph(ctx, stops[2].x, stops[2].y, 30 * u, '#16A34A');

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
fs.writeFileSync(path.join(outDir, 'icon-192.png'), drawIcon(192).toBuffer('image/png'));
console.log('✅ icon-192.png written (village hub: bus + hospital + auto)');
fs.writeFileSync(path.join(outDir, 'icon-512.png'), drawIcon(512).toBuffer('image/png'));
console.log('✅ icon-512.png written (village hub: bus + hospital + auto)');
