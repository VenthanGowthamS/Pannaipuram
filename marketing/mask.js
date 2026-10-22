// Rounded-corner alpha mask so the overlaid screen recording matches the
// phone bezel's 46px inner radius instead of showing square corners.
const { createCanvas } = require('/Users/gowtham/Documents/VenthanDocuments/Workspace/Projects/Pannaipuram/backend/node_modules/canvas');
const fs = require('fs');
const { w, h } = JSON.parse(fs.readFileSync('frames/04-bulletin.rect.json'));
const r = 46;
const c = createCanvas(w, h), x = c.getContext('2d');
x.clearRect(0, 0, w, h);
x.fillStyle = '#fff';
x.beginPath();
x.moveTo(r, 0); x.arcTo(w, 0, w, h, r); x.arcTo(w, h, 0, h, r);
x.arcTo(0, h, 0, 0, r); x.arcTo(0, 0, w, 0, r); x.closePath(); x.fill();
fs.writeFileSync('mask.png', c.toBuffer('image/png'));
console.log('mask.png', w + 'x' + h, 'radius', r);
