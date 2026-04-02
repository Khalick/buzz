class AppNotification {
  final String id;
  final String userId;
  final String title;
  final String? message;
  final bool read;
  final String? type;
  final String createdAt;

  AppNotification({
    required this.id,
    required this.userId,
    required this.title,
    this.message,
    this.read = false,
    this.type,
    required this.createdAt,
  });

  factory AppNotification.fromJson(Map<String, dynamic> json) {
    return AppNotification(
      id: json['id'] as String,
      userId: json['user_id'] as String,
      title: json['title'] as String,
      message: json['message'] as String?,
      read: json['read'] as bool? ?? false,
      type: json['type'] as String?,
      createdAt: json['created_at'] as String,
    );
  }
}
