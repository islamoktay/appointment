import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import 'core/network/dio_client.dart';
import 'core/storage/token_storage.dart';
import 'core/theme/app_theme.dart';
import 'core/widgets/state_views.dart';
import 'features/appointments/bloc/bookings_cubit.dart';
import 'features/appointments/data/appointment_repository.dart';
import 'features/auth/bloc/auth_bloc.dart';
import 'features/auth/data/auth_repository.dart';
import 'features/auth/presentation/login_screen.dart';
import 'features/providers/bloc/providers_cubit.dart';
import 'features/providers/data/provider_repository.dart';
import 'home_shell.dart';

class AppointmentApp extends StatefulWidget {
  /// Dependencies are injectable so widget tests can supply fakes.
  const AppointmentApp({
    super.key,
    this.authRepository,
    this.providerRepository,
    this.appointmentRepository,
  });

  final AuthRepository? authRepository;
  final ProviderRepository? providerRepository;
  final AppointmentRepository? appointmentRepository;

  @override
  State<AppointmentApp> createState() => _AppointmentAppState();
}

class _AppointmentAppState extends State<AppointmentApp> {
  late final AuthBloc _authBloc;
  late final AuthRepository _auth;
  late final ProviderRepository _providers;
  late final AppointmentRepository _appointments;

  @override
  void initState() {
    super.initState();
    if (widget.authRepository != null) {
      _auth = widget.authRepository!;
      _providers = widget.providerRepository!;
      _appointments = widget.appointmentRepository!;
      _authBloc = AuthBloc(repository: _auth);
    } else {
      final storage = TokenStorage();
      final client = DioClient(
        tokenStorage: storage,
        // 401 anywhere => token already cleared; drop to the login screen.
        onUnauthorized: () => _authBloc.add(const SessionExpired()),
      );
      _auth = AuthRepository(dio: client.dio, tokenStorage: storage);
      _providers = ProviderRepository(dio: client.dio);
      _appointments = AppointmentRepository(dio: client.dio);
      _authBloc = AuthBloc(repository: _auth);
    }
    _authBloc.add(const AuthStarted());
  }

  @override
  void dispose() {
    _authBloc.close();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return MultiRepositoryProvider(
      providers: [
        RepositoryProvider.value(value: _providers),
        RepositoryProvider.value(value: _appointments),
      ],
      child: BlocProvider.value(
        value: _authBloc,
        child: MaterialApp(
          title: 'Appointment Booking',
          debugShowCheckedModeBanner: false,
          theme: AppTheme.light,
          home: const _AuthGate(),
        ),
      ),
    );
  }
}

class _AuthGate extends StatelessWidget {
  const _AuthGate();

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<AuthBloc, AuthState>(
      // Keep the login form mounted while a login attempt is in flight.
      buildWhen: (p, c) => !(p is Unauthenticated && c is Authenticating),
      builder: (context, state) {
        return switch (state) {
          Authenticated(:final user) => MultiBlocProvider(
              // Keyed by user so a new login never sees the previous cache.
              key: ValueKey(user.id),
              providers: [
                BlocProvider(
                  create: (ctx) =>
                      ProvidersCubit(ctx.read<ProviderRepository>())..load(),
                ),
                BlocProvider(
                  create: (ctx) =>
                      BookingsCubit(ctx.read<AppointmentRepository>())..load(),
                ),
              ],
              child: HomeShell(user: user),
            ),
          Unauthenticated() => const LoginScreen(),
          Authenticating() => const Scaffold(body: LoadingView()),
        };
      },
    );
  }
}
