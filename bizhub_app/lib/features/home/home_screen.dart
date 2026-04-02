import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_staggered_animations/flutter_staggered_animations.dart';
import 'package:go_router/go_router.dart';
import 'package:bizhub_app/core/theme/town_theme_provider.dart';
import 'package:bizhub_app/shared/widgets/app_input.dart';
import 'package:bizhub_app/shared/widgets/animated_list_item.dart';
import 'package:bizhub_app/shared/widgets/business_card.dart';
import 'package:bizhub_app/shared/widgets/shimmer_loading.dart';
import '../../core/repositories/business_repository.dart';
import 'widgets/town_selector.dart';

class HomeScreen extends ConsumerWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    final currentPalette = ref.watch(currentTownPaletteProvider);

    // Watch data providers
    final featuredAsync = ref.watch(featuredBusinessesProvider);
    final categoriesAsync = ref.watch(categoriesProvider);

    return Scaffold(
      body: CustomScrollView(
        slivers: [
          SliverAppBar(
            pinned: true,
            floating: true,
            expandedHeight: 120,
            flexibleSpace: FlexibleSpaceBar(
              titlePadding: const EdgeInsets.only(left: 16, bottom: 16),
              title: Text(
                'BizHub',
                style: theme.textTheme.headlineSmall?.copyWith(
                  color: theme.colorScheme.onPrimary,
                  fontWeight: FontWeight.w800,
                ),
              ),
              background: Stack(
                fit: StackFit.expand,
                children: [
                  Container(
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        colors: [
                          theme.colorScheme.primary,
                          theme.colorScheme.secondary,
                        ],
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                      ),
                    ),
                  ),
                ],
              ),
            ),
            actions: [
              IconButton(
                onPressed: () => context.push('/notifications'),
                icon: const Icon(Icons.notifications_outlined),
              ),
              const SizedBox(width: 8),
            ],
          ),
          SliverToBoxAdapter(
            child: AnimationLimiter(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: AnimationConfiguration.toStaggeredList(
                  duration: const Duration(milliseconds: 600),
                  childAnimationBuilder: (widget) => SlideAnimation(
                    verticalOffset: 50.0,
                    child: FadeInAnimation(child: widget),
                  ),
                  children: [
                    const TownSelector(),
                    Padding(
                      padding: const EdgeInsets.all(16.0),
                      child: Text(
                        'Welcome to ${currentPalette.townName}\n${currentPalette.tagLine}',
                        style: theme.textTheme.headlineMedium?.copyWith(
                          color: theme.colorScheme.primary,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                    
                    // Search Bar triggers directory navigation
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 16.0),
                      child: GestureDetector(
                        onTap: () => context.push('/directory'),
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(16),
                            boxShadow: [
                              BoxShadow(
                                color: Colors.black.withAlpha(10),
                                blurRadius: 10,
                                offset: const Offset(0, 4),
                              ),
                            ],
                          ),
                          child: Row(
                            children: [
                              Icon(Icons.search, color: theme.colorScheme.primary),
                              const SizedBox(width: 12),
                              Text(
                                'Search businesses, categories...',
                                style: TextStyle(color: Colors.grey.shade600),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(height: 32),

                    // Categories Section
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 16.0),
                      child: Text(
                        'Categories',
                        style: theme.textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold),
                      ),
                    ),
                    const SizedBox(height: 16),
                    SizedBox(
                      height: 100,
                      child: categoriesAsync.when(
                        data: (categories) {
                          if (categories.isEmpty) return const SizedBox.shrink();
                          return ListView.builder(
                            scrollDirection: Axis.horizontal,
                            itemCount: categories.length,
                            padding: const EdgeInsets.symmetric(horizontal: 16),
                            itemBuilder: (context, index) {
                              final category = categories[index];
                              return AnimatedListItem(
                                index: index,
                                child: Padding(
                                  padding: const EdgeInsets.only(right: 20),
                                  child: GestureDetector(
                                    onTap: () {
                                      // Push directory with category filter (future enhancement)
                                      context.push('/directory');
                                    },
                                    child: Column(
                                      children: [
                                        Container(
                                          width: 60,
                                          height: 60,
                                          decoration: BoxDecoration(
                                            color: theme.colorScheme.primary.withAlpha(20),
                                            shape: BoxShape.circle,
                                            border: Border.all(
                                              color: theme.colorScheme.primary.withAlpha(40),
                                            ),
                                          ),
                                          child: Icon(
                                            _getCategoryIcon(category),
                                            color: theme.colorScheme.primary,
                                            size: 28,
                                          ),
                                        ),
                                        const SizedBox(height: 8),
                                        Text(
                                          category,
                                          style: theme.textTheme.labelMedium?.copyWith(
                                            fontWeight: FontWeight.w600,
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                ),
                              );
                            },
                          );
                        },
                        loading: () => ListView.builder(
                          scrollDirection: Axis.horizontal,
                          itemCount: 6,
                          padding: const EdgeInsets.symmetric(horizontal: 16),
                          itemBuilder: (context, index) => Padding(
                            padding: const EdgeInsets.only(right: 20),
                            child: Column(
                              children: const [
                                ShimmerLoading(width: 60, height: 60, borderRadius: 30),
                                SizedBox(height: 8),
                                ShimmerLoading(width: 50, height: 12),
                              ],
                            ),
                          ),
                        ),
                        error: (_, __) => const SizedBox.shrink(),
                      ),
                    ),
                    const SizedBox(height: 32),

                    // Featured section
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 16.0),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            'Featured Businesses',
                            style: theme.textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold),
                          ),
                          TextButton(
                            onPressed: () => context.push('/directory'),
                            child: const Text('See All'),
                          ),
                        ],
                      ),
                    ),
                    
                    featuredAsync.when(
                      data: (businesses) {
                        if (businesses.isEmpty) {
                          return const Padding(
                            padding: EdgeInsets.all(32.0),
                            child: Center(child: Text('No featured businesses yet.')),
                          );
                        }
                        return ListView.builder(
                          physics: const NeverScrollableScrollPhysics(),
                          shrinkWrap: true,
                          itemCount: businesses.length,
                          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                          itemBuilder: (context, index) {
                            return BusinessCardWidget(business: businesses[index]);
                          },
                        );
                      },
                      loading: () => ListView.builder(
                        physics: const NeverScrollableScrollPhysics(),
                        shrinkWrap: true,
                        itemCount: 3,
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                        itemBuilder: (context, index) => const BusinessCardSkeleton(),
                      ),
                      error: (err, _) => Padding(
                        padding: const EdgeInsets.all(16.0),
                        child: Text(err.toString()),
                      ),
                    ),
                    const SizedBox(height: 40),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  IconData _getCategoryIcon(String category) {
    final lower = category.toLowerCase();
    if (lower.contains('food') || lower.contains('restaurant')) return Icons.restaurant;
    if (lower.contains('shop') || lower.contains('retail')) return Icons.shopping_bag;
    if (lower.contains('health') || lower.contains('medical')) return Icons.local_hospital;
    if (lower.contains('auto') || lower.contains('car')) return Icons.directions_car;
    if (lower.contains('beauty') || lower.contains('salon')) return Icons.spa;
    if (lower.contains('tech') || lower.contains('computer')) return Icons.computer;
    return Icons.storefront;
  }
}
