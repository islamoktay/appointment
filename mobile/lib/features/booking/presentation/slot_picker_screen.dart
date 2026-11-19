import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../core/theme/app_colors.dart';
import '../../../core/widgets/state_views.dart';
import '../../appointments/data/appointment_repository.dart';
import '../../providers/bloc/providers_cubit.dart' show LoadStatus;
import '../../providers/data/provider_models.dart';
import '../../providers/data/provider_repository.dart';
import '../bloc/slots_cubit.dart';

const _weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const _months = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', //
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

class SlotPickerScreen extends StatelessWidget {
  const SlotPickerScreen({super.key, required this.provider});
  final ProviderSummary provider;

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (ctx) => SlotsCubit(
        providerId: provider.id,
        providers: ctx.read<ProviderRepository>(),
        appointments: ctx.read<AppointmentRepository>(),
        initialDate: formatDate(DateTime.now()),
      )..load(),
      child: _SlotPickerView(provider: provider),
    );
  }
}

class _SlotPickerView extends StatelessWidget {
  const _SlotPickerView({required this.provider});
  final ProviderSummary provider;

  @override
  Widget build(BuildContext context) {
    final today = DateTime.now();
    final days = List.generate(
      14,
      (i) => DateTime(today.year, today.month, today.day + i),
    );

    return Scaffold(
      appBar: AppBar(title: Text(provider.fullName)),
      body: BlocConsumer<SlotsCubit, SlotsState>(
        listenWhen: (p, c) => c.notice != null && p.noticeSeq != c.noticeSeq,
        listener: (context, state) =>
            showFeedback(context, state.notice!, error: state.noticeIsError),
        builder: (context, state) {
          final cubit = context.read<SlotsCubit>();
          return Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              SizedBox(
                height: 84,
                child: ListView.separated(
                  scrollDirection: Axis.horizontal,
                  padding: const EdgeInsets.all(16),
                  itemCount: days.length,
                  separatorBuilder: (_, __) => const SizedBox(width: 8),
                  itemBuilder: (_, i) {
                    final d = days[i];
                    final key = formatDate(d);
                    final selected = key == state.date;
                    return ChoiceChip(
                      selected: selected,
                      showCheckmark: false,
                      selectedColor: AppColors.primaryBrand,
                      labelStyle: TextStyle(
                        color: selected
                            ? AppColors.surfaceNeutral
                            : AppColors.primaryBrand,
                      ),
                      label: Text(
                        '${_weekdays[d.weekday - 1]}\n'
                        '${_months[d.month - 1]} ${d.day}',
                        textAlign: TextAlign.center,
                      ),
                      onSelected: (_) => cubit.selectDate(key),
                    );
                  },
                ),
              ),
              if (state.slots != null)
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  child: Text(
                    'Times shown in ${state.slots!.timezone}',
                    style: Theme.of(context)
                        .textTheme
                        .bodySmall
                        ?.copyWith(color: AppColors.completedMuted),
                  ),
                ),
              Expanded(child: _SlotsBody(state: state)),
            ],
          );
        },
      ),
    );
  }
}

class _SlotsBody extends StatelessWidget {
  const _SlotsBody({required this.state});
  final SlotsState state;

  @override
  Widget build(BuildContext context) {
    final cubit = context.read<SlotsCubit>();
    switch (state.status) {
      case LoadStatus.loading:
        return const LoadingView();
      case LoadStatus.failure:
        return ErrorView(
          message: state.error?.message ?? 'Could not load slots.',
          onRetry: cubit.load,
        );
      case LoadStatus.success:
        final slots = state.slots!.slots;
        if (slots.isEmpty) {
          return const EmptyView(
            message: 'No available slots on this date',
            icon: Icons.event_busy,
          );
        }
        return GridView.builder(
          padding: const EdgeInsets.all(16),
          gridDelegate: const SliverGridDelegateWithMaxCrossAxisExtent(
            maxCrossAxisExtent: 120,
            mainAxisExtent: 48,
            mainAxisSpacing: 8,
            crossAxisSpacing: 8,
          ),
          itemCount: slots.length,
          itemBuilder: (_, i) {
            final slot = slots[i];
            final busy = state.bookingStart == slot.startTime;
            return OutlinedButton(
              style: OutlinedButton.styleFrom(
                foregroundColor: AppColors.confirmedActive,
                side: const BorderSide(color: AppColors.confirmedActive),
              ),
              onPressed: state.bookingStart != null
                  ? null
                  : () => _confirm(context, slot),
              child: busy
                  ? const SizedBox(
                      width: 18,
                      height: 18,
                      child: CircularProgressIndicator(strokeWidth: 2),
                    )
                  : Text(slot.startTime),
            );
          },
        );
    }
  }

  Future<void> _confirm(BuildContext context, TimeSlot slot) async {
    final cubit = context.read<SlotsCubit>();
    final ok = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Confirm booking'),
        content: Text(
          '${state.slots!.providerName}\n${state.date} · '
          '${slot.startTime}–${slot.endTime} (${state.slots!.timezone})',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('Back'),
          ),
          FilledButton(
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text('Book'),
          ),
        ],
      ),
    );
    if (ok == true) await cubit.book(slot.startTime);
  }
}
