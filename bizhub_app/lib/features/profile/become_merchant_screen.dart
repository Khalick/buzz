import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../core/providers/auth_provider.dart';
import '../../core/services/supabase_service.dart';
import '../../core/theme/app_theme.dart';

class BecomeMerchantScreen extends ConsumerStatefulWidget {
  const BecomeMerchantScreen({super.key});

  @override
  ConsumerState<BecomeMerchantScreen> createState() => _BecomeMerchantScreenState();
}

class _BecomeMerchantScreenState extends ConsumerState<BecomeMerchantScreen> {
  final _formKey = GlobalKey<FormState>();
  final _businessNameController = TextEditingController();
  final _categoryController = TextEditingController();
  final _phoneController = TextEditingController();
  bool _isSubmitting = false;

  Future<void> _submitRequest() async {
    if (!_formKey.currentState!.validate()) return;

    final user = ref.read(currentUserProvider);
    if (user == null) return;

    setState(() => _isSubmitting = true);

    try {
      await SupabaseService.client.from('merchant_requests').insert({
        'user_id': user.id,
        'business_name': _businessNameController.text.trim(),
        'category': _categoryController.text.trim(),
        'contact_phone': _phoneController.text.trim(),
      });

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Request submitted successfully!'),
            backgroundColor: Colors.green,
          ),
        );
        context.pop();
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isSubmitting = false);
      }
    }
  }

  @override
  void dispose() {
    _businessNameController.dispose();
    _categoryController.dispose();
    _phoneController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Become a Merchant'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const Icon(Icons.store, size: 64, color: SpotifyColors.green),
              const SizedBox(height: 16),
              const Text(
                'Grow your business on ThikaBizHub by upgrading to a merchant account.',
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 16,
                  color: SpotifyColors.textSecondary,
                ),
              ),
              const SizedBox(height: 32),
              
              TextFormField(
                controller: _businessNameController,
                decoration: const InputDecoration(
                  labelText: 'Business Name',
                  border: OutlineInputBorder(),
                  prefixIcon: Icon(Icons.business),
                ),
                validator: (val) => val == null || val.isEmpty ? 'Required field' : null,
              ),
              const SizedBox(height: 16),
              
              TextFormField(
                controller: _categoryController,
                decoration: const InputDecoration(
                  labelText: 'Category (e.g. Fashion, Electronics)',
                  border: OutlineInputBorder(),
                  prefixIcon: Icon(Icons.category),
                ),
                validator: (val) => val == null || val.isEmpty ? 'Required field' : null,
              ),
              const SizedBox(height: 16),
              
              TextFormField(
                controller: _phoneController,
                keyboardType: TextInputType.phone,
                decoration: const InputDecoration(
                  labelText: 'Contact Phone',
                  border: OutlineInputBorder(),
                  prefixIcon: Icon(Icons.phone),
                ),
                validator: (val) => val == null || val.isEmpty ? 'Required field' : null,
              ),
              const SizedBox(height: 32),
              
              ElevatedButton(
                onPressed: _isSubmitting ? null : _submitRequest,
                style: ElevatedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  backgroundColor: SpotifyColors.green,
                  foregroundColor: Colors.white,
                ),
                child: _isSubmitting
                    ? const SizedBox(
                        height: 20,
                        width: 20,
                        child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                      )
                    : const Text('Submit Request', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
