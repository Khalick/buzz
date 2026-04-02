import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/notification.dart';
import '../services/supabase_service.dart';

class NotificationRepository {
  final _client = SupabaseService.client;

  /// Fetch notifications for a user
  Future<List<AppNotification>> getNotifications(String userId) async {
    final data = await _client
        .from('notifications')
        .select()
        .eq('user_id', userId)
        .order('created_at', ascending: false)
        .limit(50);

    return (data as List).map((e) => AppNotification.fromJson(e)).toList();
  }

  /// Mark a notification as read
  Future<void> markAsRead(String notificationId) async {
    await _client
        .from('notifications')
        .update({'read': true})
        .eq('id', notificationId);
  }

  /// Count unread notifications
  Future<int> getUnreadCount(String userId) async {
    final data = await _client
        .from('notifications')
        .select('id')
        .eq('user_id', userId)
        .eq('read', false);

    return (data as List).length;
  }
}

/// Provider
final notificationRepositoryProvider = Provider<NotificationRepository>((ref) {
  return NotificationRepository();
});
