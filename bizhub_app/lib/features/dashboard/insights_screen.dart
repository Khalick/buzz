import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/services/supabase_service.dart';
import '../../core/theme/app_theme.dart';

class InsightsScreen extends ConsumerStatefulWidget {
  final String businessId;
  final String businessName;
  const InsightsScreen({super.key, required this.businessId, required this.businessName});

  @override
  ConsumerState<InsightsScreen> createState() => _InsightsScreenState();
}

class _InsightsScreenState extends ConsumerState<InsightsScreen> {
  final _client = SupabaseService.client;
  bool _loading = true;
  List<Map<String, dynamic>> _reviews = [];
  double _townAvg = 0;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    try {
      final reviews = await _client
          .from('reviews')
          .select('id, rating, comment, created_at')
          .eq('business_id', widget.businessId);

      // Get business to fetch town for benchmarking
      final biz = await _client.from('businesses').select('location, rating').eq('id', widget.businessId).maybeSingle();
      double townAvg = 0;
      if (biz != null && biz['location'] != null) {
        final town = biz['location']['town'];
        if (town != null) {
          // Simplified: use the global average as benchmark
          final others = await _client.from('businesses').select('rating').eq('approved', true);
          if ((others as List).isNotEmpty) {
            final sum = others.fold(0.0, (s, b) => s + ((b['rating'] as num?)?.toDouble() ?? 0.0));
            townAvg = sum / others.length;
          }
        }
      }

      if (mounted) {
        setState(() {
          _reviews = List<Map<String, dynamic>>.from(reviews);
          _townAvg = townAvg;
          _loading = false;
        });
      }
    } catch (e) {
      if (mounted) setState(() => _loading = false);
    }
  }

  // --- Sentiment analysis (same logic as web) ---
  static const _positiveWords = ['great', 'excellent', 'good', 'amazing', 'love', 'perfect', 'friendly', 'fast', 'clean', 'professional', 'delicious', 'best'];
  static const _negativeWords = ['bad', 'terrible', 'slow', 'rude', 'dirty', 'expensive', 'worst', 'poor', 'late', 'unprofessional'];

  Map<String, dynamic> _analyzeReviews() {
    int positive = 0, negative = 0;
    final Map<String, int> keywords = {};

    for (final r in _reviews) {
      final comment = (r['comment'] as String? ?? '').toLowerCase().replaceAll(RegExp(r'[^a-z\s]'), ' ');
      final words = comment.split(RegExp(r'\s+'));
      for (final w in words) {
        if (w.length < 4) continue;
        if (_positiveWords.contains(w)) positive++;
        if (_negativeWords.contains(w)) negative++;
        if (!_positiveWords.contains(w) && !_negativeWords.contains(w) &&
            !['this', 'that', 'very', 'with', 'they', 'have', 'from', 'were', 'also'].contains(w)) {
          keywords[w] = (keywords[w] ?? 0) + 1;
        }
      }
    }

    final total = positive + negative;
    final score = total > 0 ? ((positive / total) * 100).round() : 100;
    final topKws = (keywords.entries.toList()
          ..sort((a, b) => b.value - a.value))
        .take(5)
        .map((e) => e.key)
        .toList();

    final avgRating = _reviews.isEmpty
        ? 0.0
        : _reviews.fold(0.0, (s, r) => s + ((r['rating'] as num?)?.toDouble() ?? 0)) / _reviews.length;

    String rankText = 'Gathering data...';
    if (_townAvg > 0) {
      if (avgRating >= _townAvg + 0.5) rankText = 'Top 10% in Town';
      else if (avgRating >= _townAvg) rankText = 'Above Average';
      else rankText = 'Below Average';
    } else {
      if (avgRating >= 4.5) rankText = 'Top Tier';
      else rankText = 'Standard';
    }

    return {
      'sentimentScore': score,
      'positive': positive,
      'negative': negative,
      'topKeywords': topKws,
      'avgRating': avgRating,
      'rankText': rankText,
    };
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) return Scaffold(appBar: AppBar(title: const Text('AI Review Insights')), body: const Center(child: CircularProgressIndicator()));

    final analysis = _analyzeReviews();
    final score = analysis['sentimentScore'] as int;
    final topKws = analysis['topKeywords'] as List<String>;
    final avgRating = (analysis['avgRating'] as double);
    final rankText = analysis['rankText'] as String;
    final positive = analysis['positive'] as int;
    final negative = analysis['negative'] as int;

    return Scaffold(
      appBar: AppBar(
        title: const Text('AI Review Insights'),
        centerTitle: true,
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(28),
          child: Padding(
            padding: const EdgeInsets.only(bottom: 8),
            child: Text(widget.businessName, style: const TextStyle(color: SpotifyColors.textSecondary, fontSize: 13)),
          ),
        ),
      ),
      body: _reviews.isEmpty
          ? Center(child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
              const Icon(Icons.bar_chart, size: 64, color: SpotifyColors.textTertiary),
              const SizedBox(height: 16),
              const Text('Not Enough Data', style: TextStyle(color: SpotifyColors.textPrimary, fontSize: 18, fontWeight: FontWeight.bold)),
              const SizedBox(height: 8),
              const Text('You need at least one review for insights.', style: TextStyle(color: SpotifyColors.textSecondary)),
            ]))
          : ListView(padding: const EdgeInsets.all(16), children: [
              // Sentiment score card
              Container(
                padding: const EdgeInsets.all(20),
                margin: const EdgeInsets.only(bottom: 16),
                decoration: BoxDecoration(color: SpotifyColors.surface, borderRadius: BorderRadius.circular(16)),
                child: Column(children: [
                  const Text('OVERALL SENTIMENT', style: TextStyle(fontSize: 11, letterSpacing: 1.5, color: SpotifyColors.textSecondary, fontWeight: FontWeight.w600)),
                  const SizedBox(height: 8),
                  Row(mainAxisAlignment: MainAxisAlignment.center, crossAxisAlignment: CrossAxisAlignment.end, children: [
                    Text('$score%', style: const TextStyle(fontSize: 52, fontWeight: FontWeight.w900, color: SpotifyColors.green)),
                    const SizedBox(width: 6),
                    const Padding(padding: EdgeInsets.only(bottom: 8), child: Text('Positive', style: TextStyle(color: SpotifyColors.green, fontWeight: FontWeight.w600))),
                  ]),
                  const SizedBox(height: 12),
                  ClipRRect(
                    borderRadius: BorderRadius.circular(4),
                    child: LinearProgressIndicator(
                      value: score / 100,
                      minHeight: 8,
                      backgroundColor: SpotifyColors.highlight,
                      valueColor: AlwaysStoppedAnimation<Color>(SpotifyColors.green),
                    ),
                  ),
                ]),
              ),

              // Benchmark card
              Container(
                padding: const EdgeInsets.all(20),
                margin: const EdgeInsets.only(bottom: 16),
                decoration: BoxDecoration(color: SpotifyColors.surface, borderRadius: BorderRadius.circular(16)),
                child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  const Row(children: [
                    Icon(Icons.trending_up, color: Colors.amber, size: 18),
                    SizedBox(width: 6),
                    Text('Benchmark', style: TextStyle(fontWeight: FontWeight.bold, color: SpotifyColors.textPrimary)),
                  ]),
                  const SizedBox(height: 16),
                  Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
                    Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                      const Text('YOUR RATING', style: TextStyle(fontSize: 10, color: SpotifyColors.textSecondary, letterSpacing: 1.2)),
                      Row(children: [
                        const Icon(Icons.star, color: Colors.amber, size: 16),
                        const SizedBox(width: 4),
                        Text(avgRating.toStringAsFixed(1), style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w900, color: SpotifyColors.textPrimary)),
                      ]),
                    ]),
                    Column(crossAxisAlignment: CrossAxisAlignment.end, children: [
                      const Text('MARKET POSITION', style: TextStyle(fontSize: 10, color: SpotifyColors.textSecondary, letterSpacing: 1.2)),
                      Text(rankText, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: SpotifyColors.green)),
                      if (_townAvg > 0)
                        Text('Local avg: ${_townAvg.toStringAsFixed(1)}', style: const TextStyle(fontSize: 11, color: SpotifyColors.textTertiary)),
                    ]),
                  ]),
                ]),
              ),

              // Actionable insight
              Container(
                padding: const EdgeInsets.all(16),
                margin: const EdgeInsets.only(bottom: 16),
                decoration: BoxDecoration(
                  color: positive > negative
                      ? Colors.green.withAlpha(20)
                      : (positive + negative > 0 ? Colors.red.withAlpha(20) : Colors.blue.withAlpha(20)),
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(
                    color: positive > negative ? SpotifyColors.green.withAlpha(80) : (positive + negative > 0 ? SpotifyColors.error.withAlpha(80) : Colors.blue.withAlpha(80)),
                  ),
                ),
                child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Icon(
                    positive > negative ? Icons.check_circle : (positive + negative > 0 ? Icons.warning_amber : Icons.info_outline),
                    color: positive > negative ? SpotifyColors.green : (positive + negative > 0 ? SpotifyColors.error : Colors.blue),
                    size: 20,
                  ),
                  const SizedBox(width: 10),
                  Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                    Text(
                      positive > negative ? 'Strong Customer Satisfaction' : (positive + negative > 0 ? 'Area for Improvement' : 'Neutral Sentiment'),
                      style: const TextStyle(fontWeight: FontWeight.bold, color: SpotifyColors.textPrimary),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      positive > negative
                          ? 'Your customers frequently use highly positive language. Keep doing what you\'re doing!'
                          : (positive + negative > 0
                              ? 'We detected negative patterns in recent reviews. Consider addressing specific complaints.'
                              : 'Reviews don\'t show strong emotion. Ask your best customers for reviews.'),
                      style: const TextStyle(fontSize: 13, color: SpotifyColors.textSecondary),
                    ),
                  ])),
                ]),
              ),

              // Keywords
              if (topKws.isNotEmpty)
                Container(
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(color: SpotifyColors.surface, borderRadius: BorderRadius.circular(16)),
                  child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                    const Row(children: [
                      Icon(Icons.pie_chart_outline, color: SpotifyColors.green, size: 18),
                      SizedBox(width: 6),
                      Text('Frequent Keywords', style: TextStyle(fontWeight: FontWeight.bold, color: SpotifyColors.textPrimary)),
                    ]),
                    const SizedBox(height: 6),
                    const Text('What people talk about most in your reviews:', style: TextStyle(fontSize: 12, color: SpotifyColors.textSecondary)),
                    const SizedBox(height: 12),
                    Wrap(spacing: 8, runSpacing: 8, children: topKws.map((kw) => Container(
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                      decoration: BoxDecoration(color: SpotifyColors.highlight, borderRadius: BorderRadius.circular(8)),
                      child: Text(kw, style: const TextStyle(color: SpotifyColors.textPrimary, fontWeight: FontWeight.w600)),
                    )).toList()),
                  ]),
                ),

              const SizedBox(height: 32),
            ]),
    );
  }
}
