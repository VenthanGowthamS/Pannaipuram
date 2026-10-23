const test = require('node:test');
const assert = require('node:assert/strict');
const { boot, UA } = require('./harness');

const INSTALLED = 'pannai:app-installed';
const DISMISSED = 'pannai:install-dismissed';
const flush = () => new Promise((r) => setImmediate(r));
const DAY = 24 * 60 * 60 * 1000;

test('Android phone, Chrome offers the prompt → one-tap Install banner', () => {
  const t = boot({ ua: UA.androidPhone });
  t.fireInstallPrompt();
  assert.equal(t.bannerVisible(), true);
  assert.ok(t.$('install-native-btn'), 'native Install button present');
  assert.equal(t.$('install-how-btn'), null);
});

test('Android phone, browser never offers a prompt → "எப்படி?" banner after 2s', () => {
  const t = boot({ ua: UA.androidPhone });
  assert.equal(t.bannerVisible(), false, 'not shown instantly');
  t.runTimers(2000);
  assert.equal(t.bannerVisible(), true);
  assert.ok(t.$('install-how-btn'));
  assert.equal(t.$('install-native-btn'), null);
});

test('late prompt upgrades the "எப்படி?" banner to one-tap Install', () => {
  const t = boot({ ua: UA.androidPhone });
  t.runTimers(2000);
  assert.ok(t.$('install-how-btn'));
  t.fireInstallPrompt();
  assert.ok(t.$('install-native-btn'));
});

test('tapping Install calls the native prompt; accepting records an installed ping and hides the banner', async () => {
  const t = boot({ ua: UA.androidPhone });
  const ev = t.fireInstallPrompt('accepted');
  t.pings.length = 0;
  t.$('install-native-btn').click();
  await flush();
  assert.equal(ev.prompted, true);
  assert.equal(t.bannerVisible(), false);
  assert.equal(t.w.localStorage.getItem(INSTALLED), 'true');
  assert.ok(t.pings.some((p) => p.is_standalone === true), 'install ping sent with is_standalone=true');
});

test('declining the native prompt does NOT mark the app installed', async () => {
  const t = boot({ ua: UA.androidPhone });
  t.fireInstallPrompt('dismissed');
  t.pings.length = 0;
  t.$('install-native-btn').click();
  await flush();
  assert.equal(t.w.localStorage.getItem(INSTALLED), null);
  assert.equal(t.pings.filter((p) => p.is_standalone).length, 0);
});

test('stale "installed" flag from a previous install is cleared when Chrome offers install again (user uninstalled)', () => {
  const t = boot({ ua: UA.androidPhone, storage: { [INSTALLED]: 'true' } });
  assert.equal(t.bannerVisible(), false, 'hidden until Chrome proves it is installable');
  t.fireInstallPrompt();
  assert.equal(t.w.localStorage.getItem(INSTALLED), null);
  assert.equal(t.bannerVisible(), true);
});

test('already installed (opened standalone) → no banner, no menu install item', () => {
  const t = boot({ ua: UA.androidPhone, standalone: true });
  t.runTimers(5000);
  assert.equal(t.bannerVisible(), false);
  assert.equal(t.$('menu-install-btn').hidden, true);
});

test('dismissed < 3 days ago → stays hidden; > 3 days ago → shows again', () => {
  const recent = boot({ ua: UA.androidPhone, storage: { [DISMISSED]: String(Date.now() - 1 * DAY) } });
  recent.runTimers(5000);
  assert.equal(recent.bannerVisible(), false);
  const old = boot({ ua: UA.androidPhone, storage: { [DISMISSED]: String(Date.now() - 4 * DAY) } });
  old.runTimers(5000);
  assert.equal(old.bannerVisible(), true);
});

test('× closes the banner and remembers the dismissal', () => {
  const t = boot({ ua: UA.androidPhone });
  t.runTimers(2000);
  t.$('install-close').click();
  assert.equal(t.bannerVisible(), false);
  assert.ok(t.w.localStorage.getItem(DISMISSED));
});

test('iPhone → "எப்படி?" banner immediately (no native prompt on iOS)', () => {
  const t = boot({ ua: UA.iphone });
  assert.equal(t.bannerVisible(), true);
  assert.ok(t.$('install-how-btn'));
});

for (const [name, ua] of [['iPad', UA.ipad], ['Android tablet', UA.androidTablet], ['desktop', UA.desktop]]) {
  test(`${name} → never shows the install banner (phones only)`, () => {
    const t = boot({ ua });
    t.fireInstallPrompt();
    t.runTimers(5000);
    assert.equal(t.bannerVisible(), false);
  });
}

test('?install=1 wall appears for a not-installed Android phone, not for an installed one or a desktop', () => {
  const url = 'https://app.pannaipuram.com/?install=1';
  assert.equal(boot({ ua: UA.androidPhone, url }).$('install-wall').hidden, false);
  assert.equal(boot({ ua: UA.androidPhone, url, standalone: true }).$('install-wall').hidden, true);
  assert.equal(boot({ ua: UA.desktop, url }).$('install-wall').hidden, true);
});
