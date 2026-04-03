import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/business.dart';
import '../services/supabase_service.dart';

class BusinessRepository {
  final _client = SupabaseService.client;

  /// Fetch paginated businesses with search, category, town, and sort
  Future<List<Business>> getBusinesses({
    String? search,
    String? category,
    String? town,
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

    if (town != null && town.isNotEmpty) {
      query = query.eq('location->>town', town);
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

  /// Fetch featured businesses (highest rated), optionally by town
  Future<List<Business>> getFeaturedBusinesses({int limit = 5, String? town}) async {
    dynamic query = _client
        .from('businesses')
        .select()
        .eq('approved', true);

    if (town != null && town.isNotEmpty) {
      query = query.eq('location->>town', town);
    }

    query = query.order('rating', ascending: false).limit(limit);

    final data = await query;
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

  /// Submit a review
  Future<void> submitReview({
    required String businessId,
    required String userId,
    required String userName,
    required int rating,
    required String content,
  }) async {
    await _client.from('reviews').insert({
      'business_id': businessId,
      'user_id': userId,
      'user_name': userName,
      'rating': rating,
      'content': content,
      'created_at': DateTime.now().toIso8601String(),
    });
  }

  /// Submit a new business for approval
  Future<void> submitBusiness({
    required String name,
    required String description,
    required String category,
    String? phone,
    String? whatsapp,
    String? email,
    String? website,
    String? address,
    String? town,
    String? county,
    double? latitude,
    double? longitude,
    required String submittedBy,
  }) async {
    final Map<String, dynamic> row = {
      'name': name,
      'category': category,
      'approved': false,
      'submitted_by': submittedBy,
      'created_at': DateTime.now().toIso8601String(),
    };

    if (description.isNotEmpty) row['description'] = description;
    if (website != null && website.isNotEmpty) row['website'] = website;
    if (whatsapp != null && whatsapp.isNotEmpty) row['whatsapp'] = whatsapp;
    if (address != null && address.isNotEmpty) row['address'] = address;

    if (phone != null && phone.isNotEmpty || email != null && email.isNotEmpty) {
      row['contact'] = {
        if (phone != null && phone.isNotEmpty) 'phone': phone,
        if (email != null && email.isNotEmpty) 'email': email,
      };
    }

    if (town != null && town.isNotEmpty || county != null && county.isNotEmpty) {
      row['location'] = {
        if (town != null && town.isNotEmpty) 'town': town,
        if (county != null && county.isNotEmpty) 'county': county,
      };
    }

    if (latitude != null && longitude != null) {
      row['coordinates'] = {
        'latitude': latitude,
        'longitude': longitude,
      };
    }

    await _client.from('businesses').insert(row);
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

  /// Increment view count
  Future<void> incrementViewCount(String businessId) async {
    try {
      await _client.rpc('increment_views', params: {'business_id_param': businessId});
    } catch (_) {
      // Silently fail — RPC may not exist yet
      try {
        final current = await _client
            .from('businesses')
            .select('views')
            .eq('id', businessId)
            .maybeSingle();
        if (current != null) {
          final views = (current['views'] as num?)?.toInt() ?? 0;
          await _client.from('businesses').update({'views': views + 1}).eq('id', businessId);
        }
      } catch (_) {}
    }
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
