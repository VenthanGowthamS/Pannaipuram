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
      final streetId = PrefsService.streetId;
      WaterSchedule? waterSchedule;
      if (streetId != null) {
        waterSchedule = await ApiService.getWaterSchedule(streetId);
      }

      setState(() {
        _powerStatus = cuts.isEmpty
            ? '🟢 மின் தடை இல்லை இன்று'
            : '⚡ இன்று மின் தடை உள்ளது';
        _waterStatus = _buildWaterStatus(waterSchedule);
        _loadingStatus = false;
      });
    } catch (_) {
      setState(() {
        _powerStatus = '— மின் தகவல் இல்லை';
        _waterStatus = '— தண்ணீர் தகவல் இல்லை';
        _loadingStatus = false;
      });
    }
  }

  String _buildWaterStatus(WaterSchedule? schedule) {
    if (schedule == null) return '💧 தெரு தேர்வு செய்யவில்லை';
    final nextDate = schedule.nextSupplyDate;
    if (nextDate == null) return '💧 அடுத்த தண்ணீர் நேரம் தெரியவில்லை';

    // Check if today
    final today = DateTime.now();
    final parts = nextDate.split('-');
    if (parts.length >= 3) {
      final d = DateTime(int.parse(parts[0]), int.parse(parts[1]), int.parse(parts[2]));
      if (d.year == today.year && d.month == today.month && d.day == today.day) {
        return '💧 தண்ணீர் — இன்று காலை ${_formatTime(schedule.supplyTime)}';
      }
      if (d.year == today.year && d.month == today.month && d.day == today.day + 1) {
        return '💧 தண்ணீர் — நாளை காலை ${_formatTime(schedule.supplyTime)}';
      }
    }
    return '💧 தண்ணீர் — $nextDate';
  }

  String _formatTime(String t) {
    final p = t.split(':');
    final h = int.parse(p[0]);
    final m = int.parse(p[1]);
    return '${h > 12 ? h - 12 : h}:${m.toString().padLeft(2, '0')}';
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Column(
          children: [
            // App header
            Container(
              color: AppColors.primary,
              padding: const EdgeInsets.fromLTRB(16, 16, 16, 16),
              child: Row(
                children: [
                  const Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'பண்ணைப்புரம்',
                          style: TextStyle(
                            fontFamily: 'NotoSansTamil',
                            fontSize: 22,
                            fontWeight: FontWeight.bold,
                            color: Colors.white,
                          ),
                        ),
                        Text(
                          'உங்கள் ஊரின் தகவல் மையம்',
                          style: TextStyle(
                            fontFamily: 'NotoSansTamil',
                            fontSize: 14,
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
            ),

            Expanded(
              child: RefreshIndicator(
                onRefresh: _loadStatus,
                child: ListView(
                  padding: const EdgeInsets.all(12),
                  children: [
                    // Live status cards
                    _buildStatusCard(
                      text: _loadingStatus ? '⚡ ஏற்றுகிறது...' : (_powerStatus ?? '—'),
                      subtext: _loadingStatus ? 'Loading...' : 'No power cut today',
                      color: AppColors.powerYellow,
                      onTap: () => _navigate(const PowerScreen()),
                    ),
                    const SizedBox(height: 8),
                    _buildStatusCard(
                      text: _loadingStatus ? '💧 ஏற்றுகிறது...' : (_waterStatus ?? '—'),
                      subtext: _loadingStatus ? 'Loading...' : 'Water tomorrow at 6am',
                      color: AppColors.waterBlue,
                      onTap: () => _navigate(const WaterScreen()),
                    ),

                    const SizedBox(height: 16),

                    // 2×2 module grid
                    Row(
                      children: [
                        Expanded(
                          child: _ModuleTile(
                            icon: Icons.bolt,
                            iconBg: AppColors.powerYellow,
                            label: 'மின்சாரம்',
                            sublabel: 'Electricity',
                            onTap: () => _navigate(const PowerScreen()),
                          ),
                        ),
                        const SizedBox(width: 10),
                        Expanded(
                          child: _ModuleTile(
                            icon: Icons.water_drop,
                            iconBg: AppColors.waterBlue,
                            label: 'தண்ணீர்',
                            sublabel: 'Water',
                            onTap: () => _navigate(const WaterScreen()),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 10),
                    Row(
                      children: [
                        Expanded(
                          child: _ModuleTile(
                            icon: Icons.directions_bus,
                            iconBg: AppColors.busOrange,
                            label: 'பேருந்து',
                            sublabel: 'Bus Times',
                            onTap: () => _navigate(const BusScreen()),
                          ),
                        ),
                        const SizedBox(width: 10),
                        Expanded(
                          child: _ModuleTile(
                            icon: Icons.local_hospital,
                            iconBg: AppColors.hospitalRed,
                            label: 'மருத்துவமனை',
                            sublabel: 'Hospital',
                            onTap: () => _navigate(const HospitalScreen()),
                          ),
                        ),
                      ],
                    ),

                    const SizedBox(height: 10),

                    // Emergency — full width
                    _EmergencyBar(onTap: () => _navigate(const EmergencyScreen())),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _navigate(Widget screen) {
    Navigator.push(context, MaterialPageRoute(builder: (_) => screen));
  }

  Widget _buildStatusCard({
    required String text,
    required String subtext,
    required Color color,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: double.infinity,
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        decoration: BoxDecoration(
          color: color.withOpacity(0.12),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: color.withOpacity(0.3)),
        ),
        child: Row(
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    text,
                    style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w500),
                  ),
                ],
              ),
            ),
            Icon(Icons.chevron_right, color: color, size: 20),
          ],
        ),
      ),
    );
  }
}

class _ModuleTile extends StatelessWidget {
  final IconData icon;
  final Color iconBg;
  final String label;
  final String sublabel;
  final VoidCallback onTap;

  const _ModuleTile({
    required this.icon,
    required this.iconBg,
    required this.label,
    required this.sublabel,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 24),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(14),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.06),
              blurRadius: 8,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              width: 60,
              height: 60,
              decoration: BoxDecoration(
                color: iconBg.withOpacity(0.15),
                borderRadius: BorderRadius.circular(30),
              ),
              child: Icon(icon, color: iconBg, size: 32),
            ),
            const SizedBox(height: 12),
            Text(
              label,
              style: const TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: AppColors.textPrimary,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 2),
            Text(
              sublabel,
              style: const TextStyle(
                fontFamily: 'Roboto',
                fontSize: 12,
                color: AppColors.textSecondary,
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
          color: AppColors.hospitalRed,
          borderRadius: BorderRadius.circular(14),
          boxShadow: [
            BoxShadow(
              color: AppColors.hospitalRed.withOpacity(0.3),
              blurRadius: 8,
              offset: const Offset(0, 3),
            ),
          ],
        ),
        child: const Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.phone_in_talk, color: Colors.white, size: 28),
            SizedBox(width: 14),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  '📞 அவசர தொலைபேசி',
                  style: TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                ),
                Text(
                  'Emergency Contacts',
                  style: TextStyle(
                    fontFamily: 'Roboto',
                    fontSize: 13,
                    color: Colors.white70,
                  ),
                ),
              ],
            ),
            Spacer(),
            Icon(Icons.chevron_right, color: Colors.white70, size: 24),
          ],
        ),
      ),
    );
  }
}
