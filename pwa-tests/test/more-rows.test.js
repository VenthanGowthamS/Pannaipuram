const test = require('node:test');
const assert = require('node:assert/strict');
const { boot } = require('./harness');

// Opens the மேலும் tab with fixed acting-driver / service data.
async function openMore({ acting = [], services = {} }) {
  const t = boot();
  t.w.PannaiAPI.getActingDrivers = async () => acting;
  t.w.PannaiAPI.getServices = async () => services;
  t.w.More.init();
  await new Promise((r) => setImmediate(r));
  return t;
}
const driver = (extra) => ({ id: 1, name_tamil: 'சரவணன்', vehicle_type: 'car', phone: '9000000001', ...extra });
const count = (s, ch) => s.split(ch).length - 1;

test('an icon the admin typed in front of the text is not shown twice', async () => {
  const t = await openMore({ acting: [driver({ schedule_tamil: '🕐 எப்போ வேணாலும்', coverage_tamil: '📍 பண்ணைப்புரம் சுற்றுவட்டாரம்' })] });
  const metas = [...t.w.document.querySelectorAll('#more-acting .acting-meta')].map((e) => e.textContent);
  assert.equal(metas.length, 2);
  assert.equal(count(metas[0], '📍'), 1);
  assert.equal(count(metas[1], '🕐'), 1);
  assert.match(metas[1], /எப்போ வேணாலும்$/);
});

test('the icon stays on the same line as the text (non-breaking space after it)', async () => {
  const t = await openMore({ acting: [driver({ coverage_tamil: 'தமிழ்நாடு,கேரளா,கர்நாடகா,ஆந்திரா' })] });
  const meta = t.w.document.querySelector('#more-acting .acting-meta').textContent;
  assert.equal(meta, '📍 தமிழ்நாடு,கேரளா,கர்நாடகா,ஆந்திரா');
});

test('text that is only an icon / spaces produces no empty line', async () => {
  const t = await openMore({ acting: [driver({ schedule_tamil: ' 🕐 ', coverage_tamil: '' })] });
  assert.equal(t.w.document.querySelectorAll('#more-acting .acting-meta').length, 0);
});

test('admin text is still escaped (shown as text, never run as HTML)', async () => {
  const t = await openMore({
    acting: [driver({ coverage_tamil: '<img src=x onerror="1">' })],
    services: { milk: [{ id: 1, name_tamil: 'பால்', phone: '9000000002', notes_tamil: '📝 <b>காலை 6</b>', area_tamil: 'வடக்கு தெரு' }] },
  });
  const sec = t.w.document.getElementById('section-more');
  assert.equal(sec.querySelectorAll('#more-acting img, #more-services b').length, 0);
  const notes = sec.querySelector('.svc-row-notes').textContent;
  assert.equal(count(notes, '📝'), 1);
  assert.match(notes, /<b>காலை 6<\/b>/);
});
