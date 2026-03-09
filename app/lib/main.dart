import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'services/prefs_service.dart';
import 'theme/app_theme.dart';
import 'screens/onboarding_screen.dart';
import 'screens/home_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Force portrait orientation
  await SystemChrome.setPreferredOrientations([
    DeviceOrientation.portraitUp,
    DeviceOrientation.portraitDown,
  ]);

  await PrefsService.init();

  runApp(const PannaipuramApp());
}

class PannaipuramApp extends StatelessWidget {
  const PannaipuramApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'பண்ணைப்புரம்',
      theme: AppTheme.theme,
      debugShowCheckedModeBanner: false,
      home: PrefsService.isOnboarded
          ? const HomeScreen()
          : const OnboardingScreen(),
    );
  }
}
