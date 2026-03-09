import 'package:flutter/material.dart';

import '../theme.dart';

class _BusTiming {
  final String time;
  final String label;
  final bool isLast;
  final bool isExpress;

  const _BusTiming(this.time, this.label,
      {this.isLast = false, this.isExpress = false});
}

const _bodiTimings = [
  _BusTiming('5:30 காலை', 'Ordinary'),
  _BusTiming('7:45 காலை', 'Ordinary'),
  _BusTiming('9:00 காலை', 'Express', isExpress: true),
  _BusTiming('11:30 பகல்', 'Ordinary'),
  _BusTiming('2:00 மாலை', 'Ordinary'),
  _BusTiming('5:30 மாலை', 'Ordinary'),
  _BusTiming('8:00 இரவு', 'கடைசி — Last', isLast: true),
];

const _kambanTimings = [
  _BusTiming('6:00 காலை', 'Ordinary'),
  _BusTiming('8:30 காலை', 'Ordinary'),
  _BusTiming('10:00 காலை', 'Express', isExpress: true),
  _BusTiming('12:30 பகல்', 'Ordinary'),
  _BusTiming('3:00 மாலை', 'Ordinary'),
  _BusTiming('6:00 மாலை', 'Ordinary'),
  _BusTiming('8:30 இரவு', 'கடைசி — Last', isLast: true),
];

class BusScreen extends StatefulWidget {
  const BusScreen({super.key});

  @override
  State<BusScreen> createState() => _BusScreenState();
}

class _BusScreenState extends State<BusScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Row(
          children: [
            Icon(Icons.directions_bus, color: AppTheme.busOrange),
            SizedBox(width: 8),
            Text('பேருந்து'),
          ],
        ),
        bottom: TabBar(
          controller: _tabController,
          labelColor: Colors.white,
          unselectedLabelColor: Colors.white70,
          indicatorColor: AppTheme.busOrange,
          tabs: const [
            Tab(text: '🔵 போடி பக்கம்'),
            Tab(text: '🟢 கம்பம் பக்கம்'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _BusTimingList(
            direction: 'பண்ணைப்புரம் → தேவாரம் → போடி',
            directionEn: 'Towards Bodi via Thevaram',
            timings: _bodiTimings,
            color: Colors.blue,
          ),
          _BusTimingList(
            direction: 'பண்ணைப்புரம் → உதமைபாளையம் → கம்பம்',
            directionEn: 'Towards Kamban via Uthamapalayam',
            timings: _kambanTimings,
            color: Colors.green,
          ),
        ],
      ),
    );
  }
}

class _BusTimingList extends StatelessWidget {
  final String direction;
  final String directionEn;
  final List<_BusTiming> timings;
  final Color color;

  const _BusTimingList({
    required this.direction,
    required this.directionEn,
    required this.timings,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: color.withOpacity(0.1),
            borderRadius: BorderRadius.circular(10),
            border: Border(left: BorderSide(color: color, width: 4)),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(direction,
                  style: TextStyle(
                      fontSize: 15,
                      fontWeight: FontWeight.bold,
                      color: color)),
              Text(directionEn,
                  style: const TextStyle(
                      fontSize: 11, color: AppTheme.textSecondary)),
            ],
          ),
        ),
        const SizedBox(height: 16),
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: AppTheme.card,
            borderRadius: BorderRadius.circular(12),
            boxShadow: const [
              BoxShadow(color: Colors.black12, blurRadius: 4)
            ],
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('அனைத்து நேரங்கள் — All Times',
                  style: TextStyle(
                      fontSize: 16, fontWeight: FontWeight.bold)),
              const Divider(),
              ...timings.map((t) => _TimingRow(timing: t)),
            ],
          ),
        ),
        const SizedBox(height: 12),
        SizedBox(
          width: double.infinity,
          child: OutlinedButton.icon(
            onPressed: () {},
            icon: const Icon(Icons.notifications_outlined),
            label: const Text('கடைசி பேருந்து அறிவிப்பு\nAlert for last bus',
                textAlign: TextAlign.center),
            style: OutlinedButton.styleFrom(
              foregroundColor: AppTheme.busOrange,
              side: const BorderSide(color: AppTheme.busOrange),
              padding: const EdgeInsets.symmetric(vertical: 12),
              shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(10)),
            ),
          ),
        ),
      ],
    );
  }
}

class _TimingRow extends StatelessWidget {
  final _BusTiming timing;

  const _TimingRow({required this.timing});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        children: [
          SizedBox(
            width: 110,
            child: Text(
              timing.time,
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.bold,
                color: timing.isLast
                    ? Colors.red
                    : AppTheme.textPrimary,
              ),
            ),
          ),
          const SizedBox(width: 8),
          if (timing.isExpress)
            Container(
              padding:
                  const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
              decoration: BoxDecoration(
                color: AppTheme.busOrange,
                borderRadius: BorderRadius.circular(4),
              ),
              child: const Text('🚀 Express',
                  style: TextStyle(
                      color: Colors.white, fontSize: 11)),
            )
          else if (timing.isLast)
            Container(
              padding:
                  const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
              decoration: BoxDecoration(
                color: Colors.red,
                borderRadius: BorderRadius.circular(4),
              ),
              child: Text('🔴 ${timing.label}',
                  style: const TextStyle(
                      color: Colors.white, fontSize: 11)),
            )
          else
            Text(timing.label,
                style: const TextStyle(
                    fontSize: 14, color: AppTheme.textSecondary)),
        ],
      ),
    );
  }
}
