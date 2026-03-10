import 'package:flutter/material.dart';
import '../models/models.dart';
import '../services/api_service.dart';
import '../services/prefs_service.dart';
import '../theme/app_theme.dart';
import 'power_screen.dart';
import 'water_screen.dart';
import 'bus_screen.dart';
import 'hospital_screen.dart';
import 'emergency_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  String? _powerStatus;
  String? _waterStatus;
  bool _loadingStatus = true;

  @override
  void initState() {
    super.initState();
    _loadStatus();
  }

  Future<void> _loadStatus() async {
    try {
      final cuts = await ApiService.getTodayPowerCuts();
      final streetId = PrefsService.streetId ?? 1;
      WaterSchedule? waterSchedule;
      try {
        waterSchedule = await ApiService.getWaterSchedule(streetId);
      } catch (_) {}

      setState(() {
        _powerStatus = cuts.isEmpty ? 'மின் தடை இல்லை இன்று' : 'இன்று மின் தடை உள்ளது';
        _waterStatus = _buildWaterStatus(waterSchedule);
        _loadingStatus = false;
      });
    } catch (_) {
      setState(() {
        _powerStatus = 'மின் தகவல் இல்லை';
        _waterStatus = 'தண்ணீர் தகவல் இல்லை';
        _loadingStatus = false;
      });
    }
  }

  String _buildWaterStatus(WaterSchedule? schedule) {
    if (schedule == null) return 'தகவல் இல்லை';
    final nextDate = schedule.nextSupplyDate;
    if (nextDate == null) return 'நேரம் தெரியவில்லை';
    final today = DateTime.now();
    final parts = nextDate.split('-');
    if (parts.length >= 3) {
      final d = DateTime(int.parse(parts[0]), int.parse(parts[1]), int.parse(parts[2]));
      if (d.year == today.year && d.month == today.month && d.day == today.day) {
        return 'இன்று காலை ${_formatTime(schedule.supplyTime)}';
      }
      if (d.difference(today).inDays == 1) {
        return 'நாளை காலை ${_formatTime(schedule.supplyTime)}';
      }
    }
    return '$nextDate';
  }

  String _formatTime(String t) {
    final p = t.split(':');
    final h = int.parse(p[0]);
    final m = int.parse(p[1]);
    return '${h > 12 ? h - 12 : h}:${m.toString().padLeft(2, '0')} மணி';
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF0F4F0),
      body: Column(
        children: [
          _buildHeader(),
          Expanded(
            child: RefreshIndicator(
              onRefresh: _loadStatus,
              child: ListView(
                padding: const EdgeInsets.fromLTRB(14, 14, 14, 24),
                children: [
                  _buildLiveStatusRow(),
                  const SizedBox(height: 18),
                  const Padding(
                    padding: EdgeInsets.only(left: 4, bottom: 10),
                    child: Text(
                      'என்ன தெரிய வேண்டும்?',
                      style: TextStyle(
                        fontFamily: 'NotoSansTamil',
                        fontSize: 16,
                        color: Color(0xFF4A6741),
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                  Row(
                    children: [
                      Expanded(child: _ModuleTile(
                        icon: Icons.bolt,
                        emoji: '⚡',
                        gradientColors: const [Color(0xFFF9A825), Color(0xFFFFB300)],
                        label: 'மின்சாரம்',
                        sublabel: 'Electricity',
                        onTap: () => _navigate(const PowerScreen()),
                      )),
                      const SizedBox(width: 12),
                      Expanded(child: _ModuleTile(
                        icon: Icons.water_drop,
                        emoji: '💧',
                        gradientColors: const [Color(0xFF0288D1), Color(0xFF0277BD)],
                        label: 'தண்ணீர்',
                        sublabel: 'Water',
                        onTap: () => _navigate(const WaterScreen()),
                      )),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      Expanded(child: _ModuleTile(
                        icon: Icons.directions_bus_rounded,
                        emoji: '🚌',
                        gradientColors: const [Color(0xFFE65100), Color(0xFFF4511E)],
                        label: 'பேருந்து',
                        sublabel: 'Bus Times',
                        onTap: () => _navigate(const BusScreen()),
                      )),
                      const SizedBox(width: 12),
                      Expanded(child: _ModuleTile(
                        icon: Icons.local_hospital_rounded,
                        emoji: '🏥',
                        gradientColors: const [Color(0xFFC62828), Color(0xFFB71C1C)],
                        label: 'மருத்துவமனை',
                        sublabel: 'Hospital',
                        onTap: () => _navigate(const HospitalScreen()),
                      )),
                    ],
                  ),
                  const SizedBox(height: 14),
                  _EmergencyBar(onTap: () => _navigate(const EmergencyScreen())),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildHeader() {
    return Container(
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [Color(0xFF1B5E20), Color(0xFF2E7D32), Color(0xFF43A047)],
        ),
      ),
      padding: EdgeInsets.only(
        top: MediaQuery.of(context).padding.top + 12,
        left: 18,
        right: 18,
        bottom: 18,
      ),
      child: Row(
        children: [
          Container(
            width: 48,
            height: 48,
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.2),
              borderRadius: BorderRadius.circular(24),
            ),
            child: const Icon(Icons.location_city, color: Colors.white, size: 28),
          ),
          const SizedBox(width: 14),
          const Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'பண்ணைப்புரம்',
                  style: TextStyle(
                    fontFamily: 'NotoSansTamil',
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                ),
                Text(
                  'உங்கள் ஊரின் தகவல் மையம்',
                  style: TextStyle(
                    fontFamily: 'NotoSansTamil',
                    fontSize: 13,
                    color: Colors.white70,
                  ),
                ),
              ],
            ),
          ),
          IconButton(
            icon: const Icon(Icons.notifications_outlined, color: Colors.white, size: 28),
            onPressed: () {},
          ),
        ],
      ),
    );
  }

  Widget _buildLiveStatusRow() {
    return Column(
      children: [
        _StatusBadge(
          icon: Icons.bolt,
          color: const Color(0xFFF9A825),
          title: _loadingStatus ? 'ஏற்றுகிறது...' : (_powerStatus ?? '—'),
          subtitle: 'Power status',
          onTap: () => _navigate(const PowerScreen()),
        ),
        const SizedBox(height: 8),
        _StatusBadge(
          icon: Icons.water_drop,
          color: const Color(0xFF0288D1),
          title: _loadingStatus ? 'ஏற்றுகிறது...' : (_waterStatus ?? '—'),
          subtitle: 'Water — ${PrefsService.streetNameTamil}',
          onTap: () => _navigate(const WaterScreen()),
        ),
      ],
    );
  }

  void _navigate(Widget screen) {
    Navigator.push(context, MaterialPageRoute(builder: (_) => screen));
  }
}

class _StatusBadge extends StatelessWidget {
  final IconData icon;
  final Color color;
  final String title;
  final String subtitle;
  final VoidCallback onTap;

  const _StatusBadge({
    required this.icon,
    required this.color,
    required this.title,
    required this.subtitle,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: color.withOpacity(0.3), width: 1.5),
          boxShadow: [
            BoxShadow(color: color.withOpacity(0.08), blurRadius: 8, offset: const Offset(0, 3)),
          ],
        ),
        child: Row(
          children: [
            Container(
              width: 42, height: 42,
              decoration: BoxDecoration(color: color.withOpacity(0.12), borderRadius: BorderRadius.circular(21)),
              child: Icon(icon, color: color, size: 22),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(title, style: const TextStyle(fontFamily: 'NotoSansTamil', fontSize: 17, fontWeight: FontWeight.w600, color: Color(0xFF212121))),
                  Text(subtitle, style: const TextStyle(fontFamily: 'Roboto', fontSize: 12, color: Color(0xFF757575))),
                ],
              ),
            ),
            Icon(Icons.chevron_right_rounded, color: color, size: 24),
          ],
        ),
      ),
    );
  }
}

class _ModuleTile extends StatelessWidget {
  final IconData icon;
  final String emoji;
  final List<Color> gradientColors;
  final String label;
  final String sublabel;
  final VoidCallback onTap;

  const _ModuleTile({
    required this.icon, required this.emoji, required this.gradientColors,
    required this.label, required this.sublabel, required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        height: 140,
        decoration: BoxDecoration(
          gradient: LinearGradient(begin: Alignment.topLeft, end: Alignment.bottomRight, colors: gradientColors),
          borderRadius: BorderRadius.circular(18),
          boxShadow: [BoxShadow(color: gradientColors[0].withOpacity(0.35), blurRadius: 10, offset: const Offset(0, 4))],
        ),
        child: Stack(
          children: [
            Positioned(
              right: -8, bottom: -8,
              child: Text(emoji, style: const TextStyle(fontSize: 64)),
            ),
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 18, 16, 16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    width: 44, height: 44,
                    decoration: BoxDecoration(color: Colors.white.withOpacity(0.25), borderRadius: BorderRadius.circular(22)),
                    child: Icon(icon, color: Colors.white, size: 26),
                  ),
                  const Spacer(),
                  Text(label, style: const TextStyle(fontFamily: 'NotoSansTamil', fontSize: 20, fontWeight: FontWeight.bold, color: Colors.white)),
                  Text(sublabel, style: const TextStyle(fontFamily: 'Roboto', fontSize: 12, color: Colors.white70)),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _EmergencyBar extends StatelessWidget {
  final VoidCallback onTap;
  const _EmergencyBar({required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 20, horizontal: 20),
        decoration: BoxDecoration(
          gradient: const LinearGradient(colors: [Color(0xFFB71C1C), Color(0xFFC62828)]),
          borderRadius: BorderRadius.circular(18),
          boxShadow: [BoxShadow(color: const Color(0xFFB71C1C).withOpacity(0.35), blurRadius: 10, offset: const Offset(0, 4))],
        ),
        child: const Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.phone_in_talk_rounded, color: Colors.white, size: 32),
            SizedBox(width: 14),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('அவசர தொலைபேசி', style: TextStyle(fontFamily: 'NotoSansTamil', fontSize: 22, fontWeight: FontWeight.bold, color: Colors.white)),
                Text('Emergency Contacts', style: TextStyle(fontFamily: 'Roboto', fontSize: 13, color: Colors.white70)),
              ],
            ),
            Spacer(),
            Icon(Icons.chevron_right_rounded, color: Colors.white70, size: 28),
          ],
        ),
      ),
    );
  }
}
