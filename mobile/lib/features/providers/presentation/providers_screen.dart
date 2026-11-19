import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../core/theme/app_colors.dart';
import '../../../core/widgets/state_views.dart';
import '../../booking/presentation/slot_picker_screen.dart';
import '../bloc/providers_cubit.dart';
import '../data/provider_models.dart';

class ProvidersScreen extends StatefulWidget {
  const ProvidersScreen({super.key});

  @override
  State<ProvidersScreen> createState() => _ProvidersScreenState();
}

class _ProvidersScreenState extends State<ProvidersScreen> {
  final _search = TextEditingController();

  @override
  void dispose() {
    _search.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final cubit = context.read<ProvidersCubit>();
    return Scaffold(
      appBar: AppBar(title: const Text('Providers')),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 8),
            child: TextField(
              controller: _search,
              textInputAction: TextInputAction.search,
              decoration: const InputDecoration(
                labelText: 'Search providers',
                prefixIcon: Icon(Icons.search),
              ),
              onSubmitted: (v) => cubit.load(search: v),
            ),
          ),
          Expanded(
            child: BlocBuilder<ProvidersCubit, ProvidersState>(
              builder: (context, state) {
                switch (state.status) {
                  case LoadStatus.loading:
                    return const LoadingView();
                  case LoadStatus.failure:
                    return ErrorView(
                      message: state.error?.message ?? 'Something went wrong.',
                      onRetry: () => cubit.load(search: _search.text),
                    );
                  case LoadStatus.success:
                    if (state.providers.isEmpty) {
                      return const EmptyView(
                        message: 'No providers found.',
                        icon: Icons.people_outline,
                      );
                    }
                    return RefreshIndicator(
                      onRefresh: () => cubit.load(search: _search.text),
                      child: ListView.separated(
                        padding: const EdgeInsets.all(16),
                        itemCount: state.providers.length,
                        separatorBuilder: (_, __) => const SizedBox(height: 8),
                        itemBuilder: (_, i) =>
                            _ProviderTile(provider: state.providers[i]),
                      ),
                    );
                }
              },
            ),
          ),
        ],
      ),
    );
  }
}

class _ProviderTile extends StatelessWidget {
  const _ProviderTile({required this.provider});
  final ProviderSummary provider;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: ListTile(
        minVerticalPadding: 12,
        leading: CircleAvatar(
          backgroundColor: AppColors.primaryBrand,
          foregroundColor: AppColors.surfaceNeutral,
          child: Text(provider.fullName.isEmpty
              ? '?'
              : provider.fullName[0].toUpperCase()),
        ),
        title: Text(provider.fullName),
        subtitle: Text('${provider.email}\n${provider.timezone}'),
        isThreeLine: true,
        trailing: const Icon(Icons.chevron_right),
        onTap: () => Navigator.of(context).push(
          MaterialPageRoute<void>(
            builder: (_) => SlotPickerScreen(provider: provider),
          ),
        ),
      ),
    );
  }
}
