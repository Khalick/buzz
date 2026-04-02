class Business {
  final String id;
  final String name;
  final String? description;
  final String category;
  final String? whatsapp;
  final String? address;
  final String? website;
  final Map<String, dynamic>? coordinates;
  final Map<String, dynamic>? location;
  final Map<String, dynamic>? socialMedia;
  final Map<String, dynamic>? businessHours;
  final List<String> images;
  final int views;
  final double rating;
  final int reviewCount;
  final Map<String, dynamic>? contact;
  final bool approved;
  final bool isPremium;
  final String? ownerId;
  final String? submittedBy;
  final String createdAt;
  final String? updatedAt;

  Business({
    required this.id,
    required this.name,
    this.description,
    required this.category,
    this.whatsapp,
    this.address,
    this.website,
    this.coordinates,
    this.location,
    this.socialMedia,
    this.businessHours,
    this.images = const [],
    this.views = 0,
    this.rating = 0.0,
    this.reviewCount = 0,
    this.contact,
    this.approved = false,
    this.isPremium = false,
    this.ownerId,
    this.submittedBy,
    required this.createdAt,
    this.updatedAt,
  });

  factory Business.fromJson(Map<String, dynamic> json) {
    return Business(
      id: json['id'] as String,
      name: json['name'] as String,
      description: json['description'] as String?,
      category: json['category'] as String? ?? 'General',
      whatsapp: json['whatsapp'] as String?,
      address: json['address'] as String?,
      website: json['website'] as String?,
      coordinates: json['coordinates'] as Map<String, dynamic>?,
      location: json['location'] as Map<String, dynamic>?,
      socialMedia: json['social_media'] as Map<String, dynamic>?,
      businessHours: json['business_hours'] as Map<String, dynamic>?,
      images: (json['images'] as List<dynamic>?)
              ?.map((e) => e.toString())
              .toList() ??
          [],
      views: (json['views'] as num?)?.toInt() ?? 0,
      rating: (json['rating'] as num?)?.toDouble() ?? 0.0,
      reviewCount: (json['review_count'] as num?)?.toInt() ?? 0,
      contact: json['contact'] as Map<String, dynamic>?,
      approved: json['approved'] as bool? ?? false,
      isPremium: json['is_premium'] as bool? ?? false,
      ownerId: json['owner_id'] as String?,
      submittedBy: json['submitted_by'] as String?,
      createdAt: json['created_at'] as String,
      updatedAt: json['updated_at'] as String?,
    );
  }

  /// Phone from contact map
  String? get phone => contact?['phone'] as String?;

  /// Email from contact map
  String? get email => contact?['email'] as String?;

  /// WhatsApp from contact map or top-level
  String? get whatsappNumber =>
      contact?['whatsapp'] as String? ?? whatsapp;

  /// Town name from location
  String? get town => location?['town'] as String?;

  /// County from location
  String? get county => location?['county'] as String?;

  /// Latitude
  double? get latitude =>
      (coordinates?['latitude'] as num?)?.toDouble();

  /// Longitude
  double? get longitude =>
      (coordinates?['longitude'] as num?)?.toDouble();

  /// Check if currently open based on business hours
  bool get isOpen {
    if (businessHours == null) return false;
    final now = DateTime.now();
    final days = [
      'sunday',
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday'
    ];
    final today = days[now.weekday % 7];
    final todayHours = businessHours?[today];
    if (todayHours == null) return false;
    if (todayHours['closed'] == true) return false;

    final openStr = todayHours['open'] as String?;
    final closeStr = todayHours['close'] as String?;
    if (openStr == null || closeStr == null) return false;

    try {
      final openParts = openStr.split(':');
      final closeParts = closeStr.split(':');
      final openMinutes =
          int.parse(openParts[0]) * 60 + int.parse(openParts[1]);
      final closeMinutes =
          int.parse(closeParts[0]) * 60 + int.parse(closeParts[1]);
      final nowMinutes = now.hour * 60 + now.minute;
      return nowMinutes >= openMinutes && nowMinutes <= closeMinutes;
    } catch (_) {
      return false;
    }
  }
}
