import 'package:flutter/material.dart';

/// Shared brand and semantic color tokens locked in docs/sdlc-master-plan.md.
abstract final class AppColors {
  static const Color primaryBrand = Color(0xFF0F172A); // Slate 900
  static const Color surfaceNeutral = Color(0xFFF8FAFC); // Slate 50
  static const Color confirmedActive = Color(0xFF059669); // Emerald 600
  static const Color pendingQueue = Color(0xFFD97706); // Amber 600
  static const Color cancelledError = Color(0xFFE11D48); // Rose 600
  static const Color completedMuted = Color(0xFF475569); // Slate 600

  static const Color cardSurface = Color(0xFFFFFFFF);
  static const Color borderSubtle = Color(0xFFE2E8F0); // Slate 200
}
