import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../services/supabase_service.dart';

class LeadsRepository {
  final _client = SupabaseService.client;

  /// Fetch open broadcast_requests matching owner's business categories
  Future<List<Map<String, dynamic>>> getLeads(List<String> categories) async {
    if (categories.isEmpty) return [];

    final data = await _client
        .from('broadcast_requests')
        .select('*')
        .inFilter('category', categories)
        .eq('status', 'open')
        .order('created_at', ascending: false);

    final result = List<Map<String, dynamic>>.from(data);

    // Enrich with user display_name
    for (int i = 0; i < result.length; i++) {
      final userId = result[i]['user_id'];
      if (userId != null) {
        try {
          final user = await _client
              .from('users')
              .select('display_name')
              .eq('id', userId)
              .maybeSingle();
          result[i] = {
            ...result[i],
            'user_name': user?['display_name'] ?? 'Local Customer',
          };
        } catch (_) {
          result[i] = {...result[i], 'user_name': 'Local Customer'};
        }
      } else {
        result[i] = {...result[i], 'user_name': 'Local Customer'};
      }
    }
    return result;
  }

  /// Submit a quote response to a broadcast request
  Future<void> respondToLead({
    required String requestId,
    required String businessId,
    required String message,
    String? quoteAmount,
  }) async {
    await _client.from('broadcast_responses').insert({
      'request_id': requestId,
      'business_id': businessId,
      'message': message,
      if (quoteAmount != null && quoteAmount.isNotEmpty) 'quote_amount': quoteAmount,
    });
  }

  /// User submits a new broadcast request ("I need X")
  Future<void> submitBroadcastRequest({
    required String userId,
    required String category,
    required String description,
    String? budget,
  }) async {
    await _client.from('broadcast_requests').insert({
      'user_id': userId,
      'category': category,
      'description': description,
      if (budget != null && budget.isNotEmpty) 'budget': budget,
      'status': 'open',
    });
  }
}

final leadsRepositoryProvider = Provider<LeadsRepository>((ref) {
  return LeadsRepository();
});
