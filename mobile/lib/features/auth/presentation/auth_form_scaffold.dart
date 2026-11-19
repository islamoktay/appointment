import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../core/theme/app_colors.dart';
import '../../../core/widgets/state_views.dart';
import '../bloc/auth_bloc.dart';

/// Shared layout for Login/Register: error feedback, busy button, footer link.
class AuthFormScaffold extends StatelessWidget {
  const AuthFormScaffold({
    super.key,
    required this.title,
    required this.submitLabel,
    required this.onSubmit,
    required this.footerLabel,
    required this.onFooter,
    required this.formKey,
    required this.fields,
    this.showBack = false,
  });

  final String title;
  final String submitLabel;
  final VoidCallback onSubmit;
  final String footerLabel;
  final VoidCallback onFooter;
  final GlobalKey<FormState> formKey;
  final List<Widget> fields;
  final bool showBack;

  @override
  Widget build(BuildContext context) {
    return BlocConsumer<AuthBloc, AuthState>(
      // A successful auth swaps the root screen; pop any pushed route first.
      listener: (context, state) {
        if (state is Authenticated) {
          Navigator.of(context).popUntil((r) => r.isFirst);
        } else if (state is Unauthenticated && state.error != null) {
          showFeedback(context, state.error!.message, error: true);
        }
      },
      builder: (context, state) {
        final busy = state is Authenticating;
        return Scaffold(
          appBar: AppBar(title: Text(title), automaticallyImplyLeading: showBack),
          body: SafeArea(
            child: Center(
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(24),
                child: ConstrainedBox(
                  constraints: const BoxConstraints(maxWidth: 420),
                  child: Form(
                    key: formKey,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        for (final f in fields) ...[f, const SizedBox(height: 16)],
                        FilledButton(
                          onPressed: busy ? null : onSubmit,
                          child: busy
                              ? const SizedBox(
                                  width: 20,
                                  height: 20,
                                  child: CircularProgressIndicator(
                                    strokeWidth: 2,
                                    color: AppColors.surfaceNeutral,
                                  ),
                                )
                              : Text(submitLabel),
                        ),
                        const SizedBox(height: 8),
                        TextButton(
                          onPressed: busy ? null : onFooter,
                          child: Text(footerLabel),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ),
          ),
        );
      },
    );
  }
}
