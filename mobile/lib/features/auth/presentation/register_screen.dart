import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../bloc/auth_bloc.dart';
import 'auth_form_scaffold.dart';

/// The mobile app is the client journey, so accounts are always `CLIENT`.
class RegisterScreen extends StatefulWidget {
  const RegisterScreen({super.key});

  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final _formKey = GlobalKey<FormState>();
  final _name = TextEditingController();
  final _email = TextEditingController();
  final _password = TextEditingController();

  @override
  void dispose() {
    _name.dispose();
    _email.dispose();
    _password.dispose();
    super.dispose();
  }

  void _submit() {
    if (!_formKey.currentState!.validate()) return;
    context.read<AuthBloc>().add(
          RegisterRequested(
            email: _email.text.trim(),
            password: _password.text,
            fullName: _name.text.trim(),
            role: 'CLIENT',
          ),
        );
  }

  @override
  Widget build(BuildContext context) {
    return AuthFormScaffold(
      title: 'Create account',
      submitLabel: 'Create account',
      onSubmit: _submit,
      footerLabel: 'Already registered? Sign in',
      onFooter: () => Navigator.of(context).pop(),
      formKey: _formKey,
      showBack: true,
      fields: [
        TextFormField(
          controller: _name,
          textCapitalization: TextCapitalization.words,
          autofillHints: const [AutofillHints.name],
          decoration: const InputDecoration(labelText: 'Full name'),
          validator: (v) =>
              (v == null || v.trim().isEmpty) ? 'Enter your name' : null,
        ),
        TextFormField(
          controller: _email,
          keyboardType: TextInputType.emailAddress,
          autofillHints: const [AutofillHints.email],
          decoration: const InputDecoration(labelText: 'Email'),
          validator: (v) =>
              (v == null || !v.contains('@')) ? 'Enter a valid email' : null,
        ),
        TextFormField(
          controller: _password,
          obscureText: true,
          autofillHints: const [AutofillHints.newPassword],
          decoration:
              const InputDecoration(labelText: 'Password (min 8 characters)'),
          validator: (v) =>
              (v == null || v.length < 8) ? 'At least 8 characters' : null,
        ),
      ],
    );
  }
}
