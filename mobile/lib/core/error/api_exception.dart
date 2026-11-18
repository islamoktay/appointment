import 'package:equatable/equatable.dart';

/// Unified client exception mirroring the locked backend Standard Error Envelope.
class ApiException extends Equatable implements Exception {
  const ApiException({
    required this.statusCode,
    required this.error,
    required this.message,
    this.path = '',
    this.fieldErrors = const {},
    this.timestamp,
  });

  factory ApiException.fromJson(
    Map<String, dynamic> json, {
    int? fallbackStatusCode,
  }) {
    final rawFieldErrors = json['fieldErrors'];
    final parsedFieldErrors = <String, String>{};
    if (rawFieldErrors is Map) {
      for (final entry in rawFieldErrors.entries) {
        parsedFieldErrors[entry.key.toString()] = entry.value.toString();
      }
    }

    return ApiException(
      statusCode: (json['status'] as num?)?.toInt() ?? fallbackStatusCode ?? 500,
      error: (json['error'] as String?) ?? 'UNKNOWN_ERROR',
      message: (json['message'] as String?) ?? 'An unexpected error occurred.',
      path: (json['path'] as String?) ?? '',
      fieldErrors: parsedFieldErrors,
      timestamp: json['timestamp'] as String?,
    );
  }

  final int statusCode;
  final String error;
  final String message;
  final String path;
  final Map<String, String> fieldErrors;
  final String? timestamp;

  bool get isUnauthorized => statusCode == 401;
  bool get isConflict => statusCode == 409;

  @override
  List<Object?> get props => [
        statusCode,
        error,
        message,
        path,
        fieldErrors,
        timestamp,
      ];

  @override
  String toString() => 'ApiException($statusCode, $error): $message';
}
