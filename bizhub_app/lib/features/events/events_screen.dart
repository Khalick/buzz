import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../../core/repositories/events_repository.dart';
import '../../shared/widgets/empty_state.dart';
import '../../shared/widgets/shimmer_loading.dart';
import '../../core/theme/app_theme.dart';

class EventFilterNotifier extends Notifier<String> {
  @override
  String build() => 'upcoming';
  void setFilter(String filter) => state = filter;
}

// Provides the current filter state (upcoming, past, all)
final eventFilterProvider = NotifierProvider<EventFilterNotifier, String>(() {
  return EventFilterNotifier();
});

// Fetches events based on the filter
final eventsProvider = FutureProvider((ref) async {
  final filter = ref.watch(eventFilterProvider);
  final repo = ref.watch(eventsRepositoryProvider);
  return repo.getEvents(filter: filter);
});

class EventsScreen extends ConsumerWidget {
  const EventsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    final currentFilter = ref.watch(eventFilterProvider);
    final eventsAsync = ref.watch(eventsProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Events'),
        centerTitle: true,
      ),
      body: Column(
        children: [
          // Filter Chips
          Container(
            padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 16),
            child: Row(
              children: [
                _buildFilterChip('Upcoming', 'upcoming', currentFilter, ref, theme),
                const SizedBox(width: 8),
                _buildFilterChip('Past', 'past', currentFilter, ref, theme),
                const SizedBox(width: 8),
                _buildFilterChip('All', 'all', currentFilter, ref, theme),
              ],
            ),
          ),

          // Events List
          Expanded(
            child: RefreshIndicator(
              onRefresh: () => ref.refresh(eventsProvider.future),
              child: eventsAsync.when(
                data: (events) {
                  if (events.isEmpty) {
                    return ListView(
                      children: [
                        SizedBox(height: MediaQuery.of(context).size.height * 0.1),
                        EmptyState(
                          icon: Icons.event_busy,
                          title: 'No Events Found',
                          subtitle: 'Check back later for upcoming events in your area.',
                          buttonText: 'Browse Directory',
                          onButtonTap: () => context.push('/directory'),
                        ),
                      ],
                    );
                  }

                  return ListView.builder(
                    padding: const EdgeInsets.all(16),
                    itemCount: events.length,
                    itemBuilder: (context, index) {
                      final event = events[index];
                      final isUpcoming = event.isUpcoming;

                      return Container(
                        margin: const EdgeInsets.only(bottom: 16),
                        decoration: BoxDecoration(
                          color: SpotifyColors.surface,
                          borderRadius: BorderRadius.circular(8),
                        ),
                        clipBehavior: Clip.antiAlias,
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            // Event Image
                            if (event.imageUrl != null)
                              CachedNetworkImage(
                                imageUrl: event.imageUrl!,
                                height: 150,
                                width: double.infinity,
                                fit: BoxFit.cover,
                                placeholder: (_, __) => Container(
                                  height: 150, color: SpotifyColors.highlight,
                                  child: const Center(child: Icon(Icons.image, color: SpotifyColors.textTertiary)),
                                ),
                                errorWidget: (_, __, ___) => const SizedBox.shrink(),
                              ),
                            // Header Row (Date Block + Info)
                            Padding(
                              padding: const EdgeInsets.all(16.0),
                              child: Row(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  // Date Block
                                  Container(
                                    width: 60,
                                    height: 70,
                                    decoration: BoxDecoration(
                                      color: isUpcoming ? SpotifyColors.green.withAlpha(20) : SpotifyColors.highlight,
                                      borderRadius: BorderRadius.circular(8),
                                      border: Border.all(
                                        color: isUpcoming ? SpotifyColors.green.withAlpha(50) : SpotifyColors.highlight,
                                      ),
                                    ),
                                    child: Column(
                                      mainAxisAlignment: MainAxisAlignment.center,
                                      children: [
                                        Text(
                                          event.monthShort.toUpperCase(),
                                          style: TextStyle(
                                            color: isUpcoming ? SpotifyColors.green : SpotifyColors.textSecondary,
                                            fontWeight: FontWeight.bold,
                                            fontSize: 12,
                                          ),
                                        ),
                                        Text(
                                          '${event.day}',
                                          style: TextStyle(
                                            color: isUpcoming ? SpotifyColors.green : SpotifyColors.textSecondary,
                                            fontWeight: FontWeight.w900,
                                            fontSize: 24,
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                  const SizedBox(width: 16),
                                  
                                  // Event Details
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Text(
                                          event.title,
                                          style: theme.textTheme.titleMedium?.copyWith(
                                            fontWeight: FontWeight.bold,
                                            color: SpotifyColors.textPrimary,
                                          ),
                                        ),
                                        const SizedBox(height: 8),
                                        Row(
                                          children: [
                                            Icon(Icons.access_time, size: 14, color: SpotifyColors.green),
                                            const SizedBox(width: 6),
                                            Text(
                                              event.timeRange,
                                              style: const TextStyle(color: SpotifyColors.textSecondary, fontSize: 13),
                                            ),
                                          ],
                                        ),
                                        if (event.location != null) ...[
                                          const SizedBox(height: 4),
                                          Row(
                                            children: [
                                              Icon(Icons.location_on_outlined, size: 14, color: SpotifyColors.green),
                                              const SizedBox(width: 6),
                                              Expanded(
                                                child: Text(
                                                  event.location!,
                                                  style: const TextStyle(color: SpotifyColors.textSecondary, fontSize: 13),
                                                  maxLines: 1,
                                                  overflow: TextOverflow.ellipsis,
                                                ),
                                              ),
                                            ],
                                          ),
                                        ],
                                      ],
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            
                            // Bottom Action Bar
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                              decoration: const BoxDecoration(
                                color: SpotifyColors.surface,
                                border: Border(top: BorderSide(color: SpotifyColors.highlight)),
                              ),
                              child: Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  // Price
                                  Row(
                                    children: [
                                      Icon(
                                        event.isPaid ? Icons.local_activity : Icons.stars,
                                        size: 16,
                                        color: event.isPaid ? Colors.orange : Colors.green,
                                      ),
                                      const SizedBox(width: 6),
                                      Text(
                                        event.isPaid && event.price != null ? 'KES ${event.price}' : 'Free Entry',
                                        style: TextStyle(
                                          fontWeight: FontWeight.bold,
                                          color: event.isPaid ? Colors.orange.shade700 : Colors.green.shade700,
                                        ),
                                      ),
                                    ],
                                  ),
                                  
                                  // Business Link
                                  if (event.businessId != null && event.businessName != null)
                                    GestureDetector(
                                      onTap: () => context.push('/business/${event.businessId}'),
                                      child: Row(
                                        children: [
                                          Text(
                                            'By ${event.businessName}',
                                            style: TextStyle(
                                              color: SpotifyColors.textPrimary,
                                              fontSize: 13,
                                              fontWeight: FontWeight.w600,
                                            ),
                                          ),
                                          const SizedBox(width: 4),
                                          const Icon(Icons.chevron_right, size: 16, color: SpotifyColors.textPrimary),
                                        ],
                                      ),
                                    ),
                                ],
                              ),
                            ),
                          ],
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
                    child: const ShimmerLoading(width: double.infinity, height: 160, borderRadius: 16),
                  ),
                ),
                error: (err, _) => Center(child: Text('Error: $err')),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFilterChip(String label, String value, String currentValue, WidgetRef ref, ThemeData theme) {
    final isSelected = value == currentValue;
    return FilterChip(
      label: Text(label),
      selected: isSelected,
      onSelected: (_) => ref.read(eventFilterProvider.notifier).setFilter(value),
      labelStyle: TextStyle(
        color: isSelected ? Colors.white : theme.colorScheme.onSurface,
        fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
      ),
      backgroundColor: theme.colorScheme.surface,
      selectedColor: theme.colorScheme.primary,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(20),
      ),
      checkmarkColor: Colors.white,
    );
  }
}
