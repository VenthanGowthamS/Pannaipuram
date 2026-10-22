const puppeteer = require('puppeteer-core');
const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');

const ROOT = '/Users/gowtham/Documents/VenthanDocuments/Workspace/Projects/Pannaipuram';
const SHOTS = path.join(__dirname, 'shots');
const OUT = path.join(__dirname, 'frames');
fs.mkdirSync(OUT, { recursive: true });

const dataURI = f => 'file://' + f;   // real file URL — inlining 800KB of base64 stalls setContent

// Each section keeps its own identity colour, exactly as the app does.
const SCENES = [
  { id: '01-title', kind: 'title', g: ['#101A4D', '#1A237E', '#283593'],
    ta: 'பண்ணைப்புரம்', sub: 'உங்க ஊரோட தகவல் மையம்', en: 'Your village. One app.' },

  { id: '02-bus', shot: 'bus.png', g: ['#1A237E', '#283593'], crop: 0,
    ta: 'பஸ் எப்போ வரும்?', sub: 'நிறுத்தத்துல காத்திருக்க வேணாம்', en: 'Live bus timings' },

  { id: '03-auto', shot: 'auto.png', g: ['#B45309', '#F59E0B'], crop: 0,
    ta: 'ஆட்டோ வேணுமா?', sub: 'ஒரே தட்டுல ஓட்டுநருக்கு கால் போகும்', en: 'Auto & van — one tap to call' },

  { id: '04-bulletin', kind: 'plate', g: ['#1B5E20', '#2E7D32'],
    ta: 'நம்ம ஊருக்கே ஒரு Facebook', sub: 'ஊர் செய்தி போடுங்க · லைக் பண்ணுங்க — சங்கமம்',
    en: 'Sangamam — your village feed' },

  { id: '05-hospital', shot: 'hospital.png', g: ['#00838F', '#006064'], crop: 0,
    ta: 'டாக்டர் இருக்காங்களா?', sub: 'இன்னைக்கு யாரு இருக்காங்கன்னு பாருங்க', en: 'Doctor availability, today' },

  { id: '06-emergency', shot: 'emergency.png', g: ['#C62828', '#8E1B1B'], crop: 0,
    ta: 'அவசரம்னா?', sub: 'ஆம்புலன்ஸ், போலீஸ், மருத்துவமனை', en: 'Emergency numbers, one tap' },

  { id: '07-cta', kind: 'cta', g: ['#101A4D', '#1A237E', '#283593'],
    ta: 'இப்பவே install பண்ணுங்க', sub: 'இலவசம் · இண்டர்நெட் இல்லாட்டியும் வேலை செய்யும்',
    en: 'Free · works offline' },
];

const FONT = `'Noto Sans Tamil','Tamil Sangam MN',sans-serif`;

function captionBlock(s) {
  return `
    <div class="cap">
      <div class="ta">${s.ta}</div>
      <div class="sub">${s.sub}</div>
      <div class="en">${s.en}</div>
    </div>`;
}

function html(s, extra) {
  const stops = s.g.map((c, i) => `${c} ${Math.round((i / (s.g.length - 1)) * 100)}%`).join(',');
  return `<!doctype html><html><head><meta charset="utf-8">
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Sans+Tamil:wght@400;600;700;800&family=Roboto:wght@400;500;700&display=swap">
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    html,body{width:1080px;height:1920px;overflow:hidden}
    body{background:linear-gradient(160deg,${stops});font-family:${FONT};
         display:flex;flex-direction:column;align-items:center;position:relative}
    /* soft light bloom so the flat gradient doesn't read as cheap */
    body::before{content:'';position:absolute;inset:0;
      background:radial-gradient(ellipse 900px 700px at 50% 12%,rgba(255,255,255,.16),transparent 70%)}
    .cap{position:relative;z-index:2;text-align:center;padding:96px 70px 0;width:100%}
    .ta{font-size:88px;line-height:1.18;font-weight:800;color:#fff;
        letter-spacing:-.5px;text-shadow:0 6px 28px rgba(0,0,0,.35)}
    .sub{font-size:42px;line-height:1.45;font-weight:600;color:rgba(255,255,255,.94);margin-top:26px}
    .en{font-family:'Roboto',sans-serif;font-size:29px;font-weight:500;letter-spacing:3px;
        text-transform:uppercase;color:rgba(255,255,255,.6);margin-top:26px}
    /* phone */
    .phone{position:relative;z-index:2;margin-top:64px;width:640px;
      border-radius:60px;padding:14px;background:linear-gradient(160deg,#3a3f52,#15171f);
      box-shadow:0 40px 90px rgba(0,0,0,.55),0 0 0 2px rgba(255,255,255,.12)}
    .phone img{display:block;width:100%;border-radius:46px}
    .shotwrap{border-radius:46px;overflow:hidden;background:#fff}
    ${extra || ''}
  </style></head><body>`;
}

(async () => {
  const qrPath = path.join(__dirname, 'qr.png');
  await QRCode.toFile(qrPath, 'https://app.pannaipuram.com/?install=1', {
    width: 720, margin: 1, color: { dark: '#101A4D', light: '#FFFFFF' },
    errorCorrectionLevel: 'H',
  });

  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: 'new', args: ['--hide-scrollbars', '--force-color-profile=srgb'],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1080, height: 1920, deviceScaleFactor: 1 });

  for (const s of SCENES) {
    let body;
    if (s.kind === 'title') {
      body = html(s, `
        body{justify-content:center}
        .icon{position:relative;z-index:2;width:400px;height:400px;border-radius:88px;
          box-shadow:0 40px 90px rgba(0,0,0,.5),0 0 0 3px rgba(255,255,255,.16)}
        .cap{padding-top:80px}
        .ta{font-size:92px}
        .rule{position:relative;z-index:2;width:150px;height:7px;border-radius:4px;margin-top:60px;
          background:linear-gradient(90deg,#FFC107,#FFE082)}`)
        + `<img class="icon" src="${dataURI(path.join(ROOT, 'pwa/icons/icon-512.png'))}">`
        + captionBlock(s) + `<div class="rule"></div></body></html>`;
    } else if (s.kind === 'cta') {
      body = html(s, `
        body{justify-content:center}
        .cap{padding-top:0}
        .ta{font-size:92px}
        .qr{position:relative;z-index:2;margin-top:80px;background:#fff;padding:34px;
          border-radius:44px;box-shadow:0 34px 80px rgba(0,0,0,.5)}
        .qr img{display:block;width:400px;height:400px}
        .url{position:relative;z-index:2;margin-top:56px;font-family:'Roboto',sans-serif;
          font-size:52px;font-weight:700;color:#FFC107;letter-spacing:1px}
        .hint{position:relative;z-index:2;margin-top:30px;font-size:38px;font-weight:600;
          color:rgba(255,255,255,.9);text-align:center;padding:0 80px;line-height:1.4}`)
        + captionBlock(s)
        + `<div class="qr"><img src="${dataURI(qrPath)}"></div>
           <div class="url">app.pannaipuram.com</div>
           <div class="hint">QR-ஐ ஸ்கேன் பண்ணுங்க<br>அல்லது லிங்கை தட்டுங்க</div>
           </body></html>`;
    } else if (s.kind === 'plate') {
      body = html(s, `.shotwrap{width:612px;height:1325px;background:#f4f6f8}`)
        + captionBlock(s)
        + `<div class="phone"><div class="shotwrap"></div></div></body></html>`;
    } else {
      // crop = fraction of the screenshot height to keep from the top (0 = full)
      const shot = dataURI(path.join(SHOTS, s.shot));
      const cropCSS = s.crop
        ? `.shotwrap{max-height:${Math.round(2436 * s.crop * (612 / 1125))}px}
           body{justify-content:center}.cap{padding-top:0}`
        : '';
      body = html(s, cropCSS)
        + captionBlock(s)
        + `<div class="phone"><div class="shotwrap"><img src="${shot}"></div></div></body></html>`;
    }

    const pageFile = path.join(OUT, s.id + '.html');
    fs.writeFileSync(pageFile, body);
    await page.goto('file://' + pageFile, { waitUntil: 'load', timeout: 60000 });
    await page.evaluate(async () => {
      await document.fonts.ready;
      await Promise.all([...document.images].map(i => i.decode().catch(() => {})));
    });
    await new Promise(r => setTimeout(r, 400));
    await page.screenshot({ path: path.join(OUT, s.id + '.png') });
    if (s.kind === 'plate') {
      const r = await page.evaluate(() => {
        const e = document.querySelector('.shotwrap').getBoundingClientRect();
        return { x: Math.round(e.x), y: Math.round(e.y), w: Math.round(e.width), h: Math.round(e.height) };
      });
      fs.writeFileSync(path.join(OUT, s.id + '.rect.json'), JSON.stringify(r));
      console.log('  plate screen rect:', JSON.stringify(r));
    }
    console.log('frame', s.id);
  }
  await browser.close();
})().catch(e => { console.error('FAIL', e.stack); process.exit(1); });
