import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../../core/models/business.dart';
import '../../core/theme/app_theme.dart';

class BusinessCardWidget extends StatelessWidget {
  final Business business;

  const BusinessCardWidget({super.key, required this.business});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isOpen = business.isOpen;

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: SpotifyColors.surface,
        borderRadius: BorderRadius.circular(8),
      ),
      clipBehavior: Clip.antiAlias,
      child: InkWell(
        onTap: () => context.push('/business/${business.id}'),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Image Header
            Stack(
              children: [
                Hero(
                  tag: 'business_image_${business.id}',
                  child: Container(
                    height: 160,
                    width: double.infinity,
                    color: SpotifyColors.highlight,
                    child: business.images.isNotEmpty
                        ? CachedNetworkImage(
                            imageUrl: business.images.first,
                            fit: BoxFit.cover,
                            placeholder: (context, url) => const Icon(
                                Icons.image,
                                size: 50,
                                color: SpotifyColors.textTertiary),
                            errorWidget: (context, url, error) => const Icon(
                                Icons.image,
                                size: 50,
                                color: SpotifyColors.textTertiary),
                          )
                        : const Icon(Icons.storefront,
                            size: 50, color: SpotifyColors.textTertiary),
                  ),
                ),

                // Category & Status Badges
                Positioned(
                  top: 12,
                  right: 12,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(
                          color: SpotifyColors.background.withAlpha(200),
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: Text(
                          business.category,
                          style: const TextStyle(
                            fontSize: 10,
                            fontWeight: FontWeight.bold,
                            color: SpotifyColors.green,
                          ),
                        ),
                      ),
                      if (business.businessHours != null) ...[
                        const SizedBox(height: 6),
                        Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 8, vertical: 4),
                          decoration: BoxDecoration(
                            color: isOpen
                                ? SpotifyColors.green
                                : SpotifyColors.error,
                            borderRadius: BorderRadius.circular(4),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Icon(Icons.access_time,
                                  size: 10,
                                  color: isOpen ? Colors.black : Colors.white),
                              const SizedBox(width: 4),
                              Text(
                                isOpen ? 'Open Now' : 'Closed',
                                style: TextStyle(
                                  fontSize: 10,
                                  fontWeight: FontWeight.bold,
                                  color: isOpen ? Colors.black : Colors.white,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ],
                  ),
                ),
              ],
            ),

            // Content
            Padding(
              padding: const EdgeInsets.all(12.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    business.name,
                    style: theme.textTheme.titleMedium,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  if (business.description != null) ...[
                    const SizedBox(height: 4),
                    Text(
                      business.description!,
                      style: theme.textTheme.bodySmall?.copyWith(
                        color: SpotifyColors.textSecondary,
                      ),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      if (business.town != null) ...[
                        const Icon(Icons.location_on,
                            size: 14, color: SpotifyColors.green),
                        const SizedBox(width: 4),
                        Expanded(
                          child: Text(
                            '${business.town}, ${business.county}',
                            style: theme.textTheme.bodySmall?.copyWith(
                              color: SpotifyColors.textSecondary,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                      ],
                    ],
                  ),
                  const SizedBox(height: 12),
                  Divider(height: 1, color: SpotifyColors.highlight),
                  const SizedBox(height: 12),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Row(
                        children: [
                          const Icon(Icons.star,
                              size: 16, color: SpotifyColors.green),
                          const SizedBox(width: 4),
                          Text(
                            business.rating > 0
                                ? '${business.rating.toStringAsFixed(1)} (${business.reviewCount})'
                                : 'New',
                            style: theme.textTheme.bodySmall?.copyWith(
                              fontWeight: FontWeight.w600,
                              color: SpotifyColors.textSecondary,
                            ),
                          ),
                        ],
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 16, vertical: 8),
                        decoration: BoxDecoration(
                          color: SpotifyColors.green,
                          borderRadius: BorderRadius.circular(500),
                        ),
                        child: const Text(
                          'View',
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.bold,
                            color: Colors.black,
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
