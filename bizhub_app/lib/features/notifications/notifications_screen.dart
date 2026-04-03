import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../core/repositories/notification_repository.dart';
import '../../core/providers/auth_provider.dart';
import '../../shared/widgets/empty_state.dart';

final notificationsProvider = FutureProvider((ref) async {
  final user = ref.watch(currentUserProvider);
  if (user == null) return [];
  final repo = ref.watch(notificationRepositoryProvider);
  return repo.getNotifications(user.id);
});

class NotificationsScreen extends ConsumerWidget {
  const NotificationsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    final user = ref.watch(currentUserProvider);
    final notificationsAsync = ref.watch(notificationsProvider);

    if (user == null) {
      return Scaffold(
        appBar: AppBar(title: const Text('Notifications')),
        body: const Center(
          child: EmptyState(
            icon: Icons.notifications_off,
            title: 'Sign In Required',
            subtitle: 'Sign in to see your notifications.',
          ),
        ),
      );
    }

    return Scaffold(
      appBar: AppBar(
        title: const Text('Notifications'),
        centerTitle: true,
      ),
      body: RefreshIndicator(
        onRefresh: () => ref.refresh(notificationsProvider.future),
        child: notificationsAsync.when(
          data: (notifications) {
            if (notifications.isEmpty) {
              return ListView(
                children: [
                  SizedBox(height: MediaQuery.of(context).size.height * 0.1),
                  const EmptyState(
                    icon: Icons.notifications_none,
                    title: 'Caught up!',
                    subtitle: 'You have no new notifications right now.',
                  ),
                ],
              );
            }

            return ListView.builder(
              itemCount: notifications.length,
              itemBuilder: (context, index) {
                final note = notifications[index];
                IconData icon;
                Color color;

                switch (note.type) {
                  case 'welcome':
                    icon = Icons.waving_hand;
                    color = Colors.blue;
                    break;
                  case 'approval':
                    icon = Icons.check_circle;
                    color = Colors.green;
                    break;
                  case 'rejection':
                    icon = Icons.cancel;
                    color = Colors.red;
                    break;
                  case 'deal':
                    icon = Icons.local_offer;
                    color = const Color(0xFFD4AF37);
                    break;
                  default:
                    icon = Icons.notifications;
                    color = theme.colorScheme.primary;
                }

                return ListTile(
                  contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  tileColor: note.read ? Colors.transparent : theme.colorScheme.primary.withAlpha(10),
                  leading: Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: color.withAlpha(20),
                      shape: BoxShape.circle,
                    ),
                    child: Icon(icon, color: color, size: 24),
                  ),
                  title: Text(
                    note.title,
                    style: TextStyle(
                      fontWeight: note.read ? FontWeight.normal : FontWeight.bold,
                    ),
                  ),
                  subtitle: note.message != null ? Text(note.message!) : null,
                  onTap: () async {
                    if (!note.read) {
                      final repo = ref.read(notificationRepositoryProvider);
                      await repo.markAsRead(note.id);
                      ref.refresh(notificationsProvider);
                    }
                    // Deep link based on type
                    if (context.mounted) {
                      switch (note.type) {
                        case 'approval':
                        case 'rejection':
                          context.push('/dashboard');
                          break;
                        case 'deal':
                          context.push('/deals');
                          break;
                        default:
                          break;
                      }
                    }
                  },
                );
              },
            );
          },
          loading: () => const Center(child: CircularProgressIndicator()),
          error: (e, _) => Center(child: Text('Error: $e')),
        ),
      ),
    );
  }
}
