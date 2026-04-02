import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/repositories/business_repository.dart';
import '../../core/providers/auth_provider.dart';
import '../../core/repositories/user_repository.dart';
import '../../shared/widgets/business_card.dart';
import '../../shared/widgets/empty_state.dart';
import '../../shared/widgets/shimmer_loading.dart';
import 'package:go_router/go_router.dart';

final favoriteIdsProvider = FutureProvider<List<String>>((ref) async {
  final user = ref.watch(currentUserProvider);
  if (user == null) return [];
  final repo = ref.watch(userRepositoryProvider);
  final profile = await repo.getUserProfile(user.id);
  return profile?.favorites ?? [];
});

final favoriteBusinessesProvider = FutureProvider((ref) async {
  final ids = await ref.watch(favoriteIdsProvider.future);
  if (ids.isEmpty) return [];
  final repo = ref.watch(businessRepositoryProvider);
  return repo.getBusinessesByIds(ids);
});

class FavoritesScreen extends ConsumerWidget {
  const FavoritesScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final businessesAsync = ref.watch(favoriteBusinessesProvider);
    final user = ref.watch(currentUserProvider);

    if (user == null) {
      return Scaffold(
        appBar: AppBar(title: const Text('Favorites')),
        body: Center(
          child: EmptyState(
            icon: Icons.lock_outline,
            title: 'Sign In Required',
            subtitle: 'Sign in to save and view your favorite businesses.',
            buttonText: 'Sign In',
            onButtonTap: () => context.push('/login'),
          ),
        ),
      );
    }

    return Scaffold(
      appBar: AppBar(
        title: const Text('Saved Favorites'),
        centerTitle: true,
      ),
      body: RefreshIndicator(
        onRefresh: () async {
          ref.refresh(favoriteIdsProvider);
          ref.refresh(favoriteBusinessesProvider);
        },
        child: businessesAsync.when(
          data: (businesses) {
            if (businesses.isEmpty) {
              return ListView(
                children: [
                  SizedBox(height: MediaQuery.of(context).size.height * 0.1),
                  EmptyState(
                    icon: Icons.favorite_border,
                    title: 'No Favorites Yet',
                    subtitle: 'Heart businesses in the directory to save them here.',
                    buttonText: 'Browse Directory',
                    onButtonTap: () => context.push('/directory'),
                  ),
                ],
              );
            }

            return ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: businesses.length,
              itemBuilder: (context, index) {
                final business = businesses[index];
                return Dismissible(
                  key: Key(business.id),
                  direction: DismissDirection.endToStart,
                  background: Container(
                    alignment: Alignment.centerRight,
                    padding: const EdgeInsets.only(right: 20),
                    margin: const EdgeInsets.only(bottom: 16),
                    decoration: BoxDecoration(
                      color: Colors.red,
                      borderRadius: BorderRadius.circular(16),
                    ),
                    child: const Icon(Icons.delete, color: Colors.white),
                  ),
                  onDismissed: (_) async {
                    final repo = ref.read(userRepositoryProvider);
                    await repo.toggleFavorite(user.id, business.id);
                    ref.refresh(favoriteIdsProvider);
                    ref.refresh(favoriteBusinessesProvider);
                    if (context.mounted) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(content: Text('${business.name} removed from favorites')),
                      );
                    }
                  },
                  child: BusinessCardWidget(business: business),
                );
              },
            );
          },
          loading: () => ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: 3,
            itemBuilder: (context, index) => const BusinessCardSkeleton(),
          ),
          error: (err, _) => Center(child: Text('Error: $err')),
        ),
      ),
    );
  }
}
