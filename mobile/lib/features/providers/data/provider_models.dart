import 'package:equatable/equatable.dart';

class ProviderSummary extends Equatable {
  const ProviderSummary({
    required this.id,
    required this.fullName,
    required this.email,
    required this.timezone,
  });

  factory ProviderSummary.fromJson(Map<String, dynamic> json) =>
      ProviderSummary(
        id: json['id'] as String,
        fullName: json['fullName'] as String,
        email: json['email'] as String,
        timezone: (json['timezone'] as String?) ?? 'UTC',
      );

  final String id;
  final String fullName;
  final String email;
  final String timezone;

  @override
  List<Object?> get props => [id, fullName, email, timezone];
}

class TimeSlot extends Equatable {
  const TimeSlot({required this.startTime, required this.endTime});

  factory TimeSlot.fromJson(Map<String, dynamic> json) => TimeSlot(
        startTime: json['startTime'] as String,
        endTime: json['endTime'] as String,
      );

  final String startTime;
  final String endTime;

  @override
  List<Object?> get props => [startTime, endTime];
}

class AvailableSlots extends Equatable {
  const AvailableSlots({
    required this.providerId,
    required this.providerName,
    required this.date,
    required this.timezone,
    required this.slots,
  });

  factory AvailableSlots.fromJson(Map<String, dynamic> json) => AvailableSlots(
        providerId: json['providerId'] as String,
        providerName: json['providerName'] as String,
        date: json['date'] as String,
        timezone: (json['timezone'] as String?) ?? 'UTC',
        slots: (json['slots'] as List<dynamic>)
            .map((e) => TimeSlot.fromJson(e as Map<String, dynamic>))
            .toList(),
      );

  final String providerId;
  final String providerName;
  final String date;
  final String timezone;
  final List<TimeSlot> slots;

  @override
  List<Object?> get props => [providerId, providerName, date, timezone, slots];
}
