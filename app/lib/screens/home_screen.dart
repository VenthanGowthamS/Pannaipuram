import 'package:flutter/material.dart';

import '../theme.dart';
import 'power_screen.dart';
import 'water_screen.dart';
import 'bus_screen.dart';
import 'hospital_screen.dart';
import 'emergency_screen.dart';

class HomeScreen extends StatelessWidget {
  final String street;

  const HomeScreen({super.key, required this.street});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('பண்ணைப்புரம்',
                style:
                    TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
            Text('உங்கள் ஊரின் தகவல் மையம்',
                style: TextStyle(fontSize: 11)),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.notifications_outlined),
            onPressed: () {},
          ),
        ],
      ),
      body: Column(
        children: [
          // Live status cards
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
            child: Column(
              children: [
                _StatusCard(
                  icon: Icons.bolt,
                  color: AppTheme.powerYellow,
                  text: 'மின் தடை இல்லை இன்று',
                  subtext: 'No power cut today',
                ),
                const SizedBox(height: 8),
                _StatusCard(
                  icon: Icons.water_drop,
                  color: AppTheme.waterBlue,
                  text: 'தண்ணீர் — நாளை காலை 6',
                  subtext: 'Water tomorrow at 6 AM',
                ),
              ],
            ),
          ),
          // Module grid
          Expanded(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Column(
                children: [
                  Expanded(
                    child: Row(
                      children: [
                        _ModuleCard(
                          icon: Icons.bolt,
                          color: AppTheme.powerYellow,
                          label: 'மின்சாரம்',
                          sublabel: 'Electricity',
                          onTap: () => Navigator.push(
                              context,
                              MaterialPageRoute(
                                  builder: (_) => const PowerScreen())),
                        ),
                        const SizedBox(width: 12),
                        _ModuleCard(
                          icon: Icons.water_drop,
                          color: AppTheme.waterBlue,
                          label: 'தண்ணீர்',
                          sublabel: 'Water',
                          onTap: () => Navigator.push(
                              context,
                              MaterialPageRoute(
                                  builder: (_) =>
                                      WaterScreen(street: street))),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 12),
                  Expanded(
                    child: Row(
                      children: [
                        _ModuleCard(
                          icon: Icons.directions_bus,
                          color: AppTheme.busOrange,
                          label: 'பேருந்து',
                          sublabel: 'Bus Times',
                          onTap: () => Navigator.push(
                              context,
                              MaterialPageRoute(
                                  builder: (_) => const BusScreen())),
                        ),
                        const SizedBox(width: 12),
                        _ModuleCard(
                          icon: Icons.local_hospital,
                          color: AppTheme.hospitalRed,
                          label: 'மருத்துவமனை',
                          sublabel: 'Hospital',
                          onTap: () => Navigator.push(
                              context,
                              MaterialPageRoute(
                                  builder: (_) =>
                                      const HospitalScreen())),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 12),
                ],
              ),
            ),
          ),
          // Emergency — full width, always visible
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
            child: SizedBox(
              width: double.infinity,
              height: 64,
              child: ElevatedButton(
                onPressed: () => Navigator.push(
                    context,
                    MaterialPageRoute(
                        builder: (_) => const EmergencyScreen())),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppTheme.hospitalRed,
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12)),
                ),
                child: const Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(Icons.phone, size: 28),
                    SizedBox(width: 12),
                    Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('அவசர தொலைபேசி',
                            style: TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.bold)),
                        Text('Emergency Contacts',
                            style: TextStyle(fontSize: 11)),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _StatusCard extends StatelessWidget {
  final IconData icon;
  final Color color;
  final String text;
  final String subtext;

  const _StatusCard({
    required this.icon,
    required this.color,
    required this.text,
    required this.subtext,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppTheme.card,
        borderRadius: BorderRadius.circular(10),
        boxShadow: const [BoxShadow(color: Colors.black12, blurRadius: 4)],
        border: Border(left: BorderSide(color: color, width: 4)),
      ),
      child: Row(
        children: [
          Icon(icon, color: color, size: 28),
          const SizedBox(width: 12),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(text,
                  style: const TextStyle(
                      fontSize: 15,
                      fontWeight: FontWeight.w600,
                      color: AppTheme.textPrimary)),
              Text(subtext,
                  style: const TextStyle(
                      fontSize: 11, color: AppTheme.textSecondary)),
            ],
          ),
        ],
      ),
    );
  }
}

class _ModuleCard extends StatelessWidget {
  final IconData icon;
  final Color color;
  final String label;
  final String sublabel;
  final VoidCallback onTap;

  const _ModuleCard({
    required this.icon,
    required this.color,
    required this.label,
    required this.sublabel,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: GestureDetector(
        onTap: onTap,
        child: Container(
          decoration: BoxDecoration(
            color: AppTheme.card,
            borderRadius: BorderRadius.circular(12),
            boxShadow: const [
              BoxShadow(color: Colors.black12, blurRadius: 4)
            ],
          ),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(icon, color: color, size: 48),
              const SizedBox(height: 8),
              Text(label,
                  style: const TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                      color: AppTheme.textPrimary)),
              Text(sublabel,
                  style: const TextStyle(
                      fontSize: 11, color: AppTheme.textSecondary)),
            ],
          ),
        ),
      ),
    );
  }
}
