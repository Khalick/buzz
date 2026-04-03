import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../core/providers/auth_provider.dart';
import '../../core/services/supabase_service.dart';
import '../../core/services/location_service.dart';

class ProofOfVisitScreen extends ConsumerStatefulWidget {
  const ProofOfVisitScreen({super.key});

  @override
  ConsumerState<ProofOfVisitScreen> createState() => _ProofOfVisitScreenState();
}

class _ProofOfVisitScreenState extends ConsumerState<ProofOfVisitScreen> {
  final _businessNameController = TextEditingController();
  final _notesController = TextEditingController();
  bool _loading = false;
  bool _detectingLocation = false;
  double? _latitude;
  double? _longitude;

  @override
  void dispose() {
    _businessNameController.dispose();
    _notesController.dispose();
    super.dispose();
  }

  Future<void> _detectLocation() async {
    setState(() => _detectingLocation = true);
    try {
      final locService = ref.read(locationServiceProvider);
      final pos = await locService.getCurrentPosition();
      if (pos != null && mounted) {
        setState(() {
          _latitude = pos.latitude;
          _longitude = pos.longitude;
        });
      }
    } catch (_) {}
    if (mounted) setState(() => _detectingLocation = false);
  }

  Future<void> _submit() async {
    if (_businessNameController.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Business name is required')),
      );
      return;
    }
    if (_latitude == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please capture your GPS location first')),
      );
      return;
    }

    setState(() => _loading = true);

    try {
      final user = ref.read(currentUserProvider);
      if (user == null) throw Exception('Not signed in');

      await SupabaseService.client.from('proofs').insert({
        'submitted_by': user.id,
        'business_name': _businessNameController.text.trim(),
        'notes': _notesController.text.trim().isNotEmpty
            ? _notesController.text.trim()
            : null,
        'latitude': _latitude,
        'longitude': _longitude,
        'approved': false,
        'created_at': DateTime.now().toIso8601String(),
      });

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Proof submitted for review!')),
        );
        context.pop();
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed: $e')),
        );
      }
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Proof of Visit'),
        centerTitle: true,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: theme.colorScheme.primary.withAlpha(15),
                borderRadius: BorderRadius.circular(14),
              ),
              child: Row(
                children: [
                  Icon(Icons.verified, color: theme.colorScheme.primary),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Text(
                      'Visit a business and submit proof to help build trust in the community.',
                      style: TextStyle(color: Colors.grey.shade700, fontSize: 13),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),
            TextField(
              controller: _businessNameController,
              decoration: InputDecoration(
                labelText: 'Business Name *',
                prefixIcon: const Icon(Icons.storefront),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(14)),
              ),
            ),
            const SizedBox(height: 16),
            TextField(
              controller: _notesController,
              maxLines: 3,
              decoration: InputDecoration(
                labelText: 'Notes (optional)',
                hintText: 'What did you do or buy?',
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(14)),
              ),
            ),
            const SizedBox(height: 24),

            // GPS
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: _latitude != null ? Colors.green.shade50 : Colors.grey.shade50,
                borderRadius: BorderRadius.circular(14),
                border: Border.all(
                  color: _latitude != null ? Colors.green.shade300 : Colors.grey.shade300,
                ),
              ),
              child: Column(
                children: [
                  Icon(
                    _latitude != null ? Icons.check_circle : Icons.gps_fixed,
                    color: _latitude != null ? Colors.green : Colors.grey,
                    size: 32,
                  ),
                  const SizedBox(height: 8),
                  Text(
                    _latitude != null
                        ? 'GPS Captured: ${_latitude!.toStringAsFixed(4)}, ${_longitude!.toStringAsFixed(4)}'
                        : 'GPS location required as proof',
                    style: TextStyle(
                      fontWeight: FontWeight.w600,
                      color: _latitude != null ? Colors.green.shade700 : Colors.grey.shade600,
                    ),
                  ),
                  const SizedBox(height: 12),
                  OutlinedButton.icon(
                    onPressed: _detectingLocation ? null : _detectLocation,
                    icon: _detectingLocation
                        ? const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2))
                        : const Icon(Icons.my_location),
                    label: Text(_detectingLocation ? 'Detecting...' : 'Capture My Location'),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 32),
            SizedBox(
              width: double.infinity,
              height: 54,
              child: ElevatedButton(
                onPressed: _loading ? null : _submit,
                style: ElevatedButton.styleFrom(
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                ),
                child: _loading
                    ? const SizedBox(width: 22, height: 22, child: CircularProgressIndicator(strokeWidth: 2.5, color: Colors.white))
                    : const Text('Submit Proof', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700)),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
