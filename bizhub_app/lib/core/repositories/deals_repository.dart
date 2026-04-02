import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/deal.dart';
import '../services/supabase_service.dart';

class DealsRepository {
  final _client = SupabaseService.client;

  /// Fetch active (non-expired) deals, flash deals first
  Future<List<Deal>> getActiveDeals() async {
    final now = DateTime.now().toIso8601String().split('T')[0];

    final data = await _client
        .from('deals')
        .select()
        .or('expiry_date.is.null,expiry_date.gte.$now')
        .order('is_flash_deal', ascending: false)
        .order('created_at', ascending: false);

    return (data as List).map((e) => Deal.fromJson(e)).toList();
  }
}

/// Provider
final dealsRepositoryProvider = Provider<DealsRepository>((ref) {
  return DealsRepository();
});

/// Active deals provider
final activeDealsProvider = FutureProvider<List<Deal>>((ref) async {
  final repo = ref.watch(dealsRepositoryProvider);
  return repo.getActiveDeals();
});
