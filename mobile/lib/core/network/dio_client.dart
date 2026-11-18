import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';

import '../error/api_exception.dart';
import '../storage/token_storage.dart';

/// Centralized Dio HTTP client with Bearer token injection and safe error mapping.
class DioClient {
  DioClient({
    required TokenStorage tokenStorage,
    String? baseUrl,
    VoidCallback? onUnauthorized,
  }) : _dio = Dio(
          BaseOptions(
            baseUrl: baseUrl ??
                const String.fromEnvironment(
                  'API_BASE_URL',
                  defaultValue: 'http://10.0.2.2:8080',
                ),
            connectTimeout: const Duration(seconds: 15),
            receiveTimeout: const Duration(seconds: 15),
            headers: const {'Accept': 'application/json'},
          ),
        ) {
    _dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          final token = await tokenStorage.readToken();
          if (token != null && token.isNotEmpty) {
            options.headers['Authorization'] = 'Bearer $token';
          }
          handler.next(options);
        },
        onError: (error, handler) async {
          final statusCode = error.response?.statusCode;
          if (statusCode == 401) {
            await tokenStorage.clearToken();
            onUnauthorized?.call();
          }

          final apiException = _mapToApiException(error);
          handler.next(
            DioException(
              requestOptions: error.requestOptions,
              response: error.response,
              type: error.type,
              error: apiException,
              message: apiException.message,
            ),
          );
        },
      ),
    );

    if (kDebugMode) {
      // Red Line 1: Never log Authorization headers (requestHeader MUST stay false)
      _dio.interceptors.add(
        LogInterceptor(
          request: true,
          requestHeader: false,
          requestBody: false,
          responseHeader: false,
          responseBody: false,
          error: true,
        ),
      );
    }
  }

  final Dio _dio;

  Dio get dio => _dio;

  ApiException _mapToApiException(DioException error) {
    final data = error.response?.data;
    final statusCode = error.response?.statusCode;
    if (data is Map<String, dynamic>) {
      return ApiException.fromJson(data, fallbackStatusCode: statusCode);
    }
    return ApiException(
      statusCode: statusCode ?? 0,
      error: error.type.name.toUpperCase(),
      message: error.message ?? 'Network request failed. Please try again.',
      path: error.requestOptions.path,
    );
  }
}
