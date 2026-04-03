import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

/// Spotify-inspired design tokens
class SpotifyColors {
  static const background = Color(0xFF121212);
  static const surface = Color(0xFF181818);
  static const highlight = Color(0xFF282828);
  static const green = Color(0xFF1ED760);
  static const textPrimary = Color(0xFFFFFFFF);
  static const textSecondary = Color(0xFFB3B3B3);
  static const textTertiary = Color(0xFF727272);
  static const error = Color(0xFFE22134);
  static const navBlack = Color(0xFF000000);
  static const overlay = Color(0x99000000); // 60% black
}

class AppTheme {
  /// The single Spotify-style dark theme
  static ThemeData spotifyTheme() {
    final montserrat = GoogleFonts.montserratTextTheme(ThemeData.dark().textTheme);

    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.dark,
      colorScheme: const ColorScheme.dark(
        primary: SpotifyColors.green,
        secondary: SpotifyColors.green,
        surface: SpotifyColors.surface,
        onPrimary: Colors.black,
        onSecondary: Colors.black,
        onSurface: SpotifyColors.textPrimary,
        error: SpotifyColors.error,
      ),
      scaffoldBackgroundColor: SpotifyColors.background,

      // Typography — Montserrat (geometric sans, close to Circular/Spotify Mix)
      textTheme: montserrat.copyWith(
        displayLarge: GoogleFonts.montserrat(
          fontSize: 28, fontWeight: FontWeight.w800, letterSpacing: -0.5, color: SpotifyColors.textPrimary,
        ),
        displayMedium: GoogleFonts.montserrat(
          fontSize: 28, fontWeight: FontWeight.w800, letterSpacing: -0.5, color: SpotifyColors.textPrimary,
        ),
        displaySmall: GoogleFonts.montserrat(
          fontSize: 28, fontWeight: FontWeight.w800, letterSpacing: -0.5, color: SpotifyColors.textPrimary,
        ),
        headlineLarge: GoogleFonts.montserrat(
          fontSize: 22, fontWeight: FontWeight.w700, letterSpacing: -0.3, color: SpotifyColors.textPrimary,
        ),
        headlineMedium: GoogleFonts.montserrat(
          fontSize: 22, fontWeight: FontWeight.w700, letterSpacing: -0.3, color: SpotifyColors.textPrimary,
        ),
        headlineSmall: GoogleFonts.montserrat(
          fontSize: 22, fontWeight: FontWeight.w700, letterSpacing: -0.3, color: SpotifyColors.textPrimary,
        ),
        titleLarge: GoogleFonts.montserrat(
          fontSize: 16, fontWeight: FontWeight.w700, color: SpotifyColors.textPrimary,
        ),
        titleMedium: GoogleFonts.montserrat(
          fontSize: 16, fontWeight: FontWeight.w700, color: SpotifyColors.textPrimary,
        ),
        titleSmall: GoogleFonts.montserrat(
          fontSize: 14, fontWeight: FontWeight.w600, color: SpotifyColors.textPrimary,
        ),
        bodyLarge: GoogleFonts.montserrat(
          fontSize: 14, fontWeight: FontWeight.w400, letterSpacing: 0.1, color: SpotifyColors.textPrimary,
        ),
        bodyMedium: GoogleFonts.montserrat(
          fontSize: 14, fontWeight: FontWeight.w400, letterSpacing: 0.1, color: SpotifyColors.textPrimary,
        ),
        bodySmall: GoogleFonts.montserrat(
          fontSize: 12, fontWeight: FontWeight.w500, letterSpacing: 0.2, color: SpotifyColors.textSecondary,
        ),
        labelLarge: GoogleFonts.montserrat(
          fontSize: 11, fontWeight: FontWeight.w600, letterSpacing: 0.8, color: SpotifyColors.textPrimary,
        ),
        labelMedium: GoogleFonts.montserrat(
          fontSize: 11, fontWeight: FontWeight.w600, letterSpacing: 0.8, color: SpotifyColors.textSecondary,
        ),
        labelSmall: GoogleFonts.montserrat(
          fontSize: 10, fontWeight: FontWeight.w400, color: SpotifyColors.textSecondary,
        ),
      ),

      // AppBar — transparent, no elevation, left-aligned
      appBarTheme: AppBarTheme(
        backgroundColor: SpotifyColors.background,
        foregroundColor: SpotifyColors.textPrimary,
        elevation: 0,
        scrolledUnderElevation: 0,
        centerTitle: false,
        titleTextStyle: GoogleFonts.montserrat(
          fontWeight: FontWeight.w800,
          fontSize: 28,
          color: SpotifyColors.textPrimary,
        ),
      ),

      // Cards — flat, dark surface, 8px radius
      cardTheme: const CardThemeData(
        color: SpotifyColors.surface,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.all(Radius.circular(8)),
        ),
        margin: EdgeInsets.zero,
      ),

      // Buttons — pill-shaped with green background
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: SpotifyColors.green,
          foregroundColor: Colors.black,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(500),
          ),
          padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 14),
          textStyle: GoogleFonts.montserrat(
            fontWeight: FontWeight.w700,
            fontSize: 14,
          ),
        ),
      ),

      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          foregroundColor: SpotifyColors.textPrimary,
          side: const BorderSide(color: SpotifyColors.textSecondary, width: 1),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(500),
          ),
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 10),
          textStyle: GoogleFonts.montserrat(
            fontWeight: FontWeight.w600,
            fontSize: 14,
          ),
        ),
      ),

      textButtonTheme: TextButtonThemeData(
        style: TextButton.styleFrom(
          foregroundColor: SpotifyColors.textSecondary,
          textStyle: GoogleFonts.montserrat(
            fontWeight: FontWeight.w500,
            fontSize: 14,
          ),
        ),
      ),

      // Floating Action Button — green circle
      floatingActionButtonTheme: const FloatingActionButtonThemeData(
        backgroundColor: SpotifyColors.green,
        foregroundColor: Colors.black,
        elevation: 4,
        shape: CircleBorder(),
        sizeConstraints: BoxConstraints.tightFor(width: 56, height: 56),
      ),

      // Input fields — dark fill, no border
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: SpotifyColors.highlight,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: BorderSide.none,
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: BorderSide.none,
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: const BorderSide(color: SpotifyColors.green, width: 1),
        ),
        hintStyle: GoogleFonts.montserrat(
          color: SpotifyColors.textSecondary,
          fontSize: 14,
        ),
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      ),

      // Bottom navigation
      navigationBarTheme: NavigationBarThemeData(
        backgroundColor: SpotifyColors.navBlack,
        elevation: 0,
        height: 56,
        indicatorColor: Colors.transparent,
        iconTheme: WidgetStateProperty.resolveWith((states) {
          if (states.contains(WidgetState.selected)) {
            return const IconThemeData(color: SpotifyColors.textPrimary, size: 24);
          }
          return const IconThemeData(color: SpotifyColors.textSecondary, size: 24);
        }),
        labelTextStyle: WidgetStateProperty.resolveWith((states) {
          if (states.contains(WidgetState.selected)) {
            return GoogleFonts.montserrat(
              color: SpotifyColors.textPrimary, fontSize: 10, fontWeight: FontWeight.w700,
            );
          }
          return GoogleFonts.montserrat(
            color: SpotifyColors.textSecondary, fontSize: 10, fontWeight: FontWeight.w400,
          );
        }),
      ),

      // Chips
      chipTheme: ChipThemeData(
        backgroundColor: SpotifyColors.highlight,
        selectedColor: SpotifyColors.green,
        labelStyle: GoogleFonts.montserrat(
          color: SpotifyColors.textPrimary, fontSize: 12, fontWeight: FontWeight.w500,
        ),
        secondaryLabelStyle: GoogleFonts.montserrat(
          color: Colors.black, fontSize: 12, fontWeight: FontWeight.w600,
        ),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(4)),
        side: BorderSide.none,
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      ),

      // Divider
      dividerTheme: const DividerThemeData(
        color: SpotifyColors.highlight,
        thickness: 1,
        space: 0,
      ),

      // SnackBar
      snackBarTheme: SnackBarThemeData(
        backgroundColor: SpotifyColors.surface,
        contentTextStyle: GoogleFonts.montserrat(
          color: SpotifyColors.textPrimary, fontSize: 14,
        ),
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
      ),

      // Dialog
      dialogTheme: DialogThemeData(
        backgroundColor: SpotifyColors.surface,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
      ),

      // Bottom sheet
      bottomSheetTheme: const BottomSheetThemeData(
        backgroundColor: SpotifyColors.surface,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(top: Radius.circular(12)),
        ),
      ),
    );
  }
}
