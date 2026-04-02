import 'package:supabase_flutter/supabase_flutter.dart';

class SupabaseService {
  static const String _supabaseUrl = 'https://efhdwksunwiawdbkihjy.supabase.co';
  static const String _supabaseAnonKey = 'sb_publishable_kWPMK3c2KiAMF_QfIYA5aQ_eteq1WGC';

  static Future<void> initialize() async {
    await Supabase.initialize(
      url: _supabaseUrl,
      anonKey: _supabaseAnonKey,
    );
  }

  static SupabaseClient get client => Supabase.instance.client;
}
