import 'package:flutter/material.dart';
import '../models/models.dart';
import '../services/api_service.dart';
import '../theme/app_theme.dart';
import '../widgets/offline_banner.dart';

class BusScreen extends StatefulWidget {
  const BusScreen({super.key});

  @override
  State<BusScreen> createState() => _BusScreenState();
}

class _BusScreenState extends State<BusScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  List<BusCorridor> _corridors = [];
  final Map<int, List<BusTiming>> _timings = {};
  bool _loading = true;
  bool _offline = false;

  // Fallback offline bus data (Bodi side sample — admin fills real data)
  static final List<BusCorridor> _fallbackCorridors = [
    const BusCorridor(
      id: 1,
      nameTamil: 'போடி பக்கம்',
      nameEnglish: 'Towards Bodi',
      colorHex: '#2196F3',
    ),
    const BusCorridor(
      id: 2,
      nameTamil: 'கம்பம் பக்கம்',
      nameEnglish: 'Towards Kamban',
      colorHex: '#4CAF50',
    ),
  ];

  static final Map<int, List<BusTiming>> _fallbackTimings = {
    1: [
      BusTiming(id: 1, departsAt: '05:30:00', daysOfWeek: 'daily', busType: 'ordinary', isLastBus: false),
      BusTiming(id: 2, departsAt: '07:45:00', daysOfWeek: 'daily', busType: 'ordinary', isLastBus: false),
      BusTiming(id: 3, departsAt: '09:00:00', daysOfWeek: 'daily', busType: 'express', isLastBus: false),
      BusTiming(id: 4, departsAt: '11:30:00', daysOfWeek: 'daily', busType: 'ordinary', isLastBus: false),
      BusTiming(id: 5, departsAt: '14:00:00', daysOfWeek: 'daily', busType: 'ordinary', isLastBus: false),
      BusTiming(id: 6, departsAt: '17:30:00', daysOfWeek: 'daily', busType: 'ordinary', isLastBus: false),
      BusTiming(id: 7, departsAt: '20:00:00', daysOfWeek: 'daily', busType: 'ordinary', isLastBus: true),
    ],
    2: [
      BusTiming(id: 8, departsAt: '06:00:00', daysOfWeek: 'daily', busType: 'ordinary', isLastBus: false),
      BusTiming(id: 9, departsAt: '09:30:00', daysOfWeek: 'daily', busType: 'ordinary', isLastBus: false),
      BusTiming(id: 10, departsAt: '13:00:00', daysOfWeek: 'daily', busType: 'ordinary', isLastBus: false),
      BusTiming(id: 11, departsAt: '16:00:00', daysOfWeek: 'daily', busType: 'ordinary', isLastBus: false),
      BusTiming(id: 12, departsAt: '19:30:00', daysOfWeek: 'daily', busType: 'ordinary', isLastBus: true),
    ],
  };

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    _load();
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  Future<void> _load() async {
    try {
      final corridors = await ApiService.getBusCorridors();
      final Map<int, List<BusTiming>> timings = {};
      for (final c in corridors) {
        timings[c.id] = await ApiService.getBusTimings(c.id);
      }
      setState(() {
        _corridors = corridors;
        _timings.addAll(timings);
        _loading = false;
        _offline = false;
      });
    } catch (_) {
      setState(() {
        _corridors = _fallbackCorridors;
        _timings.addAll(_fallbackTimings);
        _loading = false;
        _offline = true;
      });
    }
  }

  BusTiming? _nextBus(int corridorId) {
    final list = _timings[corridorId] ?? [];
    for (final t in list) {
      if (t.minutesFromNow() >= 0) return t;
    }
    return null;
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) {
      return Scaffold(
        appBar: AppBar(title: const Text('பேருந்து')),
        body: const Center(child: CircularProgressIndicator()),
      );
    }

    return Scaffold(
      appBar: AppBar(
        title: const Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('பேருந்து'),
            Text('Bus Timings', style: TextStyle(fontSize: 12, fontWeight: FontWeight.normal)),
          ],
        ),
        actions: const [
          Padding(
            padding: EdgeInsets.only(right: 16),
            child: Icon(Icons.directions_bus, size: 28),
          ),
        ],
        bottom: TabBar(
          controller: _tabController,
          indicatorColor: Colors.white,
          labelColor: Colors.white,
          unselectedLabelColor: Colors.white70,
          tabs: _corridors.map((c) {
            final icon = c.nameEnglish.contains('Bodi') ? '🔵' : '🟢';
            return Tab(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text('$icon ${c.nameTamil}', style: const TextStyle(fontSize: 14)),
                  Text(c.nameEnglish, style: const TextStyle(fontFamily: 'Roboto', fontSize: 10)),
                ],
              ),
            );
          }).toList(),
        ),
      ),
      body: Column(
        children: [
          if (_offline) const OfflineBanner(),
          Expanded(
            child: TabBarView(
              controller: _tabController,
              children: _corridors.map((c) => _buildCorridorTab(c)).toList(),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCorridorTab(BusCorridor corridor) {
    final timings = _timings[corridor.id] ?? [];
    final next = _nextBus(corridor.id);
    final color = corridor.color;

    return RefreshIndicator(
      onRefresh: _load,
      child: ListView(
        padding: const EdgeInsets.symmetric(vertical: 12),
        children: [
          // Route header
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
            child: Text(
              corridor.nameTamil,
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.bold,
                color: color,
              ),
            ),
          ),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Text(
              'பண்ணைப்புரம் → ${corridor.nameTamil.contains('போடி') ? 'தேவாரம் → போடி' : 'உத்தமபாளையம் → கம்பம்'}',
              style: const TextStyle(fontSize: 14, color: AppColors.textSecondary),
            ),
          ),
          const SizedBox(height: 12),

          // Next bus card
          if (next != null)
            Card(
              margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
              color: color.withOpacity(0.08),
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Row(
                  children: [
                    Icon(Icons.access_time, color: color, size: 32),
                    const SizedBox(width: 16),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text('⏱ அடுத்த பேருந்து', style: TextStyle(fontSize: 16)),
                          const Text('Next bus', style: TextStyle(fontFamily: 'Roboto', fontSize: 11, color: AppColors.textSecondary)),
                          const SizedBox(height: 4),
                          Text(
                            next.displayTime,
                            style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: color),
                          ),
                        ],
                      ),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                      decoration: BoxDecoration(
                        color: color,
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: Text(
                        '${next.minutesFromNow()} நிமிடம்',
                        style: const TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.bold),
                      ),
                    ),
                  ],
                ),
              ),
            )
          else
            Card(
              margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Text(
                  'இந்த நேரத்தில் பேருந்து இல்லை\nNo more buses today',
                  style: TextStyle(fontSize: 16, color: Colors.grey[600]),
                ),
              ),
            ),

          const SizedBox(height: 12),

          // All times header
          const Padding(
            padding: EdgeInsets.symmetric(horizontal: 16, vertical: 4),
            child: Text(
              'அனைத்து நேரங்கள் — All Times',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.w500),
            ),
          ),

          // Timetable list
          Card(
            margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
            child: Column(
              children: timings.asMap().entries.map((entry) {
                final t = entry.value;
                final isLast = entry.key == timings.length - 1;
                return Column(
                  children: [
                    ListTile(
                      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
                      leading: Container(
                        width: 48,
                        height: 48,
                        decoration: BoxDecoration(
                          color: t.isLastBus
                              ? AppColors.lastBusRed.withOpacity(0.1)
                              : color.withOpacity(0.08),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Icon(
                          Icons.directions_bus,
                          color: t.isLastBus ? AppColors.lastBusRed : color,
                          size: 24,
                        ),
                      ),
                      title: Text(
                        t.displayTime,
                        style: TextStyle(
                          fontSize: 20,
                          fontWeight: FontWeight.bold,
                          color: t.isLastBus ? AppColors.lastBusRed : AppColors.textPrimary,
                        ),
                      ),
                      trailing: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          if (t.busType == 'express')
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                              decoration: BoxDecoration(
                                color: Colors.orange,
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: const Text('🚀 Express', style: TextStyle(color: Colors.white, fontSize: 11)),
                            ),
                          if (t.isLastBus)
                            Container(
                              margin: const EdgeInsets.only(left: 4),
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                              decoration: BoxDecoration(
                                color: AppColors.lastBusRed,
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: const Text('🔴 கடைசி', style: TextStyle(color: Colors.white, fontSize: 11)),
                            ),
                        ],
                      ),
                    ),
                    if (!isLast)
                      const Divider(height: 1, indent: 16, endIndent: 16),
                  ],
                );
              }).toList(),
            ),
          ),

          // Last bus alert button
          Padding(
            padding: const EdgeInsets.all(16),
            child: OutlinedButton.icon(
              onPressed: () {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(
                    content: Text('கடைசி பேருந்து அறிவிப்பு இயக்கப்பட்டது!\nLast bus alert enabled!'),
                  ),
                );
              },
              icon: const Icon(Icons.notifications_outlined),
              label: const Column(
                children: [
                  Text('🔔 கடைசி பேருந்து அறிவிப்பு'),
                  Text('Alert for last bus', style: TextStyle(fontFamily: 'Roboto', fontSize: 11)),
                ],
              ),
              style: OutlinedButton.styleFrom(
                foregroundColor: color,
                side: BorderSide(color: color),
                minimumSize: const Size(double.infinity, 52),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
