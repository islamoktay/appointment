import 'package:equatable/equatable.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../core/error/api_exception.dart';
import '../data/provider_models.dart';
import '../data/provider_repository.dart';

enum LoadStatus { loading, success, failure }

class ProvidersState extends Equatable {
  const ProvidersState({
    this.status = LoadStatus.loading,
    this.providers = const [],
    this.error,
  });

  final LoadStatus status;
  final List<ProviderSummary> providers;
  final ApiException? error;

  @override
  List<Object?> get props => [status, providers, error];
}

class ProvidersCubit extends Cubit<ProvidersState> {
  ProvidersCubit(this._repository) : super(const ProvidersState());

  final ProviderRepository _repository;

  Future<void> load({String? search}) async {
    emit(const ProvidersState());
    try {
      final list = await _repository.listProviders(search: search);
      emit(ProvidersState(status: LoadStatus.success, providers: list));
    } on ApiException catch (e) {
      emit(ProvidersState(status: LoadStatus.failure, error: e));
    }
  }
}
