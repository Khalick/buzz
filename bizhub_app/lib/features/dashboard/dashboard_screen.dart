import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../core/providers/auth_provider.dart';
import '../../core/repositories/business_repository.dart';
import '../../core/repositories/analytics_repository.dart';
import '../../core/theme/app_theme.dart';

// Provider for owner's businesses with full stats
final ownerBusinessesProvider = FutureProvider((ref) async {
  final user = ref.watch(currentUserProvider);
  if (user == null) return <Map<String, dynamic>>[];
  final repo = ref.watch(businessRepositoryProvider);
  return repo.getUserBusinessesWithStats(user.id);
});

// Provider for admin check
final isAdminProvider = FutureProvider<bool>((ref) async {
  final user = ref.watch(currentUserProvider);
  if (user == null) return false;
  return ref.watch(analyticsRepositoryProvider).isAdmin();
});

class DashboardScreen extends ConsumerWidget {
  const DashboardScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    final businessesAsync = ref.watch(ownerBusinessesProvider);
    final isAdminAsync = ref.watch(isAdminProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('My Dashboard'),
        centerTitle: true,
      ),
      body: RefreshIndicator(
        onRefresh: () async {
          ref.refresh(ownerBusinessesProvider);
          ref.refresh(isAdminProvider);
        },
        child: businessesAsync.when(
          data: (businesses) {
            if (businesses.isEmpty) {
              return ListView(children: [
                SizedBox(height: MediaQuery.of(context).size.height * 0.15),
                Center(
                  child: Column(
                    children: [
                      Icon(Icons.dashboard_outlined, size: 64, color: Colors.grey.shade400),
                      const SizedBox(height: 16),
                      Text('No Businesses Yet', style: theme.textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold)),
                      const SizedBox(height: 8),
                      Text('Submit a business to manage it from here.', style: TextStyle(color: Colors.grey.shade600)),
                      const SizedBox(height: 24),
                      ElevatedButton.icon(
                        onPressed: () => context.push('/directory/add'),
                        icon: const Icon(Icons.add),
                        label: const Text('Add a Business'),
                      ),
                    ],
                  ),
                ),
              ]);
            }

            // Aggregate totals across all businesses
            final totalViews = businesses.fold(0, (s, b) => s + ((b['views'] as num?)?.toInt() ?? 0));
            final totalReviews = businesses.fold(0, (s, b) => s + ((b['review_count'] as num?)?.toInt() ?? 0));
            final ratings = businesses.where((b) => (b['rating'] as num? ?? 0) > 0).map((b) => (b['rating'] as num).toDouble()).toList();
            final avgRating = ratings.isEmpty ? 0.0 : ratings.reduce((a, b) => a + b) / ratings.length;

            return ListView(
              padding: const EdgeInsets.all(16),
              children: [
                // Summary Cards — 2 rows
                Row(children: [
                  _StatCard(icon: Icons.storefront, label: 'Businesses', value: '${businesses.length}', color: SpotifyColors.green),
                  const SizedBox(width: 10),
                  _StatCard(icon: Icons.check_circle, label: 'Approved', value: '${businesses.where((b) => b['approved'] == true).length}', color: Colors.blue),
                  const SizedBox(width: 10),
                  _StatCard(icon: Icons.pending, label: 'Pending', value: '${businesses.where((b) => b['approved'] != true).length}', color: Colors.orange),
                ]),
                const SizedBox(height: 10),
                Row(children: [
                  _StatCard(icon: Icons.remove_red_eye_outlined, label: 'Total Views', value: '$totalViews', color: Colors.purple),
                  const SizedBox(width: 10),
                  _StatCard(icon: Icons.star_outline, label: 'Avg Rating', value: avgRating > 0 ? avgRating.toStringAsFixed(1) : '–', color: Colors.amber),
                  const SizedBox(width: 10),
                  _StatCard(icon: Icons.chat_bubble_outline, label: 'Reviews', value: '$totalReviews', color: SpotifyColors.green),
                ]),
                const SizedBox(height: 24),

                // Quick Actions
                Text('Quick Actions', style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold)),
                const SizedBox(height: 12),
                Wrap(spacing: 10, runSpacing: 10, children: [
                  _QuickAction(icon: Icons.add_business, label: 'Add Business', onTap: () => context.push('/directory/add')),
                  _QuickAction(icon: Icons.local_offer, label: 'Create Deal', onTap: () => context.push('/dashboard/deals')),
                  _QuickAction(icon: Icons.handshake_outlined, label: 'Partnerships', onTap: () => context.push('/dashboard/partnerships')),
                  _QuickAction(icon: Icons.inbox_outlined, label: 'Smart Leads', onTap: () => context.push('/dashboard/leads')),
                  _QuickAction(icon: Icons.favorite_border, label: 'Top Promoters', onTap: () => context.push('/dashboard/promoters')),
                ]),
                const SizedBox(height: 24),

                // My Businesses
                Text('My Businesses', style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold)),
                const SizedBox(height: 12),
                ...businesses.map((b) {
                  final approved = b['approved'] == true;
                  final views = (b['views'] as num?)?.toInt() ?? 0;
                  final rating = (b['rating'] as num?)?.toDouble() ?? 0.0;
                  final reviews = (b['review_count'] as num?)?.toInt() ?? 0;

                  return Container(
                    margin: const EdgeInsets.only(bottom: 14),
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: SpotifyColors.surface,
                      borderRadius: BorderRadius.circular(16),
                    ),
                    child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                      // Business name + status
                      Row(children: [
                        Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                          Text(b['name'] as String? ?? '', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: SpotifyColors.textPrimary)),
                          Text(b['category'] as String? ?? '', style: const TextStyle(fontSize: 12, color: SpotifyColors.textSecondary)),
                        ])),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                          decoration: BoxDecoration(
                            color: (approved ? SpotifyColors.green : Colors.orange).withAlpha(30),
                            borderRadius: BorderRadius.circular(20),
                          ),
                          child: Text(
                            approved ? 'Live' : 'Pending',
                            style: TextStyle(color: approved ? SpotifyColors.green : Colors.orange, fontSize: 11, fontWeight: FontWeight.bold),
                          ),
                        ),
                      ]),

                      if (approved) ...[
                        const SizedBox(height: 14),
                        // Mini stats row
                        Row(mainAxisAlignment: MainAxisAlignment.spaceAround, children: [
                          _mini(Icons.remove_red_eye_outlined, '$views', 'Views', Colors.purple),
                          _mini(Icons.star_outline, rating > 0 ? rating.toStringAsFixed(1) : '–', 'Rating', Colors.amber),
                          _mini(Icons.chat_bubble_outline, '$reviews', 'Reviews', SpotifyColors.green),
                        ]),
                        const SizedBox(height: 14),

                        // Action buttons
                        GridView.count(
                          crossAxisCount: 2,
                          shrinkWrap: true,
                          physics: const NeverScrollableScrollPhysics(),
                          crossAxisSpacing: 8,
                          mainAxisSpacing: 8,
                          childAspectRatio: 3.2,
                          children: [
                            _actionBtn(Icons.visibility_outlined, 'View', SpotifyColors.textSecondary, () => context.push('/business/${b['id']}')),
                            _actionBtn(Icons.edit_outlined, 'Edit', Colors.blue, () => context.push('/dashboard/edit/${b['id']}')),
                            _actionBtn(Icons.chat_bubble_outline, 'Reviews', SpotifyColors.green, () => context.push('/dashboard/reviews/${b['id']}?name=${Uri.encodeComponent(b['name'] as String? ?? '')}')),
                            _actionBtn(Icons.bar_chart, 'AI Insights', Colors.pink, () => context.push('/dashboard/insights/${b['id']}?name=${Uri.encodeComponent(b['name'] as String? ?? '')}')),
                          ],
                        ),
                      ],
                    ]),
                  );
                }),

                const SizedBox(height: 24),

                // Admin Section
                isAdminAsync.when(
                  data: (isAdmin) => isAdmin
                      ? Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                          const Divider(),
                          const SizedBox(height: 16),
                          const Text('ADMIN', style: TextStyle(fontSize: 11, letterSpacing: 2, fontWeight: FontWeight.bold, color: SpotifyColors.textSecondary)),
                          const SizedBox(height: 12),
                          Row(children: [
                            Expanded(child: _adminCard(Icons.analytics_outlined, 'Platform Analytics', 'Users, growth & breakdown', Colors.blue, () => context.push('/admin/analytics'))),
                            const SizedBox(width: 12),
                            Expanded(child: _adminCard(Icons.emoji_events_outlined, 'Competitor Insights', 'Category benchmarks', Colors.amber, () => context.push('/admin/insights'))),
                          ]),
                          const SizedBox(height: 16),
                        ])
                      : const SizedBox.shrink(),
                  loading: () => const SizedBox.shrink(),
                  error: (_, __) => const SizedBox.shrink(),
                ),
              ],
            );
          },
          loading: () => const Center(child: CircularProgressIndicator()),
          error: (e, _) => Center(child: Text('Error: $e')),
        ),
      ),
    );
  }

  Widget _mini(IconData icon, String value, String label, Color color) {
    return Column(children: [
      Icon(icon, color: color, size: 18),
      const SizedBox(height: 2),
      Text(value, style: TextStyle(fontWeight: FontWeight.bold, color: color, fontSize: 16)),
      Text(label, style: const TextStyle(fontSize: 10, color: SpotifyColors.textSecondary)),
    ]);
  }

  Widget _actionBtn(IconData icon, String label, Color color, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        decoration: BoxDecoration(color: color.withAlpha(20), borderRadius: BorderRadius.circular(10)),
        child: Row(mainAxisAlignment: MainAxisAlignment.center, children: [
          Icon(icon, color: color, size: 15),
          const SizedBox(width: 5),
          Text(label, style: TextStyle(color: color, fontWeight: FontWeight.bold, fontSize: 12)),
        ]),
      ),
    );
  }

  Widget _adminCard(IconData icon, String title, String subtitle, Color color, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: color.withAlpha(20),
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: color.withAlpha(60)),
        ),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Icon(icon, color: color, size: 24),
          const SizedBox(height: 8),
          Text(title, style: TextStyle(fontWeight: FontWeight.bold, color: color, fontSize: 13)),
          Text(subtitle, style: const TextStyle(fontSize: 11, color: SpotifyColors.textSecondary)),
        ]),
      ),
    );
  }
}

class _StatCard extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;
  final Color color;

  const _StatCard({required this.icon, required this.label, required this.value, required this.color});

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 14),
        decoration: BoxDecoration(color: SpotifyColors.surface, borderRadius: BorderRadius.circular(12)),
        child: Column(children: [
          Icon(icon, color: color, size: 22),
          const SizedBox(height: 6),
          Text(value, style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: color)),
          Text(label, style: const TextStyle(fontSize: 10, color: SpotifyColors.textSecondary)),
        ]),
      ),
    );
  }
}

class _QuickAction extends StatelessWidget {
  final IconData icon;
  final String label;
  final VoidCallback onTap;

  const _QuickAction({required this.icon, required this.label, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(500),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
        decoration: BoxDecoration(color: SpotifyColors.highlight, borderRadius: BorderRadius.circular(500)),
        child: Row(mainAxisSize: MainAxisSize.min, children: [
          Icon(icon, color: SpotifyColors.textPrimary, size: 18),
          const SizedBox(width: 6),
          Text(label, style: const TextStyle(color: SpotifyColors.textPrimary, fontWeight: FontWeight.w600, fontSize: 13)),
        ]),
      ),
    );
  }
}
