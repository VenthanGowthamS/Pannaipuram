// Generate PWA icons for Pannaipuram
// Navy blue background + bus silhouette + "பண்" Tamil text
const { createCanvas } = require('./node_modules/canvas');
const fs = require('fs');
const path = require('path');

function drawIcon(size) {
  const c = createCanvas(size, size);
  const ctx = c.getContext('2d');
  const s = size / 192; // scale factor (192 is base design size)

  // ── Background: deep navy gradient ────────────────────────
  const bg = ctx.createLinearGradient(0, 0, size, size);
  bg.addColorStop(0, '#1A237E');
  bg.addColorStop(1, '#0D47A1');
  ctx.fillStyle = bg;

  // Rounded rect background
  const r = size * 0.22;
  ctx.beginPath();
  ctx.moveTo(r, 0);
  ctx.lineTo(size - r, 0);
  ctx.quadraticCurveTo(size, 0, size, r);
  ctx.lineTo(size, size - r);
  ctx.quadraticCurveTo(size, size, size - r, size);
  ctx.lineTo(r, size);
  ctx.quadraticCurveTo(0, size, 0, size - r);
  ctx.lineTo(0, r);
  ctx.quadraticCurveTo(0, 0, r, 0);
  ctx.closePath();
  ctx.fill();

  // ── Bus body ───────────────────────────────────────────────
  const bx = size * 0.14;   // bus left x
  const by = size * 0.28;   // bus top y
  const bw = size * 0.72;   // bus width
  const bh = size * 0.34;   // bus height
  const br = size * 0.06;   // bus corner radius

  ctx.fillStyle = 'rgba(255,255,255,0.95)';
  ctx.beginPath();
  ctx.moveTo(bx + br, by);
  ctx.lineTo(bx + bw - br, by);
  ctx.quadraticCurveTo(bx + bw, by, bx + bw, by + br);
  ctx.lineTo(bx + bw, by + bh - br);
  ctx.quadraticCurveTo(bx + bw, by + bh, bx + bw - br, by + bh);
  ctx.lineTo(bx + br, by + bh);
  ctx.quadraticCurveTo(bx, by + bh, bx, by + bh - br);
  ctx.lineTo(bx, by + br);
  ctx.quadraticCurveTo(bx, by, bx + br, by);
  ctx.closePath();
  ctx.fill();

  // ── Windows ────────────────────────────────────────────────
  const winY = by + bh * 0.15;
  const winH = bh * 0.45;
  const winW = bw * 0.16;
  const winR = size * 0.025;
  const winGap = bw * 0.055;
  const winStartX = bx + bw * 0.1;
  const numWins = 4;

  ctx.fillStyle = '#1A237E';
  for (let i = 0; i < numWins; i++) {
    const wx = winStartX + i * (winW + winGap);
    ctx.beginPath();
    ctx.moveTo(wx + winR, winY);
    ctx.lineTo(wx + winW - winR, winY);
    ctx.quadraticCurveTo(wx + winW, winY, wx + winW, winY + winR);
    ctx.lineTo(wx + winW, winY + winH - winR);
    ctx.quadraticCurveTo(wx + winW, winY + winH, wx + winW - winR, winY + winH);
    ctx.lineTo(wx + winR, winY + winH);
    ctx.quadraticCurveTo(wx, winY + winH, wx, winY + winH - winR);
    ctx.lineTo(wx, winY + winR);
    ctx.quadraticCurveTo(wx, winY, wx + winR, winY);
    ctx.closePath();
    ctx.fill();
  }

  // ── Front light bar ────────────────────────────────────────
  ctx.fillStyle = '#FFD54F';
  ctx.fillRect(bx + bw - size * 0.04, by + bh * 0.3, size * 0.04, bh * 0.25);

  // ── Wheels ─────────────────────────────────────────────────
  const wheelY = by + bh;
  const wheelR = size * 0.085;
  const wheel1X = bx + bw * 0.22;
  const wheel2X = bx + bw * 0.73;

  // Wheel shadow
  ctx.fillStyle = 'rgba(0,0,0,0.2)';
  ctx.beginPath(); ctx.ellipse(wheel1X, wheelY + wheelR * 0.4, wheelR * 1.1, wheelR * 0.35, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(wheel2X, wheelY + wheelR * 0.4, wheelR * 1.1, wheelR * 0.35, 0, 0, Math.PI * 2); ctx.fill();

  // Wheel body
  ctx.fillStyle = '#263238';
  ctx.beginPath(); ctx.arc(wheel1X, wheelY, wheelR, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(wheel2X, wheelY, wheelR, 0, Math.PI * 2); ctx.fill();

  // Wheel hub
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  ctx.beginPath(); ctx.arc(wheel1X, wheelY, wheelR * 0.38, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(wheel2X, wheelY, wheelR * 0.38, 0, Math.PI * 2); ctx.fill();

  // ── "பண்" label below bus ──────────────────────────────────
  const fontSize = size * 0.165;
  ctx.fillStyle = '#ffffff';
  ctx.font = `bold ${fontSize}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Route line dots
  const dotY = size * 0.87;
  const dotR = size * 0.025;
  const dots = 5;
  const dotSpan = size * 0.44;
  const dotStartX = size / 2 - dotSpan / 2;
  ctx.fillStyle = 'rgba(255,255,255,0.55)';
  for (let i = 0; i < dots; i++) {
    ctx.beginPath();
    ctx.arc(dotStartX + i * (dotSpan / (dots - 1)), dotY, dotR, 0, Math.PI * 2);
    ctx.fill();
  }
  // Larger center dot = Pannaipuram stop
  ctx.fillStyle = '#FFD54F';
  ctx.beginPath();
  ctx.arc(size / 2, dotY, dotR * 1.9, 0, Math.PI * 2);
  ctx.fill();

  return c;
}

const outDir = path.join(__dirname, '../pwa/icons');

// 192 × 192
const c192 = drawIcon(192);
fs.writeFileSync(path.join(outDir, 'icon-192.png'), c192.toBuffer('image/png'));
console.log('✅ icon-192.png written');

// 512 × 512
const c512 = drawIcon(512);
fs.writeFileSync(path.join(outDir, 'icon-512.png'), c512.toBuffer('image/png'));
console.log('✅ icon-512.png written');
