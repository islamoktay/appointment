import 'package:dio/dio.dart';

import 'api_exception.dart';

/// Runs [call] and rethrows any [DioException] as a typed [ApiException].
Future<T> guardApi<T>(Future<T> Function() call) async {
  try {
    return await call();
  } on DioException catch (e) {
    final inner = e.error;
    if (inner is ApiException) throw inner;
    throw ApiException(
      statusCode: e.response?.statusCode ?? 0,
      error: e.type.name.toUpperCase(),
      message: 'Network request failed. Please try again.',
    );
  }
}
