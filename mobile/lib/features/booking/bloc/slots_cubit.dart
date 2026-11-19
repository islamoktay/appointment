import 'package:equatable/equatable.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../core/error/api_exception.dart';
import '../../appointments/data/appointment_repository.dart';
import '../../providers/bloc/providers_cubit.dart' show LoadStatus;
import '../../providers/data/provider_models.dart';
import '../../providers/data/provider_repository.dart';

String formatDate(DateTime d) => '${d.year.toString().padLeft(4, '0')}-'
    '${d.month.toString().padLeft(2, '0')}-'
    '${d.day.toString().padLeft(2, '0')}';

class SlotsState extends Equatable {
  const SlotsState({
    required this.date,
    this.status = LoadStatus.loading,
    this.slots,
    this.error,
    this.bookingStart,
    this.notice,
    this.noticeIsError = false,
    this.noticeSeq = 0,
  });

  final String date;
  final LoadStatus status;
  final AvailableSlots? slots;
  final ApiException? error;
  final String? bookingStart;
  final String? notice;
  final bool noticeIsError;
  final int noticeSeq;

  SlotsState copyWith({
    LoadStatus? status,
    AvailableSlots? slots,
    ApiException? error,
    String? Function()? bookingStart,
    String? notice,
    bool noticeIsError = false,
  }) =>
      SlotsState(
        date: date,
        status: status ?? this.status,
        slots: slots ?? this.slots,
        error: error,
        bookingStart: bookingStart != null ? bookingStart() : this.bookingStart,
        notice: notice,
        noticeIsError: noticeIsError,
        noticeSeq: notice != null ? noticeSeq + 1 : noticeSeq,
      );

  @override
  List<Object?> get props =>
      [date, status, slots, error, bookingStart, notice, noticeSeq];
}

class SlotsCubit extends Cubit<SlotsState> {
  SlotsCubit({
    required this.providerId,
    required ProviderRepository providers,
    required AppointmentRepository appointments,
    required String initialDate,
  })  : _providers = providers,
        _appointments = appointments,
        super(SlotsState(date: initialDate));

  final String providerId;
  final ProviderRepository _providers;
  final AppointmentRepository _appointments;

  Future<void> selectDate(String date) {
    emit(SlotsState(date: date, noticeSeq: state.noticeSeq));
    return load();
  }

  Future<void> load() async {
    final date = state.date;
    try {
      final result = await _providers.slots(providerId, date);
      if (isClosed || state.date != date) return; // stale response
      emit(state.copyWith(status: LoadStatus.success, slots: result));
    } on ApiException catch (e) {
      if (isClosed || state.date != date) return;
      emit(state.copyWith(status: LoadStatus.failure, error: e));
    }
  }

  /// Returns true when the booking was created.
  Future<bool> book(String startTime) async {
    emit(state.copyWith(bookingStart: () => startTime));
    try {
      await _appointments.book(
        providerId: providerId,
        date: state.date,
        startTime: startTime,
      );
      emit(state.copyWith(
          bookingStart: () => null, notice: 'Appointment confirmed!'));
      await load();
      return true;
    } on ApiException catch (e) {
      emit(state.copyWith(
        bookingStart: () => null,
        notice: e.isConflict
            ? 'This slot was just booked by someone else. Showing fresh times.'
            : e.message,
        noticeIsError: true,
      ));
      // 409 (or any failure): refresh so stale slots disappear.
      await load();
      return false;
    }
  }
}
