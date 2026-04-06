import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../core/providers/auth_provider.dart';
import '../../core/repositories/leads_repository.dart';
import '../../core/repositories/business_repository.dart';
import '../../core/theme/app_theme.dart';

class BroadcastRequestScreen extends ConsumerStatefulWidget {
  const BroadcastRequestScreen({super.key});

  @override
  ConsumerState<BroadcastRequestScreen> createState() => _BroadcastRequestScreenState();
}

class _BroadcastRequestScreenState extends ConsumerState<BroadcastRequestScreen> {
  List<String> _categories = [];
  String _selectedCategory = '';
  final _descCtrl = TextEditingController();
  final _budgetCtrl = TextEditingController();
  bool _submitting = false;
  bool _submitted = false;

  @override
  void initState() {
    super.initState();
    _loadCategories();
  }

  @override
  void dispose() {
    _descCtrl.dispose();
    _budgetCtrl.dispose();
    super.dispose();
  }

  Future<void> _loadCategories() async {
    try {
      final cats = await ref.read(businessRepositoryProvider).getCategories();
      if (mounted) setState(() => _categories = cats);
    } catch (_) {}
  }

  Future<void> _submit() async {
    if (_selectedCategory.isEmpty || _descCtrl.text.trim().isEmpty) return;
    final user = ref.read(currentUserProvider);
    if (user == null) { context.push('/login'); return; }

    setState(() => _submitting = true);
    try {
      await ref.read(leadsRepositoryProvider).submitBroadcastRequest(
        userId: user.id,
        category: _selectedCategory,
        description: _descCtrl.text.trim(),
        budget: _budgetCtrl.text.trim().isEmpty ? null : _budgetCtrl.text.trim(),
      );
      if (mounted) setState(() { _submitted = true; _submitting = false; });
    } catch (e) {
      if (mounted) {
        setState(() => _submitting = false);
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Failed: $e')));
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_submitted) {
      return Scaffold(
        body: Center(child: Padding(
          padding: const EdgeInsets.all(32),
          child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
            Container(
              width: 72, height: 72,
              decoration: BoxDecoration(color: SpotifyColors.green.withAlpha(30), shape: BoxShape.circle),
              child: const Icon(Icons.check_circle_outline, color: SpotifyColors.green, size: 36),
            ),
            const SizedBox(height: 20),
            const Text('Request Broadcasted!', style: TextStyle(fontSize: 22, fontWeight: FontWeight.w900, color: SpotifyColors.textPrimary)),
            const SizedBox(height: 10),
            const Text(
              "We've alerted matching businesses. Check your notifications for quotes and responses over the next 24 hours.",
              style: TextStyle(color: SpotifyColors.textSecondary, fontSize: 14),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 28),
            SizedBox(width: double.infinity, child: ElevatedButton(
              onPressed: () => context.push('/notifications'),
              child: const Text('Go to Notifications'),
            )),
            const SizedBox(height: 10),
            SizedBox(width: double.infinity, child: OutlinedButton(
              onPressed: () => setState(() { _submitted = false; _selectedCategory = ''; _descCtrl.clear(); _budgetCtrl.clear(); }),
              child: const Text('New Request'),
            )),
          ]),
        )),
      );
    }

    return Scaffold(
      appBar: AppBar(title: const Text('Request a Service'), centerTitle: true),
      body: ListView(padding: const EdgeInsets.all(20), children: [
        // Hero text
        Container(
          padding: const EdgeInsets.all(20),
          margin: const EdgeInsets.only(bottom: 24),
          decoration: BoxDecoration(
            gradient: LinearGradient(colors: [SpotifyColors.green.withAlpha(40), SpotifyColors.green.withAlpha(10)]),
            borderRadius: BorderRadius.circular(16),
          ),
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            const Row(children: [
              Icon(Icons.auto_awesome, color: SpotifyColors.green, size: 16),
              SizedBox(width: 6),
              Text('REVERSE MARKET', style: TextStyle(color: SpotifyColors.green, fontSize: 11, fontWeight: FontWeight.bold, letterSpacing: 1.5)),
            ]),
            const SizedBox(height: 10),
            const Text('Let Businesses Come to You', style: TextStyle(fontSize: 22, fontWeight: FontWeight.w900, color: SpotifyColors.textPrimary)),
            const SizedBox(height: 6),
            const Text('Post what you need and local professionals will respond with quotes.', style: TextStyle(color: SpotifyColors.textSecondary, fontSize: 13)),
          ]),
        ),

        // Category
        const Text('What kind of service? *', style: TextStyle(fontWeight: FontWeight.bold, color: SpotifyColors.textPrimary)),
        const SizedBox(height: 8),
        DropdownButtonFormField<String>(
          value: _selectedCategory.isEmpty ? null : _selectedCategory,
          dropdownColor: SpotifyColors.surface,
          style: const TextStyle(color: SpotifyColors.textPrimary),
          decoration: const InputDecoration(hintText: 'Select a category...'),
          items: _categories.map((c) => DropdownMenuItem(value: c, child: Text(c))).toList(),
          onChanged: (v) => setState(() => _selectedCategory = v ?? ''),
        ),
        const SizedBox(height: 20),

        // Description
        const Text('What exactly do you need? *', style: TextStyle(fontWeight: FontWeight.bold, color: SpotifyColors.textPrimary)),
        const SizedBox(height: 4),
        const Text('Be specific to get the best quotes (e.g., "Need a chocolate cake for 20 people by Friday")', style: TextStyle(color: SpotifyColors.textSecondary, fontSize: 12)),
        const SizedBox(height: 8),
        TextField(
          controller: _descCtrl,
          maxLines: 5,
          style: const TextStyle(color: SpotifyColors.textPrimary),
          decoration: const InputDecoration(hintText: 'Describe your request...'),
        ),
        const SizedBox(height: 20),

        // Budget
        const Text('Estimated Budget (Optional)', style: TextStyle(fontWeight: FontWeight.bold, color: SpotifyColors.textPrimary)),
        const SizedBox(height: 8),
        TextField(
          controller: _budgetCtrl,
          keyboardType: TextInputType.number,
          style: const TextStyle(color: SpotifyColors.textPrimary),
          decoration: const InputDecoration(hintText: 'e.g. 5,000', prefixText: 'KSh '),
        ),
        const SizedBox(height: 28),

        SizedBox(
          width: double.infinity,
          child: ElevatedButton.icon(
            onPressed: (_submitting || _selectedCategory.isEmpty || _descCtrl.text.trim().isEmpty) ? null : _submit,
            icon: _submitting
                ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.black))
                : const Icon(Icons.send),
            label: Text(_submitting ? 'Broadcasting...' : 'Broadcast Request'),
            style: ElevatedButton.styleFrom(
              padding: const EdgeInsets.symmetric(vertical: 16),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
            ),
          ),
        ),
        const SizedBox(height: 32),
      ]),
    );
  }
}
