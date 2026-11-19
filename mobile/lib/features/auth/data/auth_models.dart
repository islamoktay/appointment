import 'package:equatable/equatable.dart';

enum UserRole { provider, client }

class UserDto extends Equatable {
  const UserDto({
    required this.id,
    required this.email,
    required this.fullName,
    required this.role,
    required this.timezone,
  });

  factory UserDto.fromJson(Map<String, dynamic> json) => UserDto(
        id: json['id'] as String,
        email: json['email'] as String,
        fullName: json['fullName'] as String,
        role: (json['role'] as String) == 'PROVIDER'
            ? UserRole.provider
            : UserRole.client,
        timezone: (json['timezone'] as String?) ?? 'UTC',
      );

  final String id;
  final String email;
  final String fullName;
  final UserRole role;
  final String timezone;

  @override
  List<Object?> get props => [id, email, fullName, role, timezone];
}

class AuthResponse extends Equatable {
  const AuthResponse({required this.accessToken, required this.user});

  factory AuthResponse.fromJson(Map<String, dynamic> json) => AuthResponse(
        accessToken: json['accessToken'] as String,
        user: UserDto.fromJson(json['user'] as Map<String, dynamic>),
      );

  final String accessToken;
  final UserDto user;

  @override
  List<Object?> get props => [accessToken, user];
}
