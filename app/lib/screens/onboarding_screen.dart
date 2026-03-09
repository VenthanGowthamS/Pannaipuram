import 'package:flutter/material.dart';
import '../models/models.dart';
import '../services/api_service.dart';
import '../services/prefs_service.dart';
import '../theme/app_theme.dart';
import 'home_screen.dart';

class OnboardingScreen extends StatefulWidget {
  const OnboardingScreen({super.key});

  @override
  State<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends State<OnboardingScreen> {
  List<Street> _streets = [];
  List<Street> _filtered = [];
  Street? _selected;
  bool _loading = true;
  final _searchCtrl = TextEditingController();

  // Fallback streets — populated as data is collected from panchayat
  static const List<Map<String, dynamic>> _fallbackStreets = [
    {'id': 1, 'name_tamil': 'வள்ளுவர் தெரு', 'name_english': 'Valluvar Street'},
    // Remaining 56 streets will be added when collected from panchayat
    // This list grows as Venthan collects street data
  ];

  @override
  void initState() {
    super.initState();
    _loadStreets();
    _searchCtrl.addListener(_filter);
  }

  @override
  void dispose() {
    _searchCtrl.dispose();
    super.dispose();
  }

  Future<void> _loadStreets() async {
    try {
      final streets = await ApiService.getStreets();
      setState(() {
        _streets = streets;
        _filtered = streets;
        _loading = false;
      });
    } catch (_) {
      final fallback = _fallbackStreets
          .map((e) => Street.fromJson(e))
          .toList();
      setState(() {
        _streets = fallback;
        _filtered = fallback;
        _loading = false;
      });
    }
  }

  void _filter() {
    final q = _searchCtrl.text.trim().toLowerCase();
    setState(() {
      if (q.isEmpty) {
        _filtered = _streets;
      } else {
        _filtered = _streets
            .where((s) =>
                s.nameTamil.toLowerCase().contains(q) ||
                (s.nameEnglish?.toLowerCase().contains(q) ?? false))
            .toList();
      }
    });
  }

  Future<void> _continue() async {
    if (_selected == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('உங்கள் தெருவை தேர்வு செய்யவும்')),
      );
      return;
    }
    await PrefsService.saveStreet(_selected!.id, _selected!.nameTamil);
    await PrefsService.setOnboarded();
    if (mounted) {
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(builder: (_) => const HomeScreen()),
      );
    }
  }

  void _skip() async {
    await PrefsService.setOnboarded();
    if (mounted) {
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(builder: (_) => const HomeScreen()),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            children: [
              const SizedBox(height: 24),

              // App logo / title
              const Text(
                'பண்ணைப்புரம்',
                style: TextStyle(
                  fontFamily: 'NotoSansTamil',
                  fontSize: 28,
                  fontWeight: FontWeight.bold,
                  color: AppColors.primary,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 4),
              const Text(
                'உங்கள் ஊரின் தகவல் மையம்',
                style: TextStyle(fontSize: 16, color: AppColors.textSecondary),
                textAlign: TextAlign.center,
              ),
              const Text(
                'Your Village\'s Information Centre',
                style: TextStyle(fontFamily: 'Roboto', fontSize: 12, color: AppColors.textSecondary),
                textAlign: TextAlign.center,
              ),

              const SizedBox(height: 32),

              // Street picker card
              Expanded(
                child: Container(
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(16),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withOpacity(0.06),
                        blurRadius: 12,
                        offset: const Offset(0, 4),
                      ),
                    ],
                  ),
                  child: Column(
                    children: [
                      Padding(
                        padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
                        child: Column(
                          children: [
                            const Text(
                              'உங்கள் தெருவை தேர்வு செய்யுங்கள்',
                              style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                              textAlign: TextAlign.center,
                            ),
                            const Text(
                              'Select your street',
                              style: TextStyle(fontFamily: 'Roboto', fontSize: 12, color: AppColors.textSecondary),
                            ),
                            const SizedBox(height: 12),
                            // Search
                            TextField(
                              controller: _searchCtrl,
                              decoration: InputDecoration(
                                hintText: '🔍 தெரு தேடு... / Search street',
                                hintStyle: const TextStyle(fontFamily: 'Roboto', fontSize: 14),
                                prefixIcon: const Icon(Icons.search),
                                border: OutlineInputBorder(
                                  borderRadius: BorderRadius.circular(10),
                                  borderSide: const BorderSide(color: AppColors.primary),
                                ),
                                focusedBorder: OutlineInputBorder(
                                  borderRadius: BorderRadius.circular(10),
                                  borderSide: const BorderSide(color: AppColors.primary, width: 2),
                                ),
                                contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
                              ),
                            ),
                          ],
                        ),
                      ),
                      const Divider(height: 1),
                      Expanded(
                        child: _loading
                            ? const Center(child: CircularProgressIndicator())
                            : _filtered.isEmpty
                                ? Center(
                                    child: Column(
                                      mainAxisAlignment: MainAxisAlignment.center,
                                      children: [
                                        Icon(Icons.search_off, size: 48, color: Colors.grey[400]),
                                        const SizedBox(height: 8),
                                        const Text('தெரு கிடைக்கவில்லை', style: TextStyle(fontSize: 16)),
                                      ],
                                    ),
                                  )
                                : ListView.builder(
                                    itemCount: _filtered.length,
                                    itemBuilder: (_, i) {
                                      final street = _filtered[i];
                                      final isSelected = _selected?.id == street.id;
                                      return ListTile(
                                        onTap: () => setState(() => _selected = street),
                                        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
                                        leading: Container(
                                          width: 36,
                                          height: 36,
                                          decoration: BoxDecoration(
                                            color: isSelected
                                                ? AppColors.primary
                                                : AppColors.primary.withOpacity(0.08),
                                            borderRadius: BorderRadius.circular(18),
                                          ),
                                          child: Icon(
                                            isSelected ? Icons.check : Icons.location_on_outlined,
                                            color: isSelected ? Colors.white : AppColors.primary,
                                            size: 18,
                                          ),
                                        ),
                                        title: Text(
                                          street.nameTamil,
                                          style: TextStyle(
                                            fontSize: 18,
                                            fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                                            color: isSelected ? AppColors.primary : AppColors.textPrimary,
                                          ),
                                        ),
                                        subtitle: street.nameEnglish != null
                                            ? Text(
                                                street.nameEnglish!,
                                                style: const TextStyle(
                                                  fontFamily: 'Roboto',
                                                  fontSize: 12,
                                                  color: AppColors.textSecondary,
                                                ),
                                              )
                                            : null,
                                        tileColor: isSelected
                                            ? AppColors.primary.withOpacity(0.05)
                                            : null,
                                      );
                                    },
                                  ),
                      ),
                    ],
                  ),
                ),
              ),

              const SizedBox(height: 16),

              // Continue button
              ElevatedButton(
                onPressed: _selected != null ? _continue : null,
                child: Column(
                  children: [
                    const Text('தொடரவும்', style: TextStyle(fontSize: 20)),
                    const Text('Continue', style: TextStyle(fontFamily: 'Roboto', fontSize: 12)),
                  ],
                ),
              ),

              const SizedBox(height: 10),

              // Skip option
              TextButton(
                onPressed: _skip,
                child: const Text(
                  'என் தெரு இல்லை / My street is not listed — தவிர்க்கவும்',
                  style: TextStyle(
                    fontFamily: 'Roboto',
                    fontSize: 12,
                    color: AppColors.textSecondary,
                  ),
                  textAlign: TextAlign.center,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
