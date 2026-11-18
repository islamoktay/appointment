import 'package:flutter/material.dart';

import 'core/theme/app_colors.dart';
import 'core/theme/app_theme.dart';

class AppointmentApp extends StatelessWidget {
  const AppointmentApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Appointment Booking',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.light,
      home: const _BootstrapHomeScreen(),
    );
  }
}

class _BootstrapHomeScreen extends StatelessWidget {
  const _BootstrapHomeScreen();

  @override
  Widget build(BuildContext context) {
    final textTheme = Theme.of(context).textTheme;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Appointment Booking'),
      ),
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(24),
            child: Card(
              child: Padding(
                padding: const EdgeInsets.all(20),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Semantics(
                      header: true,
                      child: Text(
                        'Client Booking App',
                        style: textTheme.headlineSmall?.copyWith(
                          color: AppColors.primaryBrand,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'Browse active providers, reserve real-time open slots, '
                      'and manage your upcoming appointments.',
                      style: textTheme.bodyMedium?.copyWith(
                        color: AppColors.completedMuted,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
