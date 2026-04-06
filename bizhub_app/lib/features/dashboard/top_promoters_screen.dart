import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/providers/auth_provider.dart';
import '../../core/repositories/business_repository.dart';
import '../../core/repositories/user_repository.dart';
import '../../core/theme/app_theme.dart';

class TopPromotersScreen extends ConsumerStatefulWidget {
  const TopPromotersScreen({super.key});

  @override
  ConsumerState<TopPromotersScreen> createState() => _TopPromotersScreenState();
}

class _TopPromotersScreenState extends ConsumerState<TopPromotersScreen> {
  List<Map<String, dynamic>> _promoters = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    final user = ref.read(currentUserProvider);
    if (user == null) return;
    try {
      final userRepo = ref.read(userRepositoryProvider);
      final businesses = await userRepo.getUserBusinesses(user.id);
      if (businesses.isEmpty) { if (mounted) setState(() => _loading = false); return; }

      final names = businesses.map((b) => b['name'] as String? ?? '').where((n) => n.isNotEmpty).toList();
      final promoters = await ref.read(businessRepositoryProvider).getPromoters(names);

      if (mounted) setState(() { _promoters = promoters; _loading = false; });
    } catch (e) {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final totalReferrals = _promoters.fold(0, (s, p) => s + ((p['referral_views'] as num?)?.toInt() ?? 0));

    return Scaffold(
      appBar: AppBar(
        title: const Text('Top Promoters'),
        centerTitle: true,
        actions: [
          Container(
            margin: const EdgeInsets.only(right: 12, top: 8, bottom: 8),
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
            decoration: BoxDecoration(color: Colors.purple.withAlpha(40), borderRadius: BorderRadius.circular(20)),
            child: const Text('INFLUENCERS', style: TextStyle(color: Colors.purple, fontWeight: FontWeight.bold, fontSize: 10)),
          ),
        ],
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : Column(children: [
              // Stats row
              Padding(
                padding: const EdgeInsets.all(16),
                child: Row(children: [
                  Expanded(child: _statCard('Active Promoters', '${_promoters.length}', Icons.people_outline, SpotifyColors.green)),
                  const SizedBox(width: 12),
                  Expanded(child: _statCard('Total Referred Views', '$totalReferrals', Icons.trending_up, Colors.amber)),
                ]),
              ),

              if (_promoters.isEmpty)
                Expanded(child: Center(child: Padding(
                  padding: const EdgeInsets.all(32),
                  child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
                    const Icon(Icons.favorite_border, size: 64, color: SpotifyColors.textTertiary),
                    const SizedBox(height: 16),
                    const Text('No Referrals Yet', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18, color: SpotifyColors.textPrimary)),
                    const SizedBox(height: 8),
                    const Text('When customers share their Proof of Visit cards, you\'ll see who\'s driving traffic here.', style: TextStyle(color: SpotifyColors.textSecondary), textAlign: TextAlign.center),
                  ]),
                )))
              else
                Expanded(
                  child: SingleChildScrollView(
                    child: Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 16),
                      child: Container(
                        decoration: BoxDecoration(color: SpotifyColors.surface, borderRadius: BorderRadius.circular(16)),
                        child: Column(children: [
                          // Header row
                          Padding(
                            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                            child: Row(children: const [
                              SizedBox(width: 36, child: Text('Rank', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: SpotifyColors.textSecondary))),
                              SizedBox(width: 12),
                              Expanded(child: Text('Promoter', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: SpotifyColors.textSecondary))),
                              Text('Business', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: SpotifyColors.textSecondary)),
                              SizedBox(width: 16),
                              Text('Views', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: SpotifyColors.textSecondary)),
                            ]),
                          ),
                          const Divider(height: 1),
                          ..._promoters.asMap().entries.map((entry) {
                            final idx = entry.key;
                            final p = entry.value;
                            final views = (p['referral_views'] as num?)?.toInt() ?? 0;

                            return Column(children: [
                              Padding(
                                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                                child: Row(children: [
                                  SizedBox(width: 36, child: _rankBadge(idx)),
                                  const SizedBox(width: 12),
                                  Expanded(child: Row(children: [
                                    if (p['image_url'] != null)
                                      ClipRRect(
                                        borderRadius: BorderRadius.circular(8),
                                        child: Image.network(p['image_url'] as String, width: 40, height: 40, fit: BoxFit.cover,
                                          errorBuilder: (_, __, ___) => Container(width: 40, height: 40, color: SpotifyColors.highlight, child: const Icon(Icons.person, color: SpotifyColors.textSecondary)),
                                        ),
                                      ),
                                    const SizedBox(width: 8),
                                    Expanded(child: Text(p['name'] as String? ?? '', style: const TextStyle(fontWeight: FontWeight.bold, color: SpotifyColors.textPrimary), overflow: TextOverflow.ellipsis)),
                                  ])),
                                  Text(p['business_name'] as String? ?? '', style: const TextStyle(fontSize: 12, color: SpotifyColors.textSecondary), overflow: TextOverflow.ellipsis),
                                  const SizedBox(width: 16),
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                    decoration: BoxDecoration(color: SpotifyColors.green.withAlpha(30), borderRadius: BorderRadius.circular(20)),
                                    child: Text('$views', style: const TextStyle(fontWeight: FontWeight.w900, color: SpotifyColors.green, fontSize: 16)),
                                  ),
                                ]),
                              ),
                              if (idx < _promoters.length - 1) const Divider(height: 1),
                            ]);
                          }),
                        ]),
                      ),
                    ),
                  ),
                ),
              const SizedBox(height: 24),
            ]),
    );
  }

  Widget _statCard(String label, String value, IconData icon, Color color) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(color: SpotifyColors.surface, borderRadius: BorderRadius.circular(14)),
      child: Row(children: [
        Container(
          width: 44, height: 44,
          decoration: BoxDecoration(color: color.withAlpha(30), shape: BoxShape.circle),
          child: Icon(icon, color: color, size: 22),
        ),
        const SizedBox(width: 12),
        Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text(label, style: const TextStyle(fontSize: 11, color: SpotifyColors.textSecondary)),
          Text(value, style: TextStyle(fontSize: 22, fontWeight: FontWeight.w900, color: color)),
        ]),
      ]),
    );
  }

  Widget _rankBadge(int idx) {
    if (idx == 0) return Container(width: 30, height: 30, decoration: BoxDecoration(color: Colors.amber.withAlpha(40), shape: BoxShape.circle), child: const Icon(Icons.emoji_events, color: Colors.amber, size: 16));
    if (idx == 1) return Container(width: 30, height: 30, decoration: BoxDecoration(color: Colors.grey.withAlpha(40), shape: BoxShape.circle), child: const Center(child: Text('2', style: TextStyle(fontWeight: FontWeight.bold, color: Colors.grey))));
    if (idx == 2) return Container(width: 30, height: 30, decoration: BoxDecoration(color: Colors.orange.withAlpha(40), shape: BoxShape.circle), child: const Center(child: Text('3', style: TextStyle(fontWeight: FontWeight.bold, color: Colors.orange))));
    return SizedBox(width: 30, child: Center(child: Text('${idx + 1}', style: const TextStyle(color: SpotifyColors.textSecondary, fontWeight: FontWeight.bold))));
  }
}
