import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'town_themes.dart';

final sharedPreferencesProvider = Provider<SharedPreferences>((ref) {
  throw UnimplementedError('SharedPreferences must be overridden in main.dart');
});

class TownThemeNotifier extends Notifier<String> {
  static const _townKey = 'selected_town';

  @override
  String build() {
    final prefs = ref.watch(sharedPreferencesProvider);
    return prefs.getString(_townKey) ?? 'Thika';
  }

  void setTown(String townName) {
    if (TownThemes.themes.containsKey(townName)) {
      state = townName;
      ref.read(sharedPreferencesProvider).setString(_townKey, townName);
    }
  }

  TownColorPalette get currentTheme => TownThemes.getTheme(state);
}

final townThemeProvider = NotifierProvider<TownThemeNotifier, String>(() {
  return TownThemeNotifier();
});

final currentTownPaletteProvider = Provider<TownColorPalette>((ref) {
  final townName = ref.watch(townThemeProvider);
  return TownThemes.getTheme(townName);
});
