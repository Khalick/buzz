import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../core/providers/auth_provider.dart';
import '../../core/repositories/deals_repository.dart';
import '../../core/services/supabase_service.dart';

class ManageDealsScreen extends ConsumerStatefulWidget {
  const ManageDealsScreen({super.key});

  @override
  ConsumerState<ManageDealsScreen> createState() => _ManageDealsScreenState();
}

class _ManageDealsScreenState extends ConsumerState<ManageDealsScreen> {
  final _titleController = TextEditingController();
  final _descriptionController = TextEditingController();
  final _businessNameController = TextEditingController();
  DateTime? _expiryDate;
  bool _isFlashDeal = false;
  bool _loading = false;
  bool _showForm = false;

  @override
  void dispose() {
    _titleController.dispose();
    _descriptionController.dispose();
    _businessNameController.dispose();
    super.dispose();
  }

  Future<void> _pickDate() async {
    final picked = await showDatePicker(
      context: context,
      initialDate: DateTime.now().add(const Duration(days: 7)),
      firstDate: DateTime.now(),
      lastDate: DateTime.now().add(const Duration(days: 365)),
    );
    if (picked != null) setState(() => _expiryDate = picked);
  }

  Future<void> _createDeal() async {
    if (_titleController.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Deal title is required')),
      );
      return;
    }

    setState(() => _loading = true);

    try {
      await SupabaseService.client.from('deals').insert({
        'title': _titleController.text.trim(),
        'description': _descriptionController.text.trim().isNotEmpty
            ? _descriptionController.text.trim()
            : null,
        'business_name': _businessNameController.text.trim(),
        'is_flash_deal': _isFlashDeal,
        'expiry_date': _expiryDate?.toIso8601String().split('T')[0],
        'created_at': DateTime.now().toIso8601String(),
      });

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Deal created successfully!')),
        );
        setState(() {
          _showForm = false;
          _titleController.clear();
          _descriptionController.clear();
          _businessNameController.clear();
          _expiryDate = null;
          _isFlashDeal = false;
        });
        ref.refresh(activeDealsProvider);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to create deal: $e')),
        );
      }
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final dealsAsync = ref.watch(activeDealsProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Manage Deals'),
        centerTitle: true,
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // Create Deal Toggle
          if (!_showForm)
            SizedBox(
              width: double.infinity,
              child: ElevatedButton.icon(
                onPressed: () => setState(() => _showForm = true),
                icon: const Icon(Icons.add),
                label: const Text('Create New Deal'),
                style: ElevatedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                ),
              ),
            ),

          if (_showForm) ...[
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: Colors.grey.shade200),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('New Deal', style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold)),
                  const SizedBox(height: 16),
                  TextField(
                    controller: _titleController,
                    decoration: InputDecoration(
                      labelText: 'Deal Title *',
                      hintText: 'e.g. 50% off Lunch Menu',
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                  ),
                  const SizedBox(height: 12),
                  TextField(
                    controller: _descriptionController,
                    maxLines: 3,
                    decoration: InputDecoration(
                      labelText: 'Description',
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                  ),
                  const SizedBox(height: 12),
                  TextField(
                    controller: _businessNameController,
                    decoration: InputDecoration(
                      labelText: 'Business Name *',
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                  ),
                  const SizedBox(height: 12),
                  ListTile(
                    contentPadding: EdgeInsets.zero,
                    title: Text(
                      _expiryDate != null
                          ? 'Expires: ${_expiryDate!.toIso8601String().split('T')[0]}'
                          : 'Set Expiry Date',
                    ),
                    trailing: const Icon(Icons.calendar_today),
                    onTap: _pickDate,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                      side: BorderSide(color: Colors.grey.shade300),
                    ),
                  ),
                  const SizedBox(height: 8),
                  SwitchListTile(
                    title: const Text('Flash Deal (Live Pulse)'),
                    value: _isFlashDeal,
                    onChanged: (v) => setState(() => _isFlashDeal = v),
                    contentPadding: EdgeInsets.zero,
                  ),
                  const SizedBox(height: 16),
                  Row(
                    children: [
                      Expanded(
                        child: OutlinedButton(
                          onPressed: () => setState(() => _showForm = false),
                          child: const Text('Cancel'),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        flex: 2,
                        child: ElevatedButton(
                          onPressed: _loading ? null : _createDeal,
                          child: _loading
                              ? const SizedBox(
                                  width: 20, height: 20,
                                  child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                                )
                              : const Text('Create Deal'),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],

          const SizedBox(height: 24),
          Text('Active Deals', style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold)),
          const SizedBox(height: 12),

          dealsAsync.when(
            data: (deals) {
              if (deals.isEmpty) return const Center(child: Text('No active deals yet.'));
              return Column(
                children: deals.map((d) => Container(
                  margin: const EdgeInsets.only(bottom: 8),
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: Colors.grey.shade200),
                  ),
                  child: Row(
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(d.title, style: const TextStyle(fontWeight: FontWeight.bold)),
                            Text(d.businessName, style: TextStyle(color: Colors.grey.shade600, fontSize: 13)),
                          ],
                        ),
                      ),
                      if (d.isFlashDeal)
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                          decoration: BoxDecoration(
                            color: Colors.red.shade50,
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Text('FLASH', style: TextStyle(color: Colors.red.shade600, fontSize: 10, fontWeight: FontWeight.bold)),
                        ),
                    ],
                  ),
                )).toList(),
              );
            },
            loading: () => const Center(child: CircularProgressIndicator()),
            error: (e, _) => Text('Error: $e'),
          ),
        ],
      ),
    );
  }
}
