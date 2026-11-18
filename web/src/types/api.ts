export type UserRole = "PROVIDER" | "CLIENT";

export type AppointmentStatus =
  | "CONFIRMED"
  | "IN_PROGRESS"
  | "CANCELLED"
  | "COMPLETED";

export interface ApiErrorEnvelope {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  path: string;
  fieldErrors: Record<string, string>;
}

export interface UserDto {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  timezone: string;
}

export interface AuthResponse {
  accessToken: string;
  tokenType: "Bearer";
  expiresIn: number;
  user: UserDto;
}

export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
  role: UserRole;
  timezone?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface ProviderSummaryDto {
  id: string;
  fullName: string;
  email: string;
  timezone: string;
}

export interface ScheduleDayDto {
  dayOfWeek: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  startTime: string;
  endTime: string;
  slotDurationMinutes: 15 | 30 | 60;
}

export interface UpdateScheduleRequest {
  timezone?: string;
  days: ScheduleDayDto[];
}

export interface ProviderScheduleResponse {
  providerId: string;
  providerName: string;
  timezone: string;
  days: ScheduleDayDto[];
}

export interface TimeSlotDto {
  startTime: string;
  endTime: string;
}

export interface AvailableSlotsResponse {
  providerId: string;
  providerName: string;
  date: string;
  timezone: string;
  slots: TimeSlotDto[];
}

export interface CreateAppointmentRequest {
  providerId: string;
  appointmentDate: string;
  startTime: string;
}

export interface AppointmentResponse {
  id: string;
  providerId: string;
  providerName: string;
  providerTimezone: string;
  clientId: string;
  clientName: string;
  appointmentDate: string;
  startTime: string;
  endTime: string;
  status: AppointmentStatus;
  createdAt: string;
}
