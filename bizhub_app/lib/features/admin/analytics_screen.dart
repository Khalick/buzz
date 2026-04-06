import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/repositories/analytics_repository.dart';
import '../../core/theme/app_theme.dart';

class AnalyticsScreen extends ConsumerStatefulWidget {
  const AnalyticsScreen({super.key});

  @override
  ConsumerState<AnalyticsScreen> createState() => _AnalyticsScreenState();
}

class _AnalyticsScreenState extends ConsumerState<AnalyticsScreen> {
  Map<String, dynamic>? _data;
  bool _loading = true;
  bool _isAdmin = false;
  String? _error;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    try {
      final repo = ref.read(analyticsRepositoryProvider);
      final admin = await repo.isAdmin();
      if (!admin) { if (mounted) setState(() { _isAdmin = false; _loading = false; }); return; }
      final data = await repo.getAnalytics();
      if (mounted) setState(() { _data = data; _isAdmin = true; _loading = false; });
    } catch (e) {
      if (mounted) setState(() { _error = e.toString(); _loading = false; });
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) return Scaffold(appBar: AppBar(title: const Text('Analytics')), body: const Center(child: CircularProgressIndicator()));
    if (!_isAdmin) return Scaffold(
      appBar: AppBar(title: const Text('Analytics')),
      body: Center(child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
        const Icon(Icons.lock_outline, size: 64, color: SpotifyColors.textTertiary),
        const SizedBox(height: 16),
        const Text('Admin Access Required', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18, color: SpotifyColors.textPrimary)),
        const SizedBox(height: 8),
        const Text('This page is restricted to admin users.', style: TextStyle(color: SpotifyColors.textSecondary)),
      ])),
    );
    if (_error != null) return Scaffold(appBar: AppBar(title: const Text('Analytics')), body: Center(child: Text(_error!, style: const TextStyle(color: SpotifyColors.error))));

    final overview = _data!['overview'] as Map;
    final growth = _data!['growth'] as Map;
    final breakdown = _data!['breakdown'] as Map;
    final recent = _data!['recent'] as Map;
    final byCategory = Map<String, int>.from(breakdown['byCategory'] ?? {});
    final byCounty = Map<String, int>.from(breakdown['byCounty'] ?? {});
    final recentUsers = recent['users'] as List? ?? [];
    final recentBizs = recent['businesses'] as List? ?? [];

    final maxCat = byCategory.values.isEmpty ? 1 : byCategory.values.reduce((a, b) => a > b ? a : b);
    final maxCounty = byCounty.values.isEmpty ? 1 : byCounty.values.reduce((a, b) => a > b ? a : b);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Analytics Dashboard'),
        centerTitle: true,
        actions: [
          IconButton(icon: const Icon(Icons.refresh), onPressed: () { setState(() => _loading = true); _load(); }),
        ],
      ),
      body: ListView(padding: const EdgeInsets.all(16), children: [
        // Overview stats
        Text('Last updated: ${(_data!['lastUpdated'] as String).split('T').first}',
          style: const TextStyle(fontSize: 11, color: SpotifyColors.textSecondary)),
        const SizedBox(height: 14),
        GridView.count(
          crossAxisCount: 2,
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          crossAxisSpacing: 12,
          mainAxisSpacing: 12,
          childAspectRatio: 1.6,
          children: [
            _statCard('Total Users', '${overview['totalUsers']}', Icons.people_outline, Colors.blue, growth: '+${growth['newUsersThisWeek']} this week'),
            _statCard('Total Businesses', '${overview['totalBusinesses']}', Icons.business_outlined, SpotifyColors.green, growth: '+${growth['newBusinessesThisWeek']} this week'),
            _statCard('Approved', '${overview['approvedBusinesses']}', Icons.check_circle_outline, Colors.orange),
            _statCard('Pending', '${overview['pendingBusinesses']}', Icons.schedule_outlined, Colors.amber),
          ],
        ),
        const SizedBox(height: 24),

        // Category breakdown
        _sectionHeader('Businesses by Category'),
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(color: SpotifyColors.surface, borderRadius: BorderRadius.circular(16)),
          child: Column(children: (byCategory.entries.toList()..sort((a, b) => b.value - a.value)).take(8).map((e) => Padding(
            padding: const EdgeInsets.only(bottom: 10),
            child: Row(children: [
              Expanded(flex: 2, child: Text(e.key, style: const TextStyle(color: SpotifyColors.textSecondary, fontSize: 13))),
              Expanded(flex: 3, child: ClipRRect(
                borderRadius: BorderRadius.circular(4),
                child: LinearProgressIndicator(
                  value: maxCat > 0 ? e.value / maxCat : 0,
                  minHeight: 8,
                  backgroundColor: SpotifyColors.highlight,
                  valueColor: const AlwaysStoppedAnimation<Color>(Colors.blue),
                ),
              )),
              const SizedBox(width: 8),
              Text('${e.value}', style: const TextStyle(fontWeight: FontWeight.bold, color: SpotifyColors.textPrimary, fontSize: 13)),
            ]),
          )).toList()),
        ),
        const SizedBox(height: 16),

        // County breakdown
        _sectionHeader('Businesses by County'),
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(color: SpotifyColors.surface, borderRadius: BorderRadius.circular(16)),
          child: Column(children: (byCounty.entries.toList()..sort((a, b) => b.value - a.value)).take(8).map((e) => Padding(
            padding: const EdgeInsets.only(bottom: 10),
            child: Row(children: [
              Expanded(flex: 2, child: Text(e.key, style: const TextStyle(color: SpotifyColors.textSecondary, fontSize: 13))),
              Expanded(flex: 3, child: ClipRRect(
                borderRadius: BorderRadius.circular(4),
                child: LinearProgressIndicator(
                  value: maxCounty > 0 ? e.value / maxCounty : 0,
                  minHeight: 8,
                  backgroundColor: SpotifyColors.highlight,
                  valueColor: const AlwaysStoppedAnimation<Color>(SpotifyColors.green),
                ),
              )),
              const SizedBox(width: 8),
              Text('${e.value}', style: const TextStyle(fontWeight: FontWeight.bold, color: SpotifyColors.textPrimary, fontSize: 13)),
            ]),
          )).toList()),
        ),
        const SizedBox(height: 16),

        // Recent users
        _sectionHeader('Recent Users'),
        Container(
          decoration: BoxDecoration(color: SpotifyColors.surface, borderRadius: BorderRadius.circular(16)),
          child: Column(children: recentUsers.take(5).map((u) {
            final Map user = u as Map;
            return ListTile(
              leading: CircleAvatar(backgroundColor: Colors.blue.withAlpha(40), child: Text((user['display_name'] as String? ?? user['email'] as String? ?? 'A')[0].toUpperCase(), style: const TextStyle(color: Colors.blue))),
              title: Text(user['display_name'] as String? ?? user['email'] as String? ?? 'Anonymous', style: const TextStyle(color: SpotifyColors.textPrimary)),
              subtitle: Text('${user['role'] ?? 'user'} • ${(user['created_at'] as String? ?? '').split('T').first}', style: const TextStyle(color: SpotifyColors.textSecondary, fontSize: 12)),
              trailing: Container(padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3), decoration: BoxDecoration(color: Colors.blue.withAlpha(30), borderRadius: BorderRadius.circular(20)), child: const Text('New', style: TextStyle(color: Colors.blue, fontSize: 10, fontWeight: FontWeight.bold))),
            );
          }).toList()),
        ),
        const SizedBox(height: 16),

        // Recent businesses
        _sectionHeader('Recent Businesses'),
        Container(
          decoration: BoxDecoration(color: SpotifyColors.surface, borderRadius: BorderRadius.circular(16)),
          child: Column(children: recentBizs.take(5).map((b) {
            final Map biz = b as Map;
            final approved = biz['approved'] == true;
            return ListTile(
              leading: CircleAvatar(backgroundColor: SpotifyColors.green.withAlpha(40), child: Text((biz['name'] as String? ?? 'B')[0].toUpperCase(), style: const TextStyle(color: SpotifyColors.green))),
              title: Text(biz['name'] as String? ?? '-', style: const TextStyle(color: SpotifyColors.textPrimary)),
              subtitle: Text('${biz['category'] ?? ''} • ${(biz['location'] is Map ? biz['location']['county'] : '') ?? ''}', style: const TextStyle(color: SpotifyColors.textSecondary, fontSize: 12)),
              trailing: Container(padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3), decoration: BoxDecoration(color: (approved ? SpotifyColors.green : Colors.amber).withAlpha(30), borderRadius: BorderRadius.circular(20)), child: Text(approved ? 'Approved' : 'Pending', style: TextStyle(color: approved ? SpotifyColors.green : Colors.amber, fontSize: 10, fontWeight: FontWeight.bold))),
            );
          }).toList()),
        ),
        const SizedBox(height: 32),
      ]),
    );
  }

  Widget _sectionHeader(String title) => Padding(
    padding: const EdgeInsets.only(bottom: 10),
    child: Text(title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15, color: SpotifyColors.textPrimary)),
  );

  Widget _statCard(String label, String value, IconData icon, Color color, {String? growth}) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(color: SpotifyColors.surface, borderRadius: BorderRadius.circular(14), border: Border(left: BorderSide(color: color, width: 3))),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
          Text(label, style: const TextStyle(fontSize: 12, color: SpotifyColors.textSecondary)),
          Icon(icon, size: 18, color: color),
        ]),
        const Spacer(),
        Text(value, style: TextStyle(fontSize: 26, fontWeight: FontWeight.w900, color: color)),
        if (growth != null) Text(growth, style: const TextStyle(fontSize: 10, color: SpotifyColors.textSecondary)),
      ]),
    );
  }
}
