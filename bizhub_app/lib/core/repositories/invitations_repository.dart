import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../services/supabase_service.dart';

class InvitationsRepository {
  final _client = SupabaseService.client;

  /// Get invitations via /api/invites (same as web)
  Future<Map<String, dynamic>> getInvitations() async {
    final session = _client.auth.currentSession;
    final token = session?.accessToken;
    if (token == null) return {'sentInvites': [], 'receivedInvites': [], 'stats': {'totalSent': 0, 'accepted': 0, 'pending': 0}};

    // Build the URL — use the deployed Vercel URL or localhost
    // We'll call supabase directly since api/invites is a Next.js route
    // Mirror the web implementation using supabase tables directly
    final userId = _client.auth.currentUser?.id;
    if (userId == null) return {'sentInvites': [], 'receivedInvites': [], 'stats': {'totalSent': 0, 'accepted': 0, 'pending': 0}};

    final sent = await _client
        .from('invites')
        .select('*')
        .eq('inviter_id', userId)
        .order('created_at', ascending: false);

    final received = await _client
        .from('invites')
        .select('*')
        .eq('invitee_email', _client.auth.currentUser?.email ?? '')
        .order('created_at', ascending: false);

    final sentList = List<Map<String, dynamic>>.from(sent);
    final receivedList = List<Map<String, dynamic>>.from(received);

    final accepted = sentList.where((i) => i['status'] == 'accepted').length;
    final pending = sentList.where((i) => i['status'] == 'pending').length;

    return {
      'sentInvites': sentList,
      'receivedInvites': receivedList,
      'stats': {
        'totalSent': sentList.length,
        'accepted': accepted,
        'pending': pending,
      },
    };
  }

  /// Send an invitation
  Future<void> sendInvitation({
    required String inviteeEmail,
    required String type, // 'user' | 'business'
    String? message,
    String? businessName,
  }) async {
    final userId = _client.auth.currentUser?.id;
    if (userId == null) return;

    await _client.from('invites').insert({
      'inviter_id': userId,
      'invitee_email': inviteeEmail,
      'type': type,
      'message': message,
      if (businessName != null) 'business_name': businessName,
      'status': 'pending',
      'expires_at': DateTime.now().add(const Duration(days: 30)).toIso8601String(),
    });
  }
}

final invitationsRepositoryProvider = Provider<InvitationsRepository>((ref) {
  return InvitationsRepository();
});
