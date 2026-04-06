import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/repositories/analytics_repository.dart';
import '../../core/theme/app_theme.dart';

class CompetitorInsightsScreen extends ConsumerStatefulWidget {
  const CompetitorInsightsScreen({super.key});

  @override
  ConsumerState<CompetitorInsightsScreen> createState() => _CompetitorInsightsScreenState();
}

class _CompetitorInsightsScreenState extends ConsumerState<CompetitorInsightsScreen> {
  List<Map<String, dynamic>> _stats = [];
  bool _loading = true;
  bool _isAdmin = false;

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
      final stats = await repo.getCompetitorInsights();
      if (mounted) setState(() { _stats = stats; _isAdmin = true; _loading = false; });
    } catch (e) {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) return Scaffold(appBar: AppBar(title: const Text('Competitor Insights')), body: const Center(child: CircularProgressIndicator()));

    if (!_isAdmin) return Scaffold(
      appBar: AppBar(title: const Text('Competitor Insights')),
      body: Center(child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
        const Icon(Icons.lock_outline, size: 64, color: SpotifyColors.textTertiary),
        const SizedBox(height: 16),
        const Text('Admin Access Required', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18, color: SpotifyColors.textPrimary)),
      ])),
    );

    final totalBiz = _stats.fold(0, (s, c) => s + ((c['totalBusinesses'] as int?) ?? 0));

    return Scaffold(
      appBar: AppBar(
        title: const Text('Competitor Insights'),
        centerTitle: true,
        actions: [
          IconButton(icon: const Icon(Icons.refresh), onPressed: () { setState(() => _loading = true); _load(); }),
        ],
      ),
      body: _stats.isEmpty
          ? Center(child: Column(mainAxisAlignment: MainAxisAlignment.center, children: const [
              Icon(Icons.bar_chart, size: 64, color: SpotifyColors.textTertiary),
              SizedBox(height: 16),
              Text('No insights available', style: TextStyle(color: SpotifyColors.textSecondary, fontSize: 16)),
              Text('More data needed to generate insights.', style: TextStyle(color: SpotifyColors.textTertiary, fontSize: 13)),
            ]))
          : ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: _stats.length,
              itemBuilder: (ctx, i) {
                final s = _stats[i];
                final count = (s['totalBusinesses'] as int?) ?? 0;
                final avgRating = (s['averageRating'] as double?) ?? 0.0;
                final reviews = (s['totalReviews'] as int?) ?? 0;
                final top = (s['topPerformer'] as String?) ?? 'N/A';
                final marketShare = totalBiz > 0 ? ((count / totalBiz) * 100).toStringAsFixed(1) : '0.0';

                return Container(
                  margin: const EdgeInsets.only(bottom: 16),
                  padding: const EdgeInsets.all(18),
                  decoration: BoxDecoration(color: SpotifyColors.surface, borderRadius: BorderRadius.circular(16)),
                  child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                    Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
                      Text(s['category'] as String? ?? '', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: SpotifyColors.textPrimary)),
                      const Icon(Icons.emoji_events, color: Colors.amber),
                    ]),
                    const SizedBox(height: 14),
                    GridView.count(
                      crossAxisCount: 2,
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      mainAxisSpacing: 10,
                      crossAxisSpacing: 10,
                      childAspectRatio: 2.2,
                      children: [
                        _cell('Total Businesses', '$count', Colors.purple),
                        _cell('Avg Rating', '${avgRating.toStringAsFixed(1)} ⭐', Colors.blue),
                        _cell('Total Reviews', '$reviews', SpotifyColors.green),
                        _cell('Top Performer', top, Colors.amber, small: true),
                      ],
                    ),
                    const SizedBox(height: 14),
                    Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
                      const Text('Market Share', style: TextStyle(fontSize: 13, color: SpotifyColors.textSecondary)),
                      Text('$marketShare%', style: const TextStyle(fontWeight: FontWeight.bold, color: SpotifyColors.textPrimary, fontSize: 14)),
                    ]),
                    const SizedBox(height: 6),
                    ClipRRect(
                      borderRadius: BorderRadius.circular(4),
                      child: LinearProgressIndicator(
                        value: totalBiz > 0 ? count / totalBiz : 0,
                        minHeight: 6,
                        backgroundColor: SpotifyColors.highlight,
                        valueColor: AlwaysStoppedAnimation<Color>(SpotifyColors.green),
                      ),
                    ),
                  ]),
                );
              },
            ),
    );
  }

  Widget _cell(String label, String value, Color color, {bool small = false}) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(color: color.withAlpha(20), borderRadius: BorderRadius.circular(10)),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, mainAxisAlignment: MainAxisAlignment.center, children: [
        Text(label, style: TextStyle(fontSize: 10, color: color, fontWeight: FontWeight.w600)),
        Text(value, style: TextStyle(fontSize: small ? 12 : 18, fontWeight: FontWeight.bold, color: color), overflow: TextOverflow.ellipsis),
      ]),
    );
  }
}
