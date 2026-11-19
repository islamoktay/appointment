import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../core/theme/app_colors.dart';
import '../../../core/widgets/state_views.dart';
import '../../providers/bloc/providers_cubit.dart' show LoadStatus;
import '../bloc/bookings_cubit.dart';
import '../data/appointment_models.dart';

class MyBookingsScreen extends StatelessWidget {
  const MyBookingsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return DefaultTabController(
      length: 2,
      child: Scaffold(
        appBar: AppBar(
          title: const Text('My bookings'),
          bottom: const TabBar(
            tabs: [Tab(text: 'Upcoming'), Tab(text: 'Past')],
          ),
        ),
        body: BlocConsumer<BookingsCubit, BookingsState>(
          listenWhen: (p, c) => c.notice != null && p.noticeSeq != c.noticeSeq,
          listener: (context, state) =>
              showFeedback(context, state.notice!, error: state.noticeIsError),
          builder: (context, state) {
            final cubit = context.read<BookingsCubit>();
            switch (state.status) {
              case LoadStatus.loading:
                return const LoadingView();
              case LoadStatus.failure:
                return ErrorView(
                  message: state.error?.message ?? 'Something went wrong.',
                  onRetry: cubit.load,
                );
              case LoadStatus.success:
                return TabBarView(
                  children: [
                    _BookingList(
                      items: state.upcoming,
                      emptyMessage: 'No upcoming appointments',
                      cancellingId: state.cancellingId,
                    ),
                    _BookingList(
                      items: state.past,
                      emptyMessage: 'No past appointments',
                      cancellingId: state.cancellingId,
                    ),
                  ],
                );
            }
          },
        ),
      ),
    );
  }
}

class _BookingList extends StatelessWidget {
  const _BookingList({
    required this.items,
    required this.emptyMessage,
    required this.cancellingId,
  });

  final List<Appointment> items;
  final String emptyMessage;
  final String? cancellingId;

  @override
  Widget build(BuildContext context) {
    final cubit = context.read<BookingsCubit>();
    return RefreshIndicator(
      onRefresh: () => cubit.load(silent: true),
      child: items.isEmpty
          ? LayoutBuilder(
              // Scrollable so pull-to-refresh works on the empty state too.
              builder: (_, c) => ListView(
                children: [
                  SizedBox(
                    height: c.maxHeight,
                    child: EmptyView(
                      message: emptyMessage,
                      icon: Icons.event_available,
                    ),
                  ),
                ],
              ),
            )
          : ListView.separated(
              physics: const AlwaysScrollableScrollPhysics(),
              padding: const EdgeInsets.all(16),
              itemCount: items.length,
              separatorBuilder: (_, __) => const SizedBox(height: 8),
              itemBuilder: (_, i) => _BookingCard(
                appointment: items[i],
                cancelling: cancellingId == items[i].id,
              ),
            ),
    );
  }
}

class _BookingCard extends StatelessWidget {
  const _BookingCard({required this.appointment, required this.cancelling});
  final Appointment appointment;
  final bool cancelling;

  @override
  Widget build(BuildContext context) {
    final a = appointment;
    final (label, color) = switch (a.status) {
      AppointmentStatus.confirmed => ('Confirmed', AppColors.confirmedActive),
      AppointmentStatus.inProgress => ('In progress', AppColors.pendingQueue),
      AppointmentStatus.completed => ('Completed', AppColors.completedMuted),
      AppointmentStatus.cancelled => ('Cancelled', AppColors.cancelledError),
    };
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Expanded(
                  child: Text(a.providerName,
                      style: Theme.of(context).textTheme.titleMedium),
                ),
                Text(label,
                    style: TextStyle(color: color, fontWeight: FontWeight.w600)),
              ],
            ),
            const SizedBox(height: 4),
            Text('${a.appointmentDate} · ${a.startTime}–${a.endTime} '
                '(${a.providerTimezone})'),
            if (a.isCancellable) ...[
              const SizedBox(height: 8),
              Align(
                alignment: Alignment.centerRight,
                child: TextButton(
                  style: TextButton.styleFrom(
                      foregroundColor: AppColors.cancelledError),
                  onPressed: cancelling ? null : () => _confirmCancel(context),
                  child: cancelling
                      ? const SizedBox(
                          width: 18,
                          height: 18,
                          child: CircularProgressIndicator(strokeWidth: 2),
                        )
                      : const Text('Cancel'),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }

  Future<void> _confirmCancel(BuildContext context) async {
    final cubit = context.read<BookingsCubit>();
    final ok = await showModalBottomSheet<bool>(
      context: context,
      showDragHandle: true,
      builder: (ctx) => SafeArea(
        child: Padding(
          padding: const EdgeInsets.fromLTRB(24, 0, 24, 16),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Text('Cancel appointment?',
                  style: Theme.of(ctx).textTheme.titleLarge),
              const SizedBox(height: 8),
              Text('${appointment.providerName} on '
                  '${appointment.appointmentDate} at ${appointment.startTime}. '
                  'The slot becomes available again.'),
              const SizedBox(height: 16),
              FilledButton(
                style: FilledButton.styleFrom(
                    backgroundColor: AppColors.cancelledError),
                onPressed: () => Navigator.pop(ctx, true),
                child: const Text('Yes, cancel it'),
              ),
              const SizedBox(height: 8),
              OutlinedButton(
                onPressed: () => Navigator.pop(ctx, false),
                child: const Text('Keep appointment'),
              ),
            ],
          ),
        ),
      ),
    );
    if (ok == true) await cubit.cancel(appointment.id);
  }
}
