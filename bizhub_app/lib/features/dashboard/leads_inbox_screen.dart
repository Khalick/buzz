import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/providers/auth_provider.dart';
import '../../core/repositories/leads_repository.dart';
import '../../core/repositories/user_repository.dart';
import '../../core/theme/app_theme.dart';

class LeadsInboxScreen extends ConsumerStatefulWidget {
  const LeadsInboxScreen({super.key});

  @override
  ConsumerState<LeadsInboxScreen> createState() => _LeadsInboxScreenState();
}

class _LeadsInboxScreenState extends ConsumerState<LeadsInboxScreen> {
  List<Map<String, dynamic>> _leads = [];
  List<Map<String, dynamic>> _businesses = [];
  bool _loading = true;
  String? _respondingTo;
  String _selectedBizId = '';
  final _msgCtrl = TextEditingController();
  final _quoteCtrl = TextEditingController();
  bool _sending = false;

  @override
  void initState() {
    super.initState();
    _load();
  }

  @override
  void dispose() {
    _msgCtrl.dispose();
    _quoteCtrl.dispose();
    super.dispose();
  }

  Future<void> _load() async {
    final user = ref.read(currentUserProvider);
    if (user == null) return;
    try {
      final repo = ref.read(userRepositoryProvider);
      final businesses = await repo.getUserBusinesses(user.id);
      if (businesses.isEmpty) {
        if (mounted) setState(() { _loading = false; });
        return;
      }
      if (businesses.isNotEmpty) _selectedBizId = businesses.first['id'] as String;

      final categories = businesses.map((b) => b['category'] as String? ?? '').where((c) => c.isNotEmpty).toList();
      final leads = await ref.read(leadsRepositoryProvider).getLeads(categories);

      if (mounted) setState(() { _businesses = businesses; _leads = leads; _loading = false; });
    } catch (e) {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _sendQuote(String requestId) async {
    if (_msgCtrl.text.trim().isEmpty || _selectedBizId.isEmpty) return;
    setState(() => _sending = true);
    try {
      await ref.read(leadsRepositoryProvider).respondToLead(
        requestId: requestId,
        businessId: _selectedBizId,
        message: _msgCtrl.text.trim(),
        quoteAmount: _quoteCtrl.text.trim().isEmpty ? null : _quoteCtrl.text.trim(),
      );
      setState(() {
        _leads.removeWhere((l) => l['id'] == requestId);
        _respondingTo = null;
        _msgCtrl.clear(); _quoteCtrl.clear();
      });
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Failed: $e')));
    } finally {
      if (mounted) setState(() => _sending = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Smart Leads Inbox'),
        centerTitle: true,
        actions: [
          Container(
            margin: const EdgeInsets.only(right: 12, top: 8, bottom: 8),
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
            decoration: BoxDecoration(color: Colors.amber.withAlpha(40), borderRadius: BorderRadius.circular(20)),
            child: const Text('NEW', style: TextStyle(color: Colors.amber, fontWeight: FontWeight.bold, fontSize: 11)),
          ),
        ],
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _businesses.isEmpty
              ? _empty('No businesses found', 'List a business first to receive smart leads.')
              : _leads.isEmpty
                  ? _empty('No Active Leads', 'When customers in your area request services matching your category, they\'ll appear here.')
                  : ListView.builder(
                      padding: const EdgeInsets.all(16),
                      itemCount: _leads.length,
                      itemBuilder: (ctx, i) {
                        final lead = _leads[i];
                        final isResponding = _respondingTo == lead['id'];
                        return Container(
                          margin: const EdgeInsets.only(bottom: 14),
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            color: SpotifyColors.surface,
                            borderRadius: BorderRadius.circular(16),
                          ),
                          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                            Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
                              Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 3),
                                  decoration: BoxDecoration(color: SpotifyColors.green.withAlpha(30), borderRadius: BorderRadius.circular(8)),
                                  child: Text(lead['category'] ?? '', style: const TextStyle(color: SpotifyColors.green, fontWeight: FontWeight.bold, fontSize: 11)),
                                ),
                                const SizedBox(height: 4),
                                Text('${lead['user_name']} Needs Help', style: const TextStyle(fontWeight: FontWeight.bold, color: SpotifyColors.textPrimary, fontSize: 15)),
                                Text(
                                  lead['created_at'] != null ? DateTime.tryParse(lead['created_at'])?.toLocal().toString().split(' ').first ?? '' : '',
                                  style: const TextStyle(fontSize: 11, color: SpotifyColors.textSecondary),
                                ),
                              ]),
                              if (lead['budget'] != null)
                                Column(crossAxisAlignment: CrossAxisAlignment.end, children: [
                                  const Text('Est. Budget', style: TextStyle(fontSize: 10, color: SpotifyColors.textSecondary)),
                                  Text('KSh ${lead['budget']}', style: const TextStyle(fontWeight: FontWeight.bold, color: SpotifyColors.green, fontSize: 16)),
                                ]),
                            ]),
                            const SizedBox(height: 12),
                            Container(
                              padding: const EdgeInsets.all(12),
                              decoration: BoxDecoration(color: SpotifyColors.highlight, borderRadius: BorderRadius.circular(10)),
                              child: Text(lead['description'] ?? '', style: const TextStyle(color: SpotifyColors.textPrimary, fontSize: 13)),
                            ),
                            const SizedBox(height: 12),
                            if (isResponding) ...[
                              if (_businesses.length > 1)
                                DropdownButtonFormField<String>(
                                  value: _selectedBizId,
                                  dropdownColor: SpotifyColors.surface,
                                  decoration: const InputDecoration(labelText: 'Responding as:'),
                                  items: _businesses
                                      .where((b) => b['category'] == lead['category'])
                                      .map((b) => DropdownMenuItem<String>(value: b['id'] as String, child: Text(b['name'] as String? ?? '')))
                                      .toList(),
                                  onChanged: (v) => setState(() => _selectedBizId = v ?? _selectedBizId),
                                ),
                              const SizedBox(height: 8),
                              TextField(
                                controller: _msgCtrl,
                                maxLines: 3,
                                style: const TextStyle(color: SpotifyColors.textPrimary),
                                decoration: const InputDecoration(hintText: 'Tell them why they should choose you...'),
                              ),
                              const SizedBox(height: 8),
                              TextField(
                                controller: _quoteCtrl,
                                keyboardType: TextInputType.number,
                                style: const TextStyle(color: SpotifyColors.textPrimary),
                                decoration: const InputDecoration(hintText: 'Your quote (KSh) — optional', prefixText: 'KSh '),
                              ),
                              const SizedBox(height: 10),
                              Row(children: [
                                Expanded(child: OutlinedButton(
                                  onPressed: () => setState(() { _respondingTo = null; _msgCtrl.clear(); _quoteCtrl.clear(); }),
                                  child: const Text('Cancel'),
                                )),
                                const SizedBox(width: 8),
                                Expanded(flex: 2, child: ElevatedButton.icon(
                                  onPressed: _sending ? null : () => _sendQuote(lead['id']),
                                  icon: _sending
                                      ? const SizedBox(width: 14, height: 14, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.black))
                                      : const Icon(Icons.send, size: 16),
                                  label: Text(_sending ? 'Sending...' : 'Send Quote'),
                                )),
                              ]),
                            ] else
                              SizedBox(
                                width: double.infinity,
                                child: OutlinedButton(
                                  onPressed: () => setState(() => _respondingTo = lead['id']),
                                  child: const Text('Respond with Quote'),
                                ),
                              ),
                          ]),
                        );
                      },
                    ),
    );
  }

  Widget _empty(String title, String subtitle) => Center(
    child: Padding(
      padding: const EdgeInsets.all(32),
      child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
        const Icon(Icons.auto_awesome, size: 64, color: SpotifyColors.textTertiary),
        const SizedBox(height: 16),
        Text(title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18, color: SpotifyColors.textPrimary), textAlign: TextAlign.center),
        const SizedBox(height: 8),
        Text(subtitle, style: const TextStyle(color: SpotifyColors.textSecondary), textAlign: TextAlign.center),
      ]),
    ),
  );
}
