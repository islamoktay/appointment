import 'package:appointment_mobile/app.dart';
import 'package:appointment_mobile/core/error/api_exception.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  testWidgets('AppointmentApp renders shell and meets accessibility guidelines',
      (WidgetTester tester) async {
    final handle = tester.ensureSemantics();
    await tester.pumpWidget(const AppointmentApp());

    expect(find.text('Appointment Booking'), findsOneWidget);
    expect(find.text('Client Booking App'), findsOneWidget);

    await expectLater(tester, meetsGuideline(textContrastGuideline));
    await expectLater(tester, meetsGuideline(androidTapTargetGuideline));
    await expectLater(tester, meetsGuideline(iOSTapTargetGuideline));
    await expectLater(tester, meetsGuideline(labeledTapTargetGuideline));

    handle.dispose();
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
    expect(
      exception.message,
      'This time slot has just been booked by another client.',
    );
  });
}
