import 'package:equatable/equatable.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../core/error/api_exception.dart';
import '../../providers/bloc/providers_cubit.dart' show LoadStatus;
import '../data/appointment_models.dart';
import '../data/appointment_repository.dart';

class BookingsState extends Equatable {
  const BookingsState({
    this.status = LoadStatus.loading,
    this.appointments = const [],
    this.error,
    this.cancellingId,
    this.notice,
    this.noticeIsError = false,
    this.noticeSeq = 0,
  });

  final LoadStatus status;
  final List<Appointment> appointments;
  final ApiException? error;
  final String? cancellingId;

  /// One-shot feedback message; [noticeSeq] makes repeats distinct.
  final String? notice;
  final bool noticeIsError;
  final int noticeSeq;

  List<Appointment> get upcoming =>
      appointments.where((a) => a.isUpcoming).toList();
  List<Appointment> get past =>
      appointments.where((a) => !a.isUpcoming).toList().reversed.toList();

  BookingsState copyWith({
    LoadStatus? status,
    List<Appointment>? appointments,
    ApiException? error,
    String? Function()? cancellingId,
    String? notice,
    bool noticeIsError = false,
  }) =>
      BookingsState(
        status: status ?? this.status,
        appointments: appointments ?? this.appointments,
        error: error,
        cancellingId: cancellingId != null ? cancellingId() : this.cancellingId,
        notice: notice,
        noticeIsError: noticeIsError,
        noticeSeq: notice != null ? noticeSeq + 1 : noticeSeq,
      );

  @override
  List<Object?> get props =>
      [status, appointments, error, cancellingId, notice, noticeSeq];
}

class BookingsCubit extends Cubit<BookingsState> {
  BookingsCubit(this._repository) : super(const BookingsState());

  final AppointmentRepository _repository;

  /// [silent] keeps current data visible (pull-to-refresh / post-action).
  Future<void> load({bool silent = false}) async {
    if (!silent) emit(const BookingsState());
    try {
      final list = await _repository.mine();
      emit(state.copyWith(status: LoadStatus.success, appointments: list));
    } on ApiException catch (e) {
      emit(silent
          ? state.copyWith(notice: e.message, noticeIsError: true)
          : BookingsState(status: LoadStatus.failure, error: e));
    }
  }

  Future<void> cancel(String id) async {
    emit(state.copyWith(cancellingId: () => id));
    try {
      await _repository.cancel(id);
      emit(state.copyWith(
          cancellingId: () => null, notice: 'Appointment cancelled.'));
    } on ApiException catch (e) {
      emit(state.copyWith(
          cancellingId: () => null, notice: e.message, noticeIsError: true));
    }
    await load(silent: true);
  }
}
