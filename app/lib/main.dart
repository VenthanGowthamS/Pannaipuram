import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'theme.dart';
import 'screens/onboarding_screen.dart';
import 'screens/home_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  final prefs = await SharedPreferences.getInstance();
  final street = prefs.getString('selected_street');
  runApp(PannaipuramApp(initialStreet: street));
}

class PannaipuramApp extends StatelessWidget {
  final String? initialStreet;

  const PannaipuramApp({super.key, this.initialStreet});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'பண்ணைப்புரம்',
      theme: AppTheme.theme,
      debugShowCheckedModeBanner: false,
      home: initialStreet == null
          ? const OnboardingScreen()
          : HomeScreen(street: initialStreet!),
    );
  }
}
