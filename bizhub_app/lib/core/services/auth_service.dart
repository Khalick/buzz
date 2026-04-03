import 'package:supabase_flutter/supabase_flutter.dart';
import 'supabase_service.dart';

class AuthService {
  final SupabaseClient _client = SupabaseService.client;

  AuthService() {
    _client.auth.onAuthStateChange.listen((data) {
      if (data.event == AuthChangeEvent.signedIn || data.event == AuthChangeEvent.initialSession) {
        if (currentUser != null) {
          ensureUserRecord();
        }
      }
    });
  }

  /// Current authenticated user (null if not signed in)
  User? get currentUser => _client.auth.currentUser;

  /// Stream of auth state changes
  Stream<AuthState> get authStateChanges => _client.auth.onAuthStateChange;

  /// Sign in with email and password
  Future<AuthResponse> signInWithEmail(String email, String password) async {
    return await _client.auth.signInWithPassword(
      email: email,
      password: password,
    );
  }

  /// Sign up with email and password
  Future<AuthResponse> signUpWithEmail(String email, String password) async {
    return await _client.auth.signUp(
      email: email,
      password: password,
    );
  }

  /// Sign in with Google OAuth
  Future<bool> signInWithGoogle() async {
    return await _client.auth.signInWithOAuth(
      OAuthProvider.google,
      redirectTo: const bool.fromEnvironment('dart.library.js_util') 
          ? null 
          : 'io.supabase.bizhub://login-callback/',
    );
  }

  /// Sign out
  Future<void> signOut() async {
    await _client.auth.signOut();
  }

  /// Ensure user record exists in users table (mirrors web logic)
  Future<void> ensureUserRecord() async {
    final user = currentUser;
    if (user == null) return;

    try {
      final existing = await _client
          .from('users')
          .select('id')
          .eq('id', user.id)
          .maybeSingle();

      if (existing == null) {
        await _client.from('users').insert({
          'id': user.id,
          'email': user.email ?? '',
          'display_name': user.userMetadata?['full_name'] ??
              user.email?.split('@').first ??
              '',
          'role': 'user',
          'created_at': DateTime.now().toIso8601String(),
        });
      }
    } catch (e) {
      // Silently handle - RLS may prevent insert, profile page will retry
    }
  }
}
