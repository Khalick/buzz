import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:bizhub_app/core/theme/app_theme.dart';
import 'package:bizhub_app/core/theme/town_theme_provider.dart';
import 'package:bizhub_app/core/router/app_router.dart';
import 'package:bizhub_app/core/services/realtime_notification_service.dart';

final scaffoldMessengerKey = GlobalKey<ScaffoldMessengerState>();

class BizHubApp extends ConsumerWidget {
  const BizHubApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    // Wake up the global notification listener
    ref.watch(realtimeNotificationProvider);
    
    final townPalette = ref.watch(currentTownPaletteProvider);

    return AnimatedTheme(
      data: AppTheme.lightTheme(townPalette),
      duration: const Duration(milliseconds: 300),
      curve: Curves.easeInOut,
      child: MaterialApp.router(
        title: 'BizHub Network',
        theme: AppTheme.lightTheme(townPalette),
        darkTheme: AppTheme.darkTheme(townPalette),
        themeMode: ThemeMode.system,
        routerConfig: ref.watch(appRouterProvider),
        scaffoldMessengerKey: scaffoldMessengerKey,
        debugShowCheckedModeBanner: false,
      ),
    );
  }
}
