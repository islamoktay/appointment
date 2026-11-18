import type { UserRole } from "@/types/api";

export interface DecodedJwtHint {
  sub: string;
  role: UserRole;
  exp: number;
}

/**
 * Decodes the JWT payload without signature verification strictly for fast
 * edge routing hints (redirects). Authorization and identity verification
 * ALWAYS happen server-side via Spring Boot `/api/auth/me` and `@PreAuthorize`.
 */
export function decodeJwtHint(token: string | undefined): DecodedJwtHint | null {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;

  try {
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
    const json =
      typeof atob === "function"
        ? atob(padded)
        : Buffer.from(padded, "base64").toString("utf-8");
    const payload = JSON.parse(json) as {
      sub?: unknown;
      role?: unknown;
      exp?: unknown;
    };

    if (
      typeof payload.sub !== "string" ||
      (payload.role !== "PROVIDER" && payload.role !== "CLIENT") ||
      typeof payload.exp !== "number"
    ) {
      return null;
    }

    const nowSeconds = Math.floor(Date.now() / 1000);
    if (payload.exp <= nowSeconds) {
      return null;
    }

    return {
      sub: payload.sub,
      role: payload.role,
      exp: payload.exp,
    };
  } catch {
    return null;
  }
}
