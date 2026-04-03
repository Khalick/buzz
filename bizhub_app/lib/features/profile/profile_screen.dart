import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:image_picker/image_picker.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../../core/providers/auth_provider.dart';
import '../../core/repositories/user_repository.dart';
import '../../core/theme/app_theme.dart';

// Profile data provider
final profileProvider = FutureProvider((ref) async {
  final user = ref.watch(currentUserProvider);
  if (user == null) return null;
  final repo = ref.watch(userRepositoryProvider);
  return repo.getUserProfile(user.id);
});

// Activity providers
final userBusinessesProvider = FutureProvider((ref) async {
  final user = ref.watch(currentUserProvider);
  if (user == null) return [];
  final repo = ref.watch(userRepositoryProvider);
  return repo.getUserBusinesses(user.id);
});

final userProofsProvider = FutureProvider((ref) async {
  final user = ref.watch(currentUserProvider);
  if (user == null) return [];
  final repo = ref.watch(userRepositoryProvider);
  return repo.getUserProofs(user.id);
});

class ProfileScreen extends ConsumerStatefulWidget {
  const ProfileScreen({super.key});

  @override
  ConsumerState<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends ConsumerState<ProfileScreen> {
  bool _isEditing = false;
  final _nameController = TextEditingController();
  final _phoneController = TextEditingController();
  final _locationController = TextEditingController();
  final _bioController = TextEditingController();

  Future<void> _handleSignOut() async {
    final authService = ref.read(authServiceProvider);
    await authService.signOut();
    if (mounted) context.go('/login');
  }

  Future<void> _saveProfile(String userId) async {
    try {
      final repo = ref.read(userRepositoryProvider);
      await repo.updateProfile(
        userId: userId,
        displayName: _nameController.text.trim(),
        phone: _phoneController.text.trim(),
        location: _locationController.text.trim(),
        bio: _bioController.text.trim(),
      );
      ref.refresh(profileProvider);
      setState(() => _isEditing = false);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Profile updated successfully')),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error updating profile: $e')),
        );
      }
    }
  }

  @override
  void dispose() {
    _nameController.dispose();
    _phoneController.dispose();
    _locationController.dispose();
    _bioController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final profileAsync = ref.watch(profileProvider);
    final user = ref.watch(currentUserProvider);

    if (user == null) {
      return const Scaffold(body: Center(child: Text('Not signed in')));
    }

    return Scaffold(
      appBar: AppBar(
        title: const Text('Profile'),
        centerTitle: true,
        actions: [
          profileAsync.when(
            data: (profile) {
              if (profile == null) return const SizedBox.shrink();
              return _isEditing
                  ? TextButton(
                      onPressed: () => _saveProfile(profile.id),
                      child: const Text('Save'),
                    )
                  : IconButton(
                      icon: const Icon(Icons.edit),
                      onPressed: () {
                        _nameController.text = profile.displayName ?? '';
                        _phoneController.text = profile.phone ?? '';
                        _locationController.text = profile.location ?? '';
                        _bioController.text = profile.bio ?? '';
                        setState(() => _isEditing = true);
                      },
                    );
            },
            loading: () => const SizedBox.shrink(),
            error: (_, __) => const SizedBox.shrink(),
          ),
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: _handleSignOut,
          ),
        ],
      ),
      body: profileAsync.when(
        data: (profile) {
          if (profile == null) return const Center(child: Text('Profile not found'));

          return RefreshIndicator(
            onRefresh: () async {
              ref.refresh(profileProvider);
              ref.refresh(userBusinessesProvider);
              ref.refresh(userProofsProvider);
            },
            child: ListView(
              padding: const EdgeInsets.all(16),
              children: [
                // Avatar Header
                Center(
                  child: Column(
                    children: [
                      GestureDetector(
                        onTap: profile.id != user.id ? null : () async {
                          final ImagePicker picker = ImagePicker();
                          final XFile? image = await picker.pickImage(source: ImageSource.gallery);
                          if (image != null && context.mounted) {
                            ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Uploading photo...')));
                            final repo = ref.read(userRepositoryProvider);
                            final url = await repo.uploadAvatar(user.id, image);
                            if (url != null && context.mounted) {
                              ref.refresh(profileProvider);
                              ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Photo updated successfully!')));
                            } else if (context.mounted) {
                              ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Failed to upload photo')));
                            }
                          }
                        },
                        child: Container(
                          width: 100,
                          height: 100,
                        decoration: const BoxDecoration(
                          color: SpotifyColors.highlight,
                          shape: BoxShape.circle,
                        ),
                        child: profile.avatarUrl != null && profile.avatarUrl!.isNotEmpty
                            ? ClipOval(
                                child: CachedNetworkImage(
                                  imageUrl: profile.avatarUrl!,
                                  fit: BoxFit.cover,
                                  width: 100,
                                  height: 100,
                                  errorWidget: (_, __, ___) => Center(
                                    child: Text(
                                      profile.initials,
                                      style: const TextStyle(fontSize: 36, color: Colors.white, fontWeight: FontWeight.bold),
                                    ),
                                  ),
                                ),
                              )
                            : Center(
                                child: Text(
                                  profile.initials,
                                  style: const TextStyle(fontSize: 36, color: Colors.white, fontWeight: FontWeight.bold),
                                ),
                              ),
                      ),
                      ),
                      const SizedBox(height: 16),
                      if (!_isEditing) ...[
                        Text(
                          profile.displayName ?? 'No name',
                          style: theme.textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.bold),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          profile.email,
                          style: const TextStyle(color: SpotifyColors.textSecondary),
                        ),
                        if (profile.isAdmin)
                          Container(
                            margin: const EdgeInsets.only(top: 8),
                            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                            decoration: BoxDecoration(
                              color: theme.colorScheme.primary,
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: const Text('Admin', style: TextStyle(color: Colors.white, fontSize: 12)),
                          ),
                      ],
                    ],
                  ),
                ),
                const SizedBox(height: 32),

                // Form or Display info
                if (_isEditing) ...[
                  _buildTextField('Display Name', _nameController),
                  const SizedBox(height: 16),
                  _buildTextField('Phone', _phoneController),
                  const SizedBox(height: 16),
                  _buildTextField('Location', _locationController),
                  const SizedBox(height: 16),
                  _buildTextField('Bio', _bioController, maxLines: 3),
                ] else ...[
                  if (profile.bio != null && profile.bio!.isNotEmpty)
                    Padding(
                      padding: const EdgeInsets.only(bottom: 24),
                      child: Text(
                        profile.bio!,
                        style: const TextStyle(fontStyle: FontStyle.italic),
                        textAlign: TextAlign.center,
                      ),
                    ),
                  
                  // Info Cards
                  _buildInfoCard(Icons.phone, 'Phone', profile.phone ?? 'Not provided', theme),
                  const SizedBox(height: 12),
                  _buildInfoCard(Icons.location_on, 'Location', profile.location ?? 'Not provided', theme),
                  const SizedBox(height: 12),
                  _buildInfoCard(
                    Icons.calendar_today,
                    'Member Since',
                    DateTime.parse(profile.createdAt).year.toString(),
                    theme,
                  ),
                ],
                const SizedBox(height: 24),

                // Quick Actions
                if (!_isEditing) ...[
                  Wrap(
                    spacing: 10,
                    runSpacing: 10,
                    children: [
                      _buildQuickAction(Icons.dashboard, 'Dashboard', () => context.push('/dashboard'), theme),
                      _buildQuickAction(Icons.verified, 'Proof of Visit', () => context.push('/proof-of-visit'), theme),
                      _buildQuickAction(Icons.favorite, 'Favorites', () => context.push('/favorites'), theme),
                    ],
                  ),
                  const SizedBox(height: 24),
                ],

                // Activity Tabs (Businesses / Proofs)
                if (!_isEditing) ...[
                  Text(
                    'My Activity',
                    style: theme.textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 16),
                  _buildActivityList(ref, theme),
                ],
              ],
            ),
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text('Failed to load profile: $e')),
      ),
    );
  }

  Widget _buildTextField(String label, TextEditingController controller, {int maxLines = 1}) {
    return TextField(
      controller: controller,
      maxLines: maxLines,
      decoration: InputDecoration(
        labelText: label,
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
      ),
    );
  }

  Widget _buildInfoCard(IconData icon, String title, String value, ThemeData theme) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: SpotifyColors.surface,
        borderRadius: BorderRadius.circular(8),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: const BoxDecoration(
              color: SpotifyColors.highlight,
              shape: BoxShape.circle,
            ),
            child: Icon(icon, color: SpotifyColors.green, size: 20),
          ),
          const SizedBox(width: 16),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(title, style: const TextStyle(color: SpotifyColors.textSecondary, fontSize: 12)),
              Text(value, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 16, color: SpotifyColors.textPrimary)),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildActivityList(WidgetRef ref, ThemeData theme) {
    final businessesAsync = ref.watch(userBusinessesProvider);

    return businessesAsync.when(
      data: (businesses) {
        if (businesses.isEmpty) {
          return const Padding(
            padding: EdgeInsets.all(32.0),
            child: Center(
              child: Text(
                'No activity yet.\nSubmit a business or proof to see it here.',
                textAlign: TextAlign.center,
                style: TextStyle(color: SpotifyColors.textSecondary),
              ),
            ),
          );
        }

        return ListView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          itemCount: businesses.length,
          itemBuilder: (context, index) {
            final b = businesses[index];
            final approved = b['approved'] as bool;
            return Container(
              margin: const EdgeInsets.only(bottom: 8),
              child: ListTile(
                leading: const Icon(Icons.storefront, color: SpotifyColors.green),
                title: Text(b['name']),
                subtitle: Text(
                  approved ? 'Approved' : 'Pending Review',
                  style: TextStyle(
                    color: approved ? Colors.green : Colors.orange,
                    fontWeight: FontWeight.bold,
                    fontSize: 12,
                  ),
                ),
                trailing: const Icon(Icons.chevron_right),
                onTap: approved ? () => context.push('/business/${b['id']}') : null,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(8),
                ),
                tileColor: SpotifyColors.surface,
                contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              ),
            );
          },
        );
      },
      loading: () => const Center(child: CircularProgressIndicator()),
      error: (_, __) => const SizedBox.shrink(),
    );
  }

  Widget _buildQuickAction(IconData icon, String label, VoidCallback onTap, ThemeData theme) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        decoration: BoxDecoration(
          color: SpotifyColors.surface,
          borderRadius: BorderRadius.circular(500),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, color: SpotifyColors.green, size: 18),
            const SizedBox(width: 8),
            Text(
              label,
              style: const TextStyle(
                color: SpotifyColors.textPrimary,
                fontWeight: FontWeight.bold,
                fontSize: 13,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
