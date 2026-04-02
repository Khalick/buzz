class Event {
  final String id;
  final String title;
  final String? description;
  final String? businessId;
  final String? businessName;
  final String? location;
  final String eventDate;
  final String? startTime;
  final String? endTime;
  final String? imageUrl;
  final int attendees;
  final bool isPaid;
  final double? price;
  final String createdAt;

  Event({
    required this.id,
    required this.title,
    this.description,
    this.businessId,
    this.businessName,
    this.location,
    required this.eventDate,
    this.startTime,
    this.endTime,
    this.imageUrl,
    this.attendees = 0,
    this.isPaid = false,
    this.price,
    required this.createdAt,
  });

  factory Event.fromJson(Map<String, dynamic> json) {
    return Event(
      id: json['id'] as String,
      title: json['title'] as String,
      description: json['description'] as String?,
      businessId: json['business_id'] as String?,
      businessName: json['business_name'] as String?,
      location: json['location'] as String?,
      eventDate: json['event_date'] as String,
      startTime: json['start_time'] as String?,
      endTime: json['end_time'] as String?,
      imageUrl: json['image_url'] as String?,
      attendees: (json['attendees'] as num?)?.toInt() ?? 0,
      isPaid: json['is_paid'] as bool? ?? false,
      price: (json['price'] as num?)?.toDouble(),
      createdAt: json['created_at'] as String,
    );
  }

  /// Parse the event date
  DateTime get date => DateTime.parse(eventDate);

  /// Day number
  int get day => date.day;

  /// Short month name
  String get monthShort {
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    return months[date.month - 1];
  }

  /// Whether this event is in the future
  bool get isUpcoming => date.isAfter(DateTime.now().subtract(const Duration(days: 1)));

  /// Formatted time range
  String get timeRange {
    if (startTime == null) return '';
    if (endTime == null) return startTime!;
    return '$startTime - $endTime';
  }
}
