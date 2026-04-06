import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../services/supabase_service.dart';

class PartnershipsRepository {
  final _client = SupabaseService.client;

  /// Get all partnerships (sent + received) for a business
  Future<List<Map<String, dynamic>>> getPartnerships(String businessId) async {
    final data = await _client
        .from('business_partnerships')
        .select('*')
        .or('business_a_id.eq.$businessId,business_b_id.eq.$businessId')
        .order('created_at', ascending: false);

    final partnerships = List<Map<String, dynamic>>.from(data);

    // Enrich with partner business details
    for (int i = 0; i < partnerships.length; i++) {
      final p = partnerships[i];
      final partnerId = p['business_a_id'] == businessId
          ? p['business_b_id']
          : p['business_a_id'];
      final direction = p['business_a_id'] == businessId ? 'sent' : 'received';

      try {
        final partner = await _client
            .from('businesses')
            .select('id, name, category, location')
            .eq('id', partnerId)
            .maybeSingle();
        partnerships[i] = {...p, 'partner': partner, 'direction': direction};
      } catch (_) {
        partnerships[i] = {...p, 'partner': null, 'direction': direction};
      }
    }
    return partnerships;
  }

  /// Get recommended businesses (different category, excluding existing partners)
  Future<List<Map<String, dynamic>>> getRecommendations({
    required String businessId,
    required String ownerId,
    required String excludeCategory,
    required List<String> excludeIds,
  }) async {
    final data = await _client
        .from('businesses')
        .select('id, name, category, location')
        .neq('category', excludeCategory)
        .neq('owner_id', ownerId)
        .eq('approved', true)
        .limit(5);

    return (data as List<dynamic>)
        .map((e) => Map<String, dynamic>.from(e as Map))
        .where((b) => !excludeIds.contains(b['id']))
        .toList();
  }

  /// Send a partnership request
  Future<Map<String, dynamic>> requestPartnership({
    required String businessAId,
    required String businessBId,
  }) async {
    final data = await _client.from('business_partnerships').insert({
      'business_a_id': businessAId,
      'business_b_id': businessBId,
      'status': 'pending',
    }).select().single();
    return Map<String, dynamic>.from(data);
  }

  /// Accept or decline a partnership
  Future<void> updateStatus({
    required String partnershipId,
    required String status, // 'active' | 'declined'
  }) async {
    await _client
        .from('business_partnerships')
        .update({'status': status})
        .eq('id', partnershipId);
  }
}

final partnershipsRepositoryProvider = Provider<PartnershipsRepository>((ref) {
  return PartnershipsRepository();
});
