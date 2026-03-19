import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:shimmer/shimmer.dart';
import 'power_screen.dart';
import 'water_screen.dart';
import 'bus_screen.dart';
import 'auto_screen.dart';
import 'hospital_screen.dart';
import 'emergency_screen.dart';
import 'about_screen.dart';
import 'services_screen.dart';
import '../services/api_service.dart';
import '../models/models.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  List<Map<String, dynamic>> _announcements = [];

  // Live status data
  bool _statusLoading = true;
  String _powerStatus = '';
  String _powerEmoji = '⚡';
  Color _powerColor = const Color(0xFF4CAF50);
  String _busStatus = '';
  String _busEmoji = '🚌';
  String _waterStatus = '';
  String _waterEmoji = '💧';

  @override
  void initState() {
    super.initState();
    _loadAll();
  }

  Future<void> _loadAll() async {
    _loadAnnouncements();
    await _loadLiveStatus();
  }

  Future<void> _loadAnnouncements() async {
    try {
      final data = await ApiService.getAnnouncements();
      if (!mounted) return;
      setState(() => _announcements = data);
    } catch (_) {}
  }

  Future<void> _loadLiveStatus() async {
    if (mounted) setState(() => _statusLoading = true);
    try {
      final results = await Future.wait([
        ApiService.getPowerCuts().catchError((_) => <PowerCut>[]),
        ApiService.getNextBuses().catchError((_) => <NextBus>[]),
        ApiService.getTodayWaterAlerts().catchError((_) => <WaterAlert>[]),
      ]);
      if (!mounted) return;

      final cuts = results[0] as List<PowerCut>;
      final buses = results[1] as List<NextBus>;
      final alerts = results[2] as List<WaterAlert>;

      // Power status
      final now = DateTime.now();
      final activeCut = cuts.where((c) =>
          c.startTime.isBefore(now) &&
          (c.endTime == null || c.endTime!.isAfter(now)) &&
          !c.isResolved).toList();
      final hasCutToday = cuts.any((c) =>
          c.startTime.year == now.year &&
          c.startTime.month == now.month &&
          c.startTime.day == now.day &&
          !c.isResolved);

      if (activeCut.isNotEmpty) {
        _powerStatus = 'மின் தடை நடக்கிறது!';
        _powerEmoji = '🔴';
        _powerColor = const Color(0xFFC62828);
      } else if (hasCutToday) {
        _powerStatus = 'இன்று மின் தடை உள்ளது';
        _powerEmoji = '⚠️';
        _powerColor = const Color(0xFFE65100);
      } else {
        _powerStatus = 'கரண்ட் இருக்கு!';
        _powerEmoji = '🟢';
        _powerColor = const Color(0xFF2E7D32);
      }

      // Bus status
      if (buses.isNotEmpty) {
        final nearest = buses.where((b) => b.minutesUntil != null && b.minutesUntil! > 0).toList();
        if (nearest.isNotEmpty) {
          nearest.sort((a, b) => (a.minutesUntil ?? 999).compareTo(b.minutesUntil ?? 999));
          final nb = nearest.first;
          if (nb.minutesUntil! <= 60) {
            _busStatus = '${nb.corridorNameTamil} — ${nb.minutesUntil} நிமிடம்';
            _busEmoji = '🚌';
          } else {
            _busStatus = '${nb.corridorNameTamil} — ${nb.departsAt ?? ''}';
            _busEmoji = '🕐';
          }
        } else {
          _busStatus = 'இன்றைக்கு பஸ் முடிந்தது';
          _busEmoji = '😴';
        }
      } else {
        _busStatus = 'பஸ் தகவல் விரைவில்';
        _busEmoji = '🚌';
      }

      // Water status
      if (alerts.isNotEmpty) {
        _waterStatus = 'இன்று வந்தது! (${alerts.length})';
        _waterEmoji = '✅';
      } else {
        _waterStatus = 'இன்னும் வரலை...';
        _waterEmoji = '⏳';
      }

      setState(() => _statusLoading = false);
    } catch (_) {
      if (!mounted) return;
      setState(() {
        _statusLoading = false;
        _powerStatus = 'இணைப்பு இல்லை';
        _busStatus = 'இணைப்பு இல்லை';
        _waterStatus = 'இணைப்பு இல்லை';
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final hour = DateTime.now().hour;
    final greeting = hour < 12
        ? 'காலை வணக்கம் 🌅'
        : hour < 17
            ? 'மதிய வணக்கம் 🌤️'
            : 'மாலை வணக்கம் 🌙';

    return Scaffold(
      backgroundColor: const Color(0xFFF2F6F2),
      body: Column(
        children: [
          _buildHeader(context),
          Expanded(
            child: RefreshIndicator(
              onRefresh: _loadAll,
              color: const Color(0xFF1B5E20),
              child: ListView(
                padding: const EdgeInsets.fromLTRB(14, 16, 14, 28),
                children: [
                  if (_announcements.isNotEmpty)
                    _AnnouncementBanner(announcements: _announcements),

                  Padding(
                    padding: const EdgeInsets.only(left: 2, bottom: 4),
                    child: Text(greeting,
                      style: const TextStyle(fontFamily: 'NotoSansTamil', fontSize: 13, color: Color(0xFF7A9A71))),
                  ),
                  const Padding(
                    padding: EdgeInsets.only(left: 2, bottom: 12),
                    child: Text('சொல்லுங்க, என்ன வேணும்?',
                      style: TextStyle(fontFamily: 'NotoSansTamil', fontSize: 15, color: Color(0xFF4A6741), fontWeight: FontWeight.w700)),
                  ),

                  // ── LIVE STATUS DASHBOARD ──────────────────────────
                  _buildStatusDashboard(),
                  const SizedBox(height: 16),

                  // Module tiles
                  _ModuleTile(
                    icon: Icons.directions_bus_rounded, emoji: '🚌',
                    gradientColors: const [Color(0xFFE65100), Color(0xFFF4511E)],
                    label: 'அண்ணே, பஸ் எத்தன மணிக்கு?', sublabel: 'Bus Times & Routes',
                    onTap: () => _navigate(context, const BusScreen()),
                  ),
                  const SizedBox(height: 12),
                  _ModuleTile(
                    icon: Icons.electric_rickshaw, secondIcon: Icons.directions_car_rounded, emoji: '🚗',
                    gradientColors: const [Color(0xFF4A148C), Color(0xFF7B1FA2)],
                    label: 'சார், ஆட்டோ வேணுமா?', sublabel: 'Auto & Car Transport',
                    onTap: () => _navigate(context, const AutoScreen()),
                  ),
                  const SizedBox(height: 12),
                  _ModuleTile(
                    icon: Icons.local_hospital_rounded, emoji: '🏥',
                    gradientColors: const [Color(0xFFC62828), Color(0xFFD32F2F)],
                    label: 'சிஸ்டர், டாக்டர் வந்துட்டாரா?', sublabel: 'Hospital & Clinic',
                    onTap: () => _navigate(context, const HospitalScreen()),
                  ),
                  const SizedBox(height: 12),
                  _ModuleTile(
                    icon: Icons.bolt, emoji: '⚡',
                    gradientColors: const [Color(0xFFF9A825), Color(0xFFFFCA28)],
                    label: 'அண்ணே, கரண்ட் எப்ப வரும்?', sublabel: 'Electricity Status',
                    onTap: () => _navigate(context, const PowerScreen()),
                  ),
                  const SizedBox(height: 12),
                  _ModuleTile(
                    icon: Icons.water_drop, emoji: '💧',
                    gradientColors: const [Color(0xFF0288D1), Color(0xFF039BE5)],
                    label: 'அக்கா, தண்ணி வந்துருச்சா?', sublabel: 'Water Supply',
                    onTap: () => _navigate(context, const WaterScreen()),
                  ),
                  const SizedBox(height: 12),
                  _ModuleTile(
                    icon: Icons.storefront_rounded, emoji: '🛍',
                    gradientColors: const [Color(0xFF00695C), Color(0xFF00897B)],
                    label: 'ஊர்ல யாரை அழைக்கணும்?', sublabel: 'Milk, Post, Plumber & More',
                    onTap: () => _navigate(context, const ServicesScreen()),
                  ),
                  const SizedBox(height: 12),
                  _ModuleTile(
                    icon: Icons.emergency_rounded, emoji: '🚨',
                    gradientColors: const [Color(0xFFB71C1C), Color(0xFFE53935)],
                    label: 'அண்ணே, உதவி வேணும்!', sublabel: 'Emergency Contacts',
                    onTap: () => _navigate(context, const EmergencyScreen()),
                  ),
                  const SizedBox(height: 20),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  // ── Live Status Dashboard ────────────────────────────────────────────
  Widget _buildStatusDashboard() {
    if (_statusLoading) return _buildShimmerDashboard();

    return Row(
      children: [
        Expanded(child: _StatusCard(
          emoji: _powerEmoji, label: 'மின்சாரம்', value: _powerStatus,
          color: _powerColor, onTap: () => _navigate(context, const PowerScreen()),
        )),
        const SizedBox(width: 8),
        Expanded(child: _StatusCard(
          emoji: _busEmoji, label: 'அடுத்த பஸ்', value: _busStatus,
          color: const Color(0xFFE65100), onTap: () => _navigate(context, const BusScreen()),
        )),
        const SizedBox(width: 8),
        Expanded(child: _StatusCard(
          emoji: _waterEmoji, label: 'தண்ணீர்', value: _waterStatus,
          color: const Color(0xFF0277BD), onTap: () => _navigate(context, const WaterScreen()),
        )),
      ],
    );
  }

  Widget _buildShimmerDashboard() {
    return Shimmer.fromColors(
      baseColor: Colors.grey[300]!,
      highlightColor: Colors.grey[100]!,
      child: Row(
        children: List.generate(3, (_) => Expanded(
          child: Container(
            height: 100,
            margin: const EdgeInsets.symmetric(horizontal: 4),
            decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(14)),
          ),
        )),
      ),
    );
  }

  Widget _buildHeader(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft, end: Alignment.bottomRight,
          colors: [Color(0xFF1B5E20), Color(0xFF2E7D32), Color(0xFF388E3C)],
        ),
      ),
      padding: EdgeInsets.only(
        top: MediaQuery.of(context).padding.top + 10, left: 18, right: 18, bottom: 14,
      ),
      child: Row(children: [
        Container(
          width: 46, height: 46,
          decoration: BoxDecoration(color: Colors.white.withOpacity(0.18), borderRadius: BorderRadius.circular(23)),
          child: const Icon(Icons.cottage_rounded, color: Colors.white, size: 26),
        ),
        const SizedBox(width: 12),
        const Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text('பண்ணைப்புரம்', style: TextStyle(fontFamily: 'NotoSansTamil', fontSize: 22, fontWeight: FontWeight.bold, color: Colors.white)),
          Text('உங்கள் ஊரின் தகவல் மையம்', style: TextStyle(fontFamily: 'NotoSansTamil', fontSize: 12, color: Colors.white70)),
        ])),
        IconButton(
          icon: const Icon(Icons.info_outline_rounded, color: Colors.white70, size: 24),
          tooltip: 'About Pannaipuram',
          onPressed: () => _navigate(context, const AboutScreen()),
        ),
      ]),
    );
  }

  void _navigate(BuildContext context, Widget screen) {
    Navigator.push(context, PageRouteBuilder(
      pageBuilder: (context, animation, secondaryAnimation) => screen,
      transitionsBuilder: (context, animation, secondaryAnimation, child) {
        final tween = Tween(begin: const Offset(1.0, 0.0), end: Offset.zero)
            .chain(CurveTween(curve: Curves.easeInOutCubic));
        return SlideTransition(position: animation.drive(tween), child: child);
      },
      transitionDuration: const Duration(milliseconds: 300),
    ));
  }
}

// ── Status Card Widget ─────────────────────────────────────────────────────
class _StatusCard extends StatelessWidget {
  final String emoji;
  final String label;
  final String value;
  final Color color;
  final VoidCallback onTap;
  const _StatusCard({required this.emoji, required this.label, required this.value, required this.color, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () { HapticFeedback.lightImpact(); onTap(); },
      child: Container(
        height: 100,
        padding: const EdgeInsets.all(10),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: color.withOpacity(0.2)),
          boxShadow: [BoxShadow(color: color.withOpacity(0.08), blurRadius: 8, offset: const Offset(0, 3))],
        ),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Row(children: [
            Text(emoji, style: const TextStyle(fontSize: 18)),
            const SizedBox(width: 4),
            Expanded(child: Text(label,
              style: TextStyle(fontFamily: 'NotoSansTamil', fontSize: 10, fontWeight: FontWeight.w600, color: color),
              overflow: TextOverflow.ellipsis)),
          ]),
          const Spacer(),
          Text(value,
            style: const TextStyle(fontFamily: 'NotoSansTamil', fontSize: 11, fontWeight: FontWeight.w600, color: Color(0xFF333333), height: 1.3),
            maxLines: 2, overflow: TextOverflow.ellipsis),
          const SizedBox(height: 4),
          Container(height: 3, decoration: BoxDecoration(color: color.withOpacity(0.3), borderRadius: BorderRadius.circular(2))),
        ]),
      ),
    );
  }
}

// ── Announcement Banner ────────────────────────────────────────────────────
class _AnnouncementBanner extends StatefulWidget {
  final List<Map<String, dynamic>> announcements;
  const _AnnouncementBanner({required this.announcements});
  @override
  State<_AnnouncementBanner> createState() => _AnnouncementBannerState();
}

class _AnnouncementBannerState extends State<_AnnouncementBanner> {
  late PageController _pageController;
  int _currentPage = 0;
  static const _typeStyles = {
    'info':    (icon: Icons.campaign_rounded, color: Color(0xFF1565C0), bg: Color(0xFFE3F2FD)),
    'warning': (icon: Icons.warning_amber_rounded, color: Color(0xFFE65100), bg: Color(0xFFFFF3E0)),
    'urgent':  (icon: Icons.error_rounded, color: Color(0xFFC62828), bg: Color(0xFFFFEBEE)),
    'event':   (icon: Icons.celebration_rounded, color: Color(0xFF6A1B9A), bg: Color(0xFFF3E5F5)),
  };

  @override
  void initState() {
    super.initState();
    _pageController = PageController();
    if (widget.announcements.length > 1) Future.delayed(const Duration(seconds: 4), _autoScroll);
  }

  void _autoScroll() {
    if (!mounted) return;
    _pageController.animateToPage(
      (_currentPage + 1) % widget.announcements.length,
      duration: const Duration(milliseconds: 500), curve: Curves.easeInOut);
    Future.delayed(const Duration(seconds: 4), _autoScroll);
  }

  @override
  void dispose() { _pageController.dispose(); super.dispose(); }

  @override
  Widget build(BuildContext context) {
    return Column(children: [
      SizedBox(height: 72, child: PageView.builder(
        controller: _pageController,
        itemCount: widget.announcements.length,
        onPageChanged: (i) => setState(() => _currentPage = i),
        itemBuilder: (ctx, i) {
          final a = widget.announcements[i];
          final type = (a['type'] ?? 'info').toString();
          final style = _typeStyles[type] ?? _typeStyles['info']!;
          return Container(
            margin: const EdgeInsets.symmetric(horizontal: 2, vertical: 4),
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
            decoration: BoxDecoration(
              color: style.bg, borderRadius: BorderRadius.circular(14),
              border: Border.all(color: style.color.withOpacity(0.3)),
            ),
            child: Row(children: [
              Icon(style.icon, color: style.color, size: 28),
              const SizedBox(width: 12),
              Expanded(child: Column(mainAxisAlignment: MainAxisAlignment.center, crossAxisAlignment: CrossAxisAlignment.start, children: [
                Text((a['message_tamil'] ?? '').toString(),
                  style: TextStyle(fontFamily: 'NotoSansTamil', fontSize: 13, fontWeight: FontWeight.w600, color: style.color),
                  maxLines: 2, overflow: TextOverflow.ellipsis),
                if ((a['message_english'] ?? '').toString().isNotEmpty)
                  Text(a['message_english'].toString(),
                    style: const TextStyle(fontFamily: 'Roboto', fontSize: 11, color: Color(0xFF757575)),
                    maxLines: 1, overflow: TextOverflow.ellipsis),
              ])),
            ]),
          );
        },
      )),
      if (widget.announcements.length > 1)
        Row(mainAxisAlignment: MainAxisAlignment.center, children: List.generate(widget.announcements.length, (i) {
          return AnimatedContainer(
            duration: const Duration(milliseconds: 300),
            width: _currentPage == i ? 16 : 6, height: 6,
            margin: const EdgeInsets.symmetric(horizontal: 2),
            decoration: BoxDecoration(
              color: _currentPage == i ? const Color(0xFF1B5E20) : const Color(0xFFBDBDBD),
              borderRadius: BorderRadius.circular(3)),
          );
        })),
      const SizedBox(height: 8),
    ]);
  }
}

// ── Module Tile with scale animation ───────────────────────────────────────
class _ModuleTile extends StatefulWidget {
  final IconData icon;
  final IconData? secondIcon;
  final String emoji;
  final List<Color> gradientColors;
  final String label;
  final String sublabel;
  final VoidCallback onTap;
  const _ModuleTile({required this.icon, this.secondIcon, required this.emoji, required this.gradientColors, required this.label, required this.sublabel, required this.onTap});
  @override
  State<_ModuleTile> createState() => _ModuleTileState();
}

class _ModuleTileState extends State<_ModuleTile> with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _scaleAnimation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(vsync: this, duration: const Duration(milliseconds: 100));
    _scaleAnimation = Tween<double>(begin: 1.0, end: 0.95).animate(CurvedAnimation(parent: _controller, curve: Curves.easeInOut));
  }

  @override
  void dispose() { _controller.dispose(); super.dispose(); }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _scaleAnimation,
      builder: (context, child) => Transform.scale(scale: _scaleAnimation.value, child: child),
      child: GestureDetector(
        onTapDown: (_) => _controller.forward(),
        onTapUp: (_) { _controller.reverse(); HapticFeedback.lightImpact(); widget.onTap(); },
        onTapCancel: () => _controller.reverse(),
        child: Container(
          constraints: const BoxConstraints(minHeight: 88),
          padding: const EdgeInsets.symmetric(vertical: 18, horizontal: 18),
          decoration: BoxDecoration(
            gradient: LinearGradient(begin: Alignment.topLeft, end: Alignment.bottomRight, colors: widget.gradientColors),
            borderRadius: BorderRadius.circular(18),
            boxShadow: [BoxShadow(color: widget.gradientColors[0].withOpacity(0.35), blurRadius: 10, offset: const Offset(0, 4))],
          ),
          child: Stack(children: [
            Positioned(right: 0, top: -6, bottom: -6, child: Center(
              child: Text(widget.emoji, style: TextStyle(fontSize: 52, color: Colors.white.withOpacity(0.13))))),
            Row(children: [
              Container(
                width: 50, height: 50,
                decoration: BoxDecoration(color: Colors.white.withOpacity(0.2), borderRadius: BorderRadius.circular(25)),
                child: widget.secondIcon != null
                  ? Stack(alignment: Alignment.center, children: [
                      Positioned(top: 8, child: Icon(widget.secondIcon, color: Colors.white, size: 20)),
                      Positioned(bottom: 6, child: Icon(widget.icon, color: Colors.white70, size: 18)),
                    ])
                  : Icon(widget.icon, color: Colors.white, size: 26),
              ),
              const SizedBox(width: 16),
              Expanded(child: Column(mainAxisSize: MainAxisSize.min, crossAxisAlignment: CrossAxisAlignment.start, children: [
                Text(widget.label, style: const TextStyle(fontFamily: 'NotoSansTamil', fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white, height: 1.3), maxLines: 2, overflow: TextOverflow.ellipsis),
                const SizedBox(height: 3),
                Text(widget.sublabel, style: const TextStyle(fontFamily: 'Roboto', fontSize: 12, color: Colors.white70)),
              ])),
              const SizedBox(width: 8),
              const Icon(Icons.chevron_right_rounded, color: Colors.white60, size: 26),
            ]),
          ]),
        ),
      ),
    );
  }
}
