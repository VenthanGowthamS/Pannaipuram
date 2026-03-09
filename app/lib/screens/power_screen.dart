import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';

import '../theme.dart';

class PowerScreen extends StatelessWidget {
  const PowerScreen({super.key});

  Future<void> _call(String number) async {
    final uri = Uri.parse('tel:$number');
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Row(
          children: [
            Icon(Icons.bolt, color: AppTheme.powerYellow),
            SizedBox(width: 8),
            Text('மின்சாரம்'),
          ],
        ),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // Today's status
          _InfoCard(
            child: Row(
              children: [
                Container(
                  width: 16,
                  height: 16,
                  decoration: const BoxDecoration(
                      color: Colors.green, shape: BoxShape.circle),
                ),
                const SizedBox(width: 12),
                const Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('இன்று மின் தடை இல்லை',
                        style: TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                            color: AppTheme.textPrimary)),
                    Text('No power cut today',
                        style: TextStyle(
                            fontSize: 12,
                            color: AppTheme.textSecondary)),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: 12),
          // Next scheduled cut
          _InfoCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Row(
                  children: [
                    Icon(Icons.calendar_today, color: AppTheme.powerYellow),
                    SizedBox(width: 8),
                    Text('அடுத்த திட்டமிட்ட மின் தடை',
                        style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.bold)),
                  ],
                ),
                const Divider(),
                const Text('தகவல் இல்லை',
                    style: TextStyle(
                        fontSize: 16, color: AppTheme.textSecondary)),
                const Text('TNEB அறிவிக்கவில்லை',
                    style: TextStyle(
                        fontSize: 12, color: AppTheme.textSecondary)),
              ],
            ),
          ),
          const SizedBox(height: 12),
          // Helpline contacts
          _InfoCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Row(
                  children: [
                    Icon(Icons.phone, color: AppTheme.primary),
                    SizedBox(width: 8),
                    Text('புகார் செய்ய அழைக்க',
                        style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.bold)),
                  ],
                ),
                const Divider(),
                _CallTile(
                  number: '94987 94987',
                  label: 'TNEB உள்ளூர் புகார்',
                  sublabel: 'TNEB Local Complaint',
                  onCall: () => _call('9498794987'),
                ),
                const Divider(),
                _CallTile(
                  number: '1912',
                  label: 'TNEB தேசிய எண்',
                  sublabel: 'TNEB National Helpline',
                  onCall: () => _call('1912'),
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),
          // Report restoration
          SizedBox(
            width: double.infinity,
            child: ElevatedButton.icon(
              onPressed: () {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(
                    content: Text('மின்சாரம் வந்தது — நன்றி! ✅'),
                    backgroundColor: Colors.green,
                  ),
                );
              },
              icon: const Icon(Icons.check_circle),
              label: const Column(
                children: [
                  Text('என் தெருவில் மின்சாரம் வந்துவிட்டது',
                      style: TextStyle(fontSize: 15)),
                  Text('Power restored in my street',
                      style: TextStyle(fontSize: 11)),
                ],
              ),
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.green,
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(vertical: 14),
                shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(10)),
              ),
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

class _CallTile extends StatelessWidget {
  final String number;
  final String label;
  final String sublabel;
  final VoidCallback onCall;

  const _CallTile({
    required this.number,
    required this.label,
    required this.sublabel,
    required this.onCall,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        children: [
          const Icon(Icons.phone_android, color: AppTheme.primary),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(number,
                    style: const TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        color: AppTheme.textPrimary)),
                Text(label,
                    style: const TextStyle(
                        fontSize: 14, color: AppTheme.textPrimary)),
                Text(sublabel,
                    style: const TextStyle(
                        fontSize: 11, color: AppTheme.textSecondary)),
              ],
            ),
          ),
          ElevatedButton(
            onPressed: onCall,
            style: ElevatedButton.styleFrom(
              backgroundColor: AppTheme.primary,
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(8)),
            ),
            child: const Text('அழைக்க'),
          ),
        ],
      ),
    );
  }
}
