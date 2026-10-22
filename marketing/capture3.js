const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');
const SHOTS = path.join(__dirname, 'shots');
const CAST  = path.join(__dirname, 'cast');
fs.mkdirSync(SHOTS, { recursive: true }); fs.mkdirSync(CAST, { recursive: true });
const sleep = ms => new Promise(r => setTimeout(r, ms));
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

// Shoot the app at the morning rush, not last thing at night. Same DATE (so
// weekday-dependent doctor availability stays truthful) — only the clock moves.
const morning = new Date(); morning.setHours(6, 35, 0, 0);
const FAKE_NOW = morning.getTime();

const fakeClock = fakeNow => {
  const Real = Date;
  const skew = fakeNow - Real.now();
  function Fake(...a) {
    return a.length ? new Real(...a) : new Real(Real.now() + skew);
  }
  Fake.prototype = Real.prototype;
  Fake.now = () => Real.now() + skew;
  Fake.parse = Real.parse; Fake.UTC = Real.UTC;
  window.Date = Fake;
};

// ── Simulated சங்கமம் feed ──────────────────────────────────────────────
// Deliberately NOT written to the production DB — this is mocked at the
// network layer, so no fake post ever reaches a real villager's phone.
// Content is past-tense/ongoing on purpose: nothing here announces a future
// event that someone watching the video could act on and be misled by.
const ago = min => new Date(FAKE_NOW - min * 60000).toISOString();
const POSTS = [
  { id: 101, poster_id: 11, status: 'approved',
    title_tamil: 'இன்னைக்கு காலைல தண்ணி வந்திருச்சு',
    content_tamil: 'வள்ளுவர் தெருவுல தண்ணி வந்திருச்சு. எல்லாரும் புடிச்சுக்கோங்க.',
    name_tamil: 'முருகன்', like_count: 12, created_at: ago(25) },
  { id: 102, poster_id: 12, status: 'approved',
    title_tamil: 'கோவில் தெரு விளக்கு சரி பண்ணிட்டாங்க',
    content_tamil: 'ரெண்டு வாரமா எரியாத விளக்கு இப்போ எரியுது. நல்ல விஷயம்.',
    name_tamil: 'லட்சுமி', like_count: 24, created_at: ago(120) },
  { id: 103, poster_id: 13, status: 'approved',
    title_tamil: 'பள்ளிக்கூடம் ரோட்ல வேலை நடக்குது',
    content_tamil: 'வண்டி எடுத்துட்டு போறவங்க கொஞ்சம் கவனமா போங்க.',
    name_tamil: 'செல்வம்', like_count: 8, created_at: ago(300) },
].map(p => ({
  title_english: null, content_english: null, image_url: null, link_url: null,
  name_english: null, is_trusted: true, is_official: false, liked_by_me: false, ...p,
}));

const likes = Object.fromEntries(POSTS.map(p => [p.id, p.like_count]));

(async () => {
  const browser = await puppeteer.launch({
    executablePath: CHROME, headless: 'new',
    args: ['--hide-scrollbars', '--lang=ta-IN'],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 375, height: 812, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
  await page.evaluateOnNewDocument(fakeClock, FAKE_NOW);

  const client = await page.createCDPSession();
  await client.send('Network.enable');
  await client.send('Network.setBypassServiceWorker', { bypass: true });

  await page.setRequestInterception(true);
  page.on('request', req => {
    const url = req.url();
    const json = body => req.respond({
      status: 200, contentType: 'application/json',
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify(body),
    });
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
  await sleep(4500);
  const clearAnn = () => page.evaluate(() => {
    const h = document.getElementById('announce-host'); if (h) h.innerHTML = '';
  });
  await clearAnn();

  // ── Still: bus at the 06:35 morning rush ──
  await page.evaluate(() => { window.location.hash = '#bus'; });
  await sleep(3000); await clearAnn();
  await page.evaluate(() => window.scrollTo(0, 0));
  await sleep(500);
  await page.screenshot({ path: path.join(SHOTS, 'bus.png') });
  const soon = await page.evaluate(() =>
    [...document.querySelectorAll('#section-bus .soon-row, .bus-soon-item, [class*=soon] [class*=badge]')]
      .map(e => e.innerText.replace(/\s+/g, ' ')).slice(0, 6));
  console.log('bus leaving-soon:', JSON.stringify(soon));

  await browser.close();
})().catch(e => { console.error('FAIL', e.stack); process.exit(1); });
