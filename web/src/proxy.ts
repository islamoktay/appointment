import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE_NAME } from "@/lib/constants";
import { getDefaultRouteForRole } from "@/lib/date-utils";
import { decodeJwtHint } from "@/lib/jwt-payload";

const AUTH_ROUTES = ["/login", "/register"];
const PROVIDER_PREFIXES = ["/provider"];
const CLIENT_PREFIXES = ["/providers", "/my-bookings"];

function matchesPrefix(pathname: string, prefixes: string[]): boolean {
  return prefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

/**
 * Next.js 16 Proxy (formerly Middleware) enforcing fast role-aware route guards
 * using the HttpOnly JWT cookie. Full cryptographic verification is always
 * enforced server-side by Spring Boot via `requireUser()` and `@PreAuthorize`.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = decodeJwtHint(token);

  const isAuthRoute = AUTH_ROUTES.includes(pathname);
  const isProviderRoute = matchesPrefix(pathname, PROVIDER_PREFIXES);
  const isClientRoute = matchesPrefix(pathname, CLIENT_PREFIXES);

  if (isAuthRoute) {
    if (session) {
      return NextResponse.redirect(
        new URL(getDefaultRouteForRole(session.role), request.url),
      );
    }
    return NextResponse.next();
  }

  if (isProviderRoute || isClientRoute) {
    if (!session) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("next", pathname);
      const response = NextResponse.redirect(loginUrl);
      if (token) {
        response.cookies.delete(SESSION_COOKIE_NAME);
      }
      return response;
    }

    if (isProviderRoute && session.role !== "PROVIDER") {
      return NextResponse.redirect(
        new URL(getDefaultRouteForRole(session.role), request.url),
      );
    }

    if (isClientRoute && session.role !== "CLIENT") {
      return NextResponse.redirect(
        new URL(getDefaultRouteForRole(session.role), request.url),
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/login",
    "/register",
    "/provider/:path*",
    "/providers",
    "/providers/:path*",
    "/my-bookings",
    "/my-bookings/:path*",
  ],
};
