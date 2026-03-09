import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';

import '../theme.dart';

const _weekdays = [
  'ஞாயிறு', 'திங்கள்', 'செவ்வாய்', 'புதன்',
  'வியாழன்', 'வெள்ளி', 'சனி'
];

class _Doctor {
  final String name;
  final String nameEn;
  final String specialisation;
  final List<int> days; // 0=Sun, 1=Mon, ..., 6=Sat
  final String timing;

  const _Doctor({
    required this.name,
    required this.nameEn,
    required this.specialisation,
    required this.days,
    required this.timing,
  });
}

const _doctors = [
  _Doctor(
    name: 'டாக்டர் சேகர்',
    nameEn: 'Dr. Sekar',
    specialisation: 'பொது மருத்துவம் — General Medicine',
    days: [3], // Wednesday
    timing: 'காலை முதல் மாலை வரை — Morning to Evening',
  ),
];

class HospitalScreen extends StatelessWidget {
  const HospitalScreen({super.key});

  Future<void> _call(String number) async {
    final uri = Uri.parse('tel:$number');
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri);
    }
  }

  @override
  Widget build(BuildContext context) {
    final today = DateTime.now().weekday % 7; // Flutter: Mon=1, so %7 gives Sun=0
    final todayDoctors =
        _doctors.where((d) => d.days.contains(today)).toList();

    return Scaffold(
      appBar: AppBar(
        title: const Row(
          children: [
            Icon(Icons.local_hospital, color: Colors.white),
            SizedBox(width: 8),
            Text('மருத்துவமனை'),
          ],
        ),
        backgroundColor: AppTheme.hospitalRed,
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // Hospital header
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: AppTheme.hospitalRed.withOpacity(0.08),
              borderRadius: BorderRadius.circular(12),
              border: const Border(
                  left:
                      BorderSide(color: AppTheme.hospitalRed, width: 4)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('PTV பத்மாவதி மருத்துவமனை',
                    style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        color: AppTheme.textPrimary)),
                const Text('PTV Padmavathy Hospital',
                    style: TextStyle(
                        fontSize: 12, color: AppTheme.textSecondary)),
                const SizedBox(height: 8),
                Row(
                  children: [
                    OutlinedButton.icon(
                      onPressed: () => _call('0000000000'),
                      icon: const Icon(Icons.phone, size: 16),
                      label: const Text('Casualty'),
                      style: OutlinedButton.styleFrom(
                        foregroundColor: AppTheme.hospitalRed,
                        side: const BorderSide(
                            color: AppTheme.hospitalRed),
                      ),
                    ),
                    const SizedBox(width: 8),
                    OutlinedButton.icon(
                      onPressed: () => _call('108'),
                      icon: const Icon(Icons.emergency, size: 16),
                      label: const Text('108 Ambulance'),
                      style: OutlinedButton.styleFrom(
                        foregroundColor: Colors.red,
                        side: const BorderSide(color: Colors.red),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),
          // Today's doctors
          _InfoCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    const Text('👨‍⚕️', style: TextStyle(fontSize: 20)),
                    const SizedBox(width: 8),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('இன்று கிடைக்கும் டாக்டர்',
                            style: TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.bold)),
                        Text('Doctors available today — ${_weekdays[today]}',
                            style: const TextStyle(
                                fontSize: 11,
                                color: AppTheme.textSecondary)),
                      ],
                    ),
                  ],
                ),
                const Divider(),
                if (todayDoctors.isEmpty)
                  const Text('இன்று டாக்டர் இல்லை — நாளை வருகின்றனர்',
                      style: TextStyle(
                          fontSize: 15, color: AppTheme.textSecondary))
                else
                  ...todayDoctors.map((d) => _DoctorTile(doctor: d)),
              ],
            ),
          ),
          const SizedBox(height: 12),
          // Full week schedule
          _InfoCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('அனைத்து டாக்டர்கள் — All Doctors',
                    style: TextStyle(
                        fontSize: 16, fontWeight: FontWeight.bold)),
                const Divider(),
                ..._doctors.map((d) => Padding(
                      padding: const EdgeInsets.symmetric(vertical: 6),
                      child: Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Expanded(
                            child: Column(
                              crossAxisAlignment:
                                  CrossAxisAlignment.start,
                              children: [
                                Text(d.name,
                                    style: const TextStyle(
                                        fontSize: 15,
                                        fontWeight: FontWeight.bold)),
                                Text(d.nameEn,
                                    style: const TextStyle(
                                        fontSize: 11,
                                        color: AppTheme.textSecondary)),
                                Text(d.specialisation,
                                    style: const TextStyle(
                                        fontSize: 12,
                                        color: AppTheme.textSecondary)),
                              ],
                            ),
                          ),
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.end,
                            children: d.days
                                .map((day) => Text(_weekdays[day],
                                    style: const TextStyle(
                                        fontSize: 14,
                                        color: AppTheme.primary)))
                                .toList(),
                          ),
                        ],
                      ),
                    )),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _DoctorTile extends StatelessWidget {
  final _Doctor doctor;

  const _DoctorTile({required this.doctor});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(doctor.name,
              style: const TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: AppTheme.textPrimary)),
          Text(doctor.nameEn,
              style: const TextStyle(
                  fontSize: 12, color: AppTheme.textSecondary)),
          Text(doctor.specialisation,
              style: const TextStyle(
                  fontSize: 13, color: AppTheme.textSecondary)),
          Text(doctor.timing,
              style: const TextStyle(
                  fontSize: 13, color: AppTheme.primary)),
        ],
      ),
    );
  }
}

class _InfoCard extends StatelessWidget {
  final Widget child;

  const _InfoCard({required this.child});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppTheme.card,
        borderRadius: BorderRadius.circular(12),
        boxShadow: const [BoxShadow(color: Colors.black12, blurRadius: 4)],
      ),
      child: child,
    );
  }
}
