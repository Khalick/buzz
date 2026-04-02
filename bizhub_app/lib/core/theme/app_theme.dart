import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'town_themes.dart';

class AppTheme {
  static ThemeData lightTheme(TownColorPalette palette) {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.light,
      colorScheme: ColorScheme.light(
        primary: palette.primary,
        secondary: palette.accent,
        surface: const Color(0xFFFAFAF8),
        onPrimary: Colors.white,
        onSecondary: Colors.white,
      ),
      scaffoldBackgroundColor: const Color(0xFFFAFAF8),
      textTheme: GoogleFonts.interTextTheme().copyWith(
        displayLarge: GoogleFonts.outfit(fontWeight: FontWeight.w800),
        displayMedium: GoogleFonts.outfit(fontWeight: FontWeight.w800),
        displaySmall: GoogleFonts.outfit(fontWeight: FontWeight.w800),
        headlineLarge: GoogleFonts.outfit(fontWeight: FontWeight.bold),
        headlineMedium: GoogleFonts.outfit(fontWeight: FontWeight.bold),
        headlineSmall: GoogleFonts.outfit(fontWeight: FontWeight.bold),
      ),
      appBarTheme: AppBarTheme(
        backgroundColor: palette.primary,
        foregroundColor: Colors.white,
        elevation: 0,
        centerTitle: true,
        titleTextStyle: GoogleFonts.outfit(
          fontWeight: FontWeight.bold,
          fontSize: 20,
          color: Colors.white,
        ),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: palette.primary,
          foregroundColor: Colors.white,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
        ),
      ),
      cardTheme: CardThemeData(
        color: Colors.white,
        elevation: 4,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
        ),
      ),
    );
  }

  static ThemeData darkTheme(TownColorPalette palette) {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.dark,
      colorScheme: ColorScheme.dark(
        primary: palette.primary,
        secondary: palette.accent,
        surface: Color.lerp(const Color(0xFF0A0A0A), palette.primary, 0.15) ?? const Color(0xFF0A0A0A),
        onPrimary: Colors.white,
        onSecondary: Colors.white,
      ),
      scaffoldBackgroundColor: Color.lerp(const Color(0xFF0A0A0A), palette.primary, 0.15) ?? const Color(0xFF0A0A0A),
      textTheme: GoogleFonts.interTextTheme(ThemeData.dark().textTheme).copyWith(
        displayLarge: GoogleFonts.outfit(fontWeight: FontWeight.w800),
        displayMedium: GoogleFonts.outfit(fontWeight: FontWeight.w800),
        displaySmall: GoogleFonts.outfit(fontWeight: FontWeight.w800),
        headlineLarge: GoogleFonts.outfit(fontWeight: FontWeight.bold),
        headlineMedium: GoogleFonts.outfit(fontWeight: FontWeight.bold),
        headlineSmall: GoogleFonts.outfit(fontWeight: FontWeight.bold),
      ),
      appBarTheme: AppBarTheme(
        backgroundColor: Color.lerp(const Color(0xFF151515), palette.primary, 0.25) ?? const Color(0xFF151515),
        foregroundColor: Colors.white,
        elevation: 0,
        centerTitle: true,
        titleTextStyle: GoogleFonts.outfit(
          fontWeight: FontWeight.bold,
          fontSize: 20,
          color: Colors.white,
        ),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: palette.primary,
          foregroundColor: Colors.white,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
        ),
      ),
      cardTheme: CardThemeData(
        color: Color.lerp(const Color(0xFF151515), palette.primary, 0.25) ?? const Color(0xFF151515),
        elevation: 4,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
        ),
      ),
    );
  }
}
