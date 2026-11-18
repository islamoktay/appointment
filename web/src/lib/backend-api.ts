import { cookies } from "next/headers";
import { getApiBaseUrl } from "@/lib/env";
import type {
  ApiErrorEnvelope,
  AppointmentResponse,
  AppointmentStatus,
  AuthResponse,
  AvailableSlotsResponse,
  CreateAppointmentRequest,
  LoginRequest,
  ProviderScheduleResponse,
  ProviderSummaryDto,
  RegisterRequest,
  UpdateScheduleRequest,
  UserDto,
} from "@/types/api";

import { SESSION_COOKIE_NAME } from "@/lib/constants";

export { SESSION_COOKIE_NAME };

export class ApiError extends Error {
  readonly status: number;
  readonly error: string;
  readonly path: string;
  readonly fieldErrors: Record<string, string>;

  constructor(envelope: {
    status: number;
    error: string;
    message: string;
    path?: string;
    fieldErrors?: Record<string, string>;
  }) {
    super(envelope.message);
    this.name = "ApiError";
    this.status = envelope.status;
    this.error = envelope.error;
    this.path = envelope.path ?? "";
    this.fieldErrors = envelope.fieldErrors ?? {};
  }
}

export type ActionResult<T> =
  | { ok: true; data: T }
  | {
      ok: false;
      status: number;
      error: string;
      message: string;
      fieldErrors: Record<string, string>;
    };

export function toActionError(err: unknown): Extract<ActionResult<never>, { ok: false }> {
  if (err instanceof ApiError) {
    return {
      ok: false,
      status: err.status,
      error: err.error,
      message: err.message,
      fieldErrors: err.fieldErrors,
    };
  }
  return {
    ok: false,
    status: 500,
    error: "INTERNAL_ERROR",
    message: "An unexpected error occurred. Please try again.",
    fieldErrors: {},
  };
}

interface BackendFetchOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  auth?: boolean;
  tokenOverride?: string;
}

async function parseErrorResponse(
  response: Response,
  path: string,
): Promise<ApiError> {
  try {
    const data = (await response.json()) as Partial<ApiErrorEnvelope>;
    return new ApiError({
      status: typeof data.status === "number" ? data.status : response.status,
      error: typeof data.error === "string" ? data.error : response.statusText || "ERROR",
      message:
        typeof data.message === "string" && data.message.trim().length > 0
          ? data.message
          : defaultMessageForStatus(response.status),
      path: typeof data.path === "string" ? data.path : path,
      fieldErrors:
        data.fieldErrors && typeof data.fieldErrors === "object"
          ? data.fieldErrors
          : {},
    });
  } catch {
    return new ApiError({
      status: response.status,
      error: response.statusText || "ERROR",
      message: defaultMessageForStatus(response.status),
      path,
      fieldErrors: {},
    });
  }
}

function defaultMessageForStatus(status: number): string {
  switch (status) {
    case 400:
      return "Please check your input and try again.";
    case 401:
      return "Your session has expired. Please sign in again.";
    case 403:
      return "You do not have permission to perform this action.";
    case 404:
      return "The requested resource could not be found.";
    case 409:
      return "This time slot has just been booked by another client.";
    default:
      return "Unable to reach the booking service right now.";
  }
}

export async function backendFetch<T>(
  path: string,
  options: BackendFetchOptions = {},
): Promise<T> {
  const { body, auth = true, tokenOverride, headers, ...rest } = options;

  const requestHeaders = new Headers(headers);
  requestHeaders.set("Accept", "application/json");
  if (body !== undefined) {
    requestHeaders.set("Content-Type", "application/json");
  }

  if (auth) {
    const token =
      tokenOverride ?? (await cookies()).get(SESSION_COOKIE_NAME)?.value;
    if (!token) {
      throw new ApiError({
        status: 401,
        error: "UNAUTHORIZED",
        message: "Authentication required. Please sign in.",
        path,
      });
    }
    requestHeaders.set("Authorization", `Bearer ${token}`);
  }

  let response: Response;
  try {
    response = await fetch(`${getApiBaseUrl()}${path}`, {
      ...rest,
      headers: requestHeaders,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      cache: "no-store",
    });
  } catch {
    throw new ApiError({
      status: 503,
      error: "SERVICE_UNAVAILABLE",
      message: "Booking API is currently unreachable. Please try again shortly.",
      path,
    });
  }

  if (!response.ok) {
    throw await parseErrorResponse(response, path);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export function authLogin(body: LoginRequest): Promise<AuthResponse> {
  return backendFetch<AuthResponse>("/api/auth/login", {
    method: "POST",
    body,
    auth: false,
  });
}

export function authRegister(body: RegisterRequest): Promise<AuthResponse> {
  return backendFetch<AuthResponse>("/api/auth/register", {
    method: "POST",
    body,
    auth: false,
  });
}

export function authMe(tokenOverride?: string): Promise<UserDto> {
  return backendFetch<UserDto>("/api/auth/me", {
    method: "GET",
    tokenOverride,
  });
}

export function listProviders(search?: string): Promise<ProviderSummaryDto[]> {
  const params = new URLSearchParams();
  if (search && search.trim().length > 0) {
    params.set("search", search.trim());
  }
  const qs = params.toString();
  return backendFetch<ProviderSummaryDto[]>(
    `/api/providers${qs ? `?${qs}` : ""}`,
  );
}

export function getProviderSchedule(
  providerId: string,
): Promise<ProviderScheduleResponse> {
  return backendFetch<ProviderScheduleResponse>(
    `/api/providers/${encodeURIComponent(providerId)}/schedule`,
  );
}

export function updateProviderSchedule(
  body: UpdateScheduleRequest,
): Promise<ProviderScheduleResponse> {
  return backendFetch<ProviderScheduleResponse>("/api/providers/schedule", {
    method: "PUT",
    body,
  });
}

export function getAvailableSlots(
  providerId: string,
  date: string,
): Promise<AvailableSlotsResponse> {
  const params = new URLSearchParams({ date });
  return backendFetch<AvailableSlotsResponse>(
    `/api/providers/${encodeURIComponent(providerId)}/slots?${params.toString()}`,
  );
}

export function createAppointment(
  body: CreateAppointmentRequest,
): Promise<AppointmentResponse> {
  return backendFetch<AppointmentResponse>("/api/appointments", {
    method: "POST",
    body,
  });
}

export function listMyAppointments(params?: {
  date?: string;
  status?: AppointmentStatus[];
}): Promise<AppointmentResponse[]> {
  const search = new URLSearchParams();
  if (params?.date) {
    search.set("date", params.date);
  }
  if (params?.status) {
    for (const st of params.status) {
      search.append("status", st);
    }
  }
  const qs = search.toString();
  return backendFetch<AppointmentResponse[]>(
    `/api/appointments/me${qs ? `?${qs}` : ""}`,
  );
}

export function startAppointment(id: string): Promise<AppointmentResponse> {
  return backendFetch<AppointmentResponse>(
    `/api/appointments/${encodeURIComponent(id)}/start`,
    { method: "PATCH" },
  );
}

export function completeAppointment(id: string): Promise<AppointmentResponse> {
  return backendFetch<AppointmentResponse>(
    `/api/appointments/${encodeURIComponent(id)}/complete`,
    { method: "PATCH" },
  );
}

export function cancelAppointment(id: string): Promise<AppointmentResponse> {
  return backendFetch<AppointmentResponse>(
    `/api/appointments/${encodeURIComponent(id)}/cancel`,
    { method: "PATCH" },
  );
}
