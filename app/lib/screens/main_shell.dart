import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'home_screen.dart';
import 'emergency_screen.dart';
import 'about_screen.dart';
import 'feedback_screen.dart';

// ── Custom bottom nav item — large tap target, clear label ─────────────────
class _NavItem extends StatelessWidget {
  final IconData icon;
  final IconData? activeIcon;
  final String label;
  final bool selected;
  final Color selectedColor;
  final VoidCallback onTap;

  const _NavItem({
    required this.icon,
    this.activeIcon,
    required this.label,
    required this.selected,
    this.selectedColor = const Color(0xFF1B5E20),
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: GestureDetector(
        onTap: onTap,
        behavior: HitTestBehavior.opaque,
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          padding: const EdgeInsets.symmetric(vertical: 6),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              // Pill highlight behind active icon
              AnimatedContainer(
                duration: const Duration(milliseconds: 200),
                width: selected ? 52 : 32,
                height: 34,
                decoration: BoxDecoration(
                  color: selected ? selectedColor.withValues(alpha: 0.12) : Colors.transparent,
                  borderRadius: BorderRadius.circular(17),
                ),
                child: Icon(
                  selected ? (activeIcon ?? icon) : icon,
                  size: 28,
                  color: selected ? selectedColor : const Color(0xFF9E9E9E),
                ),
              ),
              const SizedBox(height: 3),
              Text(
                label,
                style: TextStyle(
                  fontFamily: 'NotoSansTamil',
                  fontSize: 12,
                  fontWeight: selected ? FontWeight.w700 : FontWeight.w400,
                  color: selected ? selectedColor : const Color(0xFF9E9E9E),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

/// Persistent bottom navigation shell.
/// Home tab uses a nested Navigator so sub-screens (Bus, Power, etc.)
/// push WITHIN the tab — bottom nav stays visible at all times.
class MainShell extends StatefulWidget {
  const MainShell({super.key});

  @override
  State<MainShell> createState() => _MainShellState();
}

class _MainShellState extends State<MainShell> {
  int _currentIndex = 0;
  final _homeNavKey = GlobalKey<NavigatorState>();

  @override
  Widget build(BuildContext context) {
    return PopScope(
      canPop: false,
      onPopInvokedWithResult: (didPop, _) {
        if (didPop) return;
        // If on non-home tab, go to home first
        if (_currentIndex != 0) {
          setState(() => _currentIndex = 0);
          return;
        }
        // If home tab has sub-navigation, pop it
        if (_homeNavKey.currentState?.canPop() ?? false) {
          _homeNavKey.currentState!.pop();
          return;
        }
        // Properly exit the app (no black screen)
        SystemNavigator.pop();
      },
      child: Scaffold(
        body: IndexedStack(
          index: _currentIndex,
          children: [
            // Home tab — nested Navigator for sub-screen push
            Navigator(
              key: _homeNavKey,
              onGenerateRoute: (_) => MaterialPageRoute(
                builder: (_) => const HomeScreen(),
              ),
            ),
            // Emergency tab
            const EmergencyScreen(),
            // About tab
            const AboutScreen(),
            // Feedback tab
            const FeedbackScreen(),
          ],
        ),
        bottomNavigationBar: Container(
          decoration: BoxDecoration(
            color: Colors.white,
            boxShadow: [
              BoxShadow(color: Colors.black.withValues(alpha: 0.10), blurRadius: 16, offset: const Offset(0, -3)),
            ],
          ),
          child: SafeArea(
            top: false,
            child: SizedBox(
              height: 70,
              child: Row(
                children: [
                  _NavItem(icon: Icons.home_rounded, label: 'முகப்பு', selected: _currentIndex == 0,
                    onTap: () {
                      if (_currentIndex == 0) _homeNavKey.currentState?.popUntil((r) => r.isFirst);
                      setState(() => _currentIndex = 0);
                    }),
                  _NavItem(
                    icon: Icons.emergency_rounded,
                    label: 'அவசரம்',
                    selected: _currentIndex == 1,
                    selectedColor: const Color(0xFFB71C1C),
                    onTap: () => setState(() => _currentIndex = 1),
                  ),
                  _NavItem(icon: Icons.info_outline_rounded, label: 'பற்றி', selected: _currentIndex == 2,
                    onTap: () => setState(() => _currentIndex = 2)),
                  _NavItem(
                    icon: Icons.chat_bubble_outline_rounded,
                    activeIcon: Icons.chat_bubble_rounded,
                    label: 'கருத்து',
                    selected: _currentIndex == 3,
                    onTap: () => setState(() => _currentIndex = 3),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
