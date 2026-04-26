import 'package:flutter/material.dart';
import '../../core/services/ai_service.dart';
import '../../core/theme/app_theme.dart';

/// AI Review Summary card shown on business detail pages.
/// Calls the Next.js API to get an OpenAI-powered summary.
class AiReviewSummaryWidget extends StatefulWidget {
  final String businessId;
  final int reviewCount;

  const AiReviewSummaryWidget({
    super.key,
    required this.businessId,
    required this.reviewCount,
  });

  @override
  State<AiReviewSummaryWidget> createState() => _AiReviewSummaryWidgetState();
}

class _AiReviewSummaryWidgetState extends State<AiReviewSummaryWidget> {
  bool _loading = true;
  String? _summary;
  List<String> _tags = [];
  String? _error;

  @override
  void initState() {
    super.initState();
    if (widget.reviewCount > 0) {
      _fetchSummary();
    } else {
      _loading = false;
    }
  }

  Future<void> _fetchSummary() async {
    final result = await AiService.getReviewSummary(widget.businessId);
    if (mounted) {
      setState(() {
        _summary = result['summary'] as String?;
        _tags = List<String>.from(result['tags'] ?? []);
        _error = result['error'] as String?;
        _loading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    if (widget.reviewCount == 0) return const SizedBox.shrink();

    if (_loading) {
      return Container(
        margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          gradient: LinearGradient(
            colors: [SpotifyColors.green.withAlpha(30), SpotifyColors.green.withAlpha(10)],
          ),
          borderRadius: BorderRadius.circular(16),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(children: [
              Icon(Icons.auto_awesome, color: const Color(0xFFD4AF37), size: 18),
              const SizedBox(width: 8),
              Container(height: 14, width: 120, decoration: BoxDecoration(color: SpotifyColors.highlight, borderRadius: BorderRadius.circular(4))),
            ]),
            const SizedBox(height: 14),
            Container(height: 12, width: double.infinity, decoration: BoxDecoration(color: SpotifyColors.highlight, borderRadius: BorderRadius.circular(4))),
            const SizedBox(height: 6),
            Container(height: 12, width: MediaQuery.of(context).size.width * 0.6, decoration: BoxDecoration(color: SpotifyColors.highlight, borderRadius: BorderRadius.circular(4))),
            const SizedBox(height: 14),
            Row(children: List.generate(3, (_) => Container(
              margin: const EdgeInsets.only(right: 8),
              height: 24, width: 60,
              decoration: BoxDecoration(color: SpotifyColors.highlight, borderRadius: BorderRadius.circular(12)),
            ))),
          ],
        ),
      );
    }

    if (_error != null || _summary == null) {
      return const SizedBox.shrink();
    }

    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [Color(0xFF1B4332), Color(0xFF2D6A4F)],
        ),
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(color: const Color(0xFF1B4332).withAlpha(60), blurRadius: 20, offset: const Offset(0, 8)),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header
          const Row(children: [
            Icon(Icons.auto_awesome, color: Color(0xFFD4AF37), size: 18),
            SizedBox(width: 8),
            Text(
              'AI Review Insights',
              style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 15),
            ),
          ]),
          const SizedBox(height: 12),

          // Summary text
          Text(
            _summary!,
            style: const TextStyle(color: Colors.white70, fontSize: 13, height: 1.5),
          ),

          // Tags
          if (_tags.isNotEmpty) ...[
            const SizedBox(height: 14),
            Container(height: 1, color: Colors.white10),
            const SizedBox(height: 12),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: _tags.map((tag) => Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                decoration: BoxDecoration(
                  color: Colors.white.withAlpha(25),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: Colors.white.withAlpha(15)),
                ),
                child: Text(
                  tag,
                  style: const TextStyle(color: Colors.white70, fontSize: 11, fontWeight: FontWeight.w600),
                ),
              )).toList(),
            ),
          ],
        ],
      ),
    );
  }
}
