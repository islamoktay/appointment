import 'package:equatable/equatable.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../core/error/api_exception.dart';
import '../data/auth_models.dart';
import '../data/auth_repository.dart';

sealed class AuthEvent extends Equatable {
  const AuthEvent();
  @override
  List<Object?> get props => [];
}

class AuthStarted extends AuthEvent {
  const AuthStarted();
}

class LoginRequested extends AuthEvent {
  const LoginRequested({required this.email, required this.password});
  final String email;
  final String password;
  @override
  List<Object?> get props => [email, password];
}

class RegisterRequested extends AuthEvent {
  const RegisterRequested({
    required this.email,
    required this.password,
    required this.fullName,
    required this.role,
    this.timezone,
  });
  final String email;
  final String password;
  final String fullName;
  final String role;
  final String? timezone;
  @override
  List<Object?> get props => [email, password, fullName, role, timezone];
}

class LogoutRequested extends AuthEvent {
  const LogoutRequested();
}

/// Dispatched by the Dio 401 hook after the token was already cleared.
class SessionExpired extends AuthEvent {
  const SessionExpired();
}

sealed class AuthState extends Equatable {
  const AuthState();
  @override
  List<Object?> get props => [];
}

class Unauthenticated extends AuthState {
  const Unauthenticated({this.error});
  final ApiException? error;
  @override
  List<Object?> get props => [error];
}

/// Also used as the bootstrap state while the silent `/me` check runs.
class Authenticating extends AuthState {
  const Authenticating();
}

class Authenticated extends AuthState {
  const Authenticated(this.user);
  final UserDto user;
  @override
  List<Object?> get props => [user];
}

class AuthBloc extends Bloc<AuthEvent, AuthState> {
  AuthBloc({required AuthRepository repository})
      : _repository = repository,
        super(const Authenticating()) {
    on<AuthStarted>(_onStarted);
    on<LoginRequested>(_onLogin);
    on<RegisterRequested>(_onRegister);
    on<LogoutRequested>(_onLogout);
    on<SessionExpired>((_, emit) => emit(const Unauthenticated()));
  }

  final AuthRepository _repository;

  Future<void> _onStarted(AuthStarted event, Emitter<AuthState> emit) async {
    emit(const Authenticating());
    try {
      final user = await _repository.restoreSession();
      emit(user == null ? const Unauthenticated() : Authenticated(user));
    } on ApiException catch (e) {
      // Offline/5xx at boot: stay signed out without surfacing an error.
      if (e.isUnauthorized) await _repository.logout();
      emit(const Unauthenticated());
    }
  }

  Future<void> _onLogin(LoginRequested event, Emitter<AuthState> emit) =>
      _authenticate(
        emit,
        () => _repository.login(email: event.email, password: event.password),
      );

  Future<void> _onRegister(
    RegisterRequested event,
    Emitter<AuthState> emit,
  ) =>
      _authenticate(
        emit,
        () => _repository.register(
          email: event.email,
          password: event.password,
          fullName: event.fullName,
          role: event.role,
          timezone: event.timezone,
        ),
      );

  Future<void> _authenticate(
    Emitter<AuthState> emit,
    Future<UserDto> Function() call,
  ) async {
    emit(const Authenticating());
    try {
      emit(Authenticated(await call()));
    } on ApiException catch (e) {
      emit(Unauthenticated(error: e));
    }
  }

  Future<void> _onLogout(LogoutRequested event, Emitter<AuthState> emit) async {
    await _repository.logout();
    emit(const Unauthenticated());
  }
}
