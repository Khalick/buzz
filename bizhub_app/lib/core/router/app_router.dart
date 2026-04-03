import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../features/auth/login_screen.dart';
import '../../features/auth/onboarding_screen.dart';
import '../../features/auth/forgot_password_screen.dart';
import '../../features/home/home_screen.dart';
import '../../features/directory/directory_screen.dart';
import '../../features/directory/add_business_screen.dart';
import '../../features/directory/map_screen.dart';
import '../../features/deals/deals_screen.dart';
import '../../features/events/events_screen.dart';
import '../../features/profile/profile_screen.dart';
import '../../features/favorites/favorites_screen.dart';
import '../../features/notifications/notifications_screen.dart';
import '../../features/business_detail/business_detail_screen.dart';
import '../../features/business_detail/add_review_screen.dart';
import '../../features/dashboard/dashboard_screen.dart';
import '../../features/dashboard/manage_deals_screen.dart';
import '../../features/proof/proof_of_visit_screen.dart';
import '../services/supabase_service.dart';

final rootNavigatorKey = GlobalKey<NavigatorState>();
final shellNavigatorKey = GlobalKey<NavigatorState>();

final appRouterProvider = Provider<GoRouter>((ref) {
  return GoRouter(
    navigatorKey: rootNavigatorKey,
    initialLocation: '/home',
    redirect: (context, state) {
      final isLoggedIn = SupabaseService.client.auth.currentUser != null;
      final isLoginRoute = state.uri.path == '/login';
      final isOnboarding = state.uri.path == '/onboarding';
      final isForgotPassword = state.uri.path == '/forgot-password';

      if (!isLoggedIn && !isLoginRoute && !isForgotPassword) {
        return '/login';
      }
      if (isLoggedIn && isLoginRoute) {
        return '/home';
      }
      return null;
    },
    routes: [
      GoRoute(
        path: '/login',
        builder: (context, state) => const LoginScreen(),
      ),
      GoRoute(
        path: '/onboarding',
        builder: (context, state) => const OnboardingScreen(),
      ),
      GoRoute(
        path: '/forgot-password',
        builder: (context, state) => const ForgotPasswordScreen(),
      ),
      ShellRoute(
        navigatorKey: shellNavigatorKey,
        builder: (context, state, child) {
          return MainScaffold(child: child);
        },
        routes: [
          GoRoute(
            path: '/home',
            builder: (context, state) => const HomeScreen(),
          ),
          GoRoute(
            path: '/directory',
            builder: (context, state) {
              final category = state.uri.queryParameters['category'];
              return DirectoryScreen(initialCategory: category);
            },
          ),
          GoRoute(
            path: '/deals',
            builder: (context, state) => const DealsScreen(),
          ),
          GoRoute(
            path: '/events',
            builder: (context, state) => const EventsScreen(),
          ),
          GoRoute(
            path: '/profile',
            builder: (context, state) => const ProfileScreen(),
          ),
          GoRoute(
            path: '/favorites',
            builder: (context, state) => const FavoritesScreen(),
          ),
          GoRoute(
            path: '/notifications',
            builder: (context, state) => const NotificationsScreen(),
          ),
          GoRoute(
            path: '/dashboard',
            builder: (context, state) => const DashboardScreen(),
          ),
        ],
      ),
      GoRoute(
        path: '/business/:id',
        builder: (context, state) {
          final id = state.pathParameters['id'] ?? '1';
          return BusinessDetailScreen(id: id);
        },
      ),
      GoRoute(
        path: '/business/:id/review',
        builder: (context, state) {
          final id = state.pathParameters['id'] ?? '';
          final name = state.uri.queryParameters['name'] ?? 'Business';
          return AddReviewScreen(businessId: id, businessName: name);
        },
      ),
      GoRoute(
        path: '/directory/add',
        builder: (context, state) => const AddBusinessScreen(),
      ),
      GoRoute(
        path: '/map',
        builder: (context, state) => const MapScreen(),
      ),
      GoRoute(
        path: '/dashboard/deals',
        builder: (context, state) => const ManageDealsScreen(),
      ),
      GoRoute(
        path: '/proof-of-visit',
        builder: (context, state) => const ProofOfVisitScreen(),
      ),
    ],
  );
});

class MainScaffold extends StatelessWidget {
  final Widget child;

  const MainScaffold({super.key, required this.child});

  @override
  Widget build(BuildContext context) {
    int currentIndex = _calculateSelectedIndex(context);
    final theme = Theme.of(context);

    return Scaffold(
      body: child,
      bottomNavigationBar: NavigationBar(
        selectedIndex: currentIndex,
        onDestinationSelected: (int idx) => _onItemTapped(idx, context),
        backgroundColor: theme.colorScheme.surface,
        indicatorColor: theme.colorScheme.primary.withAlpha(25),
        destinations: const [
          NavigationDestination(
            icon: Icon(Icons.home_outlined),
            selectedIcon: Icon(Icons.home),
            label: 'Home',
          ),
          NavigationDestination(
            icon: Icon(Icons.search_outlined),
            selectedIcon: Icon(Icons.search),
            label: 'Directory',
          ),
          NavigationDestination(
            icon: Icon(Icons.local_offer_outlined),
            selectedIcon: Icon(Icons.local_offer),
            label: 'Deals',
          ),
          NavigationDestination(
            icon: Icon(Icons.event_outlined),
            selectedIcon: Icon(Icons.event),
            label: 'Events',
          ),
          NavigationDestination(
            icon: Icon(Icons.person_outline),
            selectedIcon: Icon(Icons.person),
            label: 'Profile',
          ),
        ],
      ),
    );
  }

  static int _calculateSelectedIndex(BuildContext context) {
    final String location = GoRouterState.of(context).uri.path;
    if (location.startsWith('/home')) return 0;
    if (location.startsWith('/directory')) return 1;
    if (location.startsWith('/deals')) return 2;
    if (location.startsWith('/events')) return 3;
    if (location.startsWith('/profile')) return 4;
    if (location.startsWith('/dashboard')) return 4;
    if (location.startsWith('/favorites')) return 4;
    if (location.startsWith('/notifications')) return 0;
    return 0;
  }

  void _onItemTapped(int index, BuildContext context) {
    switch (index) {
      case 0:
        context.go('/home');
        break;
      case 1:
        context.go('/directory');
        break;
      case 2:
        context.go('/deals');
        break;
      case 3:
        context.go('/events');
        break;
      case 4:
        context.go('/profile');
        break;
    }
  }
}
