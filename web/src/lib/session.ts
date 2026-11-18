import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ApiError, SESSION_COOKIE_NAME, authMe } from "@/lib/backend-api";
import { getDefaultRouteForRole } from "@/lib/date-utils";
import type { UserDto, UserRole } from "@/types/api";

export function buildSessionCookieOptions(maxAgeSeconds: number) {
  return {
    name: SESSION_COOKIE_NAME,
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: maxAgeSeconds,
  };
}

export async function getAccessToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE_NAME)?.value;
}

/**
 * Fetches the authenticated user from Spring Boot `/api/auth/me`.
 * Returns null if there is no cookie or the token is invalid/expired.
 */
export async function getCurrentUser(): Promise<UserDto | null> {
  const token = await getAccessToken();
  if (!token) return null;

  try {
    return await authMe(token);
  } catch (err) {
    if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
      return null;
    }
    return null;
  }
}

/**
 * Enforces verified authentication (and optional role) in Server Components.
 * Redirects unauthenticated users to `/login` and wrong-role users to their role home.
 */
export async function requireUser(expectedRole?: UserRole): Promise<UserDto> {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  if (expectedRole && user.role !== expectedRole) {
    redirect(getDefaultRouteForRole(user.role));
  }
  return user;
}
