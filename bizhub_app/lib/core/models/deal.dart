class Deal {
  final String id;
  final String title;
  final String? description;
  final String businessName;
  final String? businessId;
  final String? expiryDate;
  final bool isFlashDeal;
  final String createdAt;

  Deal({
    required this.id,
    required this.title,
    this.description,
    required this.businessName,
    this.businessId,
    this.expiryDate,
    this.isFlashDeal = false,
    required this.createdAt,
  });

  factory Deal.fromJson(Map<String, dynamic> json) {
    return Deal(
      id: json['id'] as String,
      title: json['title'] as String,
      description: json['description'] as String?,
      businessName: json['business_name'] as String? ?? 'Unknown Business',
      businessId: json['business_id'] as String?,
      expiryDate: json['expiry_date'] as String?,
      isFlashDeal: json['is_flash_deal'] as bool? ?? false,
      createdAt: json['created_at'] as String,
    );
  }

  /// Whether this deal has expired
  bool get isExpired {
    if (expiryDate == null) return false;
    return DateTime.parse(expiryDate!).isBefore(DateTime.now());
  }

  /// Number of days remaining
  int? get daysRemaining {
    if (expiryDate == null) return null;
    final expiry = DateTime.parse(expiryDate!);
    final diff = expiry.difference(DateTime.now()).inDays;
    return diff < 0 ? 0 : diff;
  }

  /// Whether the deal is urgent (3 or fewer days left)
  bool get isUrgent {
    final days = daysRemaining;
    return days != null && days <= 3;
  }
}
