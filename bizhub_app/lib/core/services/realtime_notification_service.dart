import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:bizhub_app/app.dart';
import 'package:bizhub_app/core/providers/auth_provider.dart';
import 'package:bizhub_app/core/services/supabase_service.dart';

final realtimeNotificationProvider = Provider<RealtimeNotificationService>((ref) {
  final service = RealtimeNotificationService(ref);
  ref.onDispose(() => service.dispose());
  return service;
});

class RealtimeNotificationService {
  final Ref ref;
  RealtimeChannel? _channel;

  RealtimeNotificationService(this.ref) {
    _init();
  }

  void _init() {
    ref.listen(currentUserProvider, (previous, next) {
      if (next != null) {
        _subscribe(next.id);
      } else {
        _unsubscribe();
      }
    }, fireImmediately: true);
  }

  void _subscribe(String userId) {
    _unsubscribe();
    
    _channel = SupabaseService.client
        .channel('public:notifications:user_$userId')
        .onPostgresChanges(
          event: PostgresChangeEvent.insert,
          schema: 'public',
          table: 'notifications',
          filter: PostgresChangeFilter(
            type: PostgresChangeFilterType.eq,
            column: 'user_id',
            value: userId,
          ),
          callback: (payload) {
            final data = payload.newRecord;
            if (data.isNotEmpty && data['title'] != null) {
              scaffoldMessengerKey.currentState?.showSnackBar(
                SnackBar(
                  content: Text('${data['title']}: ${data['message'] ?? ''}'),
                  action: SnackBarAction(
                    label: 'Close',
                    onPressed: () {},
                    textColor: Colors.white,
                  ),
                  duration: const Duration(seconds: 5),
                  behavior: SnackBarBehavior.floating,
                  backgroundColor: Colors.indigo,
                ),
              );
            }
          },
        )
        .subscribe();
  }

  void _unsubscribe() {
    _channel?.unsubscribe();
    _channel = null;
  }

  void dispose() {
    _unsubscribe();
  }
}
