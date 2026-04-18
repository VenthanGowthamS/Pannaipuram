import 'package:flutter/material.dart';
import '../models/models.dart';
import '../theme/app_theme.dart';

class BusRouteScreen extends StatelessWidget {
  final String nameTamil;
  final String nameEnglish;
  final String emoji;
  final Color color;
  final String routeDesc;
  final bool isFrequent;
  final List<BusTiming> timings;

  const BusRouteScreen({
    super.key,
    required this.nameTamil,
    required this.nameEnglish,
    required this.emoji,
    required this.color,
    required this.routeDesc,
    this.isFrequent = false,
    this.timings = const [],
  });

  // ── Helpers ────────────────────────────────────────────────────────

  static int _gapMinutes(String t1, String t2) {
    int toMin(String t) {
      final p = t.split(':');
      return int.parse(p[0]) * 60 + int.parse(p[1]);
    }
    return toMin(t2) - toMin(t1);
  }

  static String _formatGap(int minutes) {
    final h = minutes ~/ 60;
    final m = minutes % 60;
    if (h > 0 && m > 0) return '$h மணி $m நிமிடம்';
    if (h > 0) return '$h மணி';
    return '$m நிமிடம்';
  }

  BusTiming? _nextBus() {
    for (final t in timings) {
      if (t.minutesFromNow() >= 0) return t;
    }
    return null;
  }

  @override
  Widget build(BuildContext context) {
    final next = isFrequent ? null : _nextBus();

    return Scaffold(
      appBar: AppBar(
        title: Text(
          nameTamil,
          style: const TextStyle(fontFamily: 'NotoSansTamil'),
        ),
        backgroundColor: color,
        actions: [
          Padding(
            padding: const EdgeInsets.only(right: 16),
            child: Text(emoji, style: const TextStyle(fontSize: 26)),
          ),
        ],
      ),
      backgroundColor: const Color(0xFFF5F5F5),
      body: ListView(
        padding: const EdgeInsets.only(bottom: 32),
        children: [
          // ── Hero tile ───────────────────────────────────────────────
          Container(
            width: double.infinity,
            margin: const EdgeInsets.fromLTRB(16, 16, 16, 4),
            padding:
                const EdgeInsets.symmetric(vertical: 22, horizontal: 20),
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [color.withValues(alpha: 0.85), color],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(20),
              boxShadow: [
                BoxShadow(
                  color: color.withValues(alpha: 0.35),
                  blurRadius: 12,
                  offset: const Offset(0, 5),
                ),
              ],
            ),
            child: Column(
              children: [
                Text(emoji, style: const TextStyle(fontSize: 42)),
                const SizedBox(height: 8),
                const Text(
                  'அண்ணே, பஸ் எத்தன மணிக்கு?',
                  style: TextStyle(
                    fontFamily: 'NotoSansTamil',
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 8),
                Text(
                  routeDesc,
                  style: const TextStyle(
                    fontFamily: 'NotoSansTamil',
                    fontSize: 13,
                    color: Colors.white70,
                  ),
                  textAlign: TextAlign.center,
                ),
              ],
            ),
          ),

          const SizedBox(height: 10),

          // ── Frequent service ────────────────────────────────────────
          if (isFrequent) ...[
            Card(
              margin:
                  const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
              color: color.withValues(alpha: 0.07),
              child: Padding(
                padding: const EdgeInsets.symmetric(
                    vertical: 24, horizontal: 20),
                child: Column(
                  children: [
                    Icon(Icons.loop_rounded, color: color, size: 44),
                    const SizedBox(height: 12),
                    Text(
                      'ஒவ்வொரு 20–30 நிமிடங்களுக்கு ஒரு பஸ்',
                      style: TextStyle(
                        fontFamily: 'NotoSansTamil',
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        color: color,
                      ),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 6),
                    const Text(
                      'Frequent Service — Every 20–30 minutes',
                      style: TextStyle(
                        fontFamily: 'Roboto',
                        fontSize: 12,
                        color: AppColors.textSecondary,
                      ),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 10),
                    Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 14, vertical: 8),
                      decoration: BoxDecoration(
                        color: color.withValues(alpha: 0.1),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: const Text(
                        'காலை முதல் இரவு வரை இயங்குகிறது',
                        style: TextStyle(
                          fontFamily: 'NotoSansTamil',
                          fontSize: 14,
                          color: AppColors.textPrimary,
                        ),
                        textAlign: TextAlign.center,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ] else ...[
            // ── Next bus card ──────────────────────────────────────────
            if (next != null)
              Card(
                margin: const EdgeInsets.symmetric(
                    horizontal: 16, vertical: 4),
                color: color.withValues(alpha: 0.08),
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Row(
                    children: [
                      Icon(Icons.access_time_rounded,
                          color: color, size: 32),
                      const SizedBox(width: 16),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text(
                              '⏱ அடுத்த பேருந்து',
                              style: TextStyle(
                                fontFamily: 'NotoSansTamil',
                                fontSize: 16,
                              ),
                            ),
                            const Text(
                              'Next bus • Pannaipuram stop',
                              style: TextStyle(
                                fontFamily: 'Roboto',
                                fontSize: 11,
                                color: AppColors.textSecondary,
                              ),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              next.displayTime,
                              style: TextStyle(
                                fontFamily: 'NotoSansTamil',
                                fontSize: 26,
                                fontWeight: FontWeight.bold,
                                color: color,
                              ),
                            ),
                          ],
                        ),
                      ),
                      Builder(builder: (_) {
                        final mins = next.minutesFromNow();
                        final h = mins ~/ 60;
                        final m = mins % 60;
                        final big = h > 0 ? '$h' : '$m';
                        final unit = h > 0
                            ? (m > 0 ? 'மணி $m நிமி' : 'மணி')
                            : 'நிமிடம்';
                        return Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 14, vertical: 8),
                          decoration: BoxDecoration(
                            color: color,
                            borderRadius: BorderRadius.circular(20),
                          ),
                          child: Column(
                            children: [
                              Text(
                                big,
                                style: const TextStyle(
                                  fontFamily: 'Roboto',
                                  color: Colors.white,
                                  fontSize: 22,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                              Text(
                                unit,
                                style: const TextStyle(
                                  fontFamily: 'NotoSansTamil',
                                  color: Colors.white,
                                  fontSize: 10,
                                ),
                              ),
                            ],
                          ),
                        );
                      }),
                    ],
                  ),
                ),
              )
            else
              Card(
                margin: const EdgeInsets.symmetric(
                    horizontal: 16, vertical: 4),
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Row(
                    children: [
                      Icon(Icons.bedtime_outlined,
                          color: Colors.grey[400], size: 32),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text(
                              'இன்று பேருந்து இல்லை',
                              style: TextStyle(
                                fontFamily: 'NotoSansTamil',
                                fontSize: 16,
                              ),
                            ),
                            Text(
                              'No more buses today • நாளை காலை வாங்க',
                              style: TextStyle(
                                fontFamily: 'NotoSansTamil',
                                fontSize: 12,
                                color: Colors.grey[500],
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ),

            const SizedBox(height: 14),

            // ── Section header ─────────────────────────────────────────
            Padding(
              padding:
                  const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    '$nameTamil பேருந்து நேர அட்டவணை',
                    style: const TextStyle(
                      fontFamily: 'NotoSansTamil',
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  const Text(
                    'பண்ணைப்புரம் நிறுத்தம்',
                    style: TextStyle(
                      fontFamily: 'Roboto',
                      fontSize: 11,
                      color: AppColors.textSecondary,
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 6),

            // ── Timetable with gap warnings ────────────────────────────
            if (timings.isEmpty)
              Card(
                margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
                child: Padding(
                  padding: const EdgeInsets.all(24),
                  child: Column(
                    children: [
                      Icon(Icons.schedule_rounded, color: Colors.grey[300], size: 48),
                      const SizedBox(height: 8),
                      const Text(
                        'நேரம் விரைவில் சேர்க்கப்படும்',
                        style: TextStyle(fontFamily: 'NotoSansTamil', fontSize: 15, color: Color(0xFF757575)),
                      ),
                      const Text(
                        'Timings will be added soon',
                        style: TextStyle(fontFamily: 'Roboto', fontSize: 12, color: Color(0xFF9E9E9E)),
                      ),
                    ],
                  ),
                ),
              ),
            if (timings.isNotEmpty)
            ...List.generate(timings.length * 2 - 1, (index) {
              if (index.isEven) {
                return _TimingCard(
                    timing: timings[index ~/ 2], color: color);
              } else {
                final t1 = timings[index ~/ 2];
                final t2 = timings[index ~/ 2 + 1];
                final gap =
                    _gapMinutes(t1.departsAt, t2.departsAt);
                if (gap > 90) {
                  return _GapWarning(gapLabel: _formatGap(gap));
                }
                return const SizedBox.shrink();
              }
            }),

            const SizedBox(height: 12),

            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Text(
                'பண்ணைப்புரம் பேருந்து நேரங்கள் — TNSTC',
                style: const TextStyle(
                  fontFamily: 'NotoSansTamil',
                  fontSize: 11,
                  color: AppColors.textSecondary,
                ),
                textAlign: TextAlign.center,
              ),
            ),
          ],

          const SizedBox(height: 24),
        ],
      ),
    );
  }
}

// ── Timing card ────────────────────────────────────────────────────────

class _TimingCard extends StatelessWidget {
  final BusTiming timing;
  final Color color;

  const _TimingCard({required this.timing, required this.color});

  @override
  Widget build(BuildContext context) {
    final isPassed = timing.minutesFromNow() < 0;
    final iconColor = timing.isLastBus
        ? AppColors.lastBusRed
        : isPassed
            ? Colors.grey[400]!
            : color;

    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 3),
      child: ListTile(
        contentPadding:
            const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
        leading: Container(
          width: 48,
          height: 48,
          decoration: BoxDecoration(
            color: iconColor.withValues(alpha: 0.1),
            borderRadius: BorderRadius.circular(8),
          ),
          child: Icon(Icons.directions_bus_rounded,
              color: iconColor, size: 24),
        ),
        title: Text(
          timing.displayTime,
          style: TextStyle(
            fontFamily: 'NotoSansTamil',
            fontSize: 22,
            fontWeight: FontWeight.bold,
            color: timing.isLastBus
                ? AppColors.lastBusRed
                : isPassed
                    ? Colors.grey[400]
                    : AppColors.textPrimary,
          ),
        ),
        trailing: Wrap(
          spacing: 4,
          alignment: WrapAlignment.end,
          children: [
            if (isPassed)
              _badge('கடந்தது', Colors.grey[300]!, Colors.grey[600]!),
            if (timing.busType == 'express')
              _badge('Express', Colors.orange, Colors.white),
            if (timing.busType == 'SETC')
              _badge('SETC', Colors.orange[800]!, Colors.white),
            if (timing.isLastBus)
              _badge('கடைசி பஸ்', AppColors.lastBusRed, Colors.white),
          ],
        ),
      ),
    );
  }

  Widget _badge(String label, Color bg, Color fg) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Text(
        label,
        style: TextStyle(
          fontFamily: 'NotoSansTamil',
          color: fg,
          fontSize: 11,
        ),
      ),
    );
  }
}

// ── Gap warning card ───────────────────────────────────────────────────

class _GapWarning extends StatelessWidget {
  final String gapLabel;

  const _GapWarning({required this.gapLabel});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 5),
      padding:
          const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: BoxDecoration(
        color: const Color(0xFFFFF3E0),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
            color: const Color(0xFFFF6F00).withValues(alpha: 0.45), width: 1),
      ),
      child: Row(
        children: [
          const Text('⚠️', style: TextStyle(fontSize: 22)),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  '$gapLabel இடைவெளி',
                  style: const TextStyle(
                    fontFamily: 'NotoSansTamil',
                    fontSize: 14,
                    fontWeight: FontWeight.bold,
                    color: Color(0xFFE65100),
                  ),
                ),
                const Text(
                  'இந்த நேரத்தில் போகாதீங்க — நீண்ட காத்திருப்பு',
                  style: TextStyle(
                    fontFamily: 'NotoSansTamil',
                    fontSize: 12,
                    color: Color(0xFFBF360C),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
