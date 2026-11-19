import 'package:dio/dio.dart';

import '../../../core/error/dio_error_mapper.dart';
import 'appointment_models.dart';

class AppointmentRepository {
  AppointmentRepository({required Dio dio}) : _dio = dio;
  final Dio _dio;

  Future<Appointment> book({
    required String providerId,
    required String date,
    required String startTime,
  }) =>
      guardApi(() async {
        final res = await _dio.post<Map<String, dynamic>>(
          '/api/appointments',
          data: {
            'providerId': providerId,
            'appointmentDate': date,
            'startTime': startTime,
          },
        );
        return Appointment.fromJson(res.data!);
      });

  Future<List<Appointment>> mine() => guardApi(() async {
        final res = await _dio.get<List<dynamic>>('/api/appointments/me');
        return res.data!
            .map((e) => Appointment.fromJson(e as Map<String, dynamic>))
            .toList();
      });

  Future<Appointment> cancel(String id) => guardApi(() async {
        final res = await _dio
            .patch<Map<String, dynamic>>('/api/appointments/$id/cancel');
        return Appointment.fromJson(res.data!);
      });
}
