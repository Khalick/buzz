import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:bizhub_app/core/theme/app_theme.dart';
import 'package:bizhub_app/core/theme/town_theme_provider.dart';
import '../../core/repositories/business_repository.dart';
import '../../core/models/business.dart';
import 'widgets/town_selector.dart';

/// Featured businesses filtered by selected town
final homeFeaturedProvider = FutureProvider<List<Business>>((ref) {
  final repo = ref.watch(businessRepositoryProvider);
  final town = ref.watch(townThemeProvider);
  return repo.getFeaturedBusinesses(limit: 10, town: town);
});

class HomeScreen extends ConsumerWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    final currentPalette = ref.watch(currentTownPaletteProvider);
    final featuredAsync = ref.watch(homeFeaturedProvider);
    final categoriesAsync = ref.watch(categoriesProvider);

    return Scaffold(
      backgroundColor: SpotifyColors.background,
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.only(bottom: 24),
          children: [
            // ── Top Bar ──
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'BizHub',
                    style: theme.textTheme.displayLarge,
                  ),
                  Row(
                    children: [
                      IconButton(
                        onPressed: () => context.push('/notifications'),
                        icon: const Icon(Icons.notifications_none, color: SpotifyColors.textPrimary),
                      ),
                      const TownSelector(),
                    ],
                  ),
                ],
              ),
            ),

            // ── Welcome ──
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
              child: Text(
                '${currentPalette.townName} • ${currentPalette.tagLine}',
                style: theme.textTheme.bodySmall,
              ),
            ),

            // ── Search Bar (tap → Directory) ──
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: GestureDetector(
                onTap: () => context.push('/directory'),
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                  decoration: BoxDecoration(
                    color: SpotifyColors.highlight,
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.search, color: SpotifyColors.textSecondary, size: 20),
                      const SizedBox(width: 12),
                      Text(
                        'Search businesses, categories...',
                        style: theme.textTheme.bodyMedium?.copyWith(color: SpotifyColors.textSecondary),
                      ),
                    ],
                  ),
                ),
              ),
            ),
            const SizedBox(height: 24),

            // ── Category Chips ──
            categoriesAsync.when(
              data: (categories) {
                if (categories.isEmpty) return const SizedBox.shrink();
                return SizedBox(
                  height: 36,
                  child: ListView.separated(
                    scrollDirection: Axis.horizontal,
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    itemCount: categories.length,
                    separatorBuilder: (_, __) => const SizedBox(width: 8),
                    itemBuilder: (context, index) {
                      final category = categories[index];
                      return GestureDetector(
                        onTap: () => context.push('/directory?category=$category'),
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                          decoration: BoxDecoration(
                            color: SpotifyColors.highlight,
                            borderRadius: BorderRadius.circular(500),
                          ),
                          child: Text(
                            category,
                            style: theme.textTheme.bodySmall?.copyWith(
                              color: SpotifyColors.textPrimary,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                        ),
                      );
                    },
                  ),
                );
              },
              loading: () => const SizedBox(height: 36),
              error: (_, __) => const SizedBox.shrink(),
            ),
            const SizedBox(height: 24),

            // ── Featured Businesses (Horizontal Carousel) ──
            _buildSectionHeader(context, 'Featured', onSeeAll: () => context.push('/directory')),
            const SizedBox(height: 12),
            featuredAsync.when(
              data: (businesses) {
                if (businesses.isEmpty) {
                  return Padding(
                    padding: const EdgeInsets.all(32),
                    child: Center(
                      child: Text('No featured businesses yet.', style: theme.textTheme.bodySmall),
                    ),
                  );
                }
                return SizedBox(
                  height: 200,
                  child: ListView.separated(
                    scrollDirection: Axis.horizontal,
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    itemCount: businesses.length,
                    separatorBuilder: (_, __) => const SizedBox(width: 12),
                    itemBuilder: (context, index) {
                      return _SpotifyBusinessTile(business: businesses[index]);
                    },
                  ),
                );
              },
              loading: () => SizedBox(
                height: 200,
                child: ListView.separated(
                  scrollDirection: Axis.horizontal,
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  itemCount: 4,
                  separatorBuilder: (_, __) => const SizedBox(width: 12),
                  itemBuilder: (_, __) => Container(
                    width: 150,
                    decoration: BoxDecoration(
                      color: SpotifyColors.surface,
                      borderRadius: BorderRadius.circular(8),
                    ),
                  ),
                ),
              ),
              error: (err, _) => Padding(
                padding: const EdgeInsets.all(16),
                child: Text(err.toString(), style: theme.textTheme.bodySmall),
              ),
            ),
            const SizedBox(height: 24),

            // ── Quick Actions ──
            _buildSectionHeader(context, 'Quick Actions'),
            const SizedBox(height: 12),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Row(
                children: [
                  _QuickActionCard(
                    icon: Icons.add_business,
                    title: 'Add Business',
                    onTap: () => context.push('/directory/add'),
                  ),
                  const SizedBox(width: 12),
                  _QuickActionCard(
                    icon: Icons.map_outlined,
                    title: 'Map View',
                    onTap: () => context.push('/map'),
                  ),
                  const SizedBox(width: 12),
                  _QuickActionCard(
                    icon: Icons.dashboard_outlined,
                    title: 'Dashboard',
                    onTap: () => context.push('/dashboard'),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSectionHeader(BuildContext context, String title, {VoidCallback? onSeeAll}) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(title, style: Theme.of(context).textTheme.headlineLarge),
          if (onSeeAll != null)
            GestureDetector(
              onTap: onSeeAll,
              child: Text(
                'See all',
                style: Theme.of(context).textTheme.bodySmall?.copyWith(
                  color: SpotifyColors.textSecondary,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
        ],
      ),
    );
  }
}

/// Square album-art style business tile for horizontal carousels
class _SpotifyBusinessTile extends StatelessWidget {
  final Business business;

  const _SpotifyBusinessTile({required this.business});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final imageUrl = (business.images.isNotEmpty) ? business.images.first : null;

    return GestureDetector(
      onTap: () => context.push('/business/${business.id}'),
      child: SizedBox(
        width: 150,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Square cover art
            ClipRRect(
              borderRadius: BorderRadius.circular(4),
              child: Container(
                width: 150,
                height: 150,
                color: SpotifyColors.surface,
                child: imageUrl != null
                    ? CachedNetworkImage(
                        imageUrl: imageUrl,
                        fit: BoxFit.cover,
                        errorWidget: (_, __, ___) => const Icon(Icons.storefront, color: SpotifyColors.textTertiary, size: 48),
                      )
                    : const Icon(Icons.storefront, color: SpotifyColors.textTertiary, size: 48),
              ),
            ),
            const SizedBox(height: 8),
            // Title
            Text(
              business.name,
              style: theme.textTheme.titleSmall,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
            const SizedBox(height: 2),
            // Category subtitle
            Text(
              business.category,
              style: theme.textTheme.bodySmall?.copyWith(color: SpotifyColors.textSecondary),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
          ],
        ),
      ),
    );
  }
}

/// Quick action cards for the home screen
class _QuickActionCard extends StatelessWidget {
  final IconData icon;
  final String title;
  final VoidCallback onTap;

  const _QuickActionCard({required this.icon, required this.title, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: GestureDetector(
        onTap: onTap,
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 16),
          decoration: BoxDecoration(
            color: SpotifyColors.surface,
            borderRadius: BorderRadius.circular(8),
          ),
          child: Column(
            children: [
              Icon(icon, color: SpotifyColors.green, size: 28),
              const SizedBox(height: 8),
              Text(
                title,
                style: Theme.of(context).textTheme.labelMedium?.copyWith(color: SpotifyColors.textPrimary),
                textAlign: TextAlign.center,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
