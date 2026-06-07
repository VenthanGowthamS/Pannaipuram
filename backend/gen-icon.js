// Generate PWA icons for Pannaipuram — UNIFIED village info app.
// Beautiful village scene: blue sky + sun, green hills + trees,
// home (terracotta roof) + hospital (red cross), bus on a winding road.
// Full-bleed = safe for maskable icons.
const { createCanvas } = require('./node_modules/canvas');
const fs = require('fs');
const path = require('path');

function rr(ctx, x, y, w, h, r) {
  ctx.beginPath(); ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
}

function tree(ctx, x, groundY, s, c) {
  ctx.fillStyle = '#8D6E63';
  rr(ctx, x - s * 0.08, groundY - s * 0.5, s * 0.16, s * 0.5, s * 0.04); ctx.fill();
  ctx.fillStyle = c;
  ctx.beginPath(); ctx.arc(x, groundY - s * 0.7, s * 0.34, 0, 7); ctx.fill();
  ctx.beginPath(); ctx.arc(x - s * 0.24, groundY - s * 0.52, s * 0.26, 0, 7); ctx.fill();
  ctx.beginPath(); ctx.arc(x + s * 0.24, groundY - s * 0.52, s * 0.26, 0, 7); ctx.fill();
}

function cottage(ctx, cx, baseY, w) {
  const bw = w, bh = w * 0.62, x = cx - bw / 2, y = baseY - bh;
  ctx.fillStyle = '#FFFFFF'; rr(ctx, x, y, bw, bh, w * 0.05); ctx.fill();
  ctx.fillStyle = '#E2683C';
  ctx.beginPath(); ctx.moveTo(cx, y - bh * 0.55);
  ctx.lineTo(x - bw * 0.12, y + bh * 0.06); ctx.lineTo(x + bw * 1.12, y + bh * 0.06);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#E2683C'; rr(ctx, cx - bw * 0.12, y + bh * 0.42, bw * 0.24, bh * 0.58, w * 0.03); ctx.fill();
  ctx.fillStyle = '#FFD24A'; rr(ctx, x + bw * 0.12, y + bh * 0.36, bw * 0.18, bw * 0.18, w * 0.03); ctx.fill();
}

function hospital(ctx, cx, baseY, w) {
  const bw = w, bh = w * 0.95, x = cx - bw / 2, y = baseY - bh;
  ctx.fillStyle = '#FFFFFF'; rr(ctx, x, y, bw, bh, w * 0.05); ctx.fill();
  ctx.fillStyle = '#E53935'; rr(ctx, x, y, bw, bh * 0.2, w * 0.05); ctx.fill();
  ctx.fillRect(x, y + bh * 0.12, bw, bh * 0.08);
  const cs = bw * 0.34, ccx = cx, ccy = y + bh * 0.5, t = cs * 0.34;
  ctx.fillStyle = '#E53935';
  rr(ctx, ccx - t / 2, ccy - cs / 2, t, cs, t * 0.3); ctx.fill();
  rr(ctx, ccx - cs / 2, ccy - t / 2, cs, t, t * 0.3); ctx.fill();
  ctx.fillStyle = '#BBDEFB'; rr(ctx, ccx - bw * 0.15, y + bh * 0.7, bw * 0.3, bh * 0.3, w * 0.03); ctx.fill();
}

function bus(ctx, cx, cy, w, color) {
  const h = w * 0.6, x = cx - w / 2, y = cy - h / 2;
  ctx.save(); ctx.fillStyle = 'rgba(0,0,0,0.12)';
  ctx.beginPath(); ctx.ellipse(cx, y + h * 0.96, w * 0.5, h * 0.12, 0, 0, 7); ctx.fill(); ctx.restore();
  ctx.fillStyle = color; rr(ctx, x, y, w, h * 0.8, w * 0.17); ctx.fill();
  ctx.fillStyle = '#FFFFFF';
  const ww = w * 0.17, wh = h * 0.26, gap = w * 0.07; let wx = x + w * 0.1; const wy = y + h * 0.12;
  for (let i = 0; i < 3; i++) { rr(ctx, wx, wy, ww, wh, w * 0.04); ctx.fill(); wx += ww + gap; }
  ctx.fillStyle = '#263238';
  ctx.beginPath(); ctx.arc(x + w * 0.27, y + h * 0.82, w * 0.1, 0, 7); ctx.fill();
  ctx.beginPath(); ctx.arc(x + w * 0.73, y + h * 0.82, w * 0.1, 0, 7); ctx.fill();
}

function drawIcon(size) {
  const c = createCanvas(size, size), ctx = c.getContext('2d'), u = size / 192;
  // sky
  const sky = ctx.createLinearGradient(0, 0, 0, size);
  sky.addColorStop(0, '#BFE4FF'); sky.addColorStop(1, '#7FC4F2');
  ctx.fillStyle = sky; ctx.fillRect(0, 0, size, size);
  // sun
  ctx.fillStyle = '#FFE08A';
  ctx.beginPath(); ctx.arc(150 * u, 46 * u, 20 * u, 0, 7); ctx.fill();
  // far hill
  ctx.fillStyle = '#9BD9A6';
  ctx.beginPath(); ctx.moveTo(0, 120 * u);
  ctx.quadraticCurveTo(60 * u, 96 * u, 120 * u, 116 * u);
  ctx.quadraticCurveTo(165 * u, 130 * u, size, 110 * u);
  ctx.lineTo(size, size); ctx.lineTo(0, size); ctx.closePath(); ctx.fill();
  // trees
  tree(ctx, 26 * u, 120 * u, 30 * u, '#5BB56C');
  tree(ctx, 172 * u, 116 * u, 26 * u, '#5BB56C');
  // buildings
  cottage(ctx, 60 * u, 138 * u, 46 * u);
  hospital(ctx, 122 * u, 138 * u, 44 * u);
  // near hill
  ctx.fillStyle = '#4FAE6A';
  ctx.beginPath(); ctx.moveTo(0, 150 * u);
  ctx.quadraticCurveTo(96 * u, 138 * u, size, 152 * u);
  ctx.lineTo(size, size); ctx.lineTo(0, size); ctx.closePath(); ctx.fill();
  // road
  ctx.fillStyle = '#ECE6D6';
  ctx.beginPath();
  ctx.moveTo(36 * u, size); ctx.quadraticCurveTo(70 * u, 168 * u, 150 * u, 160 * u);
  ctx.lineTo(176 * u, 168 * u); ctx.quadraticCurveTo(96 * u, 182 * u, 80 * u, size);
  ctx.closePath(); ctx.fill();
  // bus
  bus(ctx, 110 * u, 168 * u, 46 * u, '#1565C0');
  return c;
}

const outDir = path.join(__dirname, '../pwa/icons');
fs.writeFileSync(path.join(outDir, 'icon-192.png'), drawIcon(192).toBuffer('image/png'));
console.log('✅ icon-192.png written (village scene)');
fs.writeFileSync(path.join(outDir, 'icon-512.png'), drawIcon(512).toBuffer('image/png'));
console.log('✅ icon-512.png written (village scene)');
