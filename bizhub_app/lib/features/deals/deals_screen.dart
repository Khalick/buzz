import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/repositories/deals_repository.dart';
import '../../shared/widgets/empty_state.dart';
import '../../shared/widgets/shimmer_loading.dart';
import 'package:go_router/go_router.dart';

class DealsScreen extends ConsumerWidget {
  const DealsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    final dealsAsync = ref.watch(activeDealsProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Deals'),
        centerTitle: true,
      ),
      body: RefreshIndicator(
        onRefresh: () => ref.refresh(activeDealsProvider.future),
        child: dealsAsync.when(
          data: (deals) {
            if (deals.isEmpty) {
              return ListView(
                children: [
                  SizedBox(height: MediaQuery.of(context).size.height * 0.1),
                  EmptyState(
                    icon: Icons.local_offer_outlined,
                    title: 'No Active Deals',
                    subtitle: 'Check back soon for amazing discounts in your area.',
                    buttonText: 'Browse Directory',
                    onButtonTap: () => context.push('/directory'),
                  ),
                ],
              );
            }

            return ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: deals.length,
              itemBuilder: (context, index) {
                final deal = deals[index];
                final isUrgent = deal.isUrgent;

                return Container(
                  margin: const EdgeInsets.only(bottom: 16),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: Colors.grey.shade200),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withAlpha(5),
                        blurRadius: 10,
                        offset: const Offset(0, 4),
                      ),
                    ],
                  ),
                  child: Padding(
                    padding: const EdgeInsets.all(16.0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Deal Header (Badges)
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            if (deal.isFlashDeal)
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                decoration: BoxDecoration(
                                  color: Colors.red.shade50,
                                  border: Border.all(color: Colors.red.shade200),
                                  borderRadius: BorderRadius.circular(12),
                                ),
                                child: Row(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    Container(
                                      width: 6,
                                      height: 6,
                                      decoration: BoxDecoration(
                                        color: Colors.red.shade600,
                                        shape: BoxShape.circle,
                                      ),
                                    ),
                                    const SizedBox(width: 4),
                                    Text(
                                      'LIVE PULSE',
                                      style: TextStyle(
                                        color: Colors.red.shade600,
                                        fontSize: 10,
                                        fontWeight: FontWeight.w900,
                                      ),
                                    ),
                                  ],
                                ),
                              )
                            else
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                decoration: BoxDecoration(
                                  color: const Color(0xFFD4AF37).withAlpha(30),
                                  borderRadius: BorderRadius.circular(12),
                                ),
                                child: const Text(
                                  '🏷️ DEAL',
                                  style: TextStyle(
                                    color: Color(0xFFD4AF37),
                                    fontSize: 10,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ),
                            
                            if (deal.daysRemaining != null)
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                decoration: BoxDecoration(
                                  color: isUrgent ? Colors.red.shade50 : theme.colorScheme.primary.withAlpha(20),
                                  borderRadius: BorderRadius.circular(12),
                                ),
                                child: Text(
                                  '${isUrgent || deal.isFlashDeal ? '⚡ ' : ''}${deal.daysRemaining} days left',
                                  style: TextStyle(
                                    color: isUrgent ? Colors.red.shade600 : theme.colorScheme.primary,
                                    fontSize: 10,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ),
                          ],
                        ),
                        const SizedBox(height: 12),

                        // Deal Content
                        Text(
                          deal.title,
                          style: theme.textTheme.titleMedium?.copyWith(
                            fontWeight: FontWeight.bold,
                            color: const Color(0xFF1A1A1A),
                          ),
                        ),
                        if (deal.description != null) ...[
                          const SizedBox(height: 6),
                          Text(
                            deal.description!,
                            style: theme.textTheme.bodyMedium?.copyWith(
                              color: const Color(0xFF525252),
                            ),
                          ),
                        ],
                        const SizedBox(height: 16),
                        const Divider(height: 1, color: Color(0xFFE5E5E5)),
                        const SizedBox(height: 12),

                        // Business Info
                        Row(
                          children: [
                            Container(
                              width: 32,
                              height: 32,
                              decoration: BoxDecoration(
                                gradient: LinearGradient(
                                  colors: [theme.colorScheme.primary, theme.colorScheme.secondary],
                                ),
                                shape: BoxShape.circle,
                              ),
                              child: Center(
                                child: Text(
                                  deal.businessName.isNotEmpty ? deal.businessName[0].toUpperCase() : '?',
                                  style: const TextStyle(
                                    color: Colors.white,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ),
                            ),
                            const SizedBox(width: 8),
                            Expanded(
                              child: Text(
                                deal.businessName,
                                style: TextStyle(
                                  color: theme.colorScheme.primary,
                                  fontWeight: FontWeight.w600,
                                  fontSize: 14,
                                ),
                              ),
                            ),
                            if (deal.businessId != null)
                              TextButton(
                                onPressed: () => context.push('/business/${deal.businessId}'),
                                style: TextButton.styleFrom(
                                  padding: EdgeInsets.zero,
                                  minimumSize: Size.zero,
                                  tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                                ),
                                child: Text(
                                  'View',
                                  style: TextStyle(color: theme.colorScheme.primary),
                                ),
                              ),
                          ],
                        ),
                      ],
                    ),
                  ),
                );
              },
            );
          },
          loading: () => ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: 4,
            itemBuilder: (context, index) => Container(
              margin: const EdgeInsets.only(bottom: 16),
              child: const ShimmerLoading(width: double.infinity, height: 180, borderRadius: 16),
            ),
          ),
          error: (err, _) => Center(child: Text('Error loading deals: $err')),
        ),
      ),
    );
  }
}
