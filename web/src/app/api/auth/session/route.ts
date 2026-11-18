import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  ApiError,
  SESSION_COOKIE_NAME,
  authLogin,
  authMe,
  authRegister,
} from "@/lib/backend-api";
import { buildSessionCookieOptions } from "@/lib/session";
import type { LoginRequest, RegisterRequest, UserRole } from "@/types/api";

interface SessionPostBody {
  mode?: "login" | "register";
  email?: string;
  password?: string;
  fullName?: string;
  role?: UserRole;
  timezone?: string;
}

export async function GET(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!token) {
    return NextResponse.json(
      {
        status: 401,
        error: "UNAUTHORIZED",
        message: "Not authenticated.",
        path: "/api/auth/session",
        fieldErrors: {},
      },
      { status: 401 },
    );
  }

  try {
    const user = await authMe(token);
    return NextResponse.json({ user }, { status: 200 });
  } catch (err) {
    const status = err instanceof ApiError ? err.status : 500;
    const response = NextResponse.json(
      err instanceof ApiError
        ? {
            status: err.status,
            error: err.error,
            message: err.message,
            path: "/api/auth/session",
            fieldErrors: err.fieldErrors,
          }
        : {
            status: 500,
            error: "INTERNAL_ERROR",
            message: "Unable to verify session.",
            path: "/api/auth/session",
            fieldErrors: {},
          },
      { status },
    );
    if (status === 401 || status === 403) {
      response.cookies.delete(SESSION_COOKIE_NAME);
    }
    return response;
  }
}

export async function POST(request: NextRequest) {
  let body: SessionPostBody;
  try {
    body = (await request.json()) as SessionPostBody;
  } catch {
    return NextResponse.json(
      {
        status: 400,
        error: "BAD_REQUEST",
        message: "Invalid JSON request body.",
        path: "/api/auth/session",
        fieldErrors: {},
      },
      { status: 400 },
    );
  }

  const mode = body.mode ?? "login";

  try {
    const authResponse =
      mode === "register"
        ? await authRegister({
            email: (body.email ?? "").trim(),
            password: body.password ?? "",
            fullName: (body.fullName ?? "").trim(),
            role: body.role as UserRole,
            timezone: body.timezone?.trim() || undefined,
          } satisfies RegisterRequest)
        : await authLogin({
            email: (body.email ?? "").trim(),
            password: body.password ?? "",
          } satisfies LoginRequest);

    const status = mode === "register" ? 201 : 200;
    const response = NextResponse.json(
      { user: authResponse.user },
      { status },
    );

    const cookieOptions = buildSessionCookieOptions(
      authResponse.expiresIn > 0 ? authResponse.expiresIn : 86400,
    );
    response.cookies.set(
      cookieOptions.name,
      authResponse.accessToken,
      cookieOptions,
    );

    return response;
  } catch (err) {
    if (err instanceof ApiError) {
      return NextResponse.json(
        {
          status: err.status,
          error: err.error,
          message: err.message,
          path: err.path || "/api/auth/session",
          fieldErrors: err.fieldErrors,
        },
        { status: err.status },
      );
    }

    return NextResponse.json(
      {
        status: 500,
        error: "INTERNAL_ERROR",
        message: "Authentication request failed.",
        path: "/api/auth/session",
        fieldErrors: {},
      },
      { status: 500 },
    );
  }
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true }, { status: 200 });
  response.cookies.set(SESSION_COOKIE_NAME, "", {
    ...buildSessionCookieOptions(0),
    maxAge: 0,
  });
  return response;
}
