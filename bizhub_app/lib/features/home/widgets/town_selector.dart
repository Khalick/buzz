import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:bizhub_app/core/theme/town_theme_provider.dart';
import 'package:bizhub_app/core/theme/town_themes.dart';

class TownSelector extends ConsumerWidget {
  const TownSelector({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final currentTown = ref.watch(townThemeProvider);
    final theme = Theme.of(context);

    return AnimatedContainer(
      duration: const Duration(milliseconds: 300),
      width: double.infinity,
      color: theme.colorScheme.primary.withAlpha(20),
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: Row(
        children: [
          Icon(Icons.location_on, color: theme.colorScheme.primary, size: 20),
          const SizedBox(width: 8),
          Text(
            'Current Town:',
            style: theme.textTheme.bodyMedium?.copyWith(
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(width: 8),
          Expanded(
            child: DropdownButtonHideUnderline(
              child: DropdownButton<String>(
                value: currentTown,
                isExpanded: true,
                icon: Icon(Icons.arrow_drop_down, color: theme.colorScheme.primary),
                items: TownThemes.themes.keys.map((String town) {
                  return DropdownMenuItem<String>(
                    value: town,
                    child: Text(
                      town,
                      style: theme.textTheme.bodyMedium?.copyWith(
                        color: theme.colorScheme.primary,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  );
                }).toList(),
                onChanged: (String? newTown) {
                  if (newTown != null) {
                    ref.read(townThemeProvider.notifier).setTown(newTown);
                  }
                },
              ),
            ),
          ),
        ],
      ),
    );
  }
}
