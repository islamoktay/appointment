import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import 'features/appointments/presentation/my_bookings_screen.dart';
import 'features/auth/bloc/auth_bloc.dart';
import 'features/auth/data/auth_models.dart';
import 'features/providers/presentation/providers_screen.dart';

/// Signed-in shell: client tabs, or a web-portal notice for providers.
class HomeShell extends StatefulWidget {
  const HomeShell({super.key, required this.user});
  final UserDto user;

  @override
  State<HomeShell> createState() => _HomeShellState();
}

class _HomeShellState extends State<HomeShell> {
  int _index = 0;

  @override
  Widget build(BuildContext context) {
    if (widget.user.role == UserRole.provider) {
      return Scaffold(
        appBar: AppBar(title: const Text('Appointment Booking')),
        body: Center(
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Text(
                  'Provider accounts are managed in the web portal.',
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 16),
                OutlinedButton(
                  onPressed: () =>
                      context.read<AuthBloc>().add(const LogoutRequested()),
                  child: const Text('Sign out'),
                ),
              ],
            ),
          ),
        ),
      );
    }

    return Scaffold(
      body: IndexedStack(
        index: _index,
        children: const [ProvidersScreen(), MyBookingsScreen()],
      ),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _index,
        onDestinationSelected: (i) => setState(() => _index = i),
        destinations: const [
          NavigationDestination(
              icon: Icon(Icons.people_outline), label: 'Providers'),
          NavigationDestination(
              icon: Icon(Icons.event_note_outlined), label: 'My bookings'),
        ],
      ),
    );
  }
}
