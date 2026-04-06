import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../core/providers/auth_provider.dart';
import '../../core/repositories/partnerships_repository.dart';
import '../../core/repositories/user_repository.dart';
import '../../core/theme/app_theme.dart';

class PartnershipsScreen extends ConsumerStatefulWidget {
  const PartnershipsScreen({super.key});

  @override
  ConsumerState<PartnershipsScreen> createState() => _PartnershipsScreenState();
}

class _PartnershipsScreenState extends ConsumerState<PartnershipsScreen> {
  List<Map<String, dynamic>> _partnerships = [];
  List<Map<String, dynamic>> _recommendations = [];
  List<Map<String, dynamic>> _businesses = [];
  String _selectedBizId = '';
  bool _loading = true;
  String? _updating;

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
      final pRepo = ref.read(partnershipsRepositoryProvider);
      final businesses = await userRepo.getUserBusinesses(user.id);
      if (businesses.isEmpty) { if (mounted) setState(() => _loading = false); return; }

      final activeId = businesses.first['id'] as String;
      _selectedBizId = activeId;
      _businesses = businesses;

      final partnerships = await pRepo.getPartnerships(activeId);
      final partnerIds = partnerships.map((p) => (p['partner'] as Map?)?['id'] as String? ?? '').where((id) => id.isNotEmpty).toList();
      final excludeCategory = businesses.first['category'] as String? ?? '';

      final recs = await pRepo.getRecommendations(
        businessId: activeId,
        ownerId: user.id,
        excludeCategory: excludeCategory,
        excludeIds: partnerIds,
      );

      if (mounted) setState(() { _partnerships = partnerships; _recommendations = recs; _loading = false; });
    } catch (e) {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _request(String partnerId) async {
    setState(() => _updating = partnerId);
    try {
      final data = await ref.read(partnershipsRepositoryProvider).requestPartnership(
        businessAId: _selectedBizId,
        businessBId: partnerId,
      );
      final partner = _recommendations.firstWhere((r) => r['id'] == partnerId, orElse: () => {});
      setState(() {
        _partnerships.insert(0, {...data, 'partner': partner, 'direction': 'sent'});
        _recommendations.removeWhere((r) => r['id'] == partnerId);
      });
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Failed: $e')));
    } finally {
      if (mounted) setState(() => _updating = null);
    }
  }

  Future<void> _updateStatus(String id, String status) async {
    setState(() => _updating = id);
    try {
      await ref.read(partnershipsRepositoryProvider).updateStatus(partnershipId: id, status: status);
      setState(() {
        _partnerships = _partnerships.map((p) => p['id'] == id ? {...p, 'status': status} : p).toList();
      });
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Failed: $e')));
    } finally {
      if (mounted) setState(() => _updating = null);
    }
  }

  @override
  Widget build(BuildContext context) {
    final pending = _partnerships.where((p) => p['status'] == 'pending').toList();
    final active = _partnerships.where((p) => p['status'] == 'active').toList();

    return Scaffold(
      appBar: AppBar(title: const Text('Local Partnerships'), centerTitle: true,
        actions: [
          Container(
            margin: const EdgeInsets.only(right: 12, top: 8, bottom: 8),
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
            decoration: BoxDecoration(color: Colors.amber.withAlpha(40), borderRadius: BorderRadius.circular(20)),
            child: const Text('B2B NETWORK', style: TextStyle(color: Colors.amber, fontWeight: FontWeight.bold, fontSize: 10)),
          ),
        ],
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _businesses.isEmpty
              ? Center(child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
                  const Icon(Icons.handshake_outlined, size: 64, color: SpotifyColors.textTertiary),
                  const SizedBox(height: 16),
                  const Text('No Businesses Found', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18, color: SpotifyColors.textPrimary)),
                  const SizedBox(height: 8),
                  const Text('List your business to start networking.', style: TextStyle(color: SpotifyColors.textSecondary)),
                ]))
              : ListView(padding: const EdgeInsets.all(16), children: [
                  // Suggestions
                  const Text('Suggested Partners', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15, color: SpotifyColors.textPrimary)),
                  const SizedBox(height: 10),
                  if (_recommendations.isEmpty)
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(color: SpotifyColors.surface, borderRadius: BorderRadius.circular(12)),
                      child: const Text('No new recommendations right now. We\'ll suggest businesses as they join.', style: TextStyle(color: SpotifyColors.textSecondary, fontSize: 13)),
                    )
                  else
                    ..._recommendations.map((r) => Container(
                      margin: const EdgeInsets.only(bottom: 10),
                      padding: const EdgeInsets.all(14),
                      decoration: BoxDecoration(color: SpotifyColors.surface, borderRadius: BorderRadius.circular(14)),
                      child: Row(children: [
                        Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                            decoration: BoxDecoration(color: SpotifyColors.green.withAlpha(30), borderRadius: BorderRadius.circular(6)),
                            child: Text(r['category'] ?? '', style: const TextStyle(color: SpotifyColors.green, fontSize: 10, fontWeight: FontWeight.bold)),
                          ),
                          const SizedBox(height: 4),
                          Text(r['name'] ?? '', style: const TextStyle(fontWeight: FontWeight.bold, color: SpotifyColors.textPrimary)),
                          Text(
                            (r['location'] is Map && r['location']['town'] != null) ? 'Based in ${r['location']['town']}' : 'Local Business',
                            style: const TextStyle(fontSize: 12, color: SpotifyColors.textSecondary),
                          ),
                        ])),
                        ElevatedButton.icon(
                          onPressed: _updating == r['id'] ? null : () => _request(r['id']),
                          icon: const Icon(Icons.handshake_outlined, size: 16),
                          label: Text(_updating == r['id'] ? '...' : 'Connect'),
                          style: ElevatedButton.styleFrom(padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8)),
                        ),
                      ]),
                    )),

                  const SizedBox(height: 20),

                  // Pending
                  const Text('Pending Requests', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15, color: SpotifyColors.textPrimary)),
                  const SizedBox(height: 10),
                  if (pending.isEmpty)
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(color: SpotifyColors.surface, borderRadius: BorderRadius.circular(12)),
                      child: const Text('No pending requests.', style: TextStyle(color: SpotifyColors.textSecondary, fontSize: 13)),
                    )
                  else
                    ...pending.map((p) {
                      final partner = p['partner'] as Map?;
                      final direction = p['direction'] as String?;
                      return Container(
                        margin: const EdgeInsets.only(bottom: 10),
                        padding: const EdgeInsets.all(14),
                        decoration: BoxDecoration(color: SpotifyColors.surface, borderRadius: BorderRadius.circular(14)),
                        child: Row(children: [
                          Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                            Row(children: [
                              Text(partner?['category'] ?? '', style: const TextStyle(fontSize: 11, color: SpotifyColors.textSecondary)),
                              const SizedBox(width: 8),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                decoration: BoxDecoration(
                                  color: direction == 'sent' ? SpotifyColors.highlight : Colors.blue.withAlpha(40),
                                  borderRadius: BorderRadius.circular(4),
                                ),
                                child: Text(direction == 'sent' ? 'SENT' : 'NEW', style: TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: direction == 'sent' ? SpotifyColors.textSecondary : Colors.blue)),
                              ),
                            ]),
                            const SizedBox(height: 4),
                            Text(partner?['name'] ?? '', style: const TextStyle(fontWeight: FontWeight.bold, color: SpotifyColors.textPrimary)),
                          ])),
                          if (direction == 'received') Row(children: [
                            IconButton(
                              icon: const Icon(Icons.check_circle, color: SpotifyColors.green),
                              onPressed: _updating == p['id'] ? null : () => _updateStatus(p['id'], 'active'),
                            ),
                            IconButton(
                              icon: const Icon(Icons.cancel, color: SpotifyColors.error),
                              onPressed: _updating == p['id'] ? null : () => _updateStatus(p['id'], 'declined'),
                            ),
                          ]) else
                            const Text('Awaiting reply...', style: TextStyle(fontSize: 12, color: SpotifyColors.textSecondary)),
                        ]),
                      );
                    }),

                  const SizedBox(height: 20),

                  // Active
                  const Text('Active Partners', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15, color: SpotifyColors.textPrimary)),
                  const SizedBox(height: 10),
                  if (active.isEmpty)
                    Container(
                      padding: const EdgeInsets.all(20),
                      decoration: BoxDecoration(color: SpotifyColors.green.withAlpha(15), borderRadius: BorderRadius.circular(14), border: Border.all(color: SpotifyColors.green.withAlpha(40))),
                      child: const Column(children: [
                        Icon(Icons.handshake_outlined, size: 40, color: SpotifyColors.textTertiary),
                        SizedBox(height: 10),
                        Text('No active partners yet', style: const TextStyle(fontWeight: FontWeight.bold, color: SpotifyColors.textPrimary)),
                        SizedBox(height: 4),
                        Text('Send connection requests to build your network.', style: TextStyle(fontSize: 12, color: SpotifyColors.textSecondary), textAlign: TextAlign.center),
                      ]),
                    )
                  else
                    GridView.count(
                      crossAxisCount: 2,
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      crossAxisSpacing: 10,
                      mainAxisSpacing: 10,
                      childAspectRatio: 1.6,
                      children: active.map((p) {
                        final partner = p['partner'] as Map?;
                        return GestureDetector(
                          onTap: () => context.push('/business/${partner?['id']}'),
                          child: Container(
                            padding: const EdgeInsets.all(12),
                            decoration: BoxDecoration(
                              color: SpotifyColors.surface,
                              borderRadius: BorderRadius.circular(12),
                              border: Border(left: BorderSide(color: SpotifyColors.green, width: 3)),
                            ),
                            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                              Text(partner?['category'] ?? '', style: const TextStyle(fontSize: 9, color: SpotifyColors.green, fontWeight: FontWeight.bold)),
                              const SizedBox(height: 4),
                              Text(partner?['name'] ?? '', style: const TextStyle(fontWeight: FontWeight.bold, color: SpotifyColors.textPrimary, fontSize: 13)),
                              const Spacer(),
                              const Text('View Profile →', style: TextStyle(color: SpotifyColors.green, fontSize: 11, fontWeight: FontWeight.bold)),
                            ]),
                          ),
                        );
                      }).toList(),
                    ),

                  const SizedBox(height: 32),
                ]),
    );
  }
}
