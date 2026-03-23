import 'package:flutter/material.dart';
import '../services/api_service.dart';
import '../theme/app_theme.dart';

class FeedbackScreen extends StatefulWidget {
  const FeedbackScreen({super.key});

  @override
  State<FeedbackScreen> createState() => _FeedbackScreenState();
}

class _FeedbackScreenState extends State<FeedbackScreen> {
  final _messageCtrl = TextEditingController();
  final _nameCtrl    = TextEditingController();
  bool _sending   = false;
  bool _submitted = false;

  @override
  void dispose() {
    _messageCtrl.dispose();
    _nameCtrl.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    final msg = _messageCtrl.text.trim();
    if (msg.length < 5) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('கொஞ்சம் அதிகமா சொல்லுங்க 😊'),
          backgroundColor: Colors.orange,
        ),
      );
      return;
    }
    setState(() => _sending = true);
    try {
      await ApiService.submitFeedback(
        message: msg,
        nameOrContact: _nameCtrl.text.trim().isEmpty ? null : _nameCtrl.text.trim(),
      );
      if (!mounted) return;
      setState(() { _sending = false; _submitted = true; });
    } catch (_) {
      if (!mounted) return;
      setState(() => _sending = false);
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('அனுப்ப முடியலை — கொஞ்சம் கழிச்சு try பண்ணுங்க'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF5FAF5),
      body: CustomScrollView(
        slivers: [
          // ── Header ──────────────────────────────────────────────
          SliverAppBar(
            expandedHeight: 150,
            pinned: true,
            backgroundColor: AppColors.primary,
            leading: IconButton(
              icon: const Icon(Icons.arrow_back_rounded, color: Colors.white),
              onPressed: () => Navigator.of(context).maybePop(),
            ),
            flexibleSpace: FlexibleSpaceBar(
              background: Container(
                decoration: const BoxDecoration(
                  gradient: LinearGradient(
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                    colors: [Color(0xFF1B5E20), Color(0xFF388E3C), Color(0xFF66BB6A)],
                  ),
                ),
                child: const SafeArea(
                  child: Padding(
                    padding: EdgeInsets.only(top: 44),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text('💬', style: TextStyle(fontSize: 32)),
                        SizedBox(height: 4),
                        Text(
                          'உங்கள் கருத்து சொல்லுங்க',
                          style: TextStyle(
                            fontFamily: 'NotoSansTamil',
                            fontSize: 20,
                            fontWeight: FontWeight.bold,
                            color: Colors.white,
                          ),
                        ),
                        Text(
                          'Share your feedback & suggestions',
                          style: TextStyle(
                            fontFamily: 'Roboto',
                            fontSize: 12,
                            color: Colors.white70,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ),
          ),

          // ── Content ─────────────────────────────────────────────
          SliverPadding(
            padding: const EdgeInsets.fromLTRB(16, 20, 16, 40),
            sliver: SliverToBoxAdapter(
              child: _submitted ? _buildSuccessState() : _buildForm(),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildForm() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Intro card
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(14),
            boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 8)],
          ),
          child: const Column(
            children: [
              Row(children: [
                Text('📝', style: TextStyle(fontSize: 22)),
                SizedBox(width: 10),
                Expanded(
                  child: Text(
                    'என்னன்னா சொல்லலாம்?',
                    style: TextStyle(
                      fontFamily: 'NotoSansTamil',
                      fontSize: 16,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                ),
              ]),
              SizedBox(height: 10),
              _FeedbackHint(icon: '🐛', text: 'App-ல ஏதாவது சரியில்லன்னா சொல்லுங்க'),
              _FeedbackHint(icon: '💡', text: 'புது feature idea இருந்தா share பண்ணுங்க'),
              _FeedbackHint(icon: '📢', text: 'ஊர் தகவல் தப்பா இருந்தா தெரியப்படுத்துங்க'),
              _FeedbackHint(icon: '👍', text: 'நல்லா இருந்தாலும் சொல்லலாம்!'),
            ],
          ),
        ),

        const SizedBox(height: 20),

        // Message field
        const Text(
          'உங்கள் கருத்து / தகவல்',
          style: TextStyle(
            fontFamily: 'NotoSansTamil',
            fontSize: 15,
            fontWeight: FontWeight.w600,
            color: Color(0xFF424242),
          ),
        ),
        const SizedBox(height: 8),
        TextField(
          controller: _messageCtrl,
          maxLines: 5,
          maxLength: 500,
          style: const TextStyle(fontFamily: 'NotoSansTamil', fontSize: 16),
          decoration: InputDecoration(
            hintText: 'இங்க type பண்ணுங்க...',
            hintStyle: const TextStyle(fontFamily: 'NotoSansTamil', color: Colors.grey),
            filled: true,
            fillColor: Colors.white,
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: const BorderSide(color: Color(0xFFE0E0E0)),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: const BorderSide(color: AppColors.primary, width: 2),
            ),
          ),
        ),

        const SizedBox(height: 16),

        // Optional name
        const Text(
          'பெயர் / தொலைபேசி (optional)',
          style: TextStyle(
            fontFamily: 'NotoSansTamil',
            fontSize: 15,
            fontWeight: FontWeight.w600,
            color: Color(0xFF424242),
          ),
        ),
        const SizedBox(height: 8),
        TextField(
          controller: _nameCtrl,
          style: const TextStyle(fontFamily: 'NotoSansTamil', fontSize: 16),
          decoration: InputDecoration(
            hintText: 'பெயர் சொல்ல விரும்பினா மட்டும்...',
            hintStyle: const TextStyle(fontFamily: 'NotoSansTamil', color: Colors.grey, fontSize: 14),
            filled: true,
            fillColor: Colors.white,
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: const BorderSide(color: Color(0xFFE0E0E0)),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: const BorderSide(color: AppColors.primary, width: 2),
            ),
          ),
        ),
        const SizedBox(height: 6),
        const Text(
          'பெயர் சொல்ல வேண்டாம் — anonymous ஆகவும் அனுப்பலாம்',
          style: TextStyle(fontFamily: 'NotoSansTamil', fontSize: 12, color: Color(0xFF9E9E9E)),
        ),

        const SizedBox(height: 28),

        // Submit button
        SizedBox(
          width: double.infinity,
          height: 54,
          child: ElevatedButton(
            onPressed: _sending ? null : _submit,
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primary,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
              elevation: 3,
            ),
            child: _sending
                ? const SizedBox(
                    width: 24, height: 24,
                    child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2.5),
                  )
                : const Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(
                        'அனுப்புங்க  ',
                        style: TextStyle(
                          fontFamily: 'NotoSansTamil',
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                        ),
                      ),
                      Text('📨', style: TextStyle(fontSize: 20)),
                    ],
                  ),
          ),
        ),
      ],
    );
  }

  Widget _buildSuccessState() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 40),
        child: Column(
          children: [
            const Text('🙏', style: TextStyle(fontSize: 64)),
            const SizedBox(height: 20),
            const Text(
              'நன்றி சார்!',
              style: TextStyle(
                fontFamily: 'NotoSansTamil',
                fontSize: 26,
                fontWeight: FontWeight.bold,
                color: AppColors.primary,
              ),
            ),
            const SizedBox(height: 10),
            const Text(
              'உங்கள் கருத்து கிடைச்சது.\nவிரைவில் பார்க்கிறோம்.',
              textAlign: TextAlign.center,
              style: TextStyle(
                fontFamily: 'NotoSansTamil',
                fontSize: 16,
                color: Color(0xFF616161),
                height: 1.6,
              ),
            ),
            const SizedBox(height: 6),
            const Text(
              'Thank you — we\'ll review it soon.',
              style: TextStyle(fontFamily: 'Roboto', fontSize: 13, color: Colors.grey),
            ),
            const SizedBox(height: 32),
            OutlinedButton(
              onPressed: () {
                setState(() {
                  _submitted = false;
                  _messageCtrl.clear();
                  _nameCtrl.clear();
                });
              },
              style: OutlinedButton.styleFrom(
                side: const BorderSide(color: AppColors.primary),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                padding: const EdgeInsets.symmetric(horizontal: 28, vertical: 12),
              ),
              child: const Text(
                'இன்னொரு கருத்து சொல்ல',
                style: TextStyle(
                  fontFamily: 'NotoSansTamil',
                  fontSize: 15,
                  color: AppColors.primary,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// Small hint row widget
class _FeedbackHint extends StatelessWidget {
  final String icon;
  final String text;
  const _FeedbackHint({required this.icon, required this.text});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 3),
      child: Row(
        children: [
          Text(icon, style: const TextStyle(fontSize: 15)),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              text,
              style: const TextStyle(
                fontFamily: 'NotoSansTamil',
                fontSize: 13,
                color: Color(0xFF616161),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
