import 'package:flutter/material.dart';
import 'home_screen.dart';
import 'emergency_screen.dart';
import 'about_screen.dart';

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
        // Otherwise let system handle (exit app)
        Navigator.of(context).pop();
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
          ],
        ),
        bottomNavigationBar: BottomNavigationBar(
          currentIndex: _currentIndex,
          onTap: (i) {
            if (i == 0 && _currentIndex == 0) {
              // Double-tap home = pop to root
              _homeNavKey.currentState?.popUntil((route) => route.isFirst);
            }
            setState(() => _currentIndex = i);
          },
          selectedItemColor: const Color(0xFF1B5E20),
          unselectedItemColor: const Color(0xFF9E9E9E),
          backgroundColor: Colors.white,
          type: BottomNavigationBarType.fixed,
          selectedLabelStyle: const TextStyle(
            fontFamily: 'NotoSansTamil', fontSize: 11, fontWeight: FontWeight.w600,
          ),
          unselectedLabelStyle: const TextStyle(
            fontFamily: 'NotoSansTamil', fontSize: 11,
          ),
          elevation: 12,
          items: const [
            BottomNavigationBarItem(
              icon: Icon(Icons.home_rounded),
              label: 'முகப்பு',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.emergency_rounded),
              activeIcon: Icon(Icons.emergency_rounded, color: Color(0xFFB71C1C)),
              label: 'அவசரம்',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.info_outline_rounded),
              label: 'பற்றி',
            ),
          ],
        ),
      ),
    );
  }
}
