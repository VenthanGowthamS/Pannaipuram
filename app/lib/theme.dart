import 'package:flutter/material.dart';

class AppTheme {
  static const Color primary = Color(0xFF1B5E20);
  static const Color powerYellow = Color(0xFFF9A825);
  static const Color waterBlue = Color(0xFF0277BD);
  static const Color busOrange = Color(0xFFE65100);
  static const Color hospitalRed = Color(0xFFB71C1C);
  static const Color background = Color(0xFFF5F5F5);
  static const Color card = Color(0xFFFFFFFF);
  static const Color textPrimary = Color(0xFF212121);
  static const Color textSecondary = Color(0xFF757575);

  static ThemeData get theme => ThemeData(
        colorScheme: ColorScheme.fromSeed(
          seedColor: primary,
          primary: primary,
        ),
        scaffoldBackgroundColor: background,
        appBarTheme: const AppBarTheme(
          backgroundColor: primary,
          foregroundColor: Colors.white,
          elevation: 0,
        ),
        cardTheme: const CardThemeData(
          color: card,
          elevation: 2,
          margin: EdgeInsets.symmetric(horizontal: 16, vertical: 6),
        ),
        useMaterial3: true,
      );
}
