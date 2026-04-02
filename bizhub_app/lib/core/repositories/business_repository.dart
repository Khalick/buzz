import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/business.dart';
import '../services/supabase_service.dart';

class BusinessRepository {
  final _client = SupabaseService.client;

  /// Fetch paginated businesses with search, category, and sort
  Future<List<Business>> getBusinesses({
    String? search,
    String? category,
    String sortBy = 'newest',
    int page = 1,
    int limit = 12,
  }) async {
    dynamic query = _client
        .from('businesses')
        .select()
        .eq('approved', true);

    if (search != null && search.isNotEmpty) {
      query = query.or('name.ilike.%$search%,description.ilike.%$search%,category.ilike.%$search%');
    }

    if (category != null && category != 'All Categories') {
      query = query.eq('category', category);
    }

    // Sort
    switch (sortBy) {
      case 'rating':
        query = query.order('rating', ascending: false);
        break;
      case 'trending':
        query = query.order('views', ascending: false);
        break;
      case 'name':
        query = query.order('name', ascending: true);
        break;
      default: // newest
        query = query.order('created_at', ascending: false);
    }

    // Pagination
    final from = (page - 1) * limit;
    query = query.range(from, from + limit - 1);

    final data = await query;
    return (data as List).map((e) => Business.fromJson(e)).toList();
  }

  /// Fetch a single business by ID
  Future<Business?> getBusinessById(String id) async {
    final data = await _client
        .from('businesses')
        .select()
        .eq('id', id)
        .maybeSingle();

    if (data == null) return null;
    return Business.fromJson(data);
  }

  /// Fetch featured businesses (highest rated)
  Future<List<Business>> getFeaturedBusinesses({int limit = 5}) async {
    final data = await _client
        .from('businesses')
        .select()
        .eq('approved', true)
        .order('rating', ascending: false)
        .limit(limit);

    return (data as List).map((e) => Business.fromJson(e)).toList();
  }

  /// Fetch distinct categories
  Future<List<String>> getCategories() async {
    try {
      final data = await _client
          .from('categories')
          .select('name')
          .order('name');

      return (data as List).map((e) => e['name'] as String).toList();
    } catch (_) {
      // Fallback: get unique categories from businesses
      final data = await _client
          .from('businesses')
          .select('category')
          .eq('approved', true);

      final categories = (data as List)
          .map((e) => e['category'] as String)
          .toSet()
          .toList();
      categories.sort();
      return categories;
    }
  }

  /// Fetch reviews for a business
  Future<List<Map<String, dynamic>>> getReviews(String businessId) async {
    final data = await _client
        .from('reviews')
        .select()
        .eq('business_id', businessId)
        .order('created_at', ascending: false);

    return List<Map<String, dynamic>>.from(data);
  }

  /// Fetch businesses by IDs (for favorites)
  Future<List<Business>> getBusinessesByIds(List<String> ids) async {
    if (ids.isEmpty) return [];

    final data = await _client
        .from('businesses')
        .select()
        .inFilter('id', ids);

    return (data as List).map((e) => Business.fromJson(e)).toList();
  }
}

/// Riverpod provider
final businessRepositoryProvider = Provider<BusinessRepository>((ref) {
  return BusinessRepository();
});

/// Featured businesses provider
final featuredBusinessesProvider = FutureProvider<List<Business>>((ref) async {
  final repo = ref.watch(businessRepositoryProvider);
  return repo.getFeaturedBusinesses();
});

/// Categories provider
final categoriesProvider = FutureProvider<List<String>>((ref) async {
  final repo = ref.watch(businessRepositoryProvider);
  return repo.getCategories();
});
