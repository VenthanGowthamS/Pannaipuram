import 'dart:async';
import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import '../models/models.dart';
import '../services/api_service.dart';

class AutoScreen extends StatefulWidget {
  const AutoScreen({super.key});

  @override
  State<AutoScreen> createState() => _AutoScreenState();
}

class _AutoScreenState extends State<AutoScreen> {
  static const Color _purple = Color(0xFF6A1B9A);

  List<AutoDriver>? _apiDrivers;
  String? _dataSource;
  bool _loading = true;
  Timer? _refreshTimer;

  // WhatsApp contact (fetched from API, fallback hardcoded)
  String _contactName = 'Admin';
  String _contactPhone = '8888888888';
  String _contactMessage = 'வணக்கம், பண்ணைப்புரம் app — சேவை சேர்க்க வேண்டும்';

  // ── Fallback contacts (shown when API is unreachable) ──────────────────
  static const List<AutoDriver> _fallbackDrivers = [
    AutoDriver(
      id: 0,
      nameTamil: 'முருகேசன்',
      nameEnglish: 'Murugesan',
      phone: '',
      vehicleType: 'auto',
      coverageTamil: 'உத்தமபாளையம் வரை',
      coverageEnglish: 'Up to Uthamapalayam',
    ),
    AutoDriver(
      id: 0,
      nameTamil: 'கதிரவன்',
      nameEnglish: 'Kathiravan',
      phone: '',
      vehicleType: 'auto',
      coverageTamil: 'போடி / கம்பம் வரை',
      coverageEnglish: 'Up to Bodi / Cumbum',
    ),
    AutoDriver(
      id: 0,
      nameTamil: 'வேன் சேவை',
      nameEnglish: 'Van Service',
      phone: '',
      vehicleType: 'van',
      scheduleTamil: 'காலை 7 மணி புறப்படும் — உத்தமபாளையம்',
    ),
  ];

  List<AutoDriver> get _drivers => _apiDrivers ?? _fallbackDrivers;

  @override
  void initState() {
    super.initState();
    _fetchFromApi();
    _refreshTimer = Timer.periodic(const Duration(minutes: 5), (_) {
      if (mounted) _fetchFromApi();
    });
  }

  @override
  void dispose() {
    _refreshTimer?.cancel();
    super.dispose();
  }

  Future<void> _fetchFromApi() async {
    try {
      final results = await Future.wait([
        ApiService.getAutoDrivers(),
        ApiService.getAutoContact(),
      ]);
      if (!mounted) return;
      final drivers = results[0] as List<AutoDriver>;
      final contact = results[1] as Map<String, String>;
      setState(() {
        _apiDrivers = drivers;
        _dataSource = 'api';
        _contactName = contact['name'] ?? _contactName;
        _contactPhone = contact['phone'] ?? _contactPhone;
        _contactMessage = contact['name_english'] ?? _contactMessage;
        _loading = false;
      });
    } catch (_) {
      if (!mounted) return;
      setState(() {
        _loading = false;
        _dataSource = 'fallback';
      });
    }
  }

  Future<void> _call(String phone) async {
    if (phone.isEmpty) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text(
            'எண் இன்னும் சேர்க்கப்படவில்லை — விரைவில்!',
            style: TextStyle(fontFamily: 'NotoSansTamil'),
          ),
          backgroundColor: Color(0xFF6A1B9A),
          duration: Duration(seconds: 3),
        ),
      );
      return;
    }
    final uri = Uri(scheme: 'tel', path: phone);
    if (await canLaunchUrl(uri)) await launchUrl(uri);
  }

  static const String _kFallbackPhone = '8807660177';

  Future<void> _openWhatsApp(String phone) async {
    final effectivePhone = phone.isNotEmpty ? phone : _kFallbackPhone;
    final cleaned = effectivePhone.replaceAll(RegExp(r'\D'), '');
    final number = cleaned.startsWith('91') ? cleaned : '91$cleaned';
    const message =
        'வணக்கம் சார் 🙏\n\n'
        'பண்ணைப்புரம் App-ல என்னை Driver-ஆக சேர்க்கணும்.\n\n'
        'என் பெயர்: \n'
        'தொலைபேசி: \n'
        'வண்டி வகை: (ஆட்டோ / வேன் / கார்)\n'
        'செல்லும் பகுதி: \n\n'
        'நன்றி!';
    final uri = Uri.parse('https://wa.me/$number?text=${Uri.encodeComponent(message)}');
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    }
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
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: _fetchFromApi,
              child: _buildBody(),
            ),
    );
  }

  Widget _buildBody() {
    final drivers = _drivers;

    return ListView(
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
                color: _purple.withValues(alpha: 0.35),
                blurRadius: 14,
                offset: const Offset(0, 6),
              ),
            ],
          ),
          child: Column(
            children: [
              const Text('🚗', style: TextStyle(fontSize: 44)),
              const SizedBox(height: 10),
              const FittedBox(
                fit: BoxFit.scaleDown,
                child: Text(
                  'சார், ஆட்டோ வேணுமா?',
                  style: TextStyle(
                    fontFamily: 'NotoSansTamil',
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                  textAlign: TextAlign.center,
                  maxLines: 1,
                ),
              ),
              const SizedBox(height: 10),
              const Text(
                'வண்டி வேணும்னா கீழ இருக்காங்க — அழைங்க!',
                style: TextStyle(
                  fontFamily: 'NotoSansTamil',
                  fontSize: 14,
                  color: Colors.white70,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 8),
              // Data source indicator
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: Colors.white.withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(
                  _dataSource == 'api'
                      ? '🟢 Live data from server'
                      : '📋 Offline — phone numbers pending',
                  style: const TextStyle(
                    fontFamily: 'Roboto',
                    fontSize: 11,
                    color: Colors.white70,
                  ),
                ),
              ),
            ],
          ),
        ),

        const SizedBox(height: 12),

        // ── Contact cards ──────────────────────────────────────────
        if (drivers.isEmpty)
          Card(
            margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
            child: Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                children: [
                  Icon(Icons.local_taxi_rounded, size: 40, color: Colors.grey[400]),
                  const SizedBox(height: 8),
                  const Text(
                    'இன்னும் ஆட்டோ தகவல் சேர்க்கப்படவில்லை',
                    style: TextStyle(fontFamily: 'NotoSansTamil', fontSize: 16),
                    textAlign: TextAlign.center,
                  ),
                  const Text(
                    'Auto driver info will be added soon',
                    style: TextStyle(fontFamily: 'Roboto', fontSize: 12, color: Color(0xFF757575)),
                  ),
                ],
              ),
            ),
          )
        else
          ...drivers.map((driver) {
            final isVan = driver.vehicleType == 'van';
            final isCar = driver.vehicleType == 'car';
            final icon = isVan
                ? Icons.airport_shuttle
                : isCar
                    ? Icons.directions_car_rounded
                    : Icons.local_taxi_rounded;
            final hasPhone = driver.phone.isNotEmpty;

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
                        color: _purple.withValues(alpha: 0.1),
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
                            driver.nameTamil,
                            style: const TextStyle(
                              fontFamily: 'NotoSansTamil',
                              fontSize: 18,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                          if (driver.nameEnglish != null)
                            Text(
                              driver.nameEnglish!,
                              style: const TextStyle(
                                fontFamily: 'Roboto',
                                fontSize: 12,
                                color: Color(0xFF757575),
                              ),
                            ),
                          if (driver.coverageTamil != null)
                            Text(
                              driver.coverageTamil!,
                              style: const TextStyle(
                                fontFamily: 'NotoSansTamil',
                                fontSize: 13,
                                color: _purple,
                              ),
                            ),
                          if (driver.scheduleTamil != null)
                            Text(
                              driver.scheduleTamil!,
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
                      onTap: () => _call(driver.phone),
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 14, vertical: 10),
                        decoration: BoxDecoration(
                          color: hasPhone ? _purple : Colors.grey,
                          borderRadius: BorderRadius.circular(16),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(
                              hasPhone ? Icons.phone : Icons.phone_disabled,
                              color: Colors.white,
                              size: 16,
                            ),
                            const SizedBox(width: 6),
                            Text(
                              hasPhone ? 'அழைக்க' : 'விரைவில்',
                              style: const TextStyle(
                                fontFamily: 'NotoSansTamil',
                                fontSize: 14,
                                color: Colors.white,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            );
          }),

        const SizedBox(height: 16),

        // ── Register as driver — WhatsApp banner ───────────────────
        Container(
          margin: const EdgeInsets.fromLTRB(16, 0, 16, 28),
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            gradient: const LinearGradient(
              colors: [Color(0xFF6A1B9A), Color(0xFF8E24AA)],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
            borderRadius: BorderRadius.circular(16),
            boxShadow: [BoxShadow(color: _purple.withValues(alpha: 0.3), blurRadius: 10, offset: const Offset(0, 4))],
          ),
          child: Column(children: [
            const Text('🚗', style: TextStyle(fontSize: 28)),
            const SizedBox(height: 8),
            const Text('சார், உங்கள் வண்டி சேர்க்கணுமா?',
              style: TextStyle(fontFamily: 'NotoSansTamil', fontSize: 16, color: Colors.white, fontWeight: FontWeight.w600),
              textAlign: TextAlign.center),
            const SizedBox(height: 2),
            const Text('Register your auto / van / car',
              style: TextStyle(fontFamily: 'Roboto', fontSize: 11, color: Colors.white70),
              textAlign: TextAlign.center),
            const SizedBox(height: 12),
            GestureDetector(
              onTap: () => _openWhatsApp(_contactPhone),
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                decoration: BoxDecoration(
                  color: const Color(0xFF25D366),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: const Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(Icons.chat_rounded, color: Colors.white, size: 20),
                    SizedBox(width: 10),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text('Admin-கு WhatsApp செய்யவும்',
                          style: TextStyle(fontFamily: 'NotoSansTamil', fontSize: 14, color: Colors.white, fontWeight: FontWeight.w700)),
                        Text('Message the admin on WhatsApp',
                          style: TextStyle(fontFamily: 'Roboto', fontSize: 11, color: Colors.white70)),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ]),
        ),
      ],
    );
  }
}
