const cron    = require('node-cron');
const axios   = require('axios');
const cheerio = require('cheerio');
const { query } = require('../db/pool');
const { sendToAll } = require('./pushNotifications');

// Keywords to match Pannaipuram and surrounding area
const AREA_KEYWORDS = [
  'pannaipuram', 'பண்ணைப்புரம்',
  'uthamapalayam', 'உத்தமபாளையம்',
  'kamban', 'கம்பம்'
];

async function scrapeTneb() {
  try {
    console.log('TNEB scraper running...');

    const response = await axios.get(
      'https://www.tnebltd.gov.in/tneb/powercutinfo',
      { timeout: 15000 }
    );

    const $ = cheerio.load(response.data);
    const entries = [];

    // Parse the power cut table from TNEB page
    $('table tr').each((i, row) => {
      const cells = $(row).find('td');
      if (cells.length < 3) return;

      const areaText = $(cells[1]).text().trim().toLowerCase();
      const isRelevant = AREA_KEYWORDS.some(kw => areaText.includes(kw.toLowerCase()));

      if (isRelevant) {
        entries.push({
          area_description: $(cells[1]).text().trim(),
          start_time:       $(cells[2]).text().trim(),
          end_time:         $(cells[3])?.text().trim() || null,
          reason_tamil:     'திட்டமிட்ட பராமரிப்பு',
          cut_type:         'planned',
          source:           'tneb_scraper'
        });
      }
    });

    for (const entry of entries) {
      // Check if already exists to avoid duplicates
      const exists = await query(`
        SELECT id FROM power_cuts
        WHERE area_description = $1 AND start_time::text LIKE $2
      `, [entry.area_description, `%${entry.start_time}%`]);

      if (exists.rows.length === 0) {
        const result = await query(`
          INSERT INTO power_cuts
            (area_description, cut_type, start_time, end_time, reason_tamil, source)
          VALUES ($1, $2, $3, $4, $5, $6)
          RETURNING *
        `, [
          entry.area_description,
          entry.cut_type,
          entry.start_time,
          entry.end_time,
          entry.reason_tamil,
          entry.source
        ]);

        // Notify all users
        const cut = result.rows[0];
        await sendToAll({
          title: 'பண்ணைப்புரம் ⚡',
          body:  `மின் தடை அறிவிப்பு — ${entry.area_description}`
        });

        console.log('New power cut saved:', cut.id);
      }
    }

    console.log(`TNEB scraper done. Found ${entries.length} relevant entries.`);
  } catch (err) {
    console.error('TNEB scraper error:', err.message);
    // Silently fail — admin can add manually
  }
}

function startTnebScraper() {
  // Run every 6 hours
  cron.schedule('0 */6 * * *', scrapeTneb);
  // Run once on startup
  scrapeTneb();
  console.log('TNEB scraper scheduled (every 6 hours)');
}

module.exports = { startTnebScraper, scrapeTneb };
