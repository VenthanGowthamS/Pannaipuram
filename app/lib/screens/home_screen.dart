import 'package:flutter/material.dart';
import 'power_screen.dart';
import 'water_screen.dart';
import 'bus_screen.dart';
import 'auto_screen.dart';
import 'hospital_screen.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF2F6F2),
      body: Column(
        children: [
          _buildHeader(context),
          Expanded(
            child: ListView(
              padding: const EdgeInsets.fromLTRB(14, 16, 14, 28),
              children: [
                const Padding(
                  padding: EdgeInsets.only(left: 2, bottom: 12),
                  child: Text(
                    'சொல்லுங்க, என்ன வேணும்?',
                    style: TextStyle(
                      fontFamily: 'NotoSansTamil',
                      fontSize: 15,
                      color: Color(0xFF4A6741),
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                ),

                // 1. Bus
                _ModuleTile(
                  icon: Icons.directions_bus_rounded,
                  emoji: '🚌',
                  gradientColors: const [Color(0xFFE65100), Color(0xFFF4511E)],
                  label: 'அண்ணே, பஸ் எத்தன மணிக்கு?',
                  sublabel: 'Bus Times & Routes',
                  onTap: () => _navigate(context, const BusScreen()),
                ),
                const SizedBox(height: 12),

                // 2. Auto / Transport
                _ModuleTile(
                  icon: Icons.electric_rickshaw,
                  secondIcon: Icons.directions_car_rounded,
                  emoji: '🚗',
                  gradientColors: const [Color(0xFF4A148C), Color(0xFF7B1FA2)],
                  label: 'சார், ஆட்டோ வேணுமா?',
                  sublabel: 'Auto & Car Transport',
                  onTap: () => _navigate(context, const AutoScreen()),
                ),
                const SizedBox(height: 12),

                // 3. Hospital
                _ModuleTile(
                  icon: Icons.local_hospital_rounded,
                  emoji: '🏥',
                  gradientColors: const [Color(0xFFC62828), Color(0xFFD32F2F)],
                  label: 'சிஸ்டர், டாக்டர் வந்துட்டாரா?',
                  sublabel: 'Hospital & Clinic',
                  onTap: () => _navigate(context, const HospitalScreen()),
                ),
                const SizedBox(height: 12),

                // 4. Electricity
                _ModuleTile(
                  icon: Icons.bolt,
                  emoji: '⚡',
                  gradientColors: const [Color(0xFFF9A825), Color(0xFFFFCA28)],
                  label: 'அண்ணே, கரண்ட் எப்ப வரும்?',
                  sublabel: 'Electricity Status',
                  onTap: () => _navigate(context, const PowerScreen()),
                ),
                const SizedBox(height: 12),

                // 5. Water
                _ModuleTile(
                  icon: Icons.water_drop,
                  emoji: '💧',
                  gradientColors: const [Color(0xFF0288D1), Color(0xFF039BE5)],
                  label: 'அக்கா, தண்ணி வந்துருச்சா?',
                  sublabel: 'Water Supply',
                  onTap: () => _navigate(context, const WaterScreen()),
                ),
                const SizedBox(height: 20),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildHeader(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [Color(0xFF1B5E20), Color(0xFF2E7D32), Color(0xFF388E3C)],
        ),
      ),
      padding: EdgeInsets.only(
        top: MediaQuery.of(context).padding.top + 10,
        left: 18,
        right: 18,
        bottom: 14,
      ),
      child: Row(
        children: [
          Container(
            width: 46,
            height: 46,
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.18),
              borderRadius: BorderRadius.circular(23),
            ),
            child:
                const Icon(Icons.cottage_rounded, color: Colors.white, size: 26),
          ),
          const SizedBox(width: 12),
          const Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'பண்ணைப்புரம்',
                  style: TextStyle(
                    fontFamily: 'NotoSansTamil',
                    fontSize: 22,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                ),
                Text(
                  'உங்கள் ஊரின் தகவல் மையம்',
                  style: TextStyle(
                    fontFamily: 'NotoSansTamil',
                    fontSize: 12,
                    color: Colors.white70,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  void _navigate(BuildContext context, Widget screen) {
    Navigator.push(context, MaterialPageRoute(builder: (_) => screen));
  }
}

// ── Full-width rectangle tile ────────────────────────────────────────────

class _ModuleTile extends StatelessWidget {
  final IconData icon;
  final IconData? secondIcon;
  final String emoji;
  final List<Color> gradientColors;
  final String label;
  final String sublabel;
  final VoidCallback onTap;

  const _ModuleTile({
    required this.icon,
    this.secondIcon,
    required this.emoji,
    required this.gradientColors,
    required this.label,
    required this.sublabel,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        constraints: const BoxConstraints(minHeight: 88),
        padding: const EdgeInsets.symmetric(vertical: 18, horizontal: 18),
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: gradientColors,
          ),
          borderRadius: BorderRadius.circular(18),
          boxShadow: [
            BoxShadow(
              color: gradientColors[0].withOpacity(0.35),
              blurRadius: 10,
              offset: const Offset(0, 4),
            )
          ],
        ),
        child: Stack(
          children: [
            // Background emoji (decorative, clipped)
            Positioned(
              right: 0,
              top: -6,
              bottom: -6,
              child: Center(
                child: Text(emoji,
                    style: TextStyle(
                        fontSize: 52,
                        color: Colors.white.withOpacity(0.13))),
              ),
            ),
            // Content row
            Row(
              children: [
                // Icon circle
                Container(
                  width: 50,
                  height: 50,
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.2),
                    borderRadius: BorderRadius.circular(25),
                  ),
                  child: secondIcon != null
                      ? Stack(
                          alignment: Alignment.center,
                          children: [
                            Positioned(
                              top: 8,
                              child: Icon(secondIcon,
                                  color: Colors.white, size: 20),
                            ),
                            Positioned(
                              bottom: 6,
                              child: Icon(icon,
                                  color: Colors.white70, size: 18),
                            ),
                          ],
                        )
                      : Icon(icon, color: Colors.white, size: 26),
                ),
                const SizedBox(width: 16),
                // Text — allow wrapping, no crop
                Expanded(
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        label,
                        style: const TextStyle(
                          fontFamily: 'NotoSansTamil',
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                          height: 1.3,
                        ),
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                      ),
                      const SizedBox(height: 3),
                      Text(
                        sublabel,
                        style: const TextStyle(
                          fontFamily: 'Roboto',
                          fontSize: 12,
                          color: Colors.white70,
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 8),
                const Icon(Icons.chevron_right_rounded,
                    color: Colors.white60, size: 26),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
