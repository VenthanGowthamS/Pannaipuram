import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'power_screen.dart';
import 'water_screen.dart';
import 'bus_screen.dart';
import 'auto_screen.dart';
import 'hospital_screen.dart';
import 'services_screen.dart';
import '../services/api_service.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  List<Map<String, dynamic>> _announcements = [];
  Timer? _refreshTimer;

  @override
  void initState() {
    super.initState();
    _loadAnnouncements();
    _refreshTimer = Timer.periodic(const Duration(minutes: 5), (_) {
      if (mounted) _loadAnnouncements();
    });
  }

  @override
  void dispose() {
    _refreshTimer?.cancel();
    super.dispose();
  }

  Future<void> _loadAnnouncements() async {
    try {
      final data = await ApiService.getAnnouncements();
      if (!mounted) return;
      setState(() => _announcements = data);
    } catch (_) {
      // Announcements are non-critical — silently use empty list
      if (!mounted) return;
      setState(() => _announcements = []);
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
              onRefresh: _loadAnnouncements,
              color: const Color(0xFF1B5E20),
              child: ListView(
                padding: const EdgeInsets.fromLTRB(14, 16, 14, 28),
                children: [
                  if (_announcements.isNotEmpty) ...[
                    Padding(
                      padding: const EdgeInsets.only(left: 2, bottom: 6),
                      child: Row(children: [
                        Icon(Icons.campaign_rounded, color: const Color(0xFF1B5E20).withValues(alpha: 0.7), size: 20),
                        const SizedBox(width: 6),
                        const Text('அறிவிப்புகள்',
                          style: TextStyle(fontFamily: 'NotoSansTamil', fontSize: 13, fontWeight: FontWeight.w600, color: Color(0xFF4A6741))),
                        const SizedBox(width: 4),
                        const Text('Announcements',
                          style: TextStyle(fontFamily: 'Roboto', fontSize: 10, color: Color(0xFF9E9E9E))),
                      ]),
                    ),
                    _AnnouncementBanner(announcements: _announcements),
                  ],

                  Padding(
                    padding: const EdgeInsets.only(left: 2, bottom: 3),
                    child: Text(greeting,
                      style: const TextStyle(fontFamily: 'NotoSansTamil', fontSize: 16, color: Color(0xFF5A8A61))),
                  ),
                  const Padding(
                    padding: EdgeInsets.only(left: 2, bottom: 14),
                    child: Text('சொல்லுங்க, என்ன வேணும்?',
                      style: TextStyle(fontFamily: 'NotoSansTamil', fontSize: 20, color: Color(0xFF2E5C2E), fontWeight: FontWeight.w800)),
                  ),

                  // ── Module Tiles ──────────────────────────────────────
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
                    label: 'ஊர்ல யாரை அழைக்கணும்?', sublabel: 'Local Services — Milk, Plumber & more',
                    onTap: () => _navigate(context, const ServicesScreen()),
                  ),
                  const SizedBox(height: 20),
                ],
              ),
            ),
          ),
        ],
      ),
      // No bottomNavigationBar here — MainShell provides it
    );
  }

  Widget _buildHeader(BuildContext context) {
    final topPad = MediaQuery.of(context).padding.top;
    return ClipPath(
      clipper: _HeaderCurveClipper(),
      child: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [Color(0xFF1A5217), Color(0xFF1B5E20), Color(0xFF2E7D32), Color(0xFF43A047)],
          ),
        ),
        padding: EdgeInsets.fromLTRB(16, topPad + 14, 16, 36),
        child: Row(children: [
          // Icon with double-ring effect
          Container(
            width: 46, height: 46,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              border: Border.all(color: Colors.white.withValues(alpha: 0.35), width: 2),
              color: Colors.white.withValues(alpha: 0.15),
            ),
            child: const Icon(Icons.cottage_rounded, color: Colors.white, size: 24),
          ),
          const SizedBox(width: 12),
          // Title + subtitle — FittedBox prevents overflow
          Expanded(child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              FittedBox(
                fit: BoxFit.scaleDown,
                alignment: Alignment.centerLeft,
                child: const Text(
                  'பண்ணைப்புரம்',
                  style: TextStyle(
                    fontFamily: 'NotoSansTamil',
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                    letterSpacing: 0.3,
                  ),
                  maxLines: 1,
                ),
              ),
              const SizedBox(height: 3),
              const Text(
                'உங்கள் ஊரின் தகவல் மையம்',
                style: TextStyle(
                  fontFamily: 'NotoSansTamil',
                  fontSize: 12,
                  color: Colors.white70,
                ),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
            ],
          )),
          const SizedBox(width: 8),
          // Location badge
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
            decoration: BoxDecoration(
              color: Colors.white.withValues(alpha: 0.15),
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: Colors.white.withValues(alpha: 0.2)),
            ),
            child: const Row(mainAxisSize: MainAxisSize.min, children: [
              Text('🌿', style: TextStyle(fontSize: 11)),
              SizedBox(width: 4),
              Text('தேனி', style: TextStyle(fontFamily: 'NotoSansTamil', fontSize: 11, color: Colors.white, fontWeight: FontWeight.w500)),
            ]),
          ),
        ]),
      ),
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

/// Clips the header with a gentle bottom curve
class _HeaderCurveClipper extends CustomClipper<Path> {
  @override
  Path getClip(Size size) {
    final path = Path();
    path.lineTo(0, size.height - 22);
    path.quadraticBezierTo(
      size.width * 0.5, size.height + 18,
      size.width, size.height - 22,
    );
    path.lineTo(size.width, 0);
    path.close();
    return path;
  }

  @override
  bool shouldReclip(_HeaderCurveClipper old) => false;
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
  Timer? _autoScrollTimer;
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
    if (widget.announcements.length > 1) {
      _autoScrollTimer = Timer.periodic(const Duration(seconds: 4), (_) => _autoScroll());
    }
  }

  void _autoScroll() {
    if (!mounted || !_pageController.hasClients) return;
    _pageController.animateToPage(
      (_currentPage + 1) % widget.announcements.length,
      duration: const Duration(milliseconds: 500), curve: Curves.easeInOut);
  }

  @override
  void dispose() { _autoScrollTimer?.cancel(); _pageController.dispose(); super.dispose(); }

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
          final style = _typeStyles[type] ?? _typeStyles['info'] ?? (icon: Icons.campaign_rounded, color: const Color(0xFF1565C0), bg: const Color(0xFFE3F2FD));
          return Container(
            margin: const EdgeInsets.symmetric(horizontal: 2, vertical: 4),
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
            decoration: BoxDecoration(
              color: style.bg, borderRadius: BorderRadius.circular(14),
              border: Border.all(color: style.color.withValues(alpha: 0.3)),
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
          constraints: const BoxConstraints(minHeight: 108),
          padding: const EdgeInsets.symmetric(vertical: 20, horizontal: 20),
          decoration: BoxDecoration(
            gradient: LinearGradient(begin: Alignment.topLeft, end: Alignment.bottomRight, colors: widget.gradientColors),
            borderRadius: BorderRadius.circular(22),
            boxShadow: [
              BoxShadow(color: widget.gradientColors[0].withValues(alpha: 0.40), blurRadius: 14, offset: const Offset(0, 5)),
              BoxShadow(color: widget.gradientColors[0].withValues(alpha: 0.15), blurRadius: 4, offset: const Offset(0, 1)),
            ],
          ),
          child: Stack(children: [
            // Ghost emoji watermark — warm background texture
            Positioned(right: -8, top: -10, bottom: -10, child: Center(
              child: Text(widget.emoji, style: TextStyle(fontSize: 72, color: Colors.white.withValues(alpha: 0.15))))),
            // Shine highlight — top-left glass effect
            Positioned(top: 0, left: 0, child: Container(
              width: 90, height: 40,
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topLeft, end: Alignment.bottomRight,
                  colors: [Colors.white.withValues(alpha: 0.18), Colors.white.withValues(alpha: 0.0)],
                ),
                borderRadius: const BorderRadius.only(topLeft: Radius.circular(22)),
              ),
            )),
            Row(children: [
              Container(
                width: 54, height: 54,
                decoration: BoxDecoration(
                  color: Colors.white.withValues(alpha: 0.22),
                  borderRadius: BorderRadius.circular(27),
                  border: Border.all(color: Colors.white.withValues(alpha: 0.25), width: 1.5),
                ),
                child: widget.secondIcon != null
                  ? Stack(alignment: Alignment.center, children: [
                      Positioned(top: 8, child: Icon(widget.secondIcon, color: Colors.white, size: 22)),
                      Positioned(bottom: 6, child: Icon(widget.icon, color: Colors.white70, size: 18)),
                    ])
                  : Icon(widget.icon, color: Colors.white, size: 28),
              ),
              const SizedBox(width: 14),
              Expanded(child: Column(mainAxisSize: MainAxisSize.min, crossAxisAlignment: CrossAxisAlignment.start, children: [
                Text(widget.label,
                  style: const TextStyle(fontFamily: 'NotoSansTamil', fontSize: 18, fontWeight: FontWeight.bold, color: Colors.white, height: 1.35),
                  maxLines: 2, overflow: TextOverflow.ellipsis),
                const SizedBox(height: 4),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(
                    color: Colors.black.withValues(alpha: 0.15),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Text(widget.sublabel,
                    style: const TextStyle(fontFamily: 'Roboto', fontSize: 11, color: Colors.white, letterSpacing: 0.2)),
                ),
              ])),
              const SizedBox(width: 6),
              Container(
                width: 30, height: 30,
                decoration: BoxDecoration(
                  color: Colors.white.withValues(alpha: 0.18),
                  shape: BoxShape.circle,
                ),
                child: const Icon(Icons.arrow_forward_rounded, color: Colors.white, size: 16),
              ),
            ]),
          ]),
        ),
      ),
    );
  }
}
