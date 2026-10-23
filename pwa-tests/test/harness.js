// Loads the real pwa/index.html + pwa/js/app.js into jsdom so the install
// banner / ping logic is tested as shipped (no copies of the logic here).
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const PWA = path.join(__dirname, '..', '..', 'pwa');
const RAW = fs.readFileSync(path.join(PWA, 'index.html'), 'utf8');
const HTML = RAW.replace(/<script[\s\S]*?<\/script>/g, '');   // we run the scripts ourselves
// Local scripts in the same order index.html loads them (bus.js, api.js … then app.js)
const SCRIPTS = [...RAW.matchAll(/<script[^>]*\ssrc="(?:\.?\/?(?:pwa\/)?)(js\/[^"?]+)"/g)]
  .map((m) => fs.readFileSync(path.join(PWA, m[1]), 'utf8'));

const UA = {
  androidPhone: 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 Chrome/126.0 Mobile Safari/537.36',
  androidTablet: 'Mozilla/5.0 (Linux; Android 14; SM-X900) AppleWebKit/537.36 Chrome/126.0 Safari/537.36',
  iphone: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 Version/17.5 Mobile/15E148 Safari/604.1',
  ipad: 'Mozilla/5.0 (iPad; CPU OS 17_5 like Mac OS X) AppleWebKit/605.1.15 Version/17.5 Mobile/15E148 Safari/604.1',
  desktop: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/126.0 Safari/537.36',
};

// opts: { ua, standalone, storage:{key:value}, url, referrer }
function boot(opts = {}) {
  const dom = new JSDOM(HTML, {
    url: opts.url || 'https://app.pannaipuram.com/',
    referrer: opts.referrer || undefined,
    runScripts: 'outside-only',
    pretendToBeVisual: true,
  });
  const w = dom.window;
  // JSDOM's userAgent option only lives on ResourceLoader — override the navigator itself.
  Object.defineProperty(w.navigator, 'userAgent', { value: opts.ua || UA.androidPhone, configurable: true });
  const pings = [];
  w.fetch = (url, init) => {
    if (String(url).includes('/api/pwa/ping')) pings.push(JSON.parse(init.body));
    return Promise.resolve({ ok: true, json: () => Promise.resolve({ success: true, data: [] }) });
  };
  w.matchMedia = (q) => ({
    matches: !!opts.standalone && /display-mode:\s*standalone/.test(q),
    media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {},
  });
  w.scrollTo = () => {};
  for (const [k, v] of Object.entries(opts.storage || {})) w.localStorage.setItem(k, v);

  // Fake timers we can drive: app.js uses setTimeout for the 2s manual-steps fallback.
  const timers = [];
  w.setTimeout = (fn, ms) => { timers.push({ fn, ms }); return timers.length; };
  w.setInterval = () => 0;
  w.clearInterval = () => {};

  // Chrome fires beforeinstallprompt after the page has loaded; jsdom stays 'loading' until an async tick.
  SCRIPTS.forEach((code) => w.eval(code));
  w.document.dispatchEvent(new w.Event('DOMContentLoaded'));
  Object.defineProperty(w.document, 'readyState', { value: 'complete', configurable: true });

  const $ = (id) => w.document.getElementById(id);
  return {
    w, $, pings, timers,
    bannerVisible: () => !$('install-banner').hidden,
    runTimers: (maxMs) => timers.filter((t) => t.ms <= maxMs).forEach((t) => t.fn()),
    // Chrome's beforeinstallprompt: records prompt() calls, resolves userChoice with `outcome`
    fireInstallPrompt(outcome = 'accepted') {
      const ev = new w.Event('beforeinstallprompt', { cancelable: true });
      ev.prompt = () => { ev.prompted = true; };
      ev.userChoice = Promise.resolve({ outcome });
      w.dispatchEvent(ev);
      return ev;
    },
  };
}

module.exports = { boot, UA };
