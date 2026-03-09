import 'package:flutter/material.dart';

class AppColors {
  static const primary = Color(0xFF1B5E20);
  static const powerYellow = Color(0xFFF9A825);
  static const waterBlue = Color(0xFF0277BD);
  static const busOrange = Color(0xFFE65100);
  static const hospitalRed = Color(0xFFB71C1C);
  static const background = Color(0xFFF5F5F5);
  static const card = Color(0xFFFFFFFF);
  static const textPrimary = Color(0xFF212121);
  static const textSecondary = Color(0xFF757575);
  static const lastBusRed = Color(0xFFD32F2F);
}

class AppTheme {
  static ThemeData get theme {
    return ThemeData(
      useMaterial3: true,
      colorScheme: ColorScheme.fromSeed(
        seedColor: AppColors.primary,
        primary: AppColors.primary,
        background: AppColors.background,
      ),
      scaffoldBackgroundColor: AppColors.background,
      fontFamily: 'NotoSansTamil',
      appBarTheme: const AppBarTheme(
        backgroundColor: AppColors.primary,
        foregroundColor: Colors.white,
        elevation: 0,
        titleTextStyle: TextStyle(
          fontFamily: 'NotoSansTamil',
          fontSize: 20,
          fontWeight: FontWeight.bold,
          color: Colors.white,
        ),
      ),
      cardTheme: CardTheme(
        color: AppColors.card,
        elevation: 2,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: AppColors.primary,
          foregroundColor: Colors.white,
          minimumSize: const Size(double.infinity, 52),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
          textStyle: const TextStyle(
            fontFamily: 'NotoSansTamil',
            fontSize: 18,
            fontWeight: FontWeight.w500,
          ),
        ),
      ),
      textTheme: const TextTheme(
        titleLarge: TextStyle(
          fontFamily: 'NotoSansTamil',
          fontSize: 22,
          fontWeight: FontWeight.bold,
          color: AppColors.textPrimary,
        ),
        titleMedium: TextStyle(
          fontFamily: 'NotoSansTamil',
          fontSize: 20,
          fontWeight: FontWeight.bold,
          color: AppColors.textPrimary,
        ),
        bodyLarge: TextStyle(
          fontFamily: 'NotoSansTamil',
          fontSize: 18,
          color: AppColors.textPrimary,
        ),
        bodyMedium: TextStyle(
          fontFamily: 'NotoSansTamil',
          fontSize: 16,
          color: AppColors.textPrimary,
        ),
        bodySmall: TextStyle(
          fontFamily: 'Roboto',
          fontSize: 12,
          color: AppColors.textSecondary,
        ),
      ),
    );
  }
}
