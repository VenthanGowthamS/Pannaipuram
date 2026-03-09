import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';

import '../theme.dart';

class _Contact {
  final String number;
  final String label;
  final String labelEn;
  final String category;
  final bool verified;

  const _Contact({
    required this.number,
    required this.label,
    required this.labelEn,
    required this.category,
    this.verified = false,
  });
}

const _contacts = [
  _Contact(
    number: '9498794987',
    label: 'TNEB உள்ளூர் புகார்',
    labelEn: 'TNEB Local Complaint',
    category: 'மின்சாரம்',
    verified: true,
  ),
  _Contact(
    number: '1912',
    label: 'TNEB தேசிய எண்',
    labelEn: 'TNEB National Helpline',
    category: 'மின்சாரம்',
    verified: true,
  ),
  _Contact(
    number: '108',
    label: 'ஆம்புலன்ஸ்',
    labelEn: 'Ambulance',
    category: 'மருத்துவம்',
    verified: true,
  ),
  _Contact(
    number: '104',
    label: 'மருத்துவ ஆலோசனை',
    labelEn: 'Medical Helpline',
    category: 'மருத்துவம்',
    verified: true,
  ),
  _Contact(
    number: '100',
    label: 'போலீஸ்',
    labelEn: 'Police',
    category: 'போலீஸ்',
    verified: true,
  ),
  _Contact(
    number: '101',
    label: 'தீயணைப்பு',
    labelEn: 'Fire',
    category: 'போலீஸ்',
    verified: true,
  ),
];

class EmergencyScreen extends StatefulWidget {
  const EmergencyScreen({super.key});

  @override
  State<EmergencyScreen> createState() => _EmergencyScreenState();
}

class _EmergencyScreenState extends State<EmergencyScreen> {
  String selectedCategory = 'மின்சாரம்';

  final categories = ['மின்சாரம்', 'மருத்துவம்', 'போலீஸ்'];

  Future<void> _call(String number) async {
    final uri = Uri.parse('tel:$number');
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri);
    }
  }

  @override
  Widget build(BuildContext context) {
    final filtered =
        _contacts.where((c) => c.category == selectedCategory).toList();

    return Scaffold(
      appBar: AppBar(
        title: const Row(
          children: [
            Icon(Icons.phone, color: Colors.white),
            SizedBox(width: 8),
            Text('அவசர தொலைபேசி'),
          ],
        ),
        backgroundColor: AppTheme.hospitalRed,
      ),
      body: Column(
        children: [
          // Category filter chips
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
            child: Wrap(
              spacing: 8,
              children: categories.map((cat) {
                final selected = cat == selectedCategory;
                return FilterChip(
                  label: Text(cat),
                  selected: selected,
                  onSelected: (_) =>
                      setState(() => selectedCategory = cat),
                  selectedColor: AppTheme.hospitalRed,
                  labelStyle: TextStyle(
                    color: selected ? Colors.white : AppTheme.textPrimary,
                    fontWeight: FontWeight.bold,
                  ),
                  checkmarkColor: Colors.white,
                );
              }).toList(),
            ),
          ),
          // Contact list
          Expanded(
            child: ListView.separated(
              padding: const EdgeInsets.fromLTRB(16, 8, 16, 16),
              itemCount: filtered.length,
              separatorBuilder: (_, __) => const SizedBox(height: 10),
              itemBuilder: (ctx, i) {
                final c = filtered[i];
                return Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: AppTheme.card,
                    borderRadius: BorderRadius.circular(12),
                    boxShadow: const [
                      BoxShadow(color: Colors.black12, blurRadius: 4)
                    ],
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.phone_android,
                          color: AppTheme.hospitalRed),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                Text(c.number,
                                    style: const TextStyle(
                                        fontSize: 20,
                                        fontWeight: FontWeight.bold,
                                        color: AppTheme.textPrimary)),
                                if (c.verified) ...[
                                  const SizedBox(width: 6),
                                  const Icon(Icons.verified,
                                      color: Colors.green, size: 16),
                                ],
                              ],
                            ),
                            Text(c.label,
                                style: const TextStyle(
                                    fontSize: 14,
                                    color: AppTheme.textPrimary)),
                            Text(c.labelEn,
                                style: const TextStyle(
                                    fontSize: 11,
                                    color: AppTheme.textSecondary)),
                          ],
                        ),
                      ),
                      ElevatedButton.icon(
                        onPressed: () => _call(c.number),
                        icon: const Icon(Icons.phone, size: 18),
                        label: const Text('அழைக்க'),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppTheme.hospitalRed,
                          foregroundColor: Colors.white,
                          shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(8)),
                        ),
                      ),
                    ],
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}
