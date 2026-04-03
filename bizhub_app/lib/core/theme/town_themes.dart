import 'package:flutter/material.dart';

/// Town metadata — used for content filtering only.
/// Colors are no longer per-town; the app uses a uniform Spotify dark theme.
class TownColorPalette {
  final String townName;
  final String tagLine;

  const TownColorPalette({
    required this.townName,
    required this.tagLine,
  });
}

class TownThemes {
  static const Map<String, TownColorPalette> themes = {
    'Thika': TownColorPalette(townName: 'Thika', tagLine: 'The Pineapple Town'),
    'Nairobi': TownColorPalette(townName: 'Nairobi', tagLine: 'The Green City in the Sun'),
    'Mombasa': TownColorPalette(townName: 'Mombasa', tagLine: 'The Coastal Hub'),
    'Nakuru': TownColorPalette(townName: 'Nakuru', tagLine: 'The Flamingo City'),
    'Kisumu': TownColorPalette(townName: 'Kisumu', tagLine: 'The Lakeside City'),
    'Eldoret': TownColorPalette(townName: 'Eldoret', tagLine: 'Home of Champions'),
    'Nyeri': TownColorPalette(townName: 'Nyeri', tagLine: 'The Cool Highlands'),
    'Machakos': TownColorPalette(townName: 'Machakos', tagLine: 'Macha Spirit'),
    'Meru': TownColorPalette(townName: 'Meru', tagLine: 'Mount Kenya Peaks'),
    'Kajiado': TownColorPalette(townName: 'Kajiado', tagLine: 'Pride of the Maasai'),
    'Malindi': TownColorPalette(townName: 'Malindi', tagLine: 'Historic Coastal Charm'),
    'Nanyuki': TownColorPalette(townName: 'Nanyuki', tagLine: 'Gateway to Laikipia'),
    'Naivasha': TownColorPalette(townName: 'Naivasha', tagLine: 'Lake & Floral Beauty'),
    'Embu': TownColorPalette(townName: 'Embu', tagLine: 'Slopes of Prosperity'),
    'Muranga': TownColorPalette(townName: "Murang'a", tagLine: 'Heritage & Forests'),
    'Lamu': TownColorPalette(townName: 'Lamu', tagLine: 'Timeless Swahili Heritage'),
    'Garissa': TownColorPalette(townName: 'Garissa', tagLine: 'Resilience on the Tana'),
    'Kitui': TownColorPalette(townName: 'Kitui', tagLine: 'Colors of the Kamba'),
  };

  static TownColorPalette getTheme(String townName) {
    return themes[townName] ?? themes['Thika']!;
  }
}
