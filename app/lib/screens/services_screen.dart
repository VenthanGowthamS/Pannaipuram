import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:url_launcher/url_launcher.dart';
import '../services/api_service.dart';

// ── Category metadata class ───────────────────────────────────────────────────
class _CategoryMeta {
  final String emoji;
  final String tamilName;
  final String englishName;
  final Color color;
  const _CategoryMeta({
    required this.emoji,
    required this.tamilName,
    required this.englishName,
    required this.color,
  });
}

const _categoryMeta = <String, _CategoryMeta>{
  'milk': _CategoryMeta(emoji: '🥛', tamilName: 'பால் காரர்', englishName: 'Milk Man', color: Color(0xFF0288D1)),
  'post': _CategoryMeta(emoji: '📮', tamilName: 'தபால்காரர்', englishName: 'Postman', color: Color(0xFFE65100)),
  'flower': _CategoryMeta(emoji: '🌺', tamilName: 'பூ காரர்', englishName: 'Flower Seller', color: Color(0xFFAD1457)),
  'plumber': _CategoryMeta(emoji: '🔧', tamilName: 'குழாய்காரர்', englishName: 'Plumber', color: Color(0xFF0277BD)),
  'electrician': _CategoryMeta(emoji: '⚡', tamilName: 'மின் தொழிலாளி', englishName: 'Electrician', color: Color(0xFFF9A825)),
  'other': _CategoryMeta(emoji: '🛠', tamilName: 'மற்றவை', englishName: 'Others', color: Color(0xFF546E7A)),
};

const _fallbackMeta = _CategoryMeta(emoji: '🛠', tamilName: 'சேவை', englishName: 'Service', color: Color(0xFF546E7A));
const _categoryOrder = ['milk', 'post', 'flower', 'plumber', 'electrician', 'other'];

class ServicesScreen extends StatefulWidget {
  const ServicesScreen({super.key});
  @override
  State<ServicesScreen> createState() => _ServicesScreenState();
}

class _ServicesScreenState extends State<ServicesScreen> {
  static const Color _teal = Color(0xFF00695C);
  Map<String, List<Map<String, dynamic>>> _services = {};
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() => _loading = true);
    try {
      final data = await ApiService.getLocalServices();
      if (!mounted) return;
      setState(() { _services = data; _loading = false; });
    } catch (_) {
      if (!mounted) return;
      setState(() => _loading = false);
    }
  }

  Future<void> _call(String phone) async {
    HapticFeedback.lightImpact();
    if (phone.isEmpty) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
        content: Text('எண் இன்னும் சேர்க்கப்படவில்லை — விரைவில்!',
          style: TextStyle(fontFamily: 'NotoSansTamil')),
        backgroundColor: Color(0xFF00695C),
      ));
      return;
    }
    final uri = Uri(scheme: 'tel', path: phone);
    if (await canLaunchUrl(uri)) await launchUrl(uri);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('உள்ளூர் சேவை', style: TextStyle(fontFamily: 'NotoSansTamil')),
        backgroundColor: _teal,
      ),
      backgroundColor: const Color(0xFFF5F5F5),
      body: RefreshIndicator(onRefresh: _load, child: _loading ? const Center(child: CircularProgressIndicator()) : _buildBody()),
    );
  }

  Widget _buildBody() {
    final hasAnyData = _services.values.any((list) => list.isNotEmpty);
    return ListView(
      padding: const EdgeInsets.symmetric(vertical: 12),
      children: [
        // Hero banner
        Container(
          width: double.infinity,
          margin: const EdgeInsets.fromLTRB(16, 12, 16, 4),
          padding: const EdgeInsets.symmetric(vertical: 24, horizontal: 20),
          decoration: BoxDecoration(
            gradient: const LinearGradient(colors: [Color(0xFF00695C), Color(0xFF00897B)],
              begin: Alignment.topLeft, end: Alignment.bottomRight),
            borderRadius: BorderRadius.circular(22),
            boxShadow: [BoxShadow(color: _teal.withOpacity(0.35), blurRadius: 14, offset: const Offset(0, 6))],
          ),
          child: const Column(children: [
            Text('🛍', style: TextStyle(fontSize: 44)),
            SizedBox(height: 10),
            Text('ஊர்ல யாரை அழைக்கணும்?',
              style: TextStyle(fontFamily: 'NotoSansTamil', fontSize: 22, fontWeight: FontWeight.bold, color: Colors.white),
              textAlign: TextAlign.center),
            SizedBox(height: 6),
            Text('Local Service Contacts', style: TextStyle(fontFamily: 'Roboto', fontSize: 13, color: Colors.white70)),
          ]),
        ),
        const SizedBox(height: 12),

        if (!hasAnyData) ...[
          // Empty state
          Card(
            margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
            child: Padding(
              padding: const EdgeInsets.all(28),
              child: Column(children: [
                Icon(Icons.people_outline_rounded, size: 48, color: Colors.grey[400]),
                const SizedBox(height: 12),
                const Text('இன்னும் சேவை தகவல் சேர்க்கப்படவில்லை',
                  style: TextStyle(fontFamily: 'NotoSansTamil', fontSize: 16), textAlign: TextAlign.center),
                const SizedBox(height: 4),
                const Text('Service contacts will be added soon',
                  style: TextStyle(fontFamily: 'Roboto', fontSize: 13, color: Color(0xFF757575)), textAlign: TextAlign.center),
              ]),
            ),
          ),
          const Padding(
            padding: EdgeInsets.fromLTRB(18, 16, 18, 8),
            child: Text('விரைவில் இந்த சேவைகள் சேர்க்கப்படும்:',
              style: TextStyle(fontFamily: 'NotoSansTamil', fontSize: 14, color: Color(0xFF555555), fontWeight: FontWeight.w600)),
          ),
          ..._categoryOrder.where((c) => c != 'other').map((cat) {
            final meta = _categoryMeta[cat]!;
            return Container(
              margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: meta.color.withOpacity(0.07),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: meta.color.withOpacity(0.2)),
              ),
              child: Row(children: [
                Text(meta.emoji, style: const TextStyle(fontSize: 24)),
                const SizedBox(width: 12),
                Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Text(meta.tamilName, style: TextStyle(fontFamily: 'NotoSansTamil', fontSize: 14, fontWeight: FontWeight.w600, color: meta.color)),
                  Text(meta.englishName, style: const TextStyle(fontFamily: 'Roboto', fontSize: 11, color: Color(0xFF757575))),
                ]),
                const Spacer(),
                const Text('விரைவில்', style: TextStyle(fontFamily: 'NotoSansTamil', fontSize: 12, color: Color(0xFF9E9E9E))),
              ]),
            );
          }),
        ] else ...[
          ..._categoryOrder.map((category) {
            final list = _services[category];
            if (list == null || list.isEmpty) return const SizedBox.shrink();
            final meta = _categoryMeta[category] ?? _fallbackMeta;
            return _CategorySection(meta: meta, services: list, onCall: _call);
          }),
        ],

        // Footer note
        Container(
          margin: const EdgeInsets.fromLTRB(16, 16, 16, 28),
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: _teal.withOpacity(0.06),
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: _teal.withOpacity(0.2)),
          ),
          child: const Column(children: [
            Text('📝', style: TextStyle(fontSize: 24)),
            SizedBox(height: 6),
            Text('உங்கள் தொடர்பை சேர்க்கணுமா?\nAdmin Panel மூலம் சேர்க்கலாம்.',
              style: TextStyle(fontFamily: 'NotoSansTamil', fontSize: 13, color: Color(0xFF00695C)),
              textAlign: TextAlign.center),
          ]),
        ),
      ],
    );
  }
}

// Category section widget
class _CategorySection extends StatelessWidget {
  final _CategoryMeta meta;
  final List<Map<String, dynamic>> services;
  final Future<void> Function(String) onCall;
  const _CategorySection({required this.meta, required this.services, required this.onCall});

  @override
  Widget build(BuildContext context) {
    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Padding(
        padding: const EdgeInsets.fromLTRB(18, 16, 18, 8),
        child: Row(children: [
          Text(meta.emoji, style: const TextStyle(fontSize: 22)),
          const SizedBox(width: 8),
          Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text(meta.tamilName, style: TextStyle(fontFamily: 'NotoSansTamil', fontSize: 16, fontWeight: FontWeight.bold, color: meta.color)),
            Text(meta.englishName, style: const TextStyle(fontFamily: 'Roboto', fontSize: 11, color: Color(0xFF757575))),
          ]),
        ]),
      ),
      ...services.map((svc) => _ServiceCard(service: svc, meta: meta, onCall: onCall)),
    ]);
  }
}

// Service card widget
class _ServiceCard extends StatelessWidget {
  final Map<String, dynamic> service;
  final _CategoryMeta meta;
  final Future<void> Function(String) onCall;
  const _ServiceCard({required this.service, required this.meta, required this.onCall});

  @override
  Widget build(BuildContext context) {
    final phone = (service['phone'] ?? '').toString();
    final hasPhone = phone.isNotEmpty;
    final nameTamil = (service['name_tamil'] ?? '').toString();
    final nameEnglish = (service['name_english'] ?? '').toString();
    final areaTamil = (service['area_tamil'] ?? '').toString();
    final notesTamil = (service['notes_tamil'] ?? '').toString();

    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 5),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
      elevation: 1,
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Row(children: [
          Container(
            width: 50, height: 50,
            decoration: BoxDecoration(color: meta.color.withOpacity(0.1), borderRadius: BorderRadius.circular(25)),
            child: Center(child: Text(meta.emoji, style: const TextStyle(fontSize: 22))),
          ),
          const SizedBox(width: 14),
          Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text(nameTamil, style: const TextStyle(fontFamily: 'NotoSansTamil', fontSize: 18, fontWeight: FontWeight.w700)),
            if (nameEnglish.isNotEmpty)
              Text(nameEnglish, style: const TextStyle(fontFamily: 'Roboto', fontSize: 12, color: Color(0xFF757575))),
            if (areaTamil.isNotEmpty)
              Text(areaTamil, style: TextStyle(fontFamily: 'NotoSansTamil', fontSize: 13, color: meta.color)),
            if (notesTamil.isNotEmpty)
              Text(notesTamil, style: const TextStyle(fontFamily: 'NotoSansTamil', fontSize: 12, color: Color(0xFF757575))),
          ])),
          GestureDetector(
            onTap: () => onCall(phone),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
              decoration: BoxDecoration(color: hasPhone ? meta.color : Colors.grey, borderRadius: BorderRadius.circular(14)),
              child: Row(mainAxisSize: MainAxisSize.min, children: [
                Icon(hasPhone ? Icons.phone_rounded : Icons.phone_disabled_rounded, color: Colors.white, size: 16),
                const SizedBox(width: 6),
                Text(hasPhone ? 'அழைக்க' : 'விரைவில்',
                  style: const TextStyle(fontFamily: 'NotoSansTamil', fontSize: 13, color: Colors.white, fontWeight: FontWeight.w600)),
              ]),
            ),
          ),
        ]),
      ),
    );
  }
}
