import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'services/prefs_service.dart';
import 'theme/app_theme.dart';
import 'screens/splash_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  await SystemChrome.setPreferredOrientations([
    DeviceOrientation.portraitUp,
    DeviceOrientation.portraitDown,
  ]);

  await PrefsService.init();
  await PrefsService.ensureDefaultStreet();

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
      home: const SplashScreen(),
    );
  }
}
