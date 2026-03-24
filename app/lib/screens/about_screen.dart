import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';

class AboutScreen extends StatelessWidget {
  const AboutScreen({super.key});

  static const Color _green = Color(0xFF1B5E20);

  Future<void> _launchUrl(String url) async {
    final uri = Uri.parse(url);
    if (await canLaunchUrl(uri)) await launchUrl(uri, mode: LaunchMode.externalApplication);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text(
          'பண்ணைப்புரம் பற்றி',
          style: TextStyle(fontFamily: 'NotoSansTamil'),
        ),
        backgroundColor: _green,
      ),
      backgroundColor: const Color(0xFFF2F6F2),
      body: ListView(
        padding: const EdgeInsets.symmetric(vertical: 16),
        children: [
          // ── Hero banner ──────────────────────────────────────────────
          Container(
            margin: const EdgeInsets.fromLTRB(16, 0, 16, 8),
            padding: const EdgeInsets.symmetric(vertical: 32, horizontal: 20),
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [Color(0xFF1B5E20), Color(0xFF2E7D32), Color(0xFF43A047)],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(22),
              boxShadow: [
                BoxShadow(
                  color: _green.withOpacity(0.3),
                  blurRadius: 14,
                  offset: const Offset(0, 6),
                ),
              ],
            ),
            child: Column(
              children: [
                const Text('🏘', style: TextStyle(fontSize: 52)),
                const SizedBox(height: 12),
                const Text(
                  'பண்ணைப்புரம்',
                  style: TextStyle(
                    fontFamily: 'NotoSansTamil',
                    fontSize: 28,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 6),
                const Text(
                  'Pannaipuram',
                  style: TextStyle(
                    fontFamily: 'Roboto',
                    fontSize: 16,
                    color: Colors.white70,
                  ),
                ),
                const SizedBox(height: 8),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.15),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: const Text(
                    'உங்கள் ஊரின் தகவல் மையம்',
                    style: TextStyle(
                      fontFamily: 'NotoSansTamil',
                      fontSize: 13,
                      color: Colors.white,
                    ),
                  ),
                ),
              ],
            ),
          ),

          // ── Village facts ────────────────────────────────────────────
          _SectionHeader(title: 'ஊர் விவரங்கள்', subtitle: 'Village Details'),
          _InfoCard(rows: const [
            _InfoRow('🗺', 'மாவட்டம்', 'District', 'தேனி (Theni)'),
            _InfoRow('📍', 'வட்டம்', 'Taluk', 'உத்தமபாளையம் (Uthamapalayam)'),
            _InfoRow('🏛', 'ஊராட்சி வகை', 'Type', 'பேரூராட்சி (Town Panchayat)'),
            _InfoRow('📮', 'அஞ்சல் குறியீடு', 'Pincode', '625524'),
            _InfoRow('📏', 'பரப்பளவு', 'Area', '15.36 சதுர கி.மீ (sq km)'),
          ]),

          // ── Population ──────────────────────────────────────────────
          _SectionHeader(title: 'மக்கள் தொகை', subtitle: 'Population (2011 Census)'),
          _InfoCard(rows: const [
            _InfoRow('👥', 'மொத்த மக்கள்', 'Total Population', '~9,323'),
            _InfoRow('🏠', 'வீடுகள்', 'Households', '1,719'),
            _InfoRow('🏘', 'வார்டுகள்', 'Wards', '15 வார்டுகள்'),
            _InfoRow('🛣', 'தெருக்கள்', 'Streets', '57 தெருக்கள்'),
          ]),

          // ── Location ────────────────────────────────────────────────
          _SectionHeader(title: 'இடம் & தூரம்', subtitle: 'Location & Distance'),
          _InfoCard(rows: const [
            _InfoRow('🚌', 'உத்தமபாளையம்', 'To Uthamapalayam', '11 கி.மீ'),
            _InfoRow('🏙', 'தேனி', 'To Theni HQ', '32 கி.மீ'),
            _InfoRow('🗳', 'சட்டமன்றம்', 'Assembly', 'கம்பம் (Cumbum)'),
            _InfoRow('🏛', 'நாடாளுமன்றம்', 'Lok Sabha', 'தேனி (Theni)'),
          ]),

          // ── Known for ───────────────────────────────────────────────
          _SectionHeader(title: 'பண்ணைப்புரம் சிறப்பு', subtitle: 'What We\'re Known For'),
          Container(
            margin: const EdgeInsets.fromLTRB(16, 0, 16, 8),
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(14),
              boxShadow: [
                BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 8, offset: const Offset(0, 2)),
              ],
            ),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('🌿', style: TextStyle(fontSize: 36)),
                const SizedBox(width: 14),
                const Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'ஏலக்காய் தோட்டம்',
                        style: TextStyle(
                          fontFamily: 'NotoSansTamil',
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                          color: Color(0xFF1B5E20),
                        ),
                      ),
                      Text(
                        'Cardamom Estate Region',
                        style: TextStyle(
                          fontFamily: 'Roboto',
                          fontSize: 12,
                          color: Color(0xFF757575),
                        ),
                      ),
                      SizedBox(height: 8),
                      Text(
                        'பண்ணைப்புரம் ஏலக்காய் தோட்டங்களுக்கு பிரசித்தமானது. '
                        'இங்கு வாழும் மக்கள் பெரும்பாலும் விவசாயிகள் மற்றும் தோட்ட தொழிலாளர்கள்.',
                        style: TextStyle(
                          fontFamily: 'NotoSansTamil',
                          fontSize: 13,
                          color: Color(0xFF333333),
                          height: 1.5,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),

          // ── App info ────────────────────────────────────────────────
          _SectionHeader(title: 'இந்த App பற்றி', subtitle: 'About This App'),
          Container(
            margin: const EdgeInsets.fromLTRB(16, 0, 16, 8),
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(14),
              boxShadow: [
                BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 8, offset: const Offset(0, 2)),
              ],
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'பண்ணைப்புரம் App — உங்கள் ஊரின் ஐந்து முக்கிய தேவைகளை ஒரே இடத்தில் தீர்க்கிறது:',
                  style: TextStyle(
                    fontFamily: 'NotoSansTamil',
                    fontSize: 14,
                    color: Color(0xFF333333),
                    height: 1.5,
                  ),
                ),
                const SizedBox(height: 12),
                ...[
                  ('⚡', 'மின்சாரம் — கரண்ட் எப்ப வரும்?', 'Electricity — Power cut alerts'),
                  ('💧', 'தண்ணீர் — தண்ணி வந்துருச்சா?', 'Water — Supply alerts'),
                  ('🚌', 'பேருந்து — பஸ் எத்தன மணிக்கு?', 'Bus — Timetable (offline)'),
                  ('🏥', 'மருத்துவமனை — டாக்டர் வந்துட்டாரா?', 'Hospital — Doctor timings'),
                  ('🚨', 'அவசர உதவி — உடனடி தொடர்பு', 'Emergency — One-tap contacts'),
                  ('🛍', 'உள்ளூர் சேவை — ஊர்ல யாரை அழைக்கணும்?', 'Local Services — Tradespeople'),
                ].map((item) => Padding(
                  padding: const EdgeInsets.only(bottom: 8),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(item.$1, style: const TextStyle(fontSize: 18)),
                      const SizedBox(width: 10),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(item.$2,
                              style: const TextStyle(
                                fontFamily: 'NotoSansTamil',
                                fontSize: 13,
                                color: Color(0xFF1B5E20),
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                            Text(item.$3,
                              style: const TextStyle(
                                fontFamily: 'Roboto',
                                fontSize: 11,
                                color: Color(0xFF757575),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                )),
              ],
            ),
          ),

          // ── How to use ──────────────────────────────────────────────
          _SectionHeader(title: 'App எப்படி பயன்படுத்துவது?', subtitle: 'How to use this app'),
          Container(
            margin: const EdgeInsets.fromLTRB(16, 0, 16, 8),
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(14),
              boxShadow: [
                BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 8, offset: const Offset(0, 2)),
              ],
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                ...[
                  ('1️⃣', 'முகப்பு பக்கம்',
                    'App திறந்தவுடன் முகப்பு பக்கம் வரும். '
                    'அங்க கரண்ட், தண்ணீர், பஸ் நிலை — எல்லாம் ஒரே பார்வையில் தெரியும்.'),
                  ('2️⃣', 'உங்கள் தெருவை தேர்வு செய்யுங்க',
                    'முதல் முறை திறக்கும்போது தெரு கேக்கும். '
                    'உங்கள் தெருவை தேர்வு செய்தால் அந்த தெருவுக்கான தண்ணீர் நேரம் தெரியும்.'),
                  ('3️⃣', 'பேருந்து நேரம் பார்க்க',
                    'பஸ் tile-ஐ தட்டினால் எந்த பக்கம் போகணும்னு corridor தேர்வு செய்யலாம். '
                    'இணையம் இல்லாமலும் பஸ் நேரம் தெரியும்.'),
                  ('4️⃣', 'டாக்டர் நேரம் தெரிய',
                    'மருத்துவமனை tile-ஐ தட்டினால் PTV Padmavathy மற்றும் SP Clinic-ல் '
                    'எந்த டாக்டர் எந்த நாளில் வருவார் என்று தெரியும்.'),
                  ('5️⃣', 'அவசர உதவி',
                    'கீழே "அவசரம்" button-ஐ தட்டினால் ஆம்புலன்ஸ், காவல் நிலையம், '
                    'தீயணைப்பு — எல்லா எண்களும் ஒரே இடத்தில் தெரியும். '
                    'ஒரே தட்டலில் அழைக்கலாம்.'),
                  ('6️⃣', 'ஆட்டோ / வண்டி அழைக்க',
                    'ஆட்டோ tile-ஐ தட்டினால் ஊரில் உள்ள ஆட்டோ drivers-ஐ '
                    'நேரடியாக அழைக்கலாம் அல்லது WhatsApp-ல் message அனுப்பலாம்.'),
                  ('7️⃣', 'கருத்து சொல்ல',
                    'கீழே "கருத்து" button-ஐ தட்டினால் app-பற்றிய கருத்து, '
                    'திருத்தம், அல்லது ஊர் தகவல் — எதுவும் அனுப்பலாம்.'),
                ].map((item) => Padding(
                  padding: const EdgeInsets.only(bottom: 14),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(item.$1, style: const TextStyle(fontSize: 20)),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              item.$2,
                              style: const TextStyle(
                                fontFamily: 'NotoSansTamil',
                                fontSize: 14,
                                fontWeight: FontWeight.bold,
                                color: Color(0xFF1B5E20),
                              ),
                            ),
                            const SizedBox(height: 3),
                            Text(
                              item.$3,
                              style: const TextStyle(
                                fontFamily: 'NotoSansTamil',
                                fontSize: 13,
                                color: Color(0xFF444444),
                                height: 1.5,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                )),
              ],
            ),
          ),

          // ── Village for villagers footer ───────────────────────────
          Container(
            margin: const EdgeInsets.fromLTRB(16, 4, 16, 8),
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: _green.withOpacity(0.06),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: _green.withOpacity(0.18)),
            ),
            child: const Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text('🌿', style: TextStyle(fontSize: 20)),
                SizedBox(width: 10),
                Flexible(
                  child: Text(
                    'பண்ணைப்புரம் மக்களால், மக்களுக்காக',
                    style: TextStyle(
                      fontFamily: 'NotoSansTamil',
                      fontSize: 13,
                      color: Color(0xFF1B5E20),
                      fontWeight: FontWeight.w600,
                    ),
                    textAlign: TextAlign.center,
                  ),
                ),
              ],
            ),
          ),

          // ── Version ───────────────────────────────────────────────
          const Padding(
            padding: EdgeInsets.only(bottom: 24),
            child: Text(
              'v1.0.0',
              style: TextStyle(
                fontFamily: 'Roboto',
                fontSize: 11,
                color: Color(0xFF9E9E9E),
              ),
              textAlign: TextAlign.center,
            ),
          ),
        ],
      ),
    );
  }
}

// ── Section Header ───────────────────────────────────────────────────────────
class _SectionHeader extends StatelessWidget {
  final String title;
  final String subtitle;
  const _SectionHeader({required this.title, required this.subtitle});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(18, 16, 18, 8),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: const TextStyle(
              fontFamily: 'NotoSansTamil',
              fontSize: 16,
              fontWeight: FontWeight.bold,
              color: Color(0xFF1B5E20),
            ),
          ),
          Text(
            subtitle,
            style: const TextStyle(
              fontFamily: 'Roboto',
              fontSize: 12,
              color: Color(0xFF757575),
            ),
          ),
        ],
      ),
    );
  }
}

// ── Info Card (rows of facts) ─────────────────────────────────────────────────
class _InfoCard extends StatelessWidget {
  final List<_InfoRow> rows;
  const _InfoCard({required this.rows});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.fromLTRB(16, 0, 16, 8),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        boxShadow: [
          BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 8, offset: const Offset(0, 2)),
        ],
      ),
      child: Column(
        children: rows.asMap().entries.map((entry) {
          final i = entry.key;
          final row = entry.value;
          return Column(
            children: [
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                child: Row(
                  children: [
                    Text(row.emoji, style: const TextStyle(fontSize: 20)),
                    const SizedBox(width: 12),
                    Expanded(
                      flex: 2,
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            row.labelTamil,
                            style: const TextStyle(
                              fontFamily: 'NotoSansTamil',
                              fontSize: 13,
                              color: Color(0xFF555555),
                            ),
                          ),
                          Text(
                            row.labelEnglish,
                            style: const TextStyle(
                              fontFamily: 'Roboto',
                              fontSize: 11,
                              color: Color(0xFF9E9E9E),
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      flex: 3,
                      child: Text(
                        row.value,
                        style: const TextStyle(
                          fontFamily: 'NotoSansTamil',
                          fontSize: 14,
                          fontWeight: FontWeight.w700,
                          color: Color(0xFF1B5E20),
                        ),
                        textAlign: TextAlign.start,
                      ),
                    ),
                  ],
                ),
              ),
              if (i < rows.length - 1)
                const Divider(height: 1, indent: 50),
            ],
          );
        }).toList(),
      ),
    );
  }
}

// ── Single fact row ───────────────────────────────────────────────────────────
class _InfoRow {
  final String emoji;
  final String labelTamil;
  final String labelEnglish;
  final String value;
  const _InfoRow(this.emoji, this.labelTamil, this.labelEnglish, this.value);
}
