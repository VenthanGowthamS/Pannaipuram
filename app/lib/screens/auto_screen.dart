import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';

class AutoScreen extends StatelessWidget {
  const AutoScreen({super.key});

  static const Color _purple = Color(0xFF6A1B9A);

  static const List<Map<String, String>> _contacts = [
    {
      'nameTamil': 'முருகேசன்',
      'type': 'auto',
      'phone': '9XXXXXXXXX',
      'note': 'உத்தமபாளையம் வரை',
    },
    {
      'nameTamil': 'கதிரவன்',
      'type': 'auto',
      'phone': '9XXXXXXXXX',
      'note': 'போடி / கம்பம் வரை',
    },
    {
      'nameTamil': 'வேன் சேவை',
      'type': 'van',
      'phone': '9XXXXXXXXX',
      'note': 'காலை 7 மணி புறப்படும் — உத்தமபாளையம்',
    },
  ];

  Future<void> _call(String phone) async {
    final uri = Uri(scheme: 'tel', path: phone);
    if (await canLaunchUrl(uri)) await launchUrl(uri);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text(
          'ஆட்டோ / வண்டி',
          style: TextStyle(fontFamily: 'NotoSansTamil'),
        ),
        backgroundColor: _purple,
      ),
      backgroundColor: const Color(0xFFF5F5F5),
      body: ListView(
        padding: const EdgeInsets.symmetric(vertical: 12),
        children: [
          // ── Hero tile ──────────────────────────────────────────────
          Container(
            width: double.infinity,
            margin: const EdgeInsets.fromLTRB(16, 12, 16, 4),
            padding:
                const EdgeInsets.symmetric(vertical: 28, horizontal: 20),
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [Color(0xFF6A1B9A), Color(0xFF8E24AA)],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(22),
              boxShadow: [
                BoxShadow(
                  color: _purple.withOpacity(0.35),
                  blurRadius: 14,
                  offset: const Offset(0, 6),
                ),
              ],
            ),
            child: const Column(
              children: [
                Text('🚗', style: TextStyle(fontSize: 44)),
                SizedBox(height: 10),
                Text(
                  'சார், ஆட்டோ வேணுமா?',
                  style: TextStyle(
                    fontFamily: 'NotoSansTamil',
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                  textAlign: TextAlign.center,
                  softWrap: true,
                ),
                SizedBox(height: 10),
                Text(
                  'வண்டி வேணும்னா கீழ இருக்காங்க — அழைங்க!',
                  style: TextStyle(
                    fontFamily: 'NotoSansTamil',
                    fontSize: 14,
                    color: Colors.white70,
                  ),
                  textAlign: TextAlign.center,
                ),
              ],
            ),
          ),

          const SizedBox(height: 12),

          // ── Contact cards ──────────────────────────────────────────
          ..._contacts.map((contact) {
            final isVan = contact['type'] == 'van';
            final icon =
                isVan ? Icons.airport_shuttle : Icons.local_taxi_rounded;
            return Card(
              margin:
                  const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
              shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(14)),
              child: Padding(
                padding: const EdgeInsets.all(14),
                child: Row(
                  children: [
                    Container(
                      width: 52,
                      height: 52,
                      decoration: BoxDecoration(
                        color: _purple.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(26),
                      ),
                      child: Icon(icon, color: _purple, size: 26),
                    ),
                    const SizedBox(width: 14),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            contact['nameTamil'] ?? '',
                            style: const TextStyle(
                              fontFamily: 'NotoSansTamil',
                              fontSize: 18,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                          if (contact['note'] != null)
                            Text(
                              contact['note']!,
                              style: const TextStyle(
                                fontFamily: 'NotoSansTamil',
                                fontSize: 13,
                                color: _purple,
                              ),
                            ),
                        ],
                      ),
                    ),
                    GestureDetector(
                      onTap: () => _call(contact['phone'] ?? ''),
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 14, vertical: 10),
                        decoration: BoxDecoration(
                          color: _purple,
                          borderRadius: BorderRadius.circular(16),
                        ),
                        child: const Text(
                          'அழைக்க',
                          style: TextStyle(
                            fontFamily: 'NotoSansTamil',
                            fontSize: 14,
                            color: Colors.white,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            );
          }),

          const SizedBox(height: 16),

          // ── Info note ─────────────────────────────────────────────
          Container(
            margin: const EdgeInsets.symmetric(horizontal: 16),
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: _purple.withOpacity(0.06),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: _purple.withOpacity(0.2), width: 1),
            ),
            child: const Column(
              children: [
                Text('📞', style: TextStyle(fontSize: 28)),
                SizedBox(height: 8),
                Text(
                  'உங்க ஊர்ல ஆட்டோ ஓட்டுனர் இருந்தா\nவேந்தனிடம் சொல்லுங்க — சேர்த்துடுவோம்!',
                  style: TextStyle(
                    fontFamily: 'NotoSansTamil',
                    fontSize: 14,
                    color: _purple,
                  ),
                  textAlign: TextAlign.center,
                ),
              ],
            ),
          ),

          const SizedBox(height: 28),
        ],
      ),
    );
  }
}
