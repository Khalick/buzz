import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../core/providers/auth_provider.dart';
import '../../core/theme/app_theme.dart';
import '../../core/services/supabase_service.dart';

class VerificationScreen extends ConsumerStatefulWidget {
  const VerificationScreen({super.key});

  @override
  ConsumerState<VerificationScreen> createState() => _VerificationScreenState();
}

class _VerificationScreenState extends ConsumerState<VerificationScreen> {
  bool _isLoading = false;
  String? _status;
  String? _rejectionReason;

  @override
  void initState() {
    super.initState();
    _fetchStatus();
  }

  Future<void> _fetchStatus() async {
    final user = ref.read(currentUserProvider);
    if (user == null) return;

    try {
      final response = await SupabaseService.client
          .from('verification_requests')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', ascending: false)
          .limit(1)
          .maybeSingle();

      if (response != null && mounted) {
        setState(() {
          _status = response['status'] as String?;
          _rejectionReason = response['rejection_reason'] as String?;
        });
      }
    } catch (e) {
      debugPrint('Error fetching verification status: $e');
    }
  }

  Future<void> _submitRequest() async {
    final user = ref.read(currentUserProvider);
    if (user == null) return;

    setState(() => _isLoading = true);
    try {
      // In a real app we would pick a file and upload it to Supabase Storage.
      // Here we just simulate inserting the request securely.
      await SupabaseService.client.from('verification_requests').insert({
        'user_id': user.id,
        'business_id': null, // Need business selection in real UI
        'document_url': 'simulated_document_upload.pdf',
        'document_type': 'business_license',
        'status': 'pending',
      });
      
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Verification request submitted successfully!')),
        );
        _fetchStatus();
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error: $e')),
        );
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Get Verified')),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const Icon(Icons.verified, size: 80, color: Colors.blue),
            const SizedBox(height: 16),
            const Text(
              'Get a Blue Checkmark',
              textAlign: TextAlign.center,
              style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),
            const Text(
              'Verify your business to build trust with customers and stand out in search results.',
              textAlign: TextAlign.center,
              style: TextStyle(color: Colors.grey),
            ),
            const SizedBox(height: 32),
            
            if (_status == null || _status == 'rejected') ...[
              if (_status == 'rejected')
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: Colors.red.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('Validation Failed', style: TextStyle(color: Colors.red, fontWeight: FontWeight.bold)),
                      if (_rejectionReason != null)
                        Text('Reason: $_rejectionReason', style: const TextStyle(color: Colors.red)),
                    ],
                  ),
                ),
              const SizedBox(height: 16),
              ElevatedButton.icon(
                onPressed: _isLoading ? null : _submitRequest,
                 style: ElevatedButton.styleFrom(
                  backgroundColor: SpotifyColors.green,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                ),
                icon: _isLoading ? const CircularProgressIndicator(color: Colors.white) : const Icon(Icons.upload_file),
                label: Text(_isLoading ? 'Submitting...' : 'Upload Business License'),
              ),
            ] else if (_status == 'pending') ...[
               Container(
                  padding: const EdgeInsets.all(24),
                  decoration: BoxDecoration(
                    color: Colors.orange.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: const Column(
                    children: [
                      Icon(Icons.access_time, size: 48, color: Colors.orange),
                      SizedBox(height: 16),
                      Text('Review in Progress', style: TextStyle(color: Colors.orange, fontWeight: FontWeight.bold, fontSize: 18)),
                      SizedBox(height: 8),
                      Text('Your documents are being reviewed by our team.', textAlign: TextAlign.center),
                    ],
                  ),
                ),
            ] else if (_status == 'approved') ...[
               Container(
                  padding: const EdgeInsets.all(24),
                  decoration: BoxDecoration(
                    color: Colors.blue.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: const Column(
                    children: [
                      Icon(Icons.verified, size: 48, color: Colors.blue),
                      SizedBox(height: 16),
                      Text('Business Verified!', style: TextStyle(color: Colors.blue, fontWeight: FontWeight.bold, fontSize: 18)),
                      SizedBox(height: 8),
                      Text('You have successfully received the blue checkmark.', textAlign: TextAlign.center),
                    ],
                  ),
                ),
            ],
            
            const Spacer(),
            TextButton(
              onPressed: () => context.pop(),
              child: const Text('Back to Dashboard', style: TextStyle(color: Colors.grey)),
            ),
          ],
        ),
      ),
    );
  }
}
