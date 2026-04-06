import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/repositories/business_repository.dart';
import '../../core/theme/app_theme.dart';

class ReviewsDashboardScreen extends ConsumerStatefulWidget {
  final String businessId;
  final String businessName;
  const ReviewsDashboardScreen({super.key, required this.businessId, required this.businessName});

  @override
  ConsumerState<ReviewsDashboardScreen> createState() => _ReviewsDashboardScreenState();
}

class _ReviewsDashboardScreenState extends ConsumerState<ReviewsDashboardScreen> {
  List<Map<String, dynamic>> _reviews = [];
  bool _loading = true;
  String? _respondingTo;
  final _responseCtrl = TextEditingController();
  bool _saving = false;

  @override
  void initState() {
    super.initState();
    _load();
  }

  @override
  void dispose() {
    _responseCtrl.dispose();
    super.dispose();
  }

  Future<void> _load() async {
    try {
      final repo = ref.read(businessRepositoryProvider);
      final reviews = await repo.getReviewsWithOwnerInfo(widget.businessId);
      if (mounted) setState(() { _reviews = reviews; _loading = false; });
    } catch (e) {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _respond(String reviewId) async {
    if (_responseCtrl.text.trim().isEmpty) return;
    setState(() => _saving = true);
    try {
      final repo = ref.read(businessRepositoryProvider);
      await repo.respondToReview(reviewId: reviewId, response: _responseCtrl.text.trim());
      setState(() {
        _reviews = _reviews.map((r) => r['id'] == reviewId
            ? {...r, 'response': _responseCtrl.text.trim(), 'response_at': DateTime.now().toIso8601String()}
            : r).toList();
        _respondingTo = null;
        _responseCtrl.clear();
      });
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Failed: $e')));
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final avgRating = _reviews.isEmpty
        ? 0.0
        : _reviews.fold(0.0, (s, r) => s + ((r['rating'] as num?) ?? 0).toDouble()) / _reviews.length;

    return Scaffold(
      appBar: AppBar(
        title: Text('Reviews: ${widget.businessName}'),
        centerTitle: true,
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(36),
          child: Padding(
            padding: const EdgeInsets.only(bottom: 10),
            child: Row(mainAxisAlignment: MainAxisAlignment.center, children: [
              Icon(Icons.star, color: Colors.amber, size: 18),
              const SizedBox(width: 4),
              Text(avgRating.toStringAsFixed(1),
                  style: const TextStyle(color: SpotifyColors.textPrimary, fontWeight: FontWeight.bold)),
              const SizedBox(width: 8),
              Text('${_reviews.length} review${_reviews.length != 1 ? 's' : ''}',
                  style: const TextStyle(color: SpotifyColors.textSecondary, fontSize: 13)),
            ]),
          ),
        ),
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _reviews.isEmpty
              ? Center(
                  child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
                    Icon(Icons.chat_bubble_outline, size: 64, color: SpotifyColors.textTertiary),
                    const SizedBox(height: 16),
                    const Text('No reviews yet', style: TextStyle(color: SpotifyColors.textSecondary, fontSize: 16)),
                  ]),
                )
              : ListView.builder(
                  padding: const EdgeInsets.all(16),
                  itemCount: _reviews.length,
                  itemBuilder: (context, i) {
                    final r = _reviews[i];
                    final rating = (r['rating'] as num?)?.toInt() ?? 0;
                    final name = r['user_name'] as String? ?? 'Anonymous';
                    final comment = r['comment'] as String?;
                    final response = r['response'] as String?;
                    final date = r['created_at'] as String?;
                    final isResponding = _respondingTo == r['id'];

                    return Container(
                      margin: const EdgeInsets.only(bottom: 12),
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: SpotifyColors.surface,
                        borderRadius: BorderRadius.circular(16),
                      ),
                      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                        Row(children: [
                          CircleAvatar(
                            radius: 18,
                            backgroundColor: SpotifyColors.green.withAlpha(40),
                            child: Text(name[0].toUpperCase(), style: const TextStyle(color: SpotifyColors.green, fontWeight: FontWeight.bold)),
                          ),
                          const SizedBox(width: 10),
                          Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                            Text(name, style: const TextStyle(fontWeight: FontWeight.bold, color: SpotifyColors.textPrimary)),
                            if (date != null)
                              Text(
                                DateTime.tryParse(date)?.toLocal().toString().split(' ').first ?? '',
                                style: const TextStyle(fontSize: 11, color: SpotifyColors.textSecondary),
                              ),
                          ])),
                          Row(children: List.generate(5, (s) => Icon(
                            s < rating ? Icons.star : Icons.star_border,
                            size: 16,
                            color: Colors.amber,
                          ))),
                        ]),

                        if (comment != null && comment.isNotEmpty) ...[
                          const SizedBox(height: 10),
                          Text(comment, style: const TextStyle(color: SpotifyColors.textPrimary, fontSize: 14)),
                        ],

                        const SizedBox(height: 12),

                        if (response != null && response.isNotEmpty)
                          Container(
                            padding: const EdgeInsets.all(12),
                            decoration: BoxDecoration(
                              color: SpotifyColors.green.withAlpha(20),
                              borderRadius: BorderRadius.circular(10),
                              border: Border(left: BorderSide(color: SpotifyColors.green, width: 3)),
                            ),
                            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                              Row(children: const [
                                Icon(Icons.check_circle, size: 14, color: SpotifyColors.green),
                                SizedBox(width: 4),
                                Text('Your Response', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: SpotifyColors.green)),
                              ]),
                              const SizedBox(height: 6),
                              Text(response, style: const TextStyle(color: SpotifyColors.textSecondary, fontSize: 13)),
                            ]),
                          )
                        else if (isResponding)
                          Column(children: [
                            TextField(
                              controller: _responseCtrl,
                              maxLines: 3,
                              style: const TextStyle(color: SpotifyColors.textPrimary),
                              decoration: const InputDecoration(hintText: 'Write your response...'),
                            ),
                            const SizedBox(height: 8),
                            Row(children: [
                              Expanded(
                                child: OutlinedButton(
                                  onPressed: () => setState(() { _respondingTo = null; _responseCtrl.clear(); }),
                                  child: const Text('Cancel'),
                                ),
                              ),
                              const SizedBox(width: 8),
                              Expanded(
                                flex: 2,
                                child: ElevatedButton.icon(
                                  onPressed: _saving ? null : () => _respond(r['id']),
                                  icon: _saving
                                      ? const SizedBox(width: 14, height: 14, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.black))
                                      : const Icon(Icons.send, size: 16),
                                  label: Text(_saving ? 'Sending...' : 'Send Response'),
                                ),
                              ),
                            ]),
                          ])
                        else
                          TextButton.icon(
                            onPressed: () => setState(() => _respondingTo = r['id']),
                            icon: const Icon(Icons.chat_bubble_outline, size: 16),
                            label: const Text('Respond to this review'),
                          ),
                      ]),
                    );
                  },
                ),
    );
  }
}
