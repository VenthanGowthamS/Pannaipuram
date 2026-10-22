// Bulletin scene, driven frame-by-frame at a fixed 30fps.
// CDP screencast only emits on repaint, so it dropped to ~6fps during the
// smooth scrolls. Here every frame is stepped and shot explicitly, which
// costs wall-clock time but is perfectly smooth and fully deterministic.
const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');
const CAST = path.join(__dirname, 'cast');
fs.rmSync(CAST, { recursive: true, force: true }); fs.mkdirSync(CAST, { recursive: true });
const sleep = ms => new Promise(r => setTimeout(r, ms));

const FPS = 30, TOTAL = 225;              // 7.5s
const morning = new Date(); morning.setHours(6, 35, 0, 0);
const FAKE_NOW = morning.getTime();

const fakeClock = fakeNow => {
  const Real = Date; const skew = fakeNow - Real.now();
  function Fake(...a) { return a.length ? new Real(...a) : new Real(Real.now() + skew); }
  Fake.prototype = Real.prototype; Fake.now = () => Real.now() + skew;
  Fake.parse = Real.parse; Fake.UTC = Real.UTC; window.Date = Fake;
};

const ago = min => new Date(FAKE_NOW - min * 60000).toISOString();
const POSTS = [
  { id: 101, title_tamil: 'இன்னைக்கு காலைல தண்ணி வந்திருச்சு',
    content_tamil: 'வள்ளுவர் தெருவுல தண்ணி வந்திருச்சு. எல்லாரும் புடிச்சுக்கோங்க.',
    name_tamil: 'முருகன்', like_count: 12, created_at: ago(25) },
  { id: 102, title_tamil: 'கோவில் தெரு விளக்கு சரி பண்ணிட்டாங்க',
    content_tamil: 'ரெண்டு வாரமா எரியாத விளக்கு இப்போ எரியுது. நல்ல விஷயம்.',
    name_tamil: 'லட்சுமி', like_count: 24, created_at: ago(120) },
  { id: 103, title_tamil: 'பள்ளிக்கூடம் ரோட்ல வேலை நடக்குது',
    content_tamil: 'வண்டி எடுத்துட்டு போறவங்க கொஞ்சம் கவனமா போங்க.',
    name_tamil: 'செல்வம்', like_count: 8, created_at: ago(300) },
].map((p, i) => ({
  poster_id: 11 + i, status: 'approved', title_english: null, content_english: null,
  image_url: null, link_url: null, name_english: null, is_trusted: true,
  is_official: false, liked_by_me: false, ...p,
}));
const likes = Object.fromEntries(POSTS.map(p => [p.id, p.like_count]));

const ease = t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

(async () => {
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: 'new', args: ['--hide-scrollbars', '--lang=ta-IN'],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 375, height: 812, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await page.evaluateOnNewDocument(fakeClock, FAKE_NOW);

  const client = await page.createCDPSession();
  await client.send('Network.enable');
  await client.send('Network.setBypassServiceWorker', { bypass: true });

  await page.setRequestInterception(true);
  page.on('request', req => {
    const url = req.url();
    const json = body => req.respond({ status: 200, contentType: 'application/json',
      headers: { 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify(body) });
    if (/\/api\/bulletin\/\d+\/like/.test(url) && req.method() === 'POST') {
      const id = Number(url.match(/bulletin\/(\d+)\/like/)[1]);
      likes[id] = (likes[id] || 0) + 1;
      return json({ success: true, data: { liked: true, like_count: likes[id] } });
    }
    if (/\/api\/bulletin(\?|$)/.test(url) && req.method() === 'GET') {
      return json({ success: true, data: POSTS.map(p => ({ ...p, like_count: likes[p.id] })) });
    }
    req.continue();
  });

  await page.goto('https://app.pannaipuram.com', { waitUntil: 'networkidle2', timeout: 60000 });
  await sleep(4000);
  await page.evaluate(() => { const h = document.getElementById('announce-host'); if (h) h.innerHTML = ''; });
  await page.evaluate(() => { window.location.hash = '#bulletin'; });
  await sleep(3000);
  await page.evaluate(() => { const h = document.getElementById('announce-host'); if (h) h.innerHTML = ''; });
  await page.evaluate(() => window.scrollTo(0, 0));
  await sleep(600);

  // Park each like button ~430px down the 812px viewport when it gets tapped.
  const targets = await page.evaluate(() => {
    const y = window.scrollY;
    return [...document.querySelectorAll('.bl-like')]
      .map(b => Math.max(0, Math.round(b.getBoundingClientRect().top + y - 430)));
  });
  console.log('like buttons:', targets.length, 'scroll targets:', targets.join(', '));
  if (targets.length < 3) { console.error('FAIL: expected 3 posts'); process.exit(1); }

  // frame -> action.  hold, tap, then ease-scroll to the next post.
  const TAP = { 25: 0, 116: 1, 196: 2 };
  const SCROLLS = [
    { from: 71, to: 115, a: targets[0], b: targets[1] },
    { from: 161, to: 195, a: targets[1], b: targets[2] },
  ];
  let scroll = targets[0];
  await page.evaluate(y => window.scrollTo(0, y), scroll);

  for (let f = 0; f < TOTAL; f++) {
    for (const s of SCROLLS) {
      if (f >= s.from && f <= s.to) {
        const t = (f - s.from) / (s.to - s.from);
        scroll = Math.round(s.a + (s.b - s.a) * ease(t));
        await page.evaluate(y => window.scrollTo(0, y), scroll);
      }
    }
    if (f in TAP) {
      await page.evaluate(i => document.querySelectorAll('.bl-like')[i].click(), TAP[f]);
      await sleep(60);   // let the optimistic heart + count paint
    }
    await page.screenshot({ path: path.join(CAST, `f${String(f).padStart(4, '0')}.jpg`),
                            type: 'jpeg', quality: 92 });
  }
  console.log('frames written:', TOTAL, '=', (TOTAL / FPS).toFixed(1), 's');
  console.log('final like counts:', JSON.stringify(likes));
  await browser.close();
})().catch(e => { console.error('FAIL', e.stack); process.exit(1); });
