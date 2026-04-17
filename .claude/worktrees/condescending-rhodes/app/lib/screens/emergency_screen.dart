import 'dart:async';
import 'package:flutter/material.dart';
import '../models/models.dart';
import '../services/api_service.dart';
import '../services/cache_service.dart';
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
  Timer? _refreshTimer;

  static const _categories = [
    ('power',   'மின்சாரம்', 'Electricity', AppColors.powerYellow),
    ('medical', 'மருத்துவம்', 'Medical',    AppColors.hospitalRed),
    ('police',  'போலீஸ்',    'Police',      Color(0xFF1565C0)),
    ('fire',    'தீயணைப்பு', 'Fire',        Color(0xFFBF360C)),
    ('other',   'மற்றவை',    'Others',      AppColors.primary),
  ];

  // Fallback data — works 100% offline with essential emergency numbers
  static final Map<String, List<EmergencyContact>> _fallback = {
    'power': [
      EmergencyContact(id: 1, category: 'power', nameTamil: 'TNEB உள்ளூர் புகார் எண்', nameEnglish: 'TNEB Local Complaint', phone: '9498794987', isVerified: true, displayOrder: 1),
      EmergencyContact(id: 2, category: 'power', nameTamil: 'TNEB தேசிய புகார் எண்', nameEnglish: 'TNEB National Fault Line', phone: '1912', isVerified: true, displayOrder: 2),
    ],
    'medical': [
      EmergencyContact(id: 10, category: 'medical', nameTamil: 'ஆம்புலன்ஸ் அவசர எண்', nameEnglish: 'Ambulance / 108 Emergency', phone: '108', isVerified: true, displayOrder: 1),
      EmergencyContact(id: 11, category: 'medical', nameTamil: 'மருத்துவ அவசர உதவி', nameEnglish: 'Medical Emergency', phone: '102', isVerified: true, displayOrder: 2),
      EmergencyContact(id: 12, category: 'medical', nameTamil: 'உத்தமபாளையம் அரசு மருத்துவமனை', nameEnglish: 'Govt Hospital Uthamapalayam', phone: '9894840333', isVerified: true, displayOrder: 3),
    ],
    'police': [
      EmergencyContact(id: 20, category: 'police', nameTamil: 'ஒருங்கிணைந்த அவசர எண்', nameEnglish: 'Unified Emergency', phone: '112', isVerified: true, displayOrder: 1),
      EmergencyContact(id: 21, category: 'police', nameTamil: 'காவல் கட்டுப்பாட்டு அறை', nameEnglish: 'Police Control Room', phone: '100', isVerified: true, displayOrder: 2),
      EmergencyContact(id: 22, category: 'police', nameTamil: 'உத்தமபாளையம் காவல் நிலையம்', nameEnglish: 'Uthamapalayam Police Station', phone: '04554265230', isVerified: true, displayOrder: 3),
      EmergencyContact(id: 23, category: 'police', nameTamil: 'தேவாரம் காவல் நிலையம்', nameEnglish: 'Thevaram Police Station', phone: '9498101584', isVerified: true, displayOrder: 4),
    ],
    'fire': [
      EmergencyContact(id: 30, category: 'fire', nameTamil: 'தீயணைப்பு அவசர எண்', nameEnglish: 'Fire & Rescue', phone: '101', isVerified: true, displayOrder: 1),
    ],
    'other': [
      EmergencyContact(id: 40, category: 'other', nameTamil: 'பெண்கள் உதவி எண்', nameEnglish: 'Women Helpline', phone: '1091', isVerified: true, displayOrder: 1),
      EmergencyContact(id: 41, category: 'other', nameTamil: 'குழந்தைகள் உதவி எண்', nameEnglish: 'Child Helpline', phone: '1098', isVerified: true, displayOrder: 2),
      EmergencyContact(id: 42, category: 'other', nameTamil: 'பேரிடர் அவசர எண்', nameEnglish: 'Disaster Helpline', phone: '1077', isVerified: true, displayOrder: 3),
    ],
  };

  @override
  void initState() {
    super.initState();
    _load();
    _refreshTimer = Timer.periodic(const Duration(minutes: 5), (_) {
      if (mounted) _load();
    });
  }

  @override
  void dispose() {
    _refreshTimer?.cancel();
    super.dispose();
  }

  Future<void> _load() async {
    try {
      final data = await ApiService.getEmergencyContacts();
      // Cache for offline use
      await CacheService.cacheEmergencyContacts(data);
      if (!mounted) return;
      setState(() {
        _contacts = data;
        _loading = false;
        _offline = false;
      });
    } catch (_) {
      if (!mounted) return;
      // Try loading from cache first
      final cached = await CacheService.getCachedEmergencyContacts();
      if (!mounted) return;
      if (cached != null && cached.values.any((l) => l.isNotEmpty)) {
        setState(() {
          _contacts = cached;
          _loading = false;
          _offline = true;
        });
      } else {
        setState(() {
          _contacts = _fallback;
          _loading = false;
          _offline = true;
        });
      }
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
          // Category tabs — horizontal scroll
          Container(
            color: Colors.white,
            padding: const EdgeInsets.symmetric(vertical: 10),
            child: SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 12),
              child: Row(
                children: _categories.map((c) {
                  final selected = _selectedCategory == c.$1;
                  return GestureDetector(
                    onTap: () => setState(() => _selectedCategory = c.$1),
                    child: Container(
                      margin: const EdgeInsets.only(right: 8),
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                      decoration: BoxDecoration(
                        color: selected ? c.$4 : Colors.grey[100],
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(
                          color: selected ? c.$4 : Colors.grey[300]!,
                          width: selected ? 2 : 1,
                        ),
                      ),
                      child: Column(
                        children: [
                          Text(
                            c.$2,
                            style: TextStyle(
                              fontFamily: 'NotoSansTamil',
                              fontSize: 14,
                              fontWeight: selected ? FontWeight.w700 : FontWeight.w500,
                              color: selected ? Colors.white : AppColors.textPrimary,
                            ),
                          ),
                          const SizedBox(height: 2),
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
                  );
                }).toList(),
              ),
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
