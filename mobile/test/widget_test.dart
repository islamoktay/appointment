import 'package:appointment_mobile/app.dart';
import 'package:appointment_mobile/core/error/api_exception.dart';
import 'package:appointment_mobile/core/storage/token_storage.dart';
import 'package:appointment_mobile/features/appointments/data/appointment_models.dart';
import 'package:appointment_mobile/features/appointments/data/appointment_repository.dart';
import 'package:appointment_mobile/features/auth/bloc/auth_bloc.dart';
import 'package:appointment_mobile/features/auth/data/auth_models.dart';
import 'package:appointment_mobile/features/auth/data/auth_repository.dart';
import 'package:appointment_mobile/features/booking/bloc/slots_cubit.dart';
import 'package:appointment_mobile/features/providers/data/provider_models.dart';
import 'package:appointment_mobile/features/providers/data/provider_repository.dart';
import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

const _client = UserDto(
  id: 'u1',
  email: 'a@b.co',
  fullName: 'Alex Doe',
  role: UserRole.client,
  timezone: 'UTC',
);

class FakeAuth extends AuthRepository {
  FakeAuth({this.restored})
      : super(dio: Dio(), tokenStorage: TokenStorage());
  final UserDto? restored;
  bool loggedOut = false;

  @override
  Future<UserDto?> restoreSession() async => restored;

  @override
  Future<UserDto> login({required String email, required String password}) async {
    if (password == 'wrong-pass') {
      throw const ApiException(
          statusCode: 401, error: 'UNAUTHORIZED', message: 'Invalid credentials');
    }
    return _client;
  }

  @override
  Future<void> logout() async => loggedOut = true;
}

class FakeProviders extends ProviderRepository {
  FakeProviders({this.slotResults = const []}) : super(dio: Dio());
  final List<AvailableSlots> slotResults;
  int slotCalls = 0;

  @override
  Future<List<ProviderSummary>> listProviders({String? search}) async => const [
        ProviderSummary(
            id: 'p1', fullName: 'Dr. Jane', email: 'j@x.co', timezone: 'UTC'),
      ];

  @override
  Future<AvailableSlots> slots(String providerId, String date) async {
    final i = slotCalls < slotResults.length ? slotCalls : slotResults.length - 1;
    slotCalls++;
    return slotResults[i];
  }
}

class FakeAppointments extends AppointmentRepository {
  FakeAppointments({this.bookError}) : super(dio: Dio());
  final ApiException? bookError;

  @override
  Future<List<Appointment>> mine() async => const [];

  @override
  Future<Appointment> book({
    required String providerId,
    required String date,
    required String startTime,
  }) async {
    if (bookError != null) throw bookError!;
    throw UnimplementedError();
  }
}

AvailableSlots _slots(List<String> starts) => AvailableSlots(
      providerId: 'p1',
      providerName: 'Dr. Jane',
      date: '2026-11-20',
      timezone: 'UTC',
      slots: [for (final s in starts) TimeSlot(startTime: s, endTime: s)],
    );

void main() {
  testWidgets('no stored session shows login and meets a11y guidelines',
      (tester) async {
    final handle = tester.ensureSemantics();
    await tester.pumpWidget(AppointmentApp(
      authRepository: FakeAuth(),
      providerRepository: FakeProviders(),
      appointmentRepository: FakeAppointments(),
    ));
    await tester.pumpAndSettle();

    expect(find.text('Sign in'), findsWidgets);
    await expectLater(tester, meetsGuideline(textContrastGuideline));
    await expectLater(tester, meetsGuideline(androidTapTargetGuideline));
    await expectLater(tester, meetsGuideline(labeledTapTargetGuideline));
    handle.dispose();
  });

  testWidgets('silent auto-login lands on the providers list', (tester) async {
    await tester.pumpWidget(AppointmentApp(
      authRepository: FakeAuth(restored: _client),
      providerRepository: FakeProviders(),
      appointmentRepository: FakeAppointments(),
    ));
    await tester.pumpAndSettle();

    expect(find.text('Dr. Jane'), findsOneWidget);
    expect(find.text('My bookings'), findsOneWidget);
  });

  testWidgets('login validates input and signs in', (tester) async {
    await tester.pumpWidget(AppointmentApp(
      authRepository: FakeAuth(),
      providerRepository: FakeProviders(),
      appointmentRepository: FakeAppointments(),
    ));
    await tester.pumpAndSettle();

    await tester.tap(find.widgetWithText(FilledButton, 'Sign in'));
    await tester.pump();
    expect(find.text('Enter a valid email'), findsOneWidget);

    await tester.enterText(find.byType(TextFormField).at(0), 'a@b.co');
    await tester.enterText(find.byType(TextFormField).at(1), 'secret-pass');
    await tester.tap(find.widgetWithText(FilledButton, 'Sign in'));
    await tester.pumpAndSettle();

    expect(find.text('Providers'), findsWidgets);
  });

  testWidgets('failed login keeps the form and shows the error',
      (tester) async {
    await tester.pumpWidget(AppointmentApp(
      authRepository: FakeAuth(),
      providerRepository: FakeProviders(),
      appointmentRepository: FakeAppointments(),
    ));
    await tester.pumpAndSettle();

    await tester.enterText(find.byType(TextFormField).at(0), 'a@b.co');
    await tester.enterText(find.byType(TextFormField).at(1), 'wrong-pass');
    await tester.tap(find.widgetWithText(FilledButton, 'Sign in'));
    await tester.pumpAndSettle();

    expect(find.text('Invalid credentials'), findsOneWidget);
    expect(find.byType(TextFormField), findsNWidgets(2));
  });

  test('AuthBloc: bootstrap with no token -> Unauthenticated', () async {
    final bloc = AuthBloc(repository: FakeAuth())..add(const AuthStarted());
    await expectLater(
      bloc.stream,
      emitsInOrder([isA<Authenticating>(), isA<Unauthenticated>()]),
    );
    await bloc.close();
  });

  test('SlotsCubit: 409 conflict emits notice and refetches slots', () async {
    final providers = FakeProviders(slotResults: [
      _slots(['09:00', '09:30']),
      _slots(['09:30']),
    ]);
    final cubit = SlotsCubit(
      providerId: 'p1',
      providers: providers,
      appointments: FakeAppointments(
        bookError: const ApiException(
          statusCode: 409,
          error: 'CONFLICT',
          message: 'taken',
        ),
      ),
      initialDate: '2026-11-20',
    );
    await cubit.load();
    expect(cubit.state.slots!.slots.length, 2);

    final ok = await cubit.book('09:00');

    expect(ok, isFalse);
    expect(providers.slotCalls, 2);
    expect(cubit.state.slots!.slots.single.startTime, '09:30');
    expect(cubit.state.noticeSeq, 1); // exactly one conflict notice was emitted
    await cubit.close();
  });

  test('ApiException.fromJson parses locked 409 Conflict error envelope', () {
    final exception = ApiException.fromJson({
      'timestamp': '2026-11-18T20:00:00Z',
      'status': 409,
      'error': 'CONFLICT',
      'message': 'This time slot has just been booked by another client.',
      'path': '/api/appointments',
      'fieldErrors': <String, dynamic>{},
    });

    expect(exception.statusCode, 409);
    expect(exception.isConflict, isTrue);
    expect(exception.isUnauthorized, isFalse);
    expect(exception.error, 'CONFLICT');
  });
}
