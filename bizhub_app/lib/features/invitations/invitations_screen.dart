import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/repositories/invitations_repository.dart';
import '../../core/theme/app_theme.dart';

class InvitationsScreen extends ConsumerStatefulWidget {
  const InvitationsScreen({super.key});

  @override
  ConsumerState<InvitationsScreen> createState() => _InvitationsScreenState();
}

class _InvitationsScreenState extends ConsumerState<InvitationsScreen> {
  Map<String, dynamic>? _data;
  bool _loading = true;
  bool _showForm = false;

  final _emailCtrl = TextEditingController();
  final _msgCtrl = TextEditingController();
  final _bizCtrl = TextEditingController();
  String _type = 'user';
  bool _submitting = false;

  @override
  void initState() {
    super.initState();
    _load();
  }

  @override
  void dispose() {
    _emailCtrl.dispose(); _msgCtrl.dispose(); _bizCtrl.dispose();
    super.dispose();
  }

  Future<void> _load() async {
    try {
      final data = await ref.read(invitationsRepositoryProvider).getInvitations();
      if (mounted) setState(() { _data = data; _loading = false; });
    } catch (e) {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _send() async {
    if (_emailCtrl.text.trim().isEmpty) return;
    setState(() => _submitting = true);
    try {
      await ref.read(invitationsRepositoryProvider).sendInvitation(
        inviteeEmail: _emailCtrl.text.trim(),
        type: _type,
        message: _msgCtrl.text.trim().isEmpty ? null : _msgCtrl.text.trim(),
        businessName: _bizCtrl.text.trim().isEmpty ? null : _bizCtrl.text.trim(),
      );
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Invite sent to ${_emailCtrl.text.trim()}!')));
      setState(() { _showForm = false; _emailCtrl.clear(); _msgCtrl.clear(); _bizCtrl.clear(); _type = 'user'; });
      _load();
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Failed: $e')));
    } finally {
      if (mounted) setState(() => _submitting = false);
    }
  }

  void _copyLink(String id) {
    Clipboard.setData(ClipboardData(text: 'https://bizhub.vercel.app/invite/$id'));
    ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Invite link copied!')));
  }

  @override
  Widget build(BuildContext context) {
    final sent = (_data?['sentInvites'] as List?) ?? [];
    final received = (_data?['receivedInvites'] as List?) ?? [];
    final stats = (_data?['stats'] as Map?) ?? {};

    return Scaffold(
      appBar: AppBar(
        title: const Text('Invitations'),
        centerTitle: true,
        actions: [
          IconButton(icon: const Icon(Icons.add), onPressed: () => setState(() => _showForm = true)),
        ],
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : ListView(padding: const EdgeInsets.all(16), children: [
              // Stats
              Row(children: [
                Expanded(child: _statCard('Sent', '${stats['totalSent'] ?? 0}', Colors.blue)),
                const SizedBox(width: 10),
                Expanded(child: _statCard('Accepted', '${stats['accepted'] ?? 0}', SpotifyColors.green)),
                const SizedBox(width: 10),
                Expanded(child: _statCard('Pending', '${stats['pending'] ?? 0}', Colors.amber)),
              ]),
              const SizedBox(height: 24),

              // Send form
              if (_showForm)
                Container(
                  padding: const EdgeInsets.all(18),
                  margin: const EdgeInsets.only(bottom: 20),
                  decoration: BoxDecoration(color: SpotifyColors.surface, borderRadius: BorderRadius.circular(16)),
                  child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                    const Text('Send Invitation', style: TextStyle(fontWeight: FontWeight.bold, color: SpotifyColors.textPrimary, fontSize: 16)),
                    const SizedBox(height: 14),
                    TextField(controller: _emailCtrl, style: const TextStyle(color: SpotifyColors.textPrimary),
                      keyboardType: TextInputType.emailAddress,
                      decoration: const InputDecoration(labelText: 'Email Address', hintText: 'Enter email address')),
                    const SizedBox(height: 12),
                    DropdownButtonFormField<String>(
                      value: _type,
                      dropdownColor: SpotifyColors.surface,
                      style: const TextStyle(color: SpotifyColors.textPrimary),
                      decoration: const InputDecoration(labelText: 'Invite Type'),
                      items: const [
                        DropdownMenuItem(value: 'user', child: Text('Regular User')),
                        DropdownMenuItem(value: 'business', child: Text('Business Member')),
                      ],
                      onChanged: (v) => setState(() => _type = v ?? 'user'),
                    ),
                    if (_type == 'business') ...[
                      const SizedBox(height: 12),
                      TextField(controller: _bizCtrl, style: const TextStyle(color: SpotifyColors.textPrimary),
                        decoration: const InputDecoration(labelText: 'Business Name')),
                    ],
                    const SizedBox(height: 12),
                    TextField(controller: _msgCtrl, maxLines: 3, style: const TextStyle(color: SpotifyColors.textPrimary),
                      decoration: const InputDecoration(labelText: 'Personal Message (Optional)')),
                    const SizedBox(height: 14),
                    Row(children: [
                      Expanded(child: OutlinedButton(
                        onPressed: () => setState(() => _showForm = false),
                        child: const Text('Cancel'),
                      )),
                      const SizedBox(width: 10),
                      Expanded(flex: 2, child: ElevatedButton(
                        onPressed: _submitting ? null : _send,
                        child: _submitting
                            ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.black))
                            : const Text('Send Invite'),
                      )),
                    ]),
                  ]),
                ),

              // Sent invites
              const Text('Sent Invitations', style: TextStyle(fontWeight: FontWeight.bold, color: SpotifyColors.textPrimary, fontSize: 15)),
              const SizedBox(height: 10),
              if (sent.isEmpty)
                _emptyBox('No invitations sent yet.')
              else
                ...sent.map<Widget>((inv) => _inviteCard(inv, showCopyLink: true)),

              const SizedBox(height: 20),

              // Received invites
              const Text('Received Invitations', style: TextStyle(fontWeight: FontWeight.bold, color: SpotifyColors.textPrimary, fontSize: 15)),
              const SizedBox(height: 10),
              if (received.isEmpty)
                _emptyBox('No invitations received.')
              else
                ...received.map<Widget>((inv) => _inviteCard(inv)),

              const SizedBox(height: 32),
            ]),
    );
  }

  Widget _statCard(String label, String value, Color color) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(color: SpotifyColors.surface, borderRadius: BorderRadius.circular(12)),
      child: Column(children: [
        Text(value, style: TextStyle(fontSize: 26, fontWeight: FontWeight.w900, color: color)),
        Text(label, style: const TextStyle(fontSize: 11, color: SpotifyColors.textSecondary)),
      ]),
    );
  }

  Widget _emptyBox(String msg) => Container(
    padding: const EdgeInsets.all(16),
    margin: const EdgeInsets.only(bottom: 4),
    decoration: BoxDecoration(color: SpotifyColors.surface, borderRadius: BorderRadius.circular(12)),
    child: Center(child: Text(msg, style: const TextStyle(color: SpotifyColors.textSecondary, fontSize: 13))),
  );

  Widget _inviteCard(Map inv, {bool showCopyLink = false}) {
    final status = inv['status'] as String? ?? 'pending';
    final Color statusColor = status == 'accepted' ? SpotifyColors.green : status == 'pending' ? Colors.amber : SpotifyColors.error;
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(color: SpotifyColors.surface, borderRadius: BorderRadius.circular(14)),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
          Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text(inv['invitee_email'] as String? ?? inv['email'] as String? ?? '-',
              style: const TextStyle(fontWeight: FontWeight.bold, color: SpotifyColors.textPrimary)),
            Text('${inv['type'] ?? 'user'} invitation', style: const TextStyle(fontSize: 12, color: SpotifyColors.textSecondary)),
            if (inv['business_name'] != null)
              Text('Business: ${inv['business_name']}', style: const TextStyle(fontSize: 12, color: Colors.blue)),
          ])),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
            decoration: BoxDecoration(color: statusColor.withAlpha(30), borderRadius: BorderRadius.circular(20)),
            child: Text(status, style: TextStyle(color: statusColor, fontSize: 11, fontWeight: FontWeight.bold)),
          ),
        ]),
        if (inv['message'] != null) ...[
          const SizedBox(height: 6),
          Text('"${inv['message']}"', style: const TextStyle(fontSize: 12, color: SpotifyColors.textSecondary, fontStyle: FontStyle.italic)),
        ],
        const SizedBox(height: 6),
        Row(children: [
          if (inv['expires_at'] != null)
            Text('Expires: ${(inv['expires_at'] as String).split('T').first}',
              style: const TextStyle(fontSize: 10, color: SpotifyColors.textTertiary)),
          if (showCopyLink && status == 'pending') ...[
            const Spacer(),
            GestureDetector(
              onTap: () => _copyLink(inv['id'] as String),
              child: const Text('Copy link', style: TextStyle(color: Colors.blue, fontSize: 12, fontWeight: FontWeight.bold)),
            ),
          ],
        ]),
      ]),
    );
  }
}
