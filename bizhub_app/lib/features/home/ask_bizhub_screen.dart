import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../core/services/ai_service.dart';
import '../../core/theme/app_theme.dart';

/// A chat message in the Ask BizHub conversation.
class _ChatMessage {
  final String role; // 'user' | 'assistant'
  final String content;
  final List<Map<String, dynamic>> businesses;

  _ChatMessage({required this.role, required this.content, this.businesses = const []});
}

const _exampleQueries = [
  'Best restaurant open now?',
  'Where can I fix my laptop?',
  'Affordable salon in Thika?',
  'Good plumber near Juja?',
];

class AskBizHubScreen extends StatefulWidget {
  const AskBizHubScreen({super.key});

  @override
  State<AskBizHubScreen> createState() => _AskBizHubScreenState();
}

class _AskBizHubScreenState extends State<AskBizHubScreen> {
  final _controller = TextEditingController();
  final _scrollController = ScrollController();
  final List<_ChatMessage> _messages = [];
  bool _loading = false;

  @override
  void dispose() {
    _controller.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  void _scrollToBottom() {
    Future.delayed(const Duration(milliseconds: 100), () {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      }
    });
  }

  Future<void> _send(String query) async {
    if (query.trim().isEmpty) return;
    setState(() {
      _messages.add(_ChatMessage(role: 'user', content: query.trim()));
      _loading = true;
    });
    _controller.clear();
    _scrollToBottom();

    final result = await AiService.askBizHub(query.trim());

    if (mounted) {
      setState(() {
        _messages.add(_ChatMessage(
          role: 'assistant',
          content: result['answer'] as String,
          businesses: List<Map<String, dynamic>>.from(result['mentionedBusinesses'] ?? []),
        ));
        _loading = false;
      });
      _scrollToBottom();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: SpotifyColors.background,
      appBar: AppBar(
        title: const Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.auto_awesome, color: Color(0xFFD4AF37), size: 20),
            SizedBox(width: 8),
            Text('Ask Lokari'),
          ],
        ),
        centerTitle: true,
        bottom: const PreferredSize(
          preferredSize: Size.fromHeight(24),
          child: Padding(
            padding: EdgeInsets.only(bottom: 8),
            child: Text(
              'AI-powered business discovery',
              style: TextStyle(color: SpotifyColors.textSecondary, fontSize: 11),
            ),
          ),
        ),
      ),
      body: Column(
        children: [
          // Message list
          Expanded(
            child: _messages.isEmpty
                ? _buildEmptyState()
                : ListView.builder(
                    controller: _scrollController,
                    padding: const EdgeInsets.all(16),
                    itemCount: _messages.length + (_loading ? 1 : 0),
                    itemBuilder: (context, index) {
                      if (index == _messages.length && _loading) {
                        return _buildTypingIndicator();
                      }
                      return _buildMessageBubble(_messages[index]);
                    },
                  ),
          ),

          // Input bar
          Container(
            padding: const EdgeInsets.fromLTRB(16, 8, 8, 16),
            decoration: const BoxDecoration(
              color: SpotifyColors.surface,
              border: Border(top: BorderSide(color: SpotifyColors.highlight)),
            ),
            child: SafeArea(
              top: false,
              child: Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: _controller,
                      style: const TextStyle(color: SpotifyColors.textPrimary, fontSize: 14),
                      decoration: InputDecoration(
                        hintText: 'Ask about businesses...',
                        hintStyle: const TextStyle(color: SpotifyColors.textTertiary),
                        filled: true,
                        fillColor: SpotifyColors.highlight,
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(24),
                          borderSide: BorderSide.none,
                        ),
                        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                      ),
                      textInputAction: TextInputAction.send,
                      onSubmitted: _loading ? null : _send,
                    ),
                  ),
                  const SizedBox(width: 8),
                  GestureDetector(
                    onTap: _loading ? null : () => _send(_controller.text),
                    child: Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: _loading ? SpotifyColors.highlight : SpotifyColors.green,
                        shape: BoxShape.circle,
                      ),
                      child: Icon(
                        Icons.send,
                        size: 20,
                        color: _loading ? SpotifyColors.textTertiary : Colors.black,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              width: 72,
              height: 72,
              decoration: BoxDecoration(
                color: const Color(0xFFD4AF37).withAlpha(25),
                shape: BoxShape.circle,
              ),
              child: const Icon(Icons.auto_awesome, color: Color(0xFFD4AF37), size: 32),
            ),
            const SizedBox(height: 20),
            const Text(
              'Ask me anything about\nbusinesses in Thika!',
              style: TextStyle(color: SpotifyColors.textSecondary, fontSize: 14),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 24),
            ..._exampleQueries.map((q) => Padding(
              padding: const EdgeInsets.only(bottom: 8),
              child: GestureDetector(
                onTap: () => _send(q),
                child: Container(
                  width: double.infinity,
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                  decoration: BoxDecoration(
                    color: SpotifyColors.surface,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: SpotifyColors.highlight),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(q, style: const TextStyle(color: SpotifyColors.textPrimary, fontSize: 13)),
                      const Icon(Icons.arrow_forward_ios, size: 12, color: SpotifyColors.textTertiary),
                    ],
                  ),
                ),
              ),
            )),
          ],
        ),
      ),
    );
  }

  Widget _buildMessageBubble(_ChatMessage msg) {
    final isUser = msg.role == 'user';
    return Align(
      alignment: isUser ? Alignment.centerRight : Alignment.centerLeft,
      child: Container(
        margin: const EdgeInsets.only(bottom: 12),
        padding: const EdgeInsets.all(14),
        constraints: BoxConstraints(maxWidth: MediaQuery.of(context).size.width * 0.8),
        decoration: BoxDecoration(
          color: isUser ? SpotifyColors.green : SpotifyColors.surface,
          borderRadius: BorderRadius.only(
            topLeft: const Radius.circular(16),
            topRight: const Radius.circular(16),
            bottomLeft: Radius.circular(isUser ? 16 : 4),
            bottomRight: Radius.circular(isUser ? 4 : 16),
          ),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              msg.content,
              style: TextStyle(
                color: isUser ? Colors.black : SpotifyColors.textPrimary,
                fontSize: 14,
                height: 1.4,
              ),
            ),
            // Business links
            if (msg.businesses.isNotEmpty) ...[
              const SizedBox(height: 10),
              Container(height: 1, color: isUser ? Colors.black12 : SpotifyColors.highlight),
              const SizedBox(height: 8),
              ...msg.businesses.map((b) => GestureDetector(
                onTap: () => context.push('/business/${b['id']}'),
                child: Padding(
                  padding: const EdgeInsets.symmetric(vertical: 3),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(Icons.arrow_forward, size: 14, color: isUser ? Colors.black54 : SpotifyColors.green),
                      const SizedBox(width: 6),
                      Text(
                        '${b['name']} (${(b['rating'] as num?)?.toStringAsFixed(1) ?? '?'}★)',
                        style: TextStyle(
                          color: isUser ? Colors.black87 : SpotifyColors.green,
                          fontWeight: FontWeight.w600,
                          fontSize: 13,
                        ),
                      ),
                    ],
                  ),
                ),
              )),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildTypingIndicator() {
    return Align(
      alignment: Alignment.centerLeft,
      child: Container(
        margin: const EdgeInsets.only(bottom: 12),
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: SpotifyColors.surface,
          borderRadius: BorderRadius.circular(16),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: List.generate(3, (index) => TweenAnimationBuilder<double>(
            tween: Tween(begin: 0, end: 1),
            duration: Duration(milliseconds: 600 + index * 200),
            builder: (context, value, child) => Container(
              margin: const EdgeInsets.symmetric(horizontal: 3),
              width: 8,
              height: 8,
              decoration: BoxDecoration(
                color: SpotifyColors.green.withAlpha((80 + (100 * value).toInt()).clamp(0, 255)),
                shape: BoxShape.circle,
              ),
            ),
          )),
        ),
      ),
    );
  }
}
