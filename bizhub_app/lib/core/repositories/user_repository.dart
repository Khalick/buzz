import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/user_profile.dart';
import '../services/supabase_service.dart';

class UserRepository {
  final _client = SupabaseService.client;

  /// Fetch user profile
  Future<UserProfile?> getUserProfile(String userId) async {
    final data = await _client
        .from('users')
        .select()
        .eq('id', userId)
        .maybeSingle();

    if (data == null) return null;
    return UserProfile.fromJson(data);
  }

  /// Update user profile
  Future<void> updateProfile({
    required String userId,
    required String displayName,
    String? phone,
    String? location,
    String? bio,
  }) async {
    await _client.from('users').update({
      'display_name': displayName,
      'phone': phone,
      'location': location,
      'bio': bio,
      'updated_at': DateTime.now().toIso8601String(),
    }).eq('id', userId);
  }

  /// Toggle a business in favorites
  Future<List<String>> toggleFavorite(String userId, String businessId) async {
    final profile = await getUserProfile(userId);
    if (profile == null) return [];

    final favorites = List<String>.from(profile.favorites);
    if (favorites.contains(businessId)) {
      favorites.remove(businessId);
    } else {
      favorites.add(businessId);
    }

    await _client.from('users').update({
      'favorites': favorites,
    }).eq('id', userId);

    return favorites;
  }

  /// Get user's submitted businesses
  Future<List<Map<String, dynamic>>> getUserBusinesses(String userId) async {
    final data = await _client
        .from('businesses')
        .select('id, name, approved, created_at')
        .eq('submitted_by', userId)
        .order('created_at', ascending: false);

    return List<Map<String, dynamic>>.from(data);
  }

  /// Get user's proof of visits
  Future<List<Map<String, dynamic>>> getUserProofs(String userId) async {
    final data = await _client
        .from('proofs')
        .select('id, business_name, approved, created_at')
        .eq('submitted_by', userId)
        .order('created_at', ascending: false);

    return List<Map<String, dynamic>>.from(data);
  }
}

/// Provider
final userRepositoryProvider = Provider<UserRepository>((ref) {
  return UserRepository();
});
