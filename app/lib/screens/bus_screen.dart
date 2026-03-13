import 'package:flutter/material.dart';
import '../models/models.dart';
import 'bus_route_screen.dart';
import 'auto_screen.dart';

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

// ── Bus screen — tile landing page ────────────────────────────────────

class BusScreen extends StatelessWidget {
  const BusScreen({super.key});

  // ── Local routes ──────────────────────────────────────────────────
  // Source: Thevaram Bus Stand (TNSTC, tickettogetlost.com, Feb 2026)
  // Pannaipuram is 4.4 km from Thevaram (~10 min by bus)
  // All times shown are Pannaipuram stop times (Thevaram times + 10 min)

  static final List<_BusRoute> _local = [
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
        // Thevaram times: 10:15, 12:20, 16:10, 18:00
        // Pannaipuram (+10 min): 10:25, 12:30, 16:20, 18:10
        BusTiming(
            id: 16,
            departsAt: '10:25:00',
            daysOfWeek: 'daily',
            busType: 'ordinary',
            isLastBus: false),
        BusTiming(
            id: 17,
            departsAt: '12:30:00',
            daysOfWeek: 'daily',
            busType: 'ordinary',
            isLastBus: false),
        BusTiming(
            id: 18,
            departsAt: '16:20:00',
            daysOfWeek: 'daily',
            busType: 'ordinary',
            isLastBus: false),
        BusTiming(
            id: 19,
            departsAt: '18:10:00',
            daysOfWeek: 'daily',
            busType: 'ordinary',
            isLastBus: true),
      ],
    ),
  ];

  // ── Long-distance routes ───────────────────────────────────────────
  // Source: Thevaram Bus Stand searches (Feb 2026) + 10 min for Pannaipuram

  static final List<_BusRoute> _longDistance = [
    _BusRoute(
      nameTamil: 'மதுரை',
      nameEnglish: 'Madurai',
      emoji: '🏛️',
      color: const Color(0xFF6A1B9A),
      routeDesc: 'பண்ணைப்புரம் → தேவாரம் → மதுரை',
      timings: [
        BusTiming(
            id: 101,
            departsAt: '04:25:00',
            daysOfWeek: 'daily',
            busType: 'ordinary',
            isLastBus: false),
        BusTiming(
            id: 102,
            departsAt: '06:00:00',
            daysOfWeek: 'daily',
            busType: 'express',
            isLastBus: false),
        BusTiming(
            id: 103,
            departsAt: '06:40:00',
            daysOfWeek: 'daily',
            busType: 'ordinary',
            isLastBus: false),
        BusTiming(
            id: 104,
            departsAt: '09:40:00',
            daysOfWeek: 'daily',
            busType: 'ordinary',
            isLastBus: false),
        BusTiming(
            id: 105,
            departsAt: '14:55:00',
            daysOfWeek: 'daily',
            busType: 'ordinary',
            isLastBus: false),
        BusTiming(
            id: 106,
            departsAt: '15:40:00',
            daysOfWeek: 'daily',
            busType: 'express',
            isLastBus: false),
        BusTiming(
            id: 107,
            departsAt: '16:30:00',
            daysOfWeek: 'daily',
            busType: 'ordinary',
            isLastBus: true),
      ],
    ),
    _BusRoute(
      nameTamil: 'கோயம்புத்தூர்',
      nameEnglish: 'Coimbatore',
      emoji: '🏭',
      color: const Color(0xFF00695C),
      routeDesc:
          'பண்ணைப்புரம் → தேவாரம் → உத்தமபாளையம் → கோயம்புத்தூர்',
      timings: [
        BusTiming(
            id: 111,
            departsAt: '05:10:00',
            daysOfWeek: 'daily',
            busType: 'express',
            isLastBus: false),
        BusTiming(
            id: 112,
            departsAt: '09:30:00',
            daysOfWeek: 'daily',
            busType: 'ordinary',
            isLastBus: false),
        BusTiming(
            id: 113,
            departsAt: '11:30:00',
            daysOfWeek: 'daily',
            busType: 'ordinary',
            isLastBus: false),
        BusTiming(
            id: 114,
            departsAt: '20:50:00',
            daysOfWeek: 'daily',
            busType: 'express',
            isLastBus: true),
      ],
    ),
    _BusRoute(
      nameTamil: 'திருச்சி',
      nameEnglish: 'Trichy',
      emoji: '🗼',
      color: const Color(0xFFC62828),
      routeDesc: 'பண்ணைப்புரம் → தேவாரம் → திண்டுக்கல் → திருச்சி',
      timings: [
        BusTiming(
            id: 121,
            departsAt: '05:50:00',
            daysOfWeek: 'daily',
            busType: 'express',
            isLastBus: false),
        BusTiming(
            id: 122,
            departsAt: '15:10:00',
            daysOfWeek: 'daily',
            busType: 'ordinary',
            isLastBus: false),
        BusTiming(
            id: 123,
            departsAt: '19:30:00',
            daysOfWeek: 'daily',
            busType: 'ordinary',
            isLastBus: true),
      ],
    ),
    _BusRoute(
      nameTamil: 'பழனி',
      nameEnglish: 'Palani',
      emoji: '🙏',
      color: const Color(0xFFE65100),
      routeDesc:
          'பண்ணைப்புரம் → தேவாரம் → உத்தமபாளையம் → பழனி',
      timings: [
        BusTiming(
            id: 131,
            departsAt: '05:20:00',
            daysOfWeek: 'daily',
            busType: 'ordinary',
            isLastBus: false),
        BusTiming(
            id: 132,
            departsAt: '06:10:00',
            daysOfWeek: 'daily',
            busType: 'ordinary',
            isLastBus: false),
        BusTiming(
            id: 133,
            departsAt: '06:25:00',
            daysOfWeek: 'daily',
            busType: 'express',
            isLastBus: false),
        BusTiming(
            id: 134,
            departsAt: '09:25:00',
            daysOfWeek: 'daily',
            busType: 'ordinary',
            isLastBus: false),
        BusTiming(
            id: 135,
            departsAt: '11:25:00',
            daysOfWeek: 'daily',
            busType: 'ordinary',
            isLastBus: false),
        BusTiming(
            id: 136,
            departsAt: '16:20:00',
            daysOfWeek: 'daily',
            busType: 'ordinary',
            isLastBus: true),
      ],
    ),
    _BusRoute(
      nameTamil: 'குமுளி',
      nameEnglish: 'Kumily',
      emoji: '🌿',
      color: const Color(0xFF2E7D32),
      routeDesc: 'பண்ணைப்புரம் → தேவாரம் → போடி → குமுளி',
      timings: [
        BusTiming(
            id: 141,
            departsAt: '03:40:00',
            daysOfWeek: 'daily',
            busType: 'ordinary',
            isLastBus: false),
        BusTiming(
            id: 142,
            departsAt: '05:00:00',
            daysOfWeek: 'daily',
            busType: 'ordinary',
            isLastBus: false),
        BusTiming(
            id: 143,
            departsAt: '05:40:00',
            daysOfWeek: 'daily',
            busType: 'express',
            isLastBus: false),
        BusTiming(
            id: 144,
            departsAt: '08:40:00',
            daysOfWeek: 'daily',
            busType: 'ordinary',
            isLastBus: false),
        BusTiming(
            id: 145,
            departsAt: '12:00:00',
            daysOfWeek: 'daily',
            busType: 'ordinary',
            isLastBus: false),
        BusTiming(
            id: 146,
            departsAt: '14:00:00',
            daysOfWeek: 'daily',
            busType: 'ordinary',
            isLastBus: false),
        BusTiming(
            id: 147,
            departsAt: '14:30:00',
            daysOfWeek: 'daily',
            busType: 'express',
            isLastBus: true),
      ],
    ),
    _BusRoute(
      nameTamil: 'திண்டுக்கல்',
      nameEnglish: 'Dindigul',
      emoji: '🏰',
      color: const Color(0xFF4E342E),
      routeDesc: 'பண்ணைப்புரம் → தேவாரம் → திண்டுக்கல்',
      timings: [
        BusTiming(
            id: 151,
            departsAt: '06:30:00',
            daysOfWeek: 'daily',
            busType: 'ordinary',
            isLastBus: false),
        BusTiming(
            id: 152,
            departsAt: '09:10:00',
            daysOfWeek: 'daily',
            busType: 'ordinary',
            isLastBus: false),
        BusTiming(
            id: 153,
            departsAt: '15:00:00',
            daysOfWeek: 'daily',
            busType: 'ordinary',
            isLastBus: false),
        BusTiming(
            id: 154,
            departsAt: '15:40:00',
            daysOfWeek: 'daily',
            busType: 'express',
            isLastBus: false),
        BusTiming(
            id: 155,
            departsAt: '16:40:00',
            daysOfWeek: 'daily',
            busType: 'ordinary',
            isLastBus: false),
        BusTiming(
            id: 156,
            departsAt: '17:30:00',
            daysOfWeek: 'daily',
            busType: 'ordinary',
            isLastBus: true),
      ],
    ),
  ];

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
      body: CustomScrollView(
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
                const Padding(
                  padding: EdgeInsets.symmetric(horizontal: 16),
                  child: Center(
                    child: Text(
                      'Source: Thevaram Bus Stand (TNSTC, Feb 2026)\nPannaipuram stop = Thevaram +10 min',
                      style: TextStyle(
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
    );
  }
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
          onTap: onTap,
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
            '$mins நிமிடம்',
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
          onTap: onTap,
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
