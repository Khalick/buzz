import 'package:flutter/material.dart';

class TownColorPalette {
  final Color primary;
  final Color accent;
  // Use a map to handle extra shades if necessary
  final String townName;
  final String tagLine;

  const TownColorPalette({
    required this.primary,
    required this.accent,
    required this.townName,
    required this.tagLine,
  });
}

class TownThemes {
  static const Map<String, TownColorPalette> themes = {
    'Thika': TownColorPalette(
      townName: 'Thika',
      tagLine: 'The Pineapple Town',
      primary: Color(0xFF2D6A4F),
      accent: Color(0xFF8B4513),
    ),
    'Nairobi': TownColorPalette(
      townName: 'Nairobi',
      tagLine: 'The Green City in the Sun',
      primary: Color(0xFFFCDD07),
      accent: Color(0xFF068930),
    ),
    'Mombasa': TownColorPalette(
      townName: 'Mombasa',
      tagLine: 'The Coastal Hub',
      primary: Color(0xFF1565C0),
      accent: Color(0xFFD4AF37),
    ),
    'Nakuru': TownColorPalette(
      townName: 'Nakuru',
      tagLine: 'The Flamingo City',
      primary: Color(0xFF1976D2),
      accent: Color(0xFFF48FB1),
    ),
    'Kisumu': TownColorPalette(
      townName: 'Kisumu',
      tagLine: 'The Lakeside City',
      primary: Color(0xFF0D47A1),
      accent: Color(0xFF2E7D32),
    ),
    'Eldoret': TownColorPalette(
      townName: 'Eldoret',
      tagLine: 'Home of Champions',
      primary: Color(0xFF388E3C),
      accent: Color(0xFFFBC02D),
    ),
    'Nyeri': TownColorPalette(
      townName: 'Nyeri',
      tagLine: 'The Cool Highlands',
      primary: Color(0xFF42A5F5),
      accent: Color(0xFF5D4037),
    ),
    'Machakos': TownColorPalette(
      townName: 'Machakos',
      tagLine: 'Macha Spirit',
      primary: Color(0xFF1565C0),
      accent: Color(0xFFC62828),
    ),
    'Meru': TownColorPalette(
      townName: 'Meru',
      tagLine: 'Mount Kenya Peaks',
      primary: Color(0xFF6A1B9A),
      accent: Color(0xFFF5F5F5),
    ),
    'Kajiado': TownColorPalette(
      townName: 'Kajiado',
      tagLine: 'Pride of the Maasai',
      primary: Color(0xFF4FC3F7),
      accent: Color(0xFF81C784),
    ),
    'Malindi': TownColorPalette(
      townName: 'Malindi',
      tagLine: 'Historic Coastal Charm',
      primary: Color(0xFF00897B),
      accent: Color(0xFFFFB74D),
    ),
    'Nanyuki': TownColorPalette(
      townName: 'Nanyuki',
      tagLine: 'Gateway to Laikipia',
      primary: Color(0xFF50B148),
      accent: Color(0xFFD4A76A),
    ),
    'Naivasha': TownColorPalette(
      townName: 'Naivasha',
      tagLine: 'Lake & Floral Beauty',
      primary: Color(0xFF2196F3),
      accent: Color(0xFFE91E63),
    ),
    'Embu': TownColorPalette(
      townName: 'Embu',
      tagLine: 'Slopes of Prosperity',
      primary: Color(0xFF43A047),
      accent: Color(0xFFFFD54F),
    ),
    'Muranga': TownColorPalette(
      townName: "Murang'a",
      tagLine: 'Heritage & Forests',
      primary: Color(0xFF2E7D32),
      accent: Color(0xFFFDD835),
    ),
    'Lamu': TownColorPalette(
      townName: 'Lamu',
      tagLine: 'Timeless Swahili Heritage',
      primary: Color(0xFFE3F2FD),
      accent: Color(0xFF4DD0E1),
    ),
    'Garissa': TownColorPalette(
      townName: 'Garissa',
      tagLine: 'Resilience on the Tana',
      primary: Color(0xFF1976D2),
      accent: Color(0xFFF9A825),
    ),
    'Kitui': TownColorPalette(
      townName: 'Kitui',
      tagLine: 'Colors of the Kamba',
      primary: Color(0xFF37474F),
      accent: Color(0xFFA1887F),
    ),
  };

  static TownColorPalette getTheme(String townName) {
    return themes[townName] ?? themes['Thika']!;
  }
}
