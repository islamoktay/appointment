import 'package:dio/dio.dart';

import '../../../core/error/dio_error_mapper.dart';
import 'provider_models.dart';

class ProviderRepository {
  ProviderRepository({required Dio dio}) : _dio = dio;
  final Dio _dio;

  Future<List<ProviderSummary>> listProviders({String? search}) =>
      guardApi(() async {
        final res = await _dio.get<List<dynamic>>(
          '/api/providers',
          queryParameters: {
            if (search != null && search.trim().isNotEmpty)
              'search': search.trim(),
          },
        );
        return res.data!
            .map((e) => ProviderSummary.fromJson(e as Map<String, dynamic>))
            .toList();
      });

  /// [date] must be `YYYY-MM-DD`.
  Future<AvailableSlots> slots(String providerId, String date) =>
      guardApi(() async {
        final res = await _dio.get<Map<String, dynamic>>(
          '/api/providers/$providerId/slots',
          queryParameters: {'date': date},
        );
        return AvailableSlots.fromJson(res.data!);
      });
}
