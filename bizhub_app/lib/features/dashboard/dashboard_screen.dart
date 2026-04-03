import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../core/providers/auth_provider.dart';
import '../../core/repositories/business_repository.dart';
import '../../core/repositories/user_repository.dart';
import '../../core/repositories/deals_repository.dart';

// Provider for owner's businesses
final ownerBusinessesProvider = FutureProvider((ref) async {
  final user = ref.watch(currentUserProvider);
  if (user == null) return <Map<String, dynamic>>[];
  final repo = ref.watch(userRepositoryProvider);
  return repo.getUserBusinesses(user.id);
});

class DashboardScreen extends ConsumerWidget {
  const DashboardScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    final businessesAsync = ref.watch(ownerBusinessesProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('My Dashboard'),
        centerTitle: true,
      ),
      body: RefreshIndicator(
        onRefresh: () async => ref.refresh(ownerBusinessesProvider),
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
                      Text(
                        'No Businesses Yet',
                        style: theme.textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        'Submit a business to manage it from here.',
                        style: TextStyle(color: Colors.grey.shade600),
                      ),
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

            return ListView(
              padding: const EdgeInsets.all(16),
              children: [
                // Summary Cards
                Row(
                  children: [
                    _StatCard(
                      icon: Icons.storefront,
                      label: 'Businesses',
                      value: '${businesses.length}',
                      color: theme.colorScheme.primary,
                    ),
                    const SizedBox(width: 12),
                    _StatCard(
                      icon: Icons.check_circle,
                      label: 'Approved',
                      value: '${businesses.where((b) => b['approved'] == true).length}',
                      color: Colors.green,
                    ),
                    const SizedBox(width: 12),
                    _StatCard(
                      icon: Icons.pending,
                      label: 'Pending',
                      value: '${businesses.where((b) => b['approved'] != true).length}',
                      color: Colors.orange,
                    ),
                  ],
                ),
                const SizedBox(height: 24),

                // Quick Actions
                Text('Quick Actions', style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold)),
                const SizedBox(height: 12),
                Wrap(
                  spacing: 12,
                  runSpacing: 12,
                  children: [
                    _QuickAction(
                      icon: Icons.add_business,
                      label: 'Add Business',
                      onTap: () => context.push('/directory/add'),
                      theme: theme,
                    ),
                    _QuickAction(
                      icon: Icons.local_offer,
                      label: 'Create Deal',
                      onTap: () => context.push('/dashboard/deals'),
                      theme: theme,
                    ),
                  ],
                ),
                const SizedBox(height: 24),

                // My Businesses
                Text('My Businesses', style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold)),
                const SizedBox(height: 12),
                ...businesses.map((b) {
                  final approved = b['approved'] as bool;
                  return Container(
                    margin: const EdgeInsets.only(bottom: 12),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: Colors.grey.shade200),
                    ),
                    child: ListTile(
                      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                      leading: Container(
                        width: 48, height: 48,
                        decoration: BoxDecoration(
                          color: theme.colorScheme.primary.withAlpha(20),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Icon(Icons.storefront, color: theme.colorScheme.primary),
                      ),
                      title: Text(b['name'] ?? '', style: const TextStyle(fontWeight: FontWeight.bold)),
                      subtitle: Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                            decoration: BoxDecoration(
                              color: approved ? Colors.green.shade50 : Colors.orange.shade50,
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: Text(
                              approved ? 'Approved' : 'Pending',
                              style: TextStyle(
                                color: approved ? Colors.green.shade700 : Colors.orange.shade700,
                                fontSize: 11,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),
                        ],
                      ),
                      trailing: approved
                          ? PopupMenuButton<String>(
                              onSelected: (val) {
                                if (val == 'view') context.push('/business/${b['id']}');
                                if (val == 'edit') context.push('/dashboard/edit/${b['id']}');
                              },
                              itemBuilder: (_) => [
                                const PopupMenuItem(value: 'view', child: Text('View')),
                                const PopupMenuItem(value: 'edit', child: Text('Edit')),
                              ],
                            )
                          : null,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                    ),
                  );
                }),
              ],
            );
          },
          loading: () => const Center(child: CircularProgressIndicator()),
          error: (e, _) => Center(child: Text('Error: $e')),
        ),
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
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: color.withAlpha(15),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: color.withAlpha(40)),
        ),
        child: Column(
          children: [
            Icon(icon, color: color, size: 28),
            const SizedBox(height: 8),
            Text(value, style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: color)),
            Text(label, style: TextStyle(fontSize: 11, color: color)),
          ],
        ),
      ),
    );
  }
}

class _QuickAction extends StatelessWidget {
  final IconData icon;
  final String label;
  final VoidCallback onTap;
  final ThemeData theme;

  const _QuickAction({required this.icon, required this.label, required this.onTap, required this.theme});

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
        decoration: BoxDecoration(
          color: theme.colorScheme.primary.withAlpha(15),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: theme.colorScheme.primary.withAlpha(40)),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, color: theme.colorScheme.primary, size: 20),
            const SizedBox(width: 8),
            Text(label, style: TextStyle(color: theme.colorScheme.primary, fontWeight: FontWeight.bold)),
          ],
        ),
      ),
    );
  }
}
