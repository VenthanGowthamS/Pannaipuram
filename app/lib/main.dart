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

class PannaipuramApp extends StatefulWidget {
  const PannaipuramApp({super.key});

  @override
  State<PannaipuramApp> createState() => _PannaipuramAppState();
}

class _PannaipuramAppState extends State<PannaipuramApp>
    with WidgetsBindingObserver {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    super.dispose();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    // When the app returns from background, force a rebuild to avoid black screen
    if (state == AppLifecycleState.resumed) {
      setState(() {});
    }
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'பண்ணைப்புரம்',
      theme: AppTheme.theme,
      debugShowCheckedModeBanner: false,
      home: const SplashScreen(),
      // Clamp system font scaling — prevents text overflow on phones
      // with large accessibility font settings
      builder: (context, child) {
        final mq = MediaQuery.of(context);
        return MediaQuery(
          data: mq.copyWith(
            textScaler: mq.textScaler.clamp(
              minScaleFactor: 0.85,
              maxScaleFactor: 1.15,
            ),
          ),
          child: child!,
        );
      },
    );
  }
}
