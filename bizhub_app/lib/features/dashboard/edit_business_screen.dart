import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:image_picker/image_picker.dart';
import '../../core/services/supabase_service.dart';
import '../../core/repositories/business_repository.dart';
import '../../core/theme/app_theme.dart';

class EditBusinessScreen extends ConsumerStatefulWidget {
  final String businessId;
  const EditBusinessScreen({super.key, required this.businessId});

  @override
  ConsumerState<EditBusinessScreen> createState() => _EditBusinessScreenState();
}

class _EditBusinessScreenState extends ConsumerState<EditBusinessScreen> {
  final _client = SupabaseService.client;
  bool _loading = true;
  bool _saving = false;
  bool _saved = false;

  // Form controllers
  final _nameCtrl = TextEditingController();
  final _descCtrl = TextEditingController();
  final _whatsappCtrl = TextEditingController();
  final _addressCtrl = TextEditingController();
  final _websiteCtrl = TextEditingController();
  final _fbCtrl = TextEditingController();
  final _igCtrl = TextEditingController();
  final _twCtrl = TextEditingController();
  String _category = '';

  List<String> _existingImages = [];
  List<String> _newImageUrls = [];

  Map<String, Map<String, dynamic>> _hours = {
    'monday': {'open': '09:00', 'close': '17:00', 'closed': false},
    'tuesday': {'open': '09:00', 'close': '17:00', 'closed': false},
    'wednesday': {'open': '09:00', 'close': '17:00', 'closed': false},
    'thursday': {'open': '09:00', 'close': '17:00', 'closed': false},
    'friday': {'open': '09:00', 'close': '17:00', 'closed': false},
    'saturday': {'open': '09:00', 'close': '17:00', 'closed': false},
    'sunday': {'open': '09:00', 'close': '17:00', 'closed': true},
  };

  @override
  void initState() {
    super.initState();
    _fetchBusiness();
  }

  @override
  void dispose() {
    _nameCtrl.dispose(); _descCtrl.dispose(); _whatsappCtrl.dispose();
    _addressCtrl.dispose(); _websiteCtrl.dispose();
    _fbCtrl.dispose(); _igCtrl.dispose(); _twCtrl.dispose();
    super.dispose();
  }

  Future<void> _fetchBusiness() async {
    try {
      final data = await _client.from('businesses').select('*').eq('id', widget.businessId).single();
      setState(() {
        _nameCtrl.text = data['name'] ?? '';
        _descCtrl.text = data['description'] ?? '';
        _category = data['category'] ?? '';
        _whatsappCtrl.text = data['whatsapp'] ?? (data['contact']?['whatsapp'] ?? '');
        _addressCtrl.text = data['address'] ?? (data['location']?['address'] ?? '');
        _websiteCtrl.text = data['website'] ?? '';
        _fbCtrl.text = data['social_media']?['facebook'] ?? '';
        _igCtrl.text = data['social_media']?['instagram'] ?? '';
        _twCtrl.text = data['social_media']?['twitter'] ?? '';
        _existingImages = List<String>.from(data['images'] ?? []);
        if (data['business_hours'] != null) {
          final h = Map<String, dynamic>.from(data['business_hours']);
          for (final day in h.keys) {
            _hours[day] = Map<String, dynamic>.from(h[day]);
          }
        }
        _loading = false;
      });
    } catch (e) {
      if (mounted) { setState(() => _loading = false); context.pop(); }
    }
  }

  Future<void> _pickImages() async {
    final picker = ImagePicker();
    final files = await picker.pickMultiImage(imageQuality: 75);
    if (files.isEmpty) return;

    final total = _existingImages.length + _newImageUrls.length + files.length;
    if (total > 5) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Max 5 photos allowed')));
      return;
    }

    setState(() => _saving = true);
    try {
      for (final file in files) {
        final bytes = await file.readAsBytes();
        final ext = file.name.contains('.') ? '.${file.name.split('.').last}' : '.jpg';
        final path = '${DateTime.now().millisecondsSinceEpoch}$ext';
        await _client.storage.from('businesses').uploadBinary(path, bytes);
        final url = _client.storage.from('businesses').getPublicUrl(path);
        _newImageUrls.add(url);
      }
    } catch (_) {} finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  Future<void> _save() async {
    setState(() => _saving = true);
    try {
      final repo = ref.read(businessRepositoryProvider);
      await repo.updateBusiness(
        businessId: widget.businessId,
        data: {
          'name': _nameCtrl.text.trim(),
          'description': _descCtrl.text.trim(),
          'whatsapp': _whatsappCtrl.text.trim(),
          'address': _addressCtrl.text.trim(),
          'website': _websiteCtrl.text.trim().isEmpty ? null : _websiteCtrl.text.trim(),
          'social_media': {
            'facebook': _fbCtrl.text.trim().isEmpty ? null : _fbCtrl.text.trim(),
            'instagram': _igCtrl.text.trim().isEmpty ? null : _igCtrl.text.trim(),
            'twitter': _twCtrl.text.trim().isEmpty ? null : _twCtrl.text.trim(),
          },
          'business_hours': _hours,
          'images': [..._existingImages, ..._newImageUrls],
        },
      );
      setState(() { _saved = true; _newImageUrls = []; });
      Future.delayed(const Duration(seconds: 3), () { if (mounted) setState(() => _saved = false); });
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Failed to save: $e')));
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  Widget _buildSection(String title, IconData icon, Widget child) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: SpotifyColors.surface,
        borderRadius: BorderRadius.circular(16),
      ),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Row(children: [
          Icon(icon, color: SpotifyColors.green, size: 20),
          const SizedBox(width: 8),
          Text(title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: SpotifyColors.textPrimary)),
        ]),
        const SizedBox(height: 16),
        child,
      ]),
    );
  }

  Widget _buildInput(String label, TextEditingController ctrl, {int maxLines = 1, String? hint}) {
    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Text(label, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: SpotifyColors.textSecondary)),
      const SizedBox(height: 6),
      TextField(
        controller: ctrl,
        maxLines: maxLines,
        style: const TextStyle(color: SpotifyColors.textPrimary),
        decoration: InputDecoration(hintText: hint),
      ),
      const SizedBox(height: 12),
    ]);
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) return Scaffold(appBar: AppBar(title: const Text('Edit Business')), body: const Center(child: CircularProgressIndicator()));

    return Scaffold(
      appBar: AppBar(
        title: const Text('Edit Business'),
        centerTitle: true,
        actions: [
          if (_saved) const Padding(
            padding: EdgeInsets.only(right: 12),
            child: Icon(Icons.check_circle, color: SpotifyColors.green),
          ),
        ],
      ),
      body: ListView(padding: const EdgeInsets.all(16), children: [
        _buildSection('Basic Information', Icons.business, Column(children: [
          _buildInput('Business Name', _nameCtrl),
          _buildInput('Description', _descCtrl, maxLines: 4),
        ])),

        _buildSection('Contact & Location', Icons.phone, Column(children: [
          _buildInput('WhatsApp', _whatsappCtrl, hint: 'e.g. +254 712 345 678'),
          _buildInput('Address', _addressCtrl),
          _buildInput('Website', _websiteCtrl, hint: 'https://...'),
        ])),

        _buildSection('Social Media', Icons.share, Column(children: [
          _buildInput('Facebook URL', _fbCtrl),
          _buildInput('Instagram URL', _igCtrl),
          _buildInput('Twitter/X URL', _twCtrl),
        ])),

        _buildSection('Business Hours', Icons.access_time, Column(
          children: _hours.entries.map((entry) {
            final day = entry.key;
            final h = entry.value;
            final closed = h['closed'] as bool;
            return Padding(
              padding: const EdgeInsets.only(bottom: 10),
              child: Row(children: [
                SizedBox(width: 90, child: Text(day[0].toUpperCase() + day.substring(1),
                    style: const TextStyle(color: SpotifyColors.textSecondary, fontSize: 13))),
                if (!closed) ...[
                  Expanded(child: _timeButton(h['open'] as String, (t) => setState(() => _hours[day]!['open'] = t))),
                  const Padding(padding: EdgeInsets.symmetric(horizontal: 4), child: Text('–', style: TextStyle(color: SpotifyColors.textSecondary))),
                  Expanded(child: _timeButton(h['close'] as String, (t) => setState(() => _hours[day]!['close'] = t))),
                ] else
                  const Expanded(child: Text('Closed', style: TextStyle(color: SpotifyColors.error, fontSize: 13))),
                const SizedBox(width: 8),
                Switch(
                  value: closed,
                  onChanged: (v) => setState(() => _hours[day]!['closed'] = v),
                  activeColor: SpotifyColors.green,
                ),
              ]),
            );
          }).toList(),
        )),

        _buildSection('Photos (${_existingImages.length + _newImageUrls.length}/5)', Icons.photo_library, Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            if (_existingImages.isNotEmpty || _newImageUrls.isNotEmpty)
              SizedBox(
                height: 90,
                child: ListView(scrollDirection: Axis.horizontal, children: [
                  ..._existingImages.asMap().entries.map((e) => _imageThumb(e.value, onRemove: () => setState(() => _existingImages.removeAt(e.key)))),
                  ..._newImageUrls.asMap().entries.map((e) => _imageThumb(e.value, isNew: true, onRemove: () => setState(() => _newImageUrls.removeAt(e.key)))),
                ]),
              ),
            if (_existingImages.length + _newImageUrls.length < 5)
              Padding(
                padding: const EdgeInsets.only(top: 12),
                child: GestureDetector(
                  onTap: _pickImages,
                  child: Container(
                    height: 60,
                    decoration: BoxDecoration(
                      border: Border.all(color: SpotifyColors.green.withAlpha(100), width: 2),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: const Row(mainAxisAlignment: MainAxisAlignment.center, children: [
                      Icon(Icons.add_photo_alternate, color: SpotifyColors.green),
                      SizedBox(width: 8),
                      Text('Add Photos', style: TextStyle(color: SpotifyColors.green, fontWeight: FontWeight.bold)),
                    ]),
                  ),
                ),
              ),
          ],
        )),

        const SizedBox(height: 8),
        SizedBox(
          width: double.infinity,
          child: ElevatedButton.icon(
            onPressed: _saving ? null : _save,
            icon: _saving
                ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.black))
                : const Icon(Icons.save),
            label: Text(_saving ? 'Saving...' : 'Save Changes'),
            style: ElevatedButton.styleFrom(
              padding: const EdgeInsets.symmetric(vertical: 14),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
            ),
          ),
        ),
        const SizedBox(height: 32),
      ]),
    );
  }

  Widget _timeButton(String time, Function(String) onSelected) {
    return GestureDetector(
      onTap: () async {
        final parts = time.split(':');
        final picked = await showTimePicker(
          context: context,
          initialTime: TimeOfDay(hour: int.parse(parts[0]), minute: int.parse(parts[1])),
        );
        if (picked != null) {
          onSelected('${picked.hour.toString().padLeft(2, '0')}:${picked.minute.toString().padLeft(2, '0')}');
        }
      },
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 6),
        decoration: BoxDecoration(color: SpotifyColors.highlight, borderRadius: BorderRadius.circular(8)),
        child: Text(time, style: const TextStyle(color: SpotifyColors.textPrimary, fontSize: 13), textAlign: TextAlign.center),
      ),
    );
  }

  Widget _imageThumb(String url, {bool isNew = false, required VoidCallback onRemove}) {
    return Stack(clipBehavior: Clip.none, children: [
      Container(
        width: 80, height: 80,
        margin: const EdgeInsets.only(right: 8),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(10),
          border: isNew ? Border.all(color: SpotifyColors.green, width: 2) : null,
          image: DecorationImage(image: NetworkImage(url), fit: BoxFit.cover),
        ),
      ),
      Positioned(top: -6, right: 2,
        child: GestureDetector(
          onTap: onRemove,
          child: Container(
            padding: const EdgeInsets.all(2),
            decoration: const BoxDecoration(color: SpotifyColors.error, shape: BoxShape.circle),
            child: const Icon(Icons.close, size: 12, color: Colors.white),
          ),
        ),
      ),
    ]);
  }
}
