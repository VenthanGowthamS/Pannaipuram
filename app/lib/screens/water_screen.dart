import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:shimmer/shimmer.dart';
import 'package:url_launcher/url_launcher.dart';
import '../models/models.dart';
import '../services/api_service.dart';
import '../services/prefs_service.dart';
import '../theme/app_theme.dart';
import '../widgets/offline_banner.dart';

class WaterScreen extends StatefulWidget {
  const WaterScreen({super.key});

  @override
  State<WaterScreen> createState() => _WaterScreenState();
}

class _WaterScreenState extends State<WaterScreen> {
  WaterSchedule? _schedule;
  List<WaterAlert> _todayAlerts = [];
  List<Street> _streets = [];
  bool _loading = true;
  bool _offline = false;
  bool _alertSent = false;

  // Default: Valluvar Street
  int _selectedStreetId = 1;
  String _selectedStreetName = 'வள்ளுவர் தெரு';

  static const List<Map<String, dynamic>> _fallbackStreets = [
    {'id': 1, 'name_tamil': 'வள்ளுவர் தெரு',  'name_english': 'Valluvar Street'},
    {'id': 2, 'name_tamil': 'காந்தி தெரு',     'name_english': 'Gandhi Street'},
    {'id': 3, 'name_tamil': 'அம்பேத்கர் தெரு', 'name_english': 'Ambedkar Street'},
    {'id': 4, 'name_tamil': 'நேதாஜி தெரு',     'name_english': 'Netaji Street'},
    {'id': 5, 'name_tamil': 'கலைஞர் தெரு',     'name_english': 'Kalaignar Street'},
    {'id': 6, 'name_tamil': 'பெரியார் தெரு',   'name_english': 'Periyar Street'},
    {'id': 7, 'name_tamil': 'இந்திரா நகர்',    'name_english': 'Indira Nagar'},
    {'id': 8, 'name_tamil': 'ராஜாஜி தெரு',     'name_english': 'Rajaji Street'},
    {'id': 9, 'name_tamil': 'காமராஜர் தெரு',   'name_english': 'Kamarajar Street'},
    {'id':10, 'name_tamil': 'மேட்டுத் தெரு',   'name_english': 'Mettu Street'},
  ];

  @override
  void initState() {
    super.initState();
    // Use saved street preference, defaulting to Valluvar Street
    _selectedStreetId   = PrefsService.streetId ?? 1;
    _selectedStreetName = PrefsService.streetNameTamil;
    if (_selectedStreetName == 'தெரு தேர்வு செய்யவும்') {
      _selectedStreetName = 'வள்ளுவர் தெரு';
    }
    _loadStreets();
    _load();
  }

  Future<void> _loadStreets() async {
    try {
      final streets = await ApiService.getStreets();
      if (!mounted) return;
      setState(() => _streets = streets);
    } catch (_) {
      if (!mounted) return;
      setState(() => _streets = _fallbackStreets.map((e) => Street.fromJson(e)).toList());
    }
  }

  Future<void> _load() async {
    setState(() => _loading = true);
    try {
      final schedule = await ApiService.getWaterSchedule(_selectedStreetId);
      final alerts   = await ApiService.getTodayWaterAlerts();
      if (!mounted) return;
      setState(() {
        _schedule    = schedule;
        _todayAlerts = alerts;
        _loading     = false;
        _offline     = false;
      });
    } catch (_) {
      if (!mounted) return;
      setState(() {
        _loading = false;
        _offline = true;
      });
    }
  }

  void _showStreetPicker() {
    final streets = _streets.isNotEmpty
        ? _streets
        : _fallbackStreets.map((e) => Street.fromJson(e)).toList();

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => Container(
        height: MediaQuery.of(context).size.height * 0.6,
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
        ),
        child: Column(
          children: [
            const SizedBox(height: 12),
            Container(width: 40, height: 4, decoration: BoxDecoration(color: Colors.grey[300], borderRadius: BorderRadius.circular(2))),
            const SizedBox(height: 16),
            const Text(
              'உங்கள் தெருவை தேர்வு செய்யுங்கள்',
              style: TextStyle(fontFamily: 'NotoSansTamil', fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const Text('Select your street', style: TextStyle(fontFamily: 'Roboto', fontSize: 12, color: Color(0xFF757575))),
            const Divider(height: 20),
            Expanded(
              child: ListView.builder(
                itemCount: streets.length,
                itemBuilder: (_, i) {
                  final s = streets[i];
                  final isSelected = s.id == _selectedStreetId;
                  return ListTile(
                    leading: Icon(
                      isSelected ? Icons.check_circle : Icons.location_on_outlined,
                      color: isSelected ? AppColors.waterBlue : Colors.grey,
                      size: 24,
                    ),
                    title: Text(s.nameTamil, style: TextStyle(fontFamily: 'NotoSansTamil', fontSize: 18, fontWeight: isSelected ? FontWeight.bold : FontWeight.normal, color: isSelected ? AppColors.waterBlue : const Color(0xFF212121))),
                    subtitle: s.nameEnglish != null ? Text(s.nameEnglish!, style: const TextStyle(fontFamily: 'Roboto', fontSize: 12)) : null,
                    onTap: () async {
                      await PrefsService.saveStreet(s.id, s.nameTamil);
                      setState(() {
                        _selectedStreetId   = s.id;
                        _selectedStreetName = s.nameTamil;
                        _alertSent          = false;
                      });
                      Navigator.pop(context);
                      _load();
                    },
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _reportWaterArrival() async {
    try {
      final ok = await ApiService.reportWaterArrival(_selectedStreetId, PrefsService.deviceId);
      if (!mounted) return;
      if (ok) {
        setState(() => _alertSent = true);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('💧 அறிவிப்பு அனுப்பப்பட்டது! அனைவருக்கும் தகவல் போகும்.'),
            backgroundColor: AppColors.waterBlue,
            duration: Duration(seconds: 4),
          ),
        );
        await _load();
      }
    } catch (_) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('அறிவிப்பு அனுப்ப முடியவில்லை — இணைப்பை சரிபாருங்கள்'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  Future<void> _confirmAlert(int alertId) async {
    try {
      final ok = await ApiService.confirmWaterAlert(alertId);
      if (!mounted) return;
      if (ok) {
        await _load();
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('உறுதிப்படுத்த முடியவில்லை — மீண்டும் முயற்சிக்கவும்'),
            backgroundColor: Colors.orange,
          ),
        );
      }
    } catch (_) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('இணைப்பு பிழை — மீண்டும் முயற்சிக்கவும்'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  Future<void> _contactAdmin() async {
    const message = 'வணக்கம், பண்ணைப்புரம் app — தண்ணீர் நேரம் update செய்யவும்';
    final uri = Uri.parse('https://wa.me/?text=${Uri.encodeComponent(message)}');
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    }
  }

  String _formatTime(String timeStr) {
    try {
      // Handle various formats: "06:00:00", "06:00:00+05:30", "06:00:00+00"
      final cleaned = timeStr.split('+')[0].split('-')[0]; // strip timezone
      final parts = cleaned.split(':');
      if (parts.length < 2) return timeStr;
      final h = int.parse(parts[0]);
      final m = int.parse(parts[1]);
      final period = h < 12 ? 'காலை' : h < 17 ? 'பகல்' : 'மாலை';
      final displayH = h > 12 ? h - 12 : (h == 0 ? 12 : h);
      return '$displayH:${m.toString().padLeft(2, '0')} $period';
    } catch (_) {
      return timeStr;
    }
  }

  /// Format ISO date string "2026-03-22T00:00:00.000Z" → "சனி, மார்ச் 22"
  String _formatDate(String dateStr) {
    try {
      final dt = DateTime.parse(dateStr).toLocal();
      const dayNames = ['திங்கள்', 'செவ்வாய்', 'புதன்', 'வியாழன்', 'வெள்ளி', 'சனி', 'ஞாயிறு'];
      const monthNames = ['ஜனவரி', 'பிப்ரவரி', 'மார்ச்', 'ஏப்ரல்', 'மே', 'ஜூன்',
                          'ஜூலை', 'ஆகஸ்ட்', 'செப்டம்பர்', 'அக்டோபர்', 'நவம்பர்', 'டிசம்பர்'];
      final dayName = dayNames[dt.weekday - 1]; // weekday: 1=Mon .. 7=Sun
      final month = monthNames[dt.month - 1];
      return '$dayName, $month ${dt.day}';
    } catch (_) {
      return dateStr;
    }
  }

  // Already converted to local in model — just format
  String _formatAlertTime(DateTime dt) =>
      DateFormat('h:mm a').format(dt);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: AppColors.waterBlue,
        title: const Text('தண்ணீர் | Water Supply', style: TextStyle(fontFamily: 'NotoSansTamil', fontSize: 16)),
        actions: const [
          Padding(padding: EdgeInsets.only(right: 16), child: Icon(Icons.water_drop, size: 28)),
        ],
      ),
      body: _loading
          ? _buildShimmer()
          : RefreshIndicator(onRefresh: _load, child: _buildBody()),
    );
  }

  Widget _buildShimmer() {
    return Shimmer.fromColors(
      baseColor: Colors.grey[300]!,
      highlightColor: Colors.grey[100]!,
      child: ListView(padding: const EdgeInsets.all(16), children: [
        Container(height: 140, decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(22))),
        const SizedBox(height: 12),
        Container(height: 60, decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(12))),
        const SizedBox(height: 12),
        Container(height: 100, decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(12))),
        const SizedBox(height: 12),
        Container(height: 68, decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(14))),
      ]),
    );
  }

  Widget _buildBody() {
    // Determine water status for hero tile
    final bool hasAlertToday = _todayAlerts.isNotEmpty;
    final String statusEmoji = hasAlertToday ? '✅' : '⏳';
    final String statusText = hasAlertToday
        ? 'தண்ணி வந்துருச்சு! (${_todayAlerts.length} அறிவிப்பு)'
        : (_schedule?.nextSupplyDate != null
            ? 'அடுத்து: ${_formatDate(_schedule!.nextSupplyDate!)}'
            : 'இன்னும் வரலை...');

    return ListView(
      padding: const EdgeInsets.symmetric(vertical: 8),
      children: [
        if (_offline) const OfflineBanner(),

        // ── COMING SOON BANNER ────────────────────────────────────
        Container(
          margin: const EdgeInsets.fromLTRB(16, 10, 16, 0),
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
          decoration: BoxDecoration(
            color: const Color(0xFFE3F2FD),
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: const Color(0xFF42A5F5).withOpacity(0.5)),
          ),
          child: Row(
            children: const [
              Text('💧', style: TextStyle(fontSize: 18)),
              SizedBox(width: 10),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'விரைவில் — ஊராட்சி நேர அட்டவணை வரும்!',
                      style: TextStyle(
                        fontFamily: 'NotoSansTamil',
                        fontSize: 13,
                        fontWeight: FontWeight.w600,
                        color: Color(0xFF0D47A1),
                      ),
                    ),
                    Text(
                      'Street-wise water schedule coming soon',
                      style: TextStyle(fontFamily: 'Roboto', fontSize: 11, color: Color(0xFF1565C0)),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),

        // ── HERO TILE ─────────────────────────────────────────────
        Container(
          width: double.infinity,
          margin: const EdgeInsets.fromLTRB(16, 12, 16, 4),
          padding: const EdgeInsets.symmetric(vertical: 28, horizontal: 20),
          decoration: BoxDecoration(
            gradient: const LinearGradient(
              colors: [Color(0xFF1565C0), Color(0xFF42A5F5)],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
            borderRadius: BorderRadius.circular(22),
            boxShadow: [BoxShadow(color: AppColors.waterBlue.withOpacity(0.35), blurRadius: 14, offset: const Offset(0, 6))],
          ),
          child: Column(
            children: [
              const Text('💧', style: TextStyle(fontSize: 44)),
              const SizedBox(height: 10),
              const Text(
                'அக்கா, தண்ணி வந்துருச்சா?',
                style: TextStyle(fontFamily: 'NotoSansTamil', fontSize: 22, fontWeight: FontWeight.bold, color: Colors.white),
                textAlign: TextAlign.center,
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
              const SizedBox(height: 14),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 8),
                decoration: BoxDecoration(color: Colors.white.withOpacity(0.22), borderRadius: BorderRadius.circular(20)),
                child: Text(
                  '$statusEmoji $statusText',
                  style: const TextStyle(fontFamily: 'NotoSansTamil', fontSize: 16, color: Colors.white, fontWeight: FontWeight.w500),
                  textAlign: TextAlign.center,
                  softWrap: true,
                ),
              ),
            ],
          ),
        ),
        // ── END HERO TILE ─────────────────────────────────────────

        // Street selector — always visible, tap to change
        GestureDetector(
          onTap: _showStreetPicker,
          child: Container(
            margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            decoration: BoxDecoration(
              color: AppColors.waterBlue.withOpacity(0.08),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: AppColors.waterBlue.withOpacity(0.35)),
            ),
            child: Row(
              children: [
                const Icon(Icons.location_on, color: AppColors.waterBlue, size: 22),
                const SizedBox(width: 10),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(_selectedStreetName, style: const TextStyle(fontFamily: 'NotoSansTamil', fontSize: 19, fontWeight: FontWeight.w600, color: AppColors.waterBlue)),
                      const Text('உங்கள் தெரு — தட்டி மாற்றவும்', style: TextStyle(fontFamily: 'Roboto', fontSize: 11, color: Color(0xFF757575))),
                    ],
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                  decoration: BoxDecoration(color: AppColors.waterBlue.withOpacity(0.12), borderRadius: BorderRadius.circular(8)),
                  child: const Row(
                    children: [
                      Icon(Icons.swap_vert, color: AppColors.waterBlue, size: 16),
                      SizedBox(width: 4),
                      Text('மாற்று', style: TextStyle(fontFamily: 'NotoSansTamil', fontSize: 13, color: AppColors.waterBlue, fontWeight: FontWeight.w600)),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),

        // Schedule card
        if (_schedule != null)
          Card(
            margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Row(
                    children: [
                      Icon(Icons.calendar_today, color: AppColors.waterBlue, size: 20),
                      SizedBox(width: 8),
                      Text('அடுத்த தண்ணீர்', style: TextStyle(fontFamily: 'NotoSansTamil', fontSize: 18, fontWeight: FontWeight.w600)),
                    ],
                  ),
                  const Divider(height: 20),
                  if (_schedule!.nextSupplyDate != null)
                    Text(_formatDate(_schedule!.nextSupplyDate!), style: const TextStyle(fontFamily: 'NotoSansTamil', fontSize: 22, fontWeight: FontWeight.bold, color: AppColors.waterBlue)),
                  const SizedBox(height: 4),
                  Row(
                    children: [
                      const Icon(Icons.access_time, color: AppColors.waterBlue, size: 18),
                      const SizedBox(width: 6),
                      Text(_formatTime(_schedule!.supplyTime), style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'ஒவ்வொரு ${_schedule!.frequencyDays} நாளுக்கு ஒரு முறை  •  Every ${_schedule!.frequencyDays} days',
                    style: const TextStyle(fontFamily: 'Roboto', fontSize: 12, color: Color(0xFF757575)),
                  ),
                ],
              ),
            ),
          )
        else
          Card(
            margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Text(
                _offline ? 'இணைப்பு இல்லை — தண்ணீர் நேரம் காட்ட முடியவில்லை' : 'இந்த தெருவுக்கு அட்டவணை இல்லை — விரைவில் சேர்க்கப்படும்',
                style: const TextStyle(fontFamily: 'NotoSansTamil', fontSize: 16),
              ),
            ),
          ),

        const SizedBox(height: 8),

        // Community alert button
        Container(
          margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
          child: ElevatedButton(
            onPressed: _alertSent ? null : _reportWaterArrival,
            style: ElevatedButton.styleFrom(
              backgroundColor: _alertSent ? Colors.green : AppColors.waterBlue,
              minimumSize: const Size(double.infinity, 68),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
            ),
            child: Column(
              children: [
                Text(
                  _alertSent ? '✅ அறிவிப்பு அனுப்பப்பட்டது!' : '💧 தண்ணீர் வந்தது!',
                  style: const TextStyle(fontFamily: 'NotoSansTamil', fontSize: 22, color: Colors.white, fontWeight: FontWeight.bold),
                ),
                Text(
                  _alertSent ? 'Alert sent!' : 'Water has come! — Tap to alert everyone',
                  style: const TextStyle(fontFamily: 'Roboto', fontSize: 12, color: Colors.white70),
                ),
              ],
            ),
          ),
        ),

        const SizedBox(height: 16),

        // Today's alerts
        const Padding(
          padding: EdgeInsets.symmetric(horizontal: 16),
          child: Row(
            children: [
              Icon(Icons.history, size: 18, color: Color(0xFF757575)),
              SizedBox(width: 6),
              Text('இன்றைய அறிவிப்புகள்', style: TextStyle(fontFamily: 'NotoSansTamil', fontSize: 16, fontWeight: FontWeight.w500)),
            ],
          ),
        ),
        const SizedBox(height: 6),

        if (_todayAlerts.isEmpty)
          Card(
            margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                children: [
                  Icon(Icons.water_drop_outlined, size: 40, color: Colors.grey[400]),
                  const SizedBox(height: 8),
                  const Text('இன்னும் யாரும் அறிவிக்கவில்லை', style: TextStyle(fontFamily: 'NotoSansTamil', fontSize: 16)),
                  const Text('No alerts yet today', style: TextStyle(fontFamily: 'Roboto', fontSize: 12, color: Color(0xFF757575))),
                ],
              ),
            ),
          )
        else
          ..._todayAlerts.map((alert) => Card(
            margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
            child: Padding(
              padding: const EdgeInsets.all(14),
              child: Row(
                children: [
                  Container(
                    width: 44, height: 44,
                    decoration: BoxDecoration(color: AppColors.waterBlue.withOpacity(0.1), borderRadius: BorderRadius.circular(22)),
                    child: const Icon(Icons.water_drop, color: AppColors.waterBlue, size: 24),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('💧 ${alert.streetNameTamil}', style: const TextStyle(fontFamily: 'NotoSansTamil', fontSize: 17, fontWeight: FontWeight.w500)),
                        Text(_formatAlertTime(alert.reportedAt), style: const TextStyle(fontFamily: 'Roboto', fontSize: 12, color: Color(0xFF757575))),
                      ],
                    ),
                  ),
                  Column(
                    children: [
                      if (alert.confirmations > 0)
                        Text('✅ ${alert.confirmations}', style: const TextStyle(fontSize: 16, color: Colors.green, fontWeight: FontWeight.bold)),
                      TextButton(
                        onPressed: () => _confirmAlert(alert.id),
                        child: const Text('உறுதிப்படுத்து', style: TextStyle(fontFamily: 'NotoSansTamil', fontSize: 13)),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          )),

        // Contact admin section
        const SizedBox(height: 16),
        Container(
          margin: const EdgeInsets.fromLTRB(16, 0, 16, 16),
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: AppColors.waterBlue.withOpacity(0.06),
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: AppColors.waterBlue.withOpacity(0.25)),
          ),
          child: Column(
            children: [
              const Text('💧', style: TextStyle(fontSize: 28)),
              const SizedBox(height: 8),
              const Text(
                'தண்ணீர் நேரம் admin மூலம் update ஆகும்',
                style: TextStyle(fontFamily: 'NotoSansTamil', fontSize: 14, color: Color(0xFF1565C0), fontWeight: FontWeight.w600),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 2),
              const Text(
                'Water schedule updates are managed by admin',
                style: TextStyle(fontFamily: 'Roboto', fontSize: 11, color: Color(0xFF757575)),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 12),
              GestureDetector(
                onTap: _contactAdmin,
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
                  decoration: BoxDecoration(
                    color: const Color(0xFF25D366),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: const Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(Icons.chat_rounded, color: Colors.white, size: 18),
                      SizedBox(width: 8),
                      Text('Admin-கு WhatsApp செய்யவும்',
                        style: TextStyle(fontFamily: 'NotoSansTamil', fontSize: 13, color: Colors.white, fontWeight: FontWeight.w600)),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}
