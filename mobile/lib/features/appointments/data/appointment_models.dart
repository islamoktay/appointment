import 'package:equatable/equatable.dart';

enum AppointmentStatus { confirmed, inProgress, completed, cancelled }

AppointmentStatus _parseStatus(String raw) => switch (raw) {
      'CONFIRMED' => AppointmentStatus.confirmed,
      'IN_PROGRESS' => AppointmentStatus.inProgress,
      'COMPLETED' => AppointmentStatus.completed,
      _ => AppointmentStatus.cancelled,
    };

class Appointment extends Equatable {
  const Appointment({
    required this.id,
    required this.providerId,
    required this.providerName,
    required this.providerTimezone,
    required this.appointmentDate,
    required this.startTime,
    required this.endTime,
    required this.status,
  });

  factory Appointment.fromJson(Map<String, dynamic> json) => Appointment(
        id: json['id'] as String,
        providerId: json['providerId'] as String,
        providerName: json['providerName'] as String,
        providerTimezone: (json['providerTimezone'] as String?) ?? 'UTC',
        appointmentDate: json['appointmentDate'] as String,
        startTime: json['startTime'] as String,
        endTime: json['endTime'] as String,
        status: _parseStatus(json['status'] as String),
      );

  final String id;
  final String providerId;
  final String providerName;
  final String providerTimezone;
  final String appointmentDate;
  final String startTime;
  final String endTime;
  final AppointmentStatus status;

  bool get isUpcoming =>
      status == AppointmentStatus.confirmed ||
      status == AppointmentStatus.inProgress;

  bool get isCancellable => isUpcoming;

  @override
  List<Object?> get props => [id, status, appointmentDate, startTime];
}
