class UserProfile {
  final String id;
  final String email;
  final String? displayName;
  final String role;
  final String? phone;
  final String? location;
  final String? bio;
  final List<String> favorites;
  final String createdAt;
  final String? updatedAt;

  UserProfile({
    required this.id,
    required this.email,
    this.displayName,
    this.role = 'user',
    this.phone,
    this.location,
    this.bio,
    this.favorites = const [],
    required this.createdAt,
    this.updatedAt,
  });

  factory UserProfile.fromJson(Map<String, dynamic> json) {
    return UserProfile(
      id: json['id'] as String,
      email: json['email'] as String? ?? '',
      displayName: json['display_name'] as String?,
      role: json['role'] as String? ?? 'user',
      phone: json['phone'] as String?,
      location: json['location'] as String?,
      bio: json['bio'] as String?,
      favorites: (json['favorites'] as List<dynamic>?)
              ?.map((e) => e.toString())
              .toList() ??
          [],
      createdAt: json['created_at'] as String,
      updatedAt: json['updated_at'] as String?,
    );
  }

  /// Initials for avatar
  String get initials {
    if (displayName != null && displayName!.isNotEmpty) {
      return displayName![0].toUpperCase();
    }
    return email.isNotEmpty ? email[0].toUpperCase() : '?';
  }

  bool get isAdmin => role == 'admin';
}
