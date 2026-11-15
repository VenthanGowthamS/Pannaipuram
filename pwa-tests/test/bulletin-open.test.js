const test = require('node:test');
const assert = require('node:assert/strict');
const { boot } = require('./harness');

// சங்கமம் v110: anyone posts from the app — no sign-up. The post carries the
// app id; the name is optional; a forwarded WhatsApp message (any language,
// no title) is welcome; the admin's own phone can delete any post.
async function openBulletin({ feed = [], storage = {} } = {}) {
  const t = boot({ storage: { 'pannai:visitor-id': 'v-test-abcd1234', ...storage } });
  const sent = [];
  t.w.PannaiAPI.getBulletin = async () => feed;
  t.w.PannaiAPI.openPost = async (p) => { sent.push(['open', p]); return { id: 99, status: 'approved' }; };
  t.w.PannaiAPI.editPost = async (id, p) => { sent.push(['edit', id, p]); return { id, status: 'approved', requeued: false }; };
  t.w.PannaiAPI.deletePost = async (id, p) => { sent.push(['delete', id, p]); return { id, deleted: true }; };
  t.w.confirm = () => true;
  t.w.Bulletin.init();
  await new Promise((r) => setImmediate(r));
  return { ...t, sent };
}
const fill = (t, id, v) => { t.$(id).value = v; };
const submit = async (t) => {
  t.$('bulletin-post-form').dispatchEvent(new t.w.Event('submit', { cancelable: true, bubbles: true }));
  await new Promise((r) => setImmediate(r));
};

test('the composer opens without any registration (no sign-up form exists)', async () => {
  const t = await openBulletin();
  assert.equal(t.$('bulletin-reg'), null);
  const ev = new t.w.MouseEvent('click', { cancelable: true, bubbles: true });
  t.w.document.querySelector('.bl-compose-cta').dispatchEvent(ev);
  assert.equal(ev.defaultPrevented, false, 'tapping the prompt is not intercepted');
});

test('the post box invites WhatsApp / Facebook forwards in any language', async () => {
  const t = await openBulletin();
  const tip = t.w.document.querySelector('.bl-forward-tip').textContent;
  assert.match(tip, /WhatsApp/);
  assert.match(tip, /Facebook/);
  assert.match(tip, /எந்த மொழியிலும்/);
  assert.doesNotMatch(t.w.document.querySelector('label[for="bulletin-content-ta"]').textContent, /தமிழ்/);
});

test('posting sends the app id and the optional name; no title is fine', async () => {
  const t = await openBulletin();
  fill(t, 'bulletin-content-ta', 'Free eye camp at Uthamapalayam GH this Sunday. Please share.');
  fill(t, 'bulletin-name', '  செல்வி  ');
  await submit(t);
  const [kind, p] = t.sent[0];
  assert.equal(kind, 'open');
  assert.equal(p.device_id, 'v-test-abcd1234');
  assert.equal(p.name, 'செல்வி');
  assert.equal(p.title_tamil, '');
  assert.equal(p.poster_id, undefined, 'no registration id is sent');
  assert.equal(t.w.localStorage.getItem('pannai:bulletin-name'), 'செல்வி', 'name remembered');
});

test('posting with NO name is allowed', async () => {
  const t = await openBulletin();
  fill(t, 'bulletin-content-ta', 'நாளைக்கு காலை 6 மணி முதல் கரண்ட் இருக்காது.');
  fill(t, 'bulletin-name', '');
  await submit(t);
  assert.equal(t.sent[0][1].name, '');
});

test('a link inside a pasted message becomes the tappable link', async () => {
  const t = await openBulletin();
  fill(t, 'bulletin-content-ta', 'புது ரேஷன் கார்டு விண்ணப்பம் இங்கே: https://tnpds.gov.in/apply. எல்லாருக்கும் சொல்லுங்க');
  await submit(t);
  assert.equal(t.sent[0][1].link_url, 'https://tnpds.gov.in/apply');
});

test('too-short text with no image is still refused (nothing sent)', async () => {
  const t = await openBulletin();
  fill(t, 'bulletin-content-ta', 'சின்னது');
  await submit(t);
  assert.equal(t.sent.length, 0);
  assert.equal(t.$('bulletin-post-result').hidden, false);
});

test('📋 Paste puts the clipboard text into the message box', async () => {
  const t = await openBulletin();
  Object.defineProperty(t.w.navigator, 'clipboard', { value: { readText: async () => '  Forwarded: bus strike tomorrow  ' }, configurable: true });
  // re-wire with the clipboard present
  delete t.$('bulletin-paste').dataset.wired;
  t.w.Bulletin.init();
  t.$('bulletin-paste').click();
  await new Promise((r) => setImmediate(r));
  assert.equal(t.$('bulletin-content-ta').value, 'Forwarded: bus strike tomorrow');
});

const POST = (over) => ({ id: 5, poster_id: 3, title_tamil: '', content_tamil: 'ஒரு செய்தி இங்கே இருக்கு', name_tamil: null, like_count: 0, liked_by_me: false, is_mine: false, can_delete: false, created_at: new Date().toISOString(), status: 'approved', ...over });

test('a post without a name shows "ஊர்க்காரர்" and no empty title', async () => {
  const t = await openBulletin({ feed: [POST()] });
  const card = t.w.document.querySelector('.bl-card');
  assert.equal(card.querySelector('.bl-name').textContent, 'ஊர்க்காரர்');
  assert.equal(card.querySelector('.bl-title'), null);
});

test('own app post: edit + delete, proved with the app id', async () => {
  const t = await openBulletin({ feed: [POST({ is_mine: true, can_delete: true })] });
  assert.ok(t.w.document.querySelector('[data-edit="5"]'));
  t.w.document.querySelector('[data-del="5"]').click();
  await new Promise((r) => setImmediate(r));
  assert.equal(JSON.stringify(t.sent[0]), JSON.stringify(['delete', '5', { device_id: 'v-test-abcd1234' }]));
});

test("admin's own phone: 🛡️ delete on someone else's post, no edit", async () => {
  const t = await openBulletin({ feed: [POST({ is_mine: false, can_delete: true })] });
  assert.equal(t.w.document.querySelector('[data-edit="5"]'), null);
  const del = t.w.document.querySelector('[data-del="5"]');
  assert.match(del.textContent, /🛡️/);
  del.click();
  await new Promise((r) => setImmediate(r));
  assert.equal(JSON.stringify(t.sent[0]), JSON.stringify(['delete', '5', { device_id: 'v-test-abcd1234' }]));
});

test('an ordinary reader gets no edit or delete buttons', async () => {
  const t = await openBulletin({ feed: [POST()] });
  assert.equal(t.w.document.querySelector('[data-del="5"]'), null);
  assert.equal(t.w.document.querySelector('[data-edit="5"]'), null);
});
