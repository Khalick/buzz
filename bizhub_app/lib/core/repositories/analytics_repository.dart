import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../services/supabase_service.dart';

class AnalyticsRepository {
  final _client = SupabaseService.client;

  /// Check if current user is admin
  Future<bool> isAdmin() async {
    final userId = _client.auth.currentUser?.id;
    if (userId == null) return false;
    try {
      final data = await _client
          .from('users')
          .select('role')
          .eq('id', userId)
          .maybeSingle();
      return data?['role'] == 'admin';
    } catch (_) {
      return false;
    }
  }

  /// Fetch platform analytics (admin only) — mirrors /api/analytics
  Future<Map<String, dynamic>> getAnalytics() async {
    final now = DateTime.now();
    final weekAgo = now.subtract(const Duration(days: 7));

    final users = await _client.from('users').select('id, display_name, email, role, created_at');
    final businesses = await _client.from('businesses').select('id, name, category, location, approved, created_at');

    final totalUsers = (users as List).length;
    final totalBusinesses = (businesses as List).length;
    final approvedBusinesses = businesses.where((b) => b['approved'] == true).length;
    final pendingBusinesses = businesses.where((b) => b['approved'] != true).length;

    final newUsersThisWeek = users.where((u) {
      final created = DateTime.tryParse(u['created_at'] ?? '');
      return created != null && created.isAfter(weekAgo);
    }).length;

    final newBusinessesThisWeek = businesses.where((b) {
      final created = DateTime.tryParse(b['created_at'] ?? '');
      return created != null && created.isAfter(weekAgo);
    }).length;

    // Category breakdown
    final Map<String, int> byCategory = {};
    for (final b in businesses) {
      final cat = b['category'] as String? ?? 'Unknown';
      byCategory[cat] = (byCategory[cat] ?? 0) + 1;
    }

    // County breakdown
    final Map<String, int> byCounty = {};
    for (final b in businesses) {
      final loc = b['location'];
      final county = (loc is Map ? loc['county'] : null) as String? ?? 'Unknown';
      byCounty[county] = (byCounty[county] ?? 0) + 1;
    }

    // recent 5
    final recentUsers = users.reversed.take(5).toList();
    final recentBusinesses = businesses.reversed.take(5).toList();

    return {
      'overview': {
        'totalUsers': totalUsers,
        'totalBusinesses': totalBusinesses,
        'approvedBusinesses': approvedBusinesses,
        'pendingBusinesses': pendingBusinesses,
        'totalInvites': 0,
      },
      'growth': {
        'newUsersThisWeek': newUsersThisWeek,
        'newBusinessesThisWeek': newBusinessesThisWeek,
      },
      'breakdown': {
        'byCategory': byCategory,
        'byCounty': byCounty,
      },
      'recent': {
        'users': recentUsers,
        'businesses': recentBusinesses,
      },
      'lastUpdated': now.toIso8601String(),
    };
  }

  /// Fetch competitor/category insights (admin only) — mirrors /api/insights
  Future<List<Map<String, dynamic>>> getCompetitorInsights() async {
    final businesses = await _client
        .from('businesses')
        .select('category, rating, review_count, name')
        .eq('approved', true);

    // Group by category
    final Map<String, List<dynamic>> grouped = {};
    for (final b in businesses as List) {
      final cat = b['category'] as String? ?? 'Unknown';
      grouped.putIfAbsent(cat, () => []).add(b);
    }

    final List<Map<String, dynamic>> stats = [];
    for (final entry in grouped.entries) {
      final cat = entry.key;
      final list = entry.value;
      final total = list.length;

      final avgRating = list.isEmpty
          ? 0.0
          : list.fold(0.0, (sum, b) => sum + ((b['rating'] as num?)?.toDouble() ?? 0.0)) / total;

      final totalReviews = list.fold(0, (sum, b) => sum + ((b['review_count'] as num?)?.toInt() ?? 0));

      // Top performer = highest rated
      final sorted = List.from(list)
        ..sort((a, b) => ((b['rating'] as num?)?.toDouble() ?? 0.0)
            .compareTo((a['rating'] as num?)?.toDouble() ?? 0.0));
      final topPerformer = sorted.isNotEmpty ? (sorted.first['name'] as String? ?? '') : '';

      stats.add({
        'category': cat,
        'totalBusinesses': total,
        'averageRating': avgRating,
        'totalReviews': totalReviews,
        'topPerformer': topPerformer,
      });
    }

    stats.sort((a, b) => (b['totalBusinesses'] as int) - (a['totalBusinesses'] as int));
    return stats;
  }
}

final analyticsRepositoryProvider = Provider<AnalyticsRepository>((ref) {
  return AnalyticsRepository();
});
