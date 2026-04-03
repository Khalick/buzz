import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:bizhub_app/core/theme/app_theme.dart';
import 'package:bizhub_app/core/router/app_router.dart';
import 'package:bizhub_app/core/services/realtime_notification_service.dart';

final scaffoldMessengerKey = GlobalKey<ScaffoldMessengerState>();

class BizHubApp extends ConsumerWidget {
  const BizHubApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    // Wake up the global notification listener
    ref.watch(realtimeNotificationProvider);

    final theme = AppTheme.spotifyTheme();

    return MaterialApp.router(
      title: 'BizHub Network',
      theme: theme,
      darkTheme: theme,
      themeMode: ThemeMode.dark,
      routerConfig: ref.watch(appRouterProvider),
      scaffoldMessengerKey: scaffoldMessengerKey,
      debugShowCheckedModeBanner: false,
    );
  }
}
