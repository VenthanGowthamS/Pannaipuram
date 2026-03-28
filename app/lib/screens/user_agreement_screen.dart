import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../services/prefs_service.dart';
import 'main_shell.dart';

class UserAgreementScreen extends StatefulWidget {
  const UserAgreementScreen({super.key});

  @override
  State<UserAgreementScreen> createState() => _UserAgreementScreenState();
}

class _UserAgreementScreenState extends State<UserAgreementScreen> {
  static const Color _green = Color(0xFF1B5E20);

  Future<void> _accept() async {
    HapticFeedback.lightImpact();
    await PrefsService.setAgreementAccepted();
    if (!mounted) return;
    // Go directly to main app — street selection is optional, not required
    Navigator.pushReplacement(
      context,
      MaterialPageRoute(builder: (_) => const MainShell()),
    );
  }

  Future<void> _decline() async {
    SystemNavigator.pop();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF2F6F2),
      body: SafeArea(
        child: Column(
          children: [
            // Header
            Container(
              width: double.infinity,
              padding: const EdgeInsets.fromLTRB(20, 32, 20, 28),
              decoration: const BoxDecoration(
                gradient: LinearGradient(
                  colors: [Color(0xFF1B5E20), Color(0xFF2E7D32), Color(0xFF43A047)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
              ),
              child: const Column(
                children: [
                  Text('🏘', style: TextStyle(fontSize: 44)),
                  SizedBox(height: 12),
                  Text(
                    'பண்ணைப்புரம்',
                    style: TextStyle(
                      fontFamily: 'NotoSansTamil',
                      fontSize: 26,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                    ),
                    textAlign: TextAlign.center,
                  ),
                  SizedBox(height: 6),
                  Text(
                    'பயன்பாட்டு விதிமுறைகள்',
                    style: TextStyle(
                      fontFamily: 'NotoSansTamil',
                      fontSize: 15,
                      color: Colors.white70,
                    ),
                  ),
                  Text(
                    'Terms of Use',
                    style: TextStyle(fontFamily: 'Roboto', fontSize: 12, color: Colors.white54),
                  ),
                ],
              ),
            ),

            // Agreement content
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _section('📱', 'இந்த App என்னத்துக்கு?', 'What is this app?',
                      'பண்ணைப்புரம் app, கிராம மக்களுக்கு மின்சாரம், தண்ணீர், பேருந்து, மருத்துவமனை, '
                      'அவசர உதவி மற்றும் உள்ளூர் சேவை தகவல்களை ஒரே இடத்தில் தருகிறது. '
                      'இது இலவசமாக வழங்கப்படுகிறது.'),

                    _section('🔒', 'தனிப்பட்ட தகவல்', 'Your Privacy',
                      'உங்கள் பெயர், எண் அல்லது வேறு எந்த தகவலும் எங்கள் சேவையகத்தில் சேகரிக்கப்படுவதில்லை. '
                      'நீங்கள் feedback கொடுத்தால் மட்டும் அது admin-ஐ சென்று சேரும். '
                      'மற்ற எந்த தகவலும் உங்கள் தொலைபேசியை விட்டு வெளியே போவதில்லை.'),

                    _section('📡', 'Internet தேவை', 'Internet Usage',
                      'முதல் முறை திறக்கும்போது internet தேவை. '
                      'பிறகு பேருந்து நேரம், டாக்டர் விவரம் போன்றவை offline-லும் வேலை செய்யும். '
                      'தகவல்கள் புதுப்பிக்கப்பட, mobile data அல்லது Wi-Fi தேவை.'),

                    _section('✅', 'தரவு துல்லியம்', 'Data Accuracy',
                      'இங்குள்ள தகவல்கள் இந்த app-ஐ உருவாக்கியவரால் '
                      'கைமுறையாக update செய்யப்படுகின்றன. '
                      'இது ஊர் நிர்வாகத்தின் அதிகாரபூர்வ தகவல் அல்ல — '
                      'எதிர்காலத்தில் இணைக்க திட்டமிடப்பட்டுள்ளது. '
                      'தகவல்களில் மாற்றம் இருந்தால் Feedback மூலம் தெரியப்படுத்தவும்.'),

                    _section('🔄', 'மாற்றங்கள்', 'Updates',
                      'இந்த app தொடர்ந்து மேம்படுத்தப்படும். '
                      'புதிய திறன்கள் சேர்க்கப்படும்போது app update செய்யுங்கள்.'),

                    const SizedBox(height: 8),
                    Container(
                      padding: const EdgeInsets.all(14),
                      decoration: BoxDecoration(
                        color: _green.withValues(alpha: 0.06),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: _green.withValues(alpha: 0.2)),
                      ),
                      child: const Text(
                        '"தொடரவும்" தட்டுவதன் மூலம் மேற்கண்ட விதிமுறைகளை ஏற்கிறீர்கள்.',
                        style: TextStyle(
                          fontFamily: 'NotoSansTamil',
                          fontSize: 13,
                          color: Color(0xFF1B5E20),
                          fontWeight: FontWeight.w600,
                          height: 1.5,
                        ),
                        textAlign: TextAlign.center,
                      ),
                    ),
                    const SizedBox(height: 20),
                  ],
                ),
              ),
            ),

            // Buttons
            Container(
              padding: const EdgeInsets.fromLTRB(20, 12, 20, 24),
              color: Colors.white,
              child: Column(
                children: [
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed: _accept,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: _green,
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                      ),
                      child: const Column(
                        children: [
                          Text('ஏற்கிறேன் — தொடரவும்',
                            style: TextStyle(fontFamily: 'NotoSansTamil', fontSize: 18, color: Colors.white, fontWeight: FontWeight.bold)),
                          Text('Accept & Continue',
                            style: TextStyle(fontFamily: 'Roboto', fontSize: 11, color: Colors.white70)),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 10),
                  TextButton(
                    onPressed: _decline,
                    child: const Text(
                      'மறுக்கிறேன் — App மூடவும் / Decline & Exit',
                      style: TextStyle(fontFamily: 'Roboto', fontSize: 12, color: Color(0xFF9E9E9E)),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _section(String emoji, String tamil, String english, String body) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        boxShadow: [
          BoxShadow(color: Colors.black.withValues(alpha: 0.04), blurRadius: 6, offset: const Offset(0, 2)),
        ],
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(emoji, style: const TextStyle(fontSize: 22)),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(tamil,
                  style: const TextStyle(fontFamily: 'NotoSansTamil', fontSize: 14, fontWeight: FontWeight.bold, color: Color(0xFF1B5E20))),
                Text(english,
                  style: const TextStyle(fontFamily: 'Roboto', fontSize: 11, color: Color(0xFF9E9E9E))),
                const SizedBox(height: 6),
                Text(body,
                  style: const TextStyle(fontFamily: 'NotoSansTamil', fontSize: 13, color: Color(0xFF444444), height: 1.5)),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
