import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:share_plus/share_plus.dart';
import 'package:cached_network_image/cached_network_image.dart';

import '../../core/repositories/business_repository.dart';
import '../../core/repositories/user_repository.dart';
import '../../core/providers/auth_provider.dart';
import '../favorites/favorites_screen.dart';

final businessDetailProvider = FutureProvider.family<Map<String, dynamic>, String>((ref, id) async {
  final repo = ref.watch(businessRepositoryProvider);
  final business = await repo.getBusinessById(id);
  final reviews = await repo.getReviews(id);
  return {
    'business': business,
    'reviews': reviews,
  };
});

class BusinessDetailScreen extends ConsumerWidget {
  final String id;

  const BusinessDetailScreen({super.key, required this.id});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    final detailAsync = ref.watch(businessDetailProvider(id));
    final favoriteIdsAsync = ref.watch(favoriteIdsProvider);

    return Scaffold(
      body: detailAsync.when(
        data: (data) {
          final business = data['business'];
          if (business == null) {
            return const Center(child: Text('Business not found.'));
          }

          final reviews = data['reviews'] as List<dynamic>;
          final isFavorite = favoriteIdsAsync.value?.contains(business.id) ?? false;
          final isOpen = business.isOpen;

          return CustomScrollView(
            slivers: [
              SliverAppBar(
                expandedHeight: 250,
                pinned: true,
                actions: [
                  IconButton(
                    icon: Icon(
                      isFavorite ? Icons.favorite : Icons.favorite_border,
                      color: isFavorite ? Colors.red : Colors.white,
                    ),
                    onPressed: () async {
                      final user = ref.read(currentUserProvider);
                      if (user == null) {
                        context.push('/login');
                        return;
                      }
                      await ref.read(userRepositoryProvider).toggleFavorite(user.id, business.id);
                      ref.refresh(favoriteIdsProvider);
                    },
                  ),
                  IconButton(
                    icon: const Icon(Icons.share, color: Colors.white),
                    onPressed: () {
                      Share.share('Check out ${business.name} on BizHub: https://thikabizhub.com/business/${business.id}');
                    },
                  ),
                ],
                flexibleSpace: FlexibleSpaceBar(
                  background: Stack(
                    fit: StackFit.expand,
                    children: [
                      Hero(
                        tag: 'business_image_${business.id}',
                        child: business.images.isNotEmpty
                            ? CachedNetworkImage(
                                imageUrl: business.images.first,
                                fit: BoxFit.cover,
                                errorWidget: (context, url, err) => Container(color: Colors.grey.shade300),
                              )
                            : Container(
                                color: theme.colorScheme.primary,
                                child: const Center(
                                  child: Icon(Icons.storefront, size: 80, color: Colors.white24),
                                ),
                              ),
                      ),
                      // Gradient overlay for text readability
                      DecoratedBox(
                        decoration: BoxDecoration(
                          gradient: LinearGradient(
                            begin: Alignment.topCenter,
                            end: Alignment.bottomCenter,
                            colors: [
                              Colors.black.withAlpha(100),
                              Colors.transparent,
                              Colors.black.withAlpha(180),
                            ],
                          ),
                        ),
                      ),
                      Positioned(
                        bottom: 16,
                        left: 16,
                        right: 16,
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              business.name,
                              style: theme.textTheme.headlineSmall?.copyWith(
                                color: Colors.white,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Status & Rating Row
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Row(
                            children: [
                              Container(
                                width: 10,
                                height: 10,
                                decoration: BoxDecoration(
                                  color: isOpen ? Colors.green : Colors.red,
                                  shape: BoxShape.circle,
                                ),
                              ),
                              const SizedBox(width: 8),
                              Text(
                                isOpen ? 'Open Now' : 'Closed',
                                style: TextStyle(
                                  fontWeight: FontWeight.bold,
                                  color: isOpen ? Colors.green : Colors.red,
                                ),
                              ),
                              const SizedBox(width: 16),
                              Text(business.category, style: TextStyle(color: theme.colorScheme.primary, fontWeight: FontWeight.w600)),
                            ],
                          ),
                          Row(
                            children: [
                              const Icon(Icons.star, color: Color(0xFFD4AF37), size: 20),
                              const SizedBox(width: 4),
                              Text(
                                business.rating > 0 ? '${business.rating.toStringAsFixed(1)}' : 'New',
                                style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                              ),
                              Text(
                                ' (${business.reviewCount} reviews)',
                                style: TextStyle(color: Colors.grey.shade600, fontSize: 14),
                              ),
                            ],
                          ),
                        ],
                      ),
                      const SizedBox(height: 24),

                      // Action Buttons
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                        children: [
                          if (business.phone != null)
                            _ActionButton(
                              icon: Icons.phone,
                              label: 'Call',
                              onTap: () => launchUrl(Uri.parse('tel:${business.phone}')),
                            ),
                          if (business.whatsappNumber != null)
                            _ActionButton(
                              icon: Icons.chat,
                              label: 'WhatsApp',
                              onTap: () => launchUrl(Uri.parse('https://wa.me/${business.whatsappNumber?.replaceAll("+", "")}')),
                            ),
                          if (business.latitude != null && business.longitude != null)
                            _ActionButton(
                              icon: Icons.directions,
                              label: 'Directions',
                              onTap: () => launchUrl(Uri.parse('https://www.google.com/maps/dir/?api=1&destination=${business.latitude},${business.longitude}')),
                            ),
                          if (business.website != null)
                            _ActionButton(
                              icon: Icons.language,
                              label: 'Website',
                              onTap: () => launchUrl(Uri.parse(business.website!)),
                            ),
                        ],
                      ),
                      const SizedBox(height: 24),
                      const Divider(),
                      const SizedBox(height: 16),

                      // Description
                      if (business.description != null) ...[
                        Text('About', style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold)),
                        const SizedBox(height: 8),
                        Text(business.description!, style: TextStyle(color: Colors.grey.shade700, height: 1.5)),
                        const SizedBox(height: 24),
                      ],

                      // Location
                      if (business.address != null || business.town != null) ...[
                        Text('Location', style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold)),
                        const SizedBox(height: 8),
                        Row(
                          children: [
                            Icon(Icons.location_on, color: theme.colorScheme.primary),
                            const SizedBox(width: 8),
                            Expanded(
                              child: Text(
                                '${business.address ?? ''}${business.address != null && business.town != null ? ', ' : ''}${business.town ?? ''}',
                                style: TextStyle(color: Colors.grey.shade700),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 24),
                      ],

                      // Reviews
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text('Reviews', style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold)),
                          TextButton(
                            onPressed: () {
                              final user = ref.read(currentUserProvider);
                              if (user == null) {
                                context.push('/login');
                                return;
                              }
                              // TODO: Navigate to add review screen
                            },
                            child: const Text('Write a Review'),
                          )
                        ],
                      ),
                      if (reviews.isEmpty)
                        const Padding(
                          padding: EdgeInsets.symmetric(vertical: 16),
                          child: Text('No reviews yet. Be the first to review this business!'),
                        )
                      else
                        ListView.builder(
                          shrinkWrap: true,
                          physics: const NeverScrollableScrollPhysics(),
                          itemCount: reviews.length,
                          itemBuilder: (context, index) {
                            final review = reviews[index];
                            final stars = (review['rating'] as num).toInt();
                            return Container(
                              margin: const EdgeInsets.only(bottom: 16),
                              padding: const EdgeInsets.all(16),
                              decoration: BoxDecoration(
                                color: Colors.grey.shade50,
                                borderRadius: BorderRadius.circular(12),
                                border: Border.all(color: Colors.grey.shade200),
                              ),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                    children: [
                                      Row(
                                        children: List.generate(5, (i) => Icon(
                                          i < stars ? Icons.star : Icons.star_border,
                                          color: const Color(0xFFD4AF37),
                                          size: 16,
                                        )),
                                      ),
                                      Text(
                                        review['created_at'].toString().split('T')[0],
                                        style: TextStyle(color: Colors.grey.shade500, fontSize: 12),
                                      ),
                                    ],
                                  ),
                                  const SizedBox(height: 8),
                                  Text(
                                    review['content'] ?? '',
                                    style: TextStyle(color: Colors.grey.shade800),
                                  ),
                                  if (review['user_name'] != null) ...[
                                    const SizedBox(height: 8),
                                    Text(
                                      '- ${review['user_name']}',
                                      style: TextStyle(color: Colors.grey.shade600, fontSize: 12, fontWeight: FontWeight.bold),
                                    ),
                                  ]
                                ],
                              ),
                            );
                          },
                        ),
                    ],
                  ),
                ),
              ),
            ],
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text('Error: $e')),
      ),
    );
  }
}

class _ActionButton extends StatelessWidget {
  final IconData icon;
  final String label;
  final VoidCallback onTap;

  const _ActionButton({required this.icon, required this.label, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(8),
      child: Padding(
        padding: const EdgeInsets.all(8.0),
        child: Column(
          children: [
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Theme.of(context).colorScheme.primary.withAlpha(20),
                shape: BoxShape.circle,
              ),
              child: Icon(icon, color: Theme.of(context).colorScheme.primary),
            ),
            const SizedBox(height: 8),
            Text(label, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
          ],
        ),
      ),
    );
  }
}
