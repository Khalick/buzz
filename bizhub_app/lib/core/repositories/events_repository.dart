import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/event.dart';
import '../services/supabase_service.dart';

class EventsRepository {
  final _client = SupabaseService.client;

  /// Fetch events with filter
  Future<List<Event>> getEvents({String filter = 'upcoming'}) async {
    final today = DateTime.now().toIso8601String().split('T')[0];

    dynamic query = _client.from('events').select();

    if (filter == 'upcoming') {
      query = query.gte('event_date', today).order('event_date', ascending: true);
    } else if (filter == 'past') {
      query = query.lt('event_date', today).order('event_date', ascending: false);
    } else {
      query = query.order('event_date', ascending: false);
    }

    final data = await query;
    return (data as List).map((e) => Event.fromJson(e)).toList();
  }
}

/// Provider
final eventsRepositoryProvider = Provider<EventsRepository>((ref) {
  return EventsRepository();
});
