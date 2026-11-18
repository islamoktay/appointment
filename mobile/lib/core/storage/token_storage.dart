import 'package:flutter_secure_storage/flutter_secure_storage.dart';

/// Persists authentication JWTs exclusively in encrypted platform storage.
class TokenStorage {
  TokenStorage({FlutterSecureStorage? storage})
      : _storage = storage ?? const FlutterSecureStorage();

  static const String _accessTokenKey = 'appointment_access_token';
  final FlutterSecureStorage _storage;

  Future<String?> readToken() => _storage.read(key: _accessTokenKey);

  Future<void> saveToken(String token) =>
      _storage.write(key: _accessTokenKey, value: token);

  Future<void> clearToken() => _storage.delete(key: _accessTokenKey);
}
