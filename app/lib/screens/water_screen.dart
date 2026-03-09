import 'package:flutter/material.dart';

import '../theme.dart';

class WaterScreen extends StatefulWidget {
  final String street;

  const WaterScreen({super.key, required this.street});

  @override
  State<WaterScreen> createState() => _WaterScreenState();
}

class _WaterScreenState extends State<WaterScreen> {
  int reportCount = 0;

  void _reportArrival() {
    setState(() => reportCount++);
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('தண்ணீர் வந்தது — நன்றி! 💧'),
        backgroundColor: AppTheme.waterBlue,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final streetLabel = widget.street.isEmpty ? 'தெரு தேர்வு இல்லை' : widget.street;

    return Scaffold(
      appBar: AppBar(
        title: const Row(
          children: [
            Icon(Icons.water_drop, color: AppTheme.waterBlue),
            SizedBox(width: 8),
            Text('தண்ணீர்'),
          ],
        ),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // Street indicator
          Center(
            child: Text(
              '$streetLabel  |  Water Supply',
              style: const TextStyle(
                  fontSize: 14, color: AppTheme.textSecondary),
            ),
          ),
          const SizedBox(height: 16),
          // Next water schedule
          _InfoCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Row(
                  children: [
                    Icon(Icons.calendar_today, color: AppTheme.waterBlue),
                    SizedBox(width: 8),
                    Text('அடுத்த தண்ணீர்',
                        style: TextStyle(
                            fontSize: 16, fontWeight: FontWeight.bold)),
                  ],
                ),
                const Divider(),
                const Text('திங்கட்கிழமை, காலை 6:00',
                    style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        color: AppTheme.textPrimary)),
                const Text('Monday, 6:00 AM',
                    style: TextStyle(
                        fontSize: 12, color: AppTheme.textSecondary)),
                const SizedBox(height: 4),
                const Text('(3 நாளுக்கு ஒரு முறை)',
                    style: TextStyle(
                        fontSize: 14, color: AppTheme.textSecondary)),
                const Text('Every 3 days',
                    style: TextStyle(
                        fontSize: 11, color: AppTheme.textSecondary)),
              ],
            ),
          ),
          const SizedBox(height: 12),
          // Community report button
          _InfoCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Row(
                  children: [
                    Icon(Icons.water_drop, color: AppTheme.waterBlue),
                    SizedBox(width: 8),
                    Text('தண்ணீர் வந்துவிட்டதா?',
                        style: TextStyle(
                            fontSize: 16, fontWeight: FontWeight.bold)),
                  ],
                ),
                const Text('Has water arrived?',
                    style: TextStyle(
                        fontSize: 12, color: AppTheme.textSecondary)),
                const SizedBox(height: 12),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton.icon(
                    onPressed: _reportArrival,
                    icon: const Icon(Icons.check),
                    label: const Text('தண்ணீர் வந்தது! — Water has come!',
                        style: TextStyle(fontSize: 15)),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppTheme.waterBlue,
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(10)),
                    ),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 12),
          // Today's community alerts
          _InfoCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Row(
                  children: [
                    Icon(Icons.access_time, color: AppTheme.primary),
                    SizedBox(width: 8),
                    Text('இன்றைய அறிவிப்புகள்',
                        style: TextStyle(
                            fontSize: 16, fontWeight: FontWeight.bold)),
                  ],
                ),
                const Text("Today's community alerts",
                    style: TextStyle(
                        fontSize: 12, color: AppTheme.textSecondary)),
                const Divider(),
                if (reportCount > 0)
                  Row(
                    children: [
                      const Icon(Icons.water_drop,
                          color: AppTheme.waterBlue, size: 18),
                      const SizedBox(width: 8),
                      Text('$streetLabel — confirmed by $reportCount ✅',
                          style: const TextStyle(fontSize: 14)),
                    ],
                  )
                else
                  const Text('இன்று இன்னும் அறிவிப்பு இல்லை',
                      style: TextStyle(
                          fontSize: 14, color: AppTheme.textSecondary)),
              ],
            ),
          ),
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
