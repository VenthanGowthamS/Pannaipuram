import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../theme.dart';
import 'home_screen.dart';

// Confirmed streets — more to be collected from panchayat
const List<String> kStreets = [
  'வள்ளுவர் தெரு',
];

class OnboardingScreen extends StatefulWidget {
  const OnboardingScreen({super.key});

  @override
  State<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends State<OnboardingScreen> {
  String? selectedStreet;
  String searchQuery = '';
  final TextEditingController _searchController = TextEditingController();

  List<String> get filteredStreets {
    if (searchQuery.isEmpty) return kStreets;
    return kStreets
        .where((s) => s.toLowerCase().contains(searchQuery.toLowerCase()))
        .toList();
  }

  Future<void> _proceed(String street) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('selected_street', street);
    if (mounted) {
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(builder: (_) => HomeScreen(street: street)),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.background,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            children: [
              const SizedBox(height: 40),
              const Text(
                'பண்ணைப்புரம்',
                style: TextStyle(
                  fontSize: 28,
                  fontWeight: FontWeight.bold,
                  color: AppTheme.primary,
                ),
              ),
              const SizedBox(height: 6),
              const Text(
                'உங்கள் ஊரின் தகவல் மையம்',
                style: TextStyle(fontSize: 16, color: AppTheme.textSecondary),
              ),
              const SizedBox(height: 40),
              Expanded(
                child: Container(
                  decoration: BoxDecoration(
                    color: AppTheme.card,
                    borderRadius: BorderRadius.circular(12),
                    boxShadow: const [
                      BoxShadow(color: Colors.black12, blurRadius: 8)
                    ],
                  ),
                  child: Column(
                    children: [
                      Padding(
                        padding: const EdgeInsets.all(16),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text(
                              'உங்கள் தெருவை தேர்வு செய்யுங்கள்',
                              style: TextStyle(
                                fontSize: 18,
                                fontWeight: FontWeight.bold,
                                color: AppTheme.textPrimary,
                              ),
                            ),
                            const Text(
                              'Select your street',
                              style: TextStyle(
                                  fontSize: 12,
                                  color: AppTheme.textSecondary),
                            ),
                            const SizedBox(height: 12),
                            TextField(
                              controller: _searchController,
                              decoration: InputDecoration(
                                hintText: 'தெரு தேடு...',
                                prefixIcon: const Icon(Icons.search),
                                border: OutlineInputBorder(
                                  borderRadius: BorderRadius.circular(8),
                                ),
                                contentPadding:
                                    const EdgeInsets.symmetric(
                                        horizontal: 12, vertical: 10),
                              ),
                              onChanged: (val) =>
                                  setState(() => searchQuery = val),
                            ),
                          ],
                        ),
                      ),
                      const Divider(height: 1),
                      Expanded(
                        child: filteredStreets.isEmpty
                            ? const Center(
                                child: Text(
                                  'தெரு கிடைக்கவில்லை',
                                  style: TextStyle(
                                      color: AppTheme.textSecondary),
                                ),
                              )
                            : ListView.builder(
                                itemCount: filteredStreets.length,
                                itemBuilder: (ctx, i) {
                                  final street = filteredStreets[i];
                                  return RadioListTile<String>(
                                    value: street,
                                    groupValue: selectedStreet,
                                    title: Text(street,
                                        style: const TextStyle(
                                            fontSize: 16)),
                                    activeColor: AppTheme.primary,
                                    onChanged: (val) => setState(
                                        () => selectedStreet = val),
                                  );
                                },
                              ),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 20),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: selectedStreet != null
                      ? () => _proceed(selectedStreet!)
                      : null,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppTheme.primary,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(8)),
                  ),
                  child: const Text('தொடரவும் — Continue',
                      style: TextStyle(fontSize: 18)),
                ),
              ),
              TextButton(
                onPressed: () => _proceed(''),
                child: const Text(
                  'என் தெரு இல்லை / My street is not listed',
                  style: TextStyle(
                      fontSize: 12, color: AppTheme.textSecondary),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
