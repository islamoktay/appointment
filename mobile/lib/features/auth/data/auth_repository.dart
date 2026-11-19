import 'package:dio/dio.dart';

import '../../../core/error/dio_error_mapper.dart';
import '../../../core/storage/token_storage.dart';
import 'auth_models.dart';

class AuthRepository {
  AuthRepository({required Dio dio, required TokenStorage tokenStorage})
      : _dio = dio,
        _tokenStorage = tokenStorage;

  final Dio _dio;
  final TokenStorage _tokenStorage;

  Future<UserDto> login({required String email, required String password}) =>
      guardApi(() async {
        final res = await _dio.post<Map<String, dynamic>>(
          '/api/auth/login',
          data: {'email': email, 'password': password},
        );
        return _persist(AuthResponse.fromJson(res.data!));
      });

  Future<UserDto> register({
    required String email,
    required String password,
    required String fullName,
    required String role,
    String? timezone,
  }) =>
      guardApi(() async {
        final res = await _dio.post<Map<String, dynamic>>(
          '/api/auth/register',
          data: {
            'email': email,
            'password': password,
            'fullName': fullName,
            'role': role,
            if (timezone != null) 'timezone': timezone,
          },
        );
        return _persist(AuthResponse.fromJson(res.data!));
      });

  /// Silent auto-login: returns null when no stored token exists.
  Future<UserDto?> restoreSession() async {
    final token = await _tokenStorage.readToken();
    if (token == null || token.isEmpty) return null;
    return guardApi(() async {
      final res = await _dio.get<Map<String, dynamic>>('/api/auth/me');
      return UserDto.fromJson(res.data!);
    });
  }

  Future<void> logout() => _tokenStorage.clearToken();

  Future<UserDto> _persist(AuthResponse response) async {
    await _tokenStorage.saveToken(response.accessToken);
    return response.user;
  }
}
