import 'dart:convert';
import 'package:http/http.dart' as http;

/// Service for calling the BizHub AI endpoints hosted on the Next.js backend.
class AiService {
  static const String _baseUrl = 'https://bizhub.vercel.app';

  /// Fetches an AI-generated review summary for a given business.
  /// Returns a map with `summary` (String?) and `tags` (List<String>).
  static Future<Map<String, dynamic>> getReviewSummary(String businessId) async {
    try {
      final uri = Uri.parse('$_baseUrl/api/reviews/summary?businessId=$businessId');
      final response = await http.get(uri).timeout(const Duration(seconds: 15));

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        return {
          'summary': data['summary'] as String?,
          'tags': List<String>.from(data['tags'] ?? []),
        };
      } else {
        return {'summary': null, 'tags': <String>[], 'error': 'Service unavailable'};
      }
    } catch (e) {
      return {'summary': null, 'tags': <String>[], 'error': e.toString()};
    }
  }

  /// Sends a natural language query to the BizHub AI assistant.
  /// Returns a map with `answer` (String) and `mentionedBusinesses` (List).
  static Future<Map<String, dynamic>> askBizHub(String query) async {
    try {
      final uri = Uri.parse('$_baseUrl/api/search/ai');
      final response = await http.post(
        uri,
        headers: {
          'Content-Type': 'application/json',
          'Origin': _baseUrl,
          'Referer': '$_baseUrl/',
        },
        body: json.encode({'query': query}),
      ).timeout(const Duration(seconds: 20));

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        return {
          'answer': data['answer'] as String? ?? 'Sorry, I couldn\'t process that.',
          'mentionedBusinesses': List<Map<String, dynamic>>.from(
            (data['mentionedBusinesses'] as List?)?.map((b) => Map<String, dynamic>.from(b)) ?? [],
          ),
        };
      } else {
        final data = json.decode(response.body);
        return {
          'answer': data['error'] as String? ?? 'AI service temporarily unavailable.',
          'mentionedBusinesses': <Map<String, dynamic>>[],
        };
      }
    } catch (e) {
      return {
        'answer': 'Network error. Please check your connection.',
        'mentionedBusinesses': <Map<String, dynamic>>[],
      };
    }
  }
}
