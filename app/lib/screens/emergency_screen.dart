import 'package:flutter/material.dart';
import '../models/models.dart';
import '../services/api_service.dart';
import '../theme/app_theme.dart';
import '../widgets/call_button.dart';
import '../widgets/offline_banner.dart';

class EmergencyScreen extends StatefulWidget {
  const EmergencyScreen({super.key});

  @override
  State<EmergencyScreen> createState() => _EmergencyScreenState();
}

class _EmergencyScreenState extends State<EmergencyScreen> {
  Map<String, List<EmergencyContact>> _contacts = {};
  bool _loading = true;
  bool _offline = false;
  String _selectedCategory = 'power';

  static const _categories = [
    ('power',   'மின்சாரம்', 'Electricity', AppColors.powerYellow),
    ('medical', 'மருத்துவம்', 'Medical',    AppColors.hospitalRed),
    ('police',  'போலீஸ்',    'Police',      Color(0xFF1565C0)),
    ('fire',    'தீயணைப்பு', 'Fire',        Color(0xFFBF360C)),
    ('other',   'மற்றவை',    'Others',      AppColors.primary),
  ];

  // Fallback data — works 100% offline
  static final Map<String, List<EmergencyContact>> _fallback = {
    'power': [
      EmergencyContact(
        id: 1,
        category: 'power',
        nameTamil: 'TNEB உள்ளூர் புகார் எண்',
        nameEnglish: 'TNEB Local Complaint',
        phone: '9498794987',
        isVerified: true,
        displayOrder: 1,
      ),
      EmergencyContact(
        id: 2,
        category: 'power',
        nameTamil: 'TNEB தேசிய புகார் எண்',
        nameEnglish: 'TNEB National Fault Line',
        phone: '1912',
        isVerified: true,
        displayOrder: 2,
      ),
    ],
    'medical': [],
    'police': [],
    'fire':   [],
    'other':  [],
  };

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    try {
      final data = await ApiService.getEmergencyContacts();
      if (!mounted) return;
      setState(() {
        _contacts = data;
        _loading = false;
        _offline = false;
      });
    } catch (_) {
      if (!mounted) return;
      setState(() {
        _contacts = _fallback;
        _loading = false;
        _offline = true;
      });
    }
  }

  Color _categoryColor(String cat) {
    for (final c in _categories) {
      if (c.$1 == cat) return c.$4;
    }
    return AppColors.primary;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('யாரையாவது கூப்பிடணுமா?', style: TextStyle(fontFamily: 'NotoSansTamil', fontSize: 17)),
            Text(
              'Emergency Contacts',
              style: TextStyle(fontSize: 12, fontWeight: FontWeight.normal),
            ),
          ],
        ),
        actions: const [
          Padding(
            padding: EdgeInsets.only(right: 16),
            child: Icon(Icons.phone_in_talk, size: 28),
          ),
        ],
      ),
      body: Column(
        children: [
          if (_offline) const OfflineBanner(),
          // Category tabs
          Container(
            color: Colors.white,
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
            child: Row(
              children: _categories.map((c) {
                final selected = _selectedCategory == c.$1;
                return Expanded(
                  child: GestureDetector(
                    onTap: () => setState(() => _selectedCategory = c.$1),
                    child: Container(
                      margin: const EdgeInsets.symmetric(horizontal: 3),
                      padding: const EdgeInsets.symmetric(vertical: 8),
                      decoration: BoxDecoration(
                        color: selected ? c.$4 : Colors.grey[100],
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(
                          color: selected ? c.$4 : Colors.grey[300]!,
                        ),
                      ),
                      child: Column(
                        children: [
                          Text(
                            c.$2,
                            style: TextStyle(
                              fontSize: 13,
                              fontWeight: FontWeight.w500,
                              color: selected ? Colors.white : AppColors.textPrimary,
                            ),
                            textAlign: TextAlign.center,
                          ),
                          Text(
                            c.$3,
                            style: TextStyle(
                              fontFamily: 'Roboto',
                              fontSize: 10,
                              color: selected ? Colors.white70 : AppColors.textSecondary,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                );
              }).toList(),
            ),
          ),
          Expanded(
            child: _loading
                ? const Center(child: CircularProgressIndicator())
                : RefreshIndicator(
                    onRefresh: _load,
                    child: _buildContactList(),
                  ),
          ),
        ],
      ),
    );
  }

  Widget _buildContactList() {
    final list = _contacts[_selectedCategory] ?? [];
    if (list.isEmpty) {
      return ListView(
        children: [
          const SizedBox(height: 60),
          Center(
            child: Column(
              children: [
                Icon(Icons.phone_disabled, size: 64, color: Colors.grey[400]),
                const SizedBox(height: 16),
                Text(
                  'தொலைபேசி எண்கள் ஏற்றப்படுகின்றன...',
                  style: TextStyle(fontSize: 16, color: Colors.grey[600]),
                ),
                const SizedBox(height: 4),
                Text(
                  'Contact numbers being added',
                  style: TextStyle(
                    fontFamily: 'Roboto',
                    fontSize: 12,
                    color: Colors.grey[500],
                  ),
                ),
              ],
            ),
          ),
        ],
      );
    }

    final color = _categoryColor(_selectedCategory);
    return ListView.builder(
      padding: const EdgeInsets.symmetric(vertical: 8),
      itemCount: list.length,
      itemBuilder: (_, i) {
        final c = list[i];
        return Column(
          children: [
            CallButton(
              phone: c.phone,
              label: '${c.nameTamil}${c.isVerified ? ' ✅' : ''}',
              sublabel: '${c.phone}  •  ${c.nameEnglish}',
              color: color,
            ),
          ],
        );
      },
    );
  }
}
