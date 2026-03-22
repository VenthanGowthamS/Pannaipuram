import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../models/models.dart';
import '../services/api_service.dart';
import 'bus_route_screen.dart';
import 'auto_screen.dart';

// ── Presentation metadata per corridor ─────────────────────────────────
// These don't change — emojis, route descriptions, local/frequent flags
// Keyed by English name (lowercase)

class _CorridorMeta {
  final String emoji;
  final String routeDesc;
  final bool isFrequent;
  final bool isLocal;

  const _CorridorMeta({
    required this.emoji,
    required this.routeDesc,
    this.isFrequent = false,
    this.isLocal = false,
  });
}

const _corridorMeta = <String, _CorridorMeta>{
  'theni': _CorridorMeta(
    emoji: '🏙️',
    routeDesc: 'பண்ணைப்புரம் → சங்கரபுரம் → தேவாரம் → தேனி',
    isFrequent: true,
    isLocal: true,
  ),
  'bodi': _CorridorMeta(
    emoji: '🌄',
    routeDesc: 'பண்ணைப்புரம் → சங்கரபுரம் → தேவாரம் → போடி',
    isFrequent: true,
    isLocal: true,
  ),
  'cumbum': _CorridorMeta(
    emoji: '🍇',
    routeDesc: 'பண்ணைப்புரம் → தேவாரம் → உத்தமபாளையம் → கம்பம்',
    isFrequent: true,
    isLocal: true,
  ),
  'chinnamanur': _CorridorMeta(
    emoji: '🛕',
    routeDesc:
        'பண்ணைப்புரம் → பல்லவராயன்பட்டி → மார்க்கையம்கோட்டை → சின்னமனூர்',
    isLocal: true,
  ),
  'madurai': _CorridorMeta(
    emoji: '🏛️',
    routeDesc: 'பண்ணைப்புரம் → தேவாரம் → மதுரை',
  ),
  'coimbatore': _CorridorMeta(
    emoji: '🏭',
    routeDesc: 'பண்ணைப்புரம் → தேவாரம் → உத்தமபாளையம் → கோயம்புத்தூர்',
  ),
  'trichy': _CorridorMeta(
    emoji: '🗼',
    routeDesc: 'பண்ணைப்புரம் → தேவாரம் → திண்டுக்கல் → திருச்சி',
  ),
  'palani': _CorridorMeta(
    emoji: '🙏',
    routeDesc: 'பண்ணைப்புரம் → தேவாரம் → உத்தமபாளையம் → பழனி',
  ),
  'kumily': _CorridorMeta(
    emoji: '🌿',
    routeDesc: 'பண்ணைப்புரம் → தேவாரம் → போடி → குமுளி',
  ),
  'dindigul': _CorridorMeta(
    emoji: '🏰',
    routeDesc: 'பண்ணைப்புரம் → தேவாரம் → திண்டுக்கல்',
  ),
  'gudalur (koodalur)': _CorridorMeta(
    emoji: '🌲',
    routeDesc: 'பண்ணைப்புரம் → கம்பம் → கூடலூர்',
    isLocal: true,
  ),
  'mettupalayam': _CorridorMeta(
    emoji: '🏘️',
    routeDesc: 'பண்ணைப்புரம் → மேட்டுப்பாளையம்',
    isLocal: true,
  ),
  'suruli theertham': _CorridorMeta(
    emoji: '💧',
    routeDesc: 'பண்ணைப்புரம் → தேவாரம் → சுருளி தீர்த்தம்',
    isLocal: true,
  ),
  'thevaram': _CorridorMeta(
    emoji: '🛤️',
    routeDesc: 'பண்ணைப்புரம் → தேவாரம்',
    isFrequent: false,
    isLocal: true,
  ),
};

// ── Private data class for a bus route ────────────────────────────────

class _BusRoute {
  final String nameTamil;
  final String nameEnglish;
  final String emoji;
  final Color color;
  final String routeDesc;
  final bool isFrequent;
  final List<BusTiming> timings;

  const _BusRoute({
    required this.nameTamil,
    required this.nameEnglish,
    required this.emoji,
    required this.color,
    required this.routeDesc,
    this.isFrequent = false,
    this.timings = const [],
  });
}

// ── Bus screen — StatefulWidget with API + offline fallback ───────────

class BusScreen extends StatefulWidget {
  const BusScreen({super.key});

  @override
  State<BusScreen> createState() => _BusScreenState();
}

class _BusScreenState extends State<BusScreen> {
  // These start with hardcoded fallback data, updated if API succeeds
  List<_BusRoute>? _apiLocal;
  List<_BusRoute>? _apiLongDistance;
  String? _dataSource; // 'api' or null (fallback)
  Timer? _countdownTimer;

  List<_BusRoute> get _local => _apiLocal ?? _fallbackLocal;
  List<_BusRoute> get _longDistance => _apiLongDistance ?? _fallbackLongDistance;

  @override
  void initState() {
    super.initState();
    _fetchFromApi();
    // Live countdown: rebuild every 60s so "X நிமிடம்" stays accurate
    _countdownTimer = Timer.periodic(const Duration(minutes: 1), (_) {
      if (mounted) setState(() {});
    });
  }

  @override
  void dispose() {
    _countdownTimer?.cancel();
    super.dispose();
  }

  Future<void> _fetchFromApi() async {
    try {
      final corridors = await ApiService.getBusCorridors();
      if (corridors.isEmpty) return;

      // Fetch all timings in parallel for speed
      final timingsFutures =
          corridors.map((c) => ApiService.getBusTimings(c.id)).toList();
      final allTimings = await Future.wait(timingsFutures);

      final local = <_BusRoute>[];
      final longDist = <_BusRoute>[];

      for (int i = 0; i < corridors.length; i++) {
        final c = corridors[i];
        final timings = allTimings[i];
        final meta = _corridorMeta[c.nameEnglish.toLowerCase()];
        final route = _BusRoute(
          nameTamil: c.nameTamil,
          nameEnglish: c.nameEnglish,
          emoji: meta?.emoji ?? '🚌',
          color: c.color,
          routeDesc:
              meta?.routeDesc ?? 'பண்ணைப்புரம் → ${c.nameTamil}',
          isFrequent: meta?.isFrequent ?? false,
          timings: timings,
        );
        if (meta?.isLocal ?? false) {
          local.add(route);
        } else {
          longDist.add(route);
        }
      }

      if (!mounted) return;
      setState(() {
        _apiLocal = local;
        _apiLongDistance = longDist;
        _dataSource = 'api';
      });
    } catch (_) {
      // API failed — keep using hardcoded fallback data (already displayed)
    }
  }

  // ── Navigation ─────────────────────────────────────────────────────

  void _goTo(BuildContext context, _BusRoute r) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) => BusRouteScreen(
          nameTamil: r.nameTamil,
          nameEnglish: r.nameEnglish,
          emoji: r.emoji,
          color: r.color,
          routeDesc: r.routeDesc,
          isFrequent: r.isFrequent,
          timings: r.timings,
        ),
      ),
    );
  }

  // ── Next bus helper ────────────────────────────────────────────────

  static BusTiming? _nextBusFor(List<BusTiming> timings) {
    for (final t in timings) {
      if (t.minutesFromNow() >= 0) return t;
    }
    return null;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF2F3F7),
      body: RefreshIndicator(
        onRefresh: _fetchFromApi,
        color: const Color(0xFF1A237E),
        strokeWidth: 2.5,
        child: CustomScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        slivers: [
          // ── Sticky gradient app bar ──────────────────────────────
          SliverAppBar(
            expandedHeight: 155,
            pinned: true,
            backgroundColor: const Color(0xFF1A237E),
            leading: IconButton(
              icon: const Icon(Icons.arrow_back_rounded, color: Colors.white),
              onPressed: () => Navigator.pop(context),
            ),
            flexibleSpace: FlexibleSpaceBar(
              background: Container(
                decoration: const BoxDecoration(
                  gradient: LinearGradient(
                    colors: [Color(0xFF1A237E), Color(0xFF283593)],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                ),
                child: SafeArea(
                  child: Padding(
                    padding: const EdgeInsets.fromLTRB(20, 48, 20, 0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'எங்கிட்டு போகணும்?',
                          style: TextStyle(
                            fontFamily: 'NotoSansTamil',
                            fontSize: 22,
                            fontWeight: FontWeight.bold,
                            color: Colors.white,
                          ),
                        ),
                        const SizedBox(height: 4),
                        const Text(
                          'Where do you want to go?',
                          style: TextStyle(
                            fontFamily: 'Roboto',
                            fontSize: 13,
                            color: Colors.white60,
                          ),
                        ),
                        const SizedBox(height: 10),
                        Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 12, vertical: 6),
                          decoration: BoxDecoration(
                            color: Colors.white.withOpacity(0.12),
                            borderRadius: BorderRadius.circular(20),
                          ),
                          child: const Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Icon(Icons.location_on_rounded,
                                  color: Colors.orange, size: 14),
                              SizedBox(width: 4),
                              Text(
                                'பண்ணைப்புரம் நிறுத்தம்',
                                style: TextStyle(
                                  fontFamily: 'NotoSansTamil',
                                  fontSize: 13,
                                  color: Colors.white,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ),
          ),

          SliverToBoxAdapter(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const SizedBox(height: 16),

                // ── Local section ──────────────────────────────────
                _SectionChip(
                    icon: Icons.home_rounded,
                    label: 'உள்ளூர் பயணம்',
                    sublabel: 'Local Routes'),
                const SizedBox(height: 8),
                ..._local.map((r) => _RouteCard(
                      route: r,
                      nextBus: r.isFrequent
                          ? null
                          : _nextBusFor(r.timings),
                      onTap: () => _goTo(context, r),
                    )),

                const SizedBox(height: 20),

                // ── Long distance section ──────────────────────────
                _SectionChip(
                    icon: Icons.map_rounded,
                    label: 'தூர பயணம்',
                    sublabel: 'Long Distance'),
                const SizedBox(height: 8),
                ..._longDistance.map((r) => _RouteCard(
                      route: r,
                      nextBus: _nextBusFor(r.timings),
                      onTap: () => _goTo(context, r),
                    )),

                const SizedBox(height: 20),

                // ── Auto section ───────────────────────────────────
                _SectionChip(
                    icon: Icons.local_taxi_rounded,
                    label: 'வாடகை வண்டி',
                    sublabel: 'Auto & Car'),
                const SizedBox(height: 8),
                _AutoCard(
                  onTap: () => Navigator.push(
                    context,
                    MaterialPageRoute(
                        builder: (_) => const AutoScreen()),
                  ),
                ),

                const SizedBox(height: 12),
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  child: Center(
                    child: Text(
                      _dataSource == 'api'
                          ? 'Live data from server'
                          : 'பண்ணைப்புரம் பேருந்து நேரங்கள் — TNSTC',
                      style: const TextStyle(
                          fontFamily: 'Roboto',
                          fontSize: 11,
                          color: Color(0xFFBDBDBD)),
                      textAlign: TextAlign.center,
                    ),
                  ),
                ),
                const SizedBox(height: 28),
              ],
            ),
          ),
        ],
      ),
     ), // RefreshIndicator
    );
  }

  // ═══════════════════════════════════════════════════════════════════════
  //  Hardcoded fallback data — used when API is unreachable (offline mode)
  //  Source: Thevaram Bus Stand (TNSTC, Feb 2026)
  //  All times = Thevaram times + 10 min for Pannaipuram stop
  // ═══════════════════════════════════════════════════════════════════════

  static final _fallbackLocal = <_BusRoute>[
    _BusRoute(
      nameTamil: 'தேனி',
      nameEnglish: 'Theni',
      emoji: '🏙️',
      color: const Color(0xFF1565C0),
      routeDesc: 'பண்ணைப்புரம் → சங்கரபுரம் → தேவாரம் → தேனி',
      isFrequent: true,
    ),
    _BusRoute(
      nameTamil: 'போடி',
      nameEnglish: 'Bodi',
      emoji: '🌄',
      color: const Color(0xFF0288D1),
      routeDesc: 'பண்ணைப்புரம் → சங்கரபுரம் → தேவாரம் → போடி',
      isFrequent: true,
    ),
    _BusRoute(
      nameTamil: 'கம்பம்',
      nameEnglish: 'Cumbum',
      emoji: '🍇',
      color: const Color(0xFF388E3C),
      routeDesc: 'பண்ணைப்புரம் → தேவாரம் → உத்தமபாளையம் → கம்பம்',
      isFrequent: true,
    ),
    _BusRoute(
      nameTamil: 'சின்னமனூர்',
      nameEnglish: 'Chinnamanur',
      emoji: '🛕',
      color: const Color(0xFFFF6F00),
      routeDesc:
          'பண்ணைப்புரம் → பல்லவராயன்பட்டி → மார்க்கையம்கோட்டை → சின்னமனூர்',
      timings: [
        BusTiming(id: 16, departsAt: '10:25:00', daysOfWeek: 'daily', busType: 'ordinary', isLastBus: false),
        BusTiming(id: 17, departsAt: '12:30:00', daysOfWeek: 'daily', busType: 'ordinary', isLastBus: false),
        BusTiming(id: 18, departsAt: '16:20:00', daysOfWeek: 'daily', busType: 'ordinary', isLastBus: false),
        BusTiming(id: 19, departsAt: '18:10:00', daysOfWeek: 'daily', busType: 'ordinary', isLastBus: true),
      ],
    ),
  ];

  static final _fallbackLongDistance = <_BusRoute>[
    _BusRoute(
      nameTamil: 'மதுரை',
      nameEnglish: 'Madurai',
      emoji: '🏛️',
      color: const Color(0xFF6A1B9A),
      routeDesc: 'பண்ணைப்புரம் → தேவாரம் → மதுரை',
      timings: [
        BusTiming(id: 101, departsAt: '04:25:00', daysOfWeek: 'daily', busType: 'ordinary', isLastBus: false),
        BusTiming(id: 102, departsAt: '06:00:00', daysOfWeek: 'daily', busType: 'express', isLastBus: false),
        BusTiming(id: 103, departsAt: '06:40:00', daysOfWeek: 'daily', busType: 'ordinary', isLastBus: false),
        BusTiming(id: 104, departsAt: '09:40:00', daysOfWeek: 'daily', busType: 'ordinary', isLastBus: false),
        BusTiming(id: 105, departsAt: '14:55:00', daysOfWeek: 'daily', busType: 'ordinary', isLastBus: false),
        BusTiming(id: 106, departsAt: '15:40:00', daysOfWeek: 'daily', busType: 'express', isLastBus: false),
        BusTiming(id: 107, departsAt: '16:30:00', daysOfWeek: 'daily', busType: 'ordinary', isLastBus: true),
      ],
    ),
    _BusRoute(
      nameTamil: 'கோயம்புத்தூர்',
      nameEnglish: 'Coimbatore',
      emoji: '🏭',
      color: const Color(0xFF00695C),
      routeDesc: 'பண்ணைப்புரம் → தேவாரம் → உத்தமபாளையம் → கோயம்புத்தூர்',
      timings: [
        BusTiming(id: 111, departsAt: '05:10:00', daysOfWeek: 'daily', busType: 'express', isLastBus: false),
        BusTiming(id: 112, departsAt: '09:30:00', daysOfWeek: 'daily', busType: 'ordinary', isLastBus: false),
        BusTiming(id: 113, departsAt: '11:30:00', daysOfWeek: 'daily', busType: 'ordinary', isLastBus: false),
        BusTiming(id: 114, departsAt: '20:50:00', daysOfWeek: 'daily', busType: 'express', isLastBus: true),
      ],
    ),
    _BusRoute(
      nameTamil: 'திருச்சி',
      nameEnglish: 'Trichy',
      emoji: '🗼',
      color: const Color(0xFFC62828),
      routeDesc: 'பண்ணைப்புரம் → தேவாரம் → திண்டுக்கல் → திருச்சி',
      timings: [
        BusTiming(id: 121, departsAt: '05:50:00', daysOfWeek: 'daily', busType: 'express', isLastBus: false),
        BusTiming(id: 122, departsAt: '15:10:00', daysOfWeek: 'daily', busType: 'ordinary', isLastBus: false),
        BusTiming(id: 123, departsAt: '19:30:00', daysOfWeek: 'daily', busType: 'ordinary', isLastBus: true),
      ],
    ),
    _BusRoute(
      nameTamil: 'பழனி',
      nameEnglish: 'Palani',
      emoji: '🙏',
      color: const Color(0xFFE65100),
      routeDesc: 'பண்ணைப்புரம் → தேவாரம் → உத்தமபாளையம் → பழனி',
      timings: [
        BusTiming(id: 131, departsAt: '05:20:00', daysOfWeek: 'daily', busType: 'ordinary', isLastBus: false),
        BusTiming(id: 132, departsAt: '06:10:00', daysOfWeek: 'daily', busType: 'ordinary', isLastBus: false),
        BusTiming(id: 133, departsAt: '06:25:00', daysOfWeek: 'daily', busType: 'express', isLastBus: false),
        BusTiming(id: 134, departsAt: '09:25:00', daysOfWeek: 'daily', busType: 'ordinary', isLastBus: false),
        BusTiming(id: 135, departsAt: '11:25:00', daysOfWeek: 'daily', busType: 'ordinary', isLastBus: false),
        BusTiming(id: 136, departsAt: '16:20:00', daysOfWeek: 'daily', busType: 'ordinary', isLastBus: true),
      ],
    ),
    _BusRoute(
      nameTamil: 'குமுளி',
      nameEnglish: 'Kumily',
      emoji: '🌿',
      color: const Color(0xFF2E7D32),
      routeDesc: 'பண்ணைப்புரம் → தேவாரம் → போடி → குமுளி',
      timings: [
        BusTiming(id: 141, departsAt: '03:40:00', daysOfWeek: 'daily', busType: 'ordinary', isLastBus: false),
        BusTiming(id: 142, departsAt: '05:00:00', daysOfWeek: 'daily', busType: 'ordinary', isLastBus: false),
        BusTiming(id: 143, departsAt: '05:40:00', daysOfWeek: 'daily', busType: 'express', isLastBus: false),
        BusTiming(id: 144, departsAt: '08:40:00', daysOfWeek: 'daily', busType: 'ordinary', isLastBus: false),
        BusTiming(id: 145, departsAt: '12:00:00', daysOfWeek: 'daily', busType: 'ordinary', isLastBus: false),
        BusTiming(id: 146, departsAt: '14:00:00', daysOfWeek: 'daily', busType: 'ordinary', isLastBus: false),
        BusTiming(id: 147, departsAt: '14:30:00', daysOfWeek: 'daily', busType: 'express', isLastBus: true),
      ],
    ),
    _BusRoute(
      nameTamil: 'திண்டுக்கல்',
      nameEnglish: 'Dindigul',
      emoji: '🏰',
      color: const Color(0xFF4E342E),
      routeDesc: 'பண்ணைப்புரம் → தேவாரம் → திண்டுக்கல்',
      timings: [
        BusTiming(id: 151, departsAt: '06:30:00', daysOfWeek: 'daily', busType: 'ordinary', isLastBus: false),
        BusTiming(id: 152, departsAt: '09:10:00', daysOfWeek: 'daily', busType: 'ordinary', isLastBus: false),
        BusTiming(id: 153, departsAt: '15:00:00', daysOfWeek: 'daily', busType: 'ordinary', isLastBus: false),
        BusTiming(id: 154, departsAt: '15:40:00', daysOfWeek: 'daily', busType: 'express', isLastBus: false),
        BusTiming(id: 155, departsAt: '16:40:00', daysOfWeek: 'daily', busType: 'ordinary', isLastBus: false),
        BusTiming(id: 156, departsAt: '17:30:00', daysOfWeek: 'daily', busType: 'ordinary', isLastBus: true),
      ],
    ),
  ];
}

// ── Section chip ──────────────────────────────────────────────────────

class _SectionChip extends StatelessWidget {
  final IconData icon;
  final String label;
  final String sublabel;

  const _SectionChip(
      {required this.icon, required this.label, required this.sublabel});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Row(
        children: [
          Container(
            padding:
                const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
            decoration: BoxDecoration(
              color: const Color(0xFF1A237E).withOpacity(0.08),
              borderRadius: BorderRadius.circular(20),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(icon, size: 15, color: const Color(0xFF1A237E)),
                const SizedBox(width: 6),
                Text(
                  label,
                  style: const TextStyle(
                    fontFamily: 'NotoSansTamil',
                    fontSize: 14,
                    fontWeight: FontWeight.w700,
                    color: Color(0xFF1A237E),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(width: 8),
          Text(
            sublabel,
            style: const TextStyle(
              fontFamily: 'Roboto',
              fontSize: 12,
              color: Color(0xFF9E9E9E),
            ),
          ),
        ],
      ),
    );
  }
}

// ── Route card ────────────────────────────────────────────────────────

class _RouteCard extends StatelessWidget {
  final _BusRoute route;
  final BusTiming? nextBus;
  final VoidCallback onTap;

  const _RouteCard(
      {required this.route, required this.nextBus, required this.onTap});

  @override
  Widget build(BuildContext context) {
    final bool noMoreBuses =
        !route.isFrequent && route.timings.isNotEmpty && nextBus == null;

    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 0, 16, 10),
      child: Material(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        elevation: 0,
        child: InkWell(
          onTap: () {
            HapticFeedback.lightImpact();
            onTap();
          },
          borderRadius: BorderRadius.circular(16),
          child: Container(
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: const Color(0xFFEEEEEE), width: 1),
            ),
            child: IntrinsicHeight(
              child: Row(
                children: [
                  // ── Coloured left rail ────────────────────────
                  Container(
                    width: 5,
                    decoration: BoxDecoration(
                      color: noMoreBuses
                          ? Colors.grey[300]
                          : route.color,
                      borderRadius: const BorderRadius.only(
                        topLeft: Radius.circular(16),
                        bottomLeft: Radius.circular(16),
                      ),
                    ),
                  ),

                  const SizedBox(width: 12),

                  // ── Emoji circle ──────────────────────────────
                  Container(
                    width: 46,
                    height: 46,
                    decoration: BoxDecoration(
                      color: (noMoreBuses
                              ? Colors.grey
                              : route.color)
                          .withOpacity(0.1),
                      shape: BoxShape.circle,
                    ),
                    child: Center(
                      child: Text(route.emoji,
                          style: const TextStyle(fontSize: 22)),
                    ),
                  ),

                  const SizedBox(width: 12),

                  // ── Destination + route path ──────────────────
                  Expanded(
                    child: Padding(
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Text(
                            route.nameTamil,
                            style: TextStyle(
                              fontFamily: 'NotoSansTamil',
                              fontSize: 18,
                              fontWeight: FontWeight.bold,
                              color: noMoreBuses
                                  ? Colors.grey[400]
                                  : const Color(0xFF1A1A1A),
                            ),
                          ),
                          Text(
                            route.nameEnglish,
                            style: const TextStyle(
                              fontFamily: 'Roboto',
                              fontSize: 11,
                              color: Color(0xFF9E9E9E),
                            ),
                          ),
                          const SizedBox(height: 4),
                          Row(
                            children: [
                              Icon(Icons.directions_bus_rounded,
                                  size: 11, color: Colors.grey[400]),
                              const SizedBox(width: 3),
                              Text(
                                route.isFrequent
                                    ? 'Frequent service'
                                    : '${route.timings.length} buses/day',
                                style: TextStyle(
                                  fontFamily: 'Roboto',
                                  fontSize: 11,
                                  color: Colors.grey[400],
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ),

                  // ── Next bus / status ─────────────────────────
                  Padding(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 14, vertical: 14),
                    child: route.isFrequent
                        ? _FrequentBadge(color: route.color)
                        : noMoreBuses
                            ? _DoneBadge()
                            : route.timings.isEmpty
                                ? _NoDataBadge()
                                : _NextBusBadge(
                                    nextBus: nextBus!, color: route.color),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}

// ── Frequent badge ────────────────────────────────────────────────────

class _FrequentBadge extends StatelessWidget {
  final Color color;
  const _FrequentBadge({required this.color});

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      crossAxisAlignment: CrossAxisAlignment.end,
      children: [
        Icon(Icons.loop_rounded, color: color, size: 22),
        const SizedBox(height: 4),
        Text(
          '20–30',
          style: TextStyle(
              fontFamily: 'Roboto',
              fontSize: 16,
              fontWeight: FontWeight.bold,
              color: color),
        ),
        Text(
          'நிமிடம்',
          style: TextStyle(
              fontFamily: 'NotoSansTamil',
              fontSize: 10,
              color: color.withOpacity(0.7)),
        ),
      ],
    );
  }
}

// ── Next bus badge ────────────────────────────────────────────────────

class _NextBusBadge extends StatelessWidget {
  final BusTiming nextBus;
  final Color color;
  const _NextBusBadge({required this.nextBus, required this.color});

  @override
  Widget build(BuildContext context) {
    final mins = nextBus.minutesFromNow();
    final Color pillColor = mins <= 10
        ? const Color(0xFFD32F2F)
        : mins <= 40
            ? const Color(0xFF2E7D32)
            : const Color(0xFF757575);

    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      crossAxisAlignment: CrossAxisAlignment.end,
      children: [
        Text(
          nextBus.displayTime,
          style: TextStyle(
            fontFamily: 'NotoSansTamil',
            fontSize: 16,
            fontWeight: FontWeight.bold,
            color: color,
          ),
        ),
        const SizedBox(height: 4),
        Container(
          padding:
              const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
          decoration: BoxDecoration(
            color: pillColor,
            borderRadius: BorderRadius.circular(12),
          ),
          child: Text(
            mins >= 60
                ? '${mins ~/ 60} மணி ${mins % 60} நிமி'
                : '$mins நிமிடம்',
            style: const TextStyle(
              fontFamily: 'NotoSansTamil',
              color: Colors.white,
              fontSize: 11,
              fontWeight: FontWeight.bold,
            ),
          ),
        ),
      ],
    );
  }
}

// ── Done badge ────────────────────────────────────────────────────────

class _DoneBadge extends StatelessWidget {
  const _DoneBadge();

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      crossAxisAlignment: CrossAxisAlignment.end,
      children: [
        Icon(Icons.bedtime_rounded, color: Colors.grey[300], size: 22),
        const SizedBox(height: 4),
        Text(
          'இன்று',
          style: TextStyle(
              fontFamily: 'NotoSansTamil',
              fontSize: 12,
              color: Colors.grey[400]),
        ),
        Text(
          'முடிந்தது',
          style: TextStyle(
              fontFamily: 'NotoSansTamil',
              fontSize: 12,
              color: Colors.grey[400]),
        ),
      ],
    );
  }
}

// ── No data badge (API corridor with no timings yet) ──────────────────

class _NoDataBadge extends StatelessWidget {
  const _NoDataBadge();

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      crossAxisAlignment: CrossAxisAlignment.end,
      children: [
        Icon(Icons.schedule_rounded, color: Colors.grey[300], size: 22),
        const SizedBox(height: 4),
        Text(
          'விரைவில்',
          style: TextStyle(
              fontFamily: 'NotoSansTamil',
              fontSize: 12,
              color: Colors.grey[400]),
        ),
      ],
    );
  }
}

// ── Auto card ─────────────────────────────────────────────────────────

class _AutoCard extends StatelessWidget {
  final VoidCallback onTap;
  const _AutoCard({required this.onTap});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: () {
            HapticFeedback.lightImpact();
            onTap();
          },
          borderRadius: BorderRadius.circular(16),
          child: Container(
            padding:
                const EdgeInsets.symmetric(vertical: 18, horizontal: 20),
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [Color(0xFF4A148C), Color(0xFF7B1FA2)],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(16),
            ),
            child: Row(
              children: [
                Container(
                  width: 50,
                  height: 50,
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.15),
                    shape: BoxShape.circle,
                  ),
                  child: const Center(
                    child: Text('🚗', style: TextStyle(fontSize: 26)),
                  ),
                ),
                const SizedBox(width: 16),
                const Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'ஆட்டோ / வண்டி வேணுமா?',
                        style: TextStyle(
                          fontFamily: 'NotoSansTamil',
                          fontSize: 17,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                        ),
                      ),
                      SizedBox(height: 2),
                      Text(
                        'Local auto & shared van contacts',
                        style: TextStyle(
                          fontFamily: 'Roboto',
                          fontSize: 12,
                          color: Colors.white60,
                        ),
                      ),
                    ],
                  ),
                ),
                const Icon(Icons.arrow_forward_ios_rounded,
                    color: Colors.white54, size: 18),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
