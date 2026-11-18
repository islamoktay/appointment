"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogIn } from "lucide-react";
import {
  AlertBanner,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
} from "@/components/ui";
import { getDefaultRouteForRole } from "@/lib/date-utils";
import type { ApiErrorEnvelope, UserDto } from "@/types/api";

function getSafeRedirectPath(
  nextParam: string | undefined,
  role: UserDto["role"],
): string {
  if (!nextParam || !nextParam.startsWith("/") || nextParam.startsWith("//")) {
    return getDefaultRouteForRole(role);
  }
  if (role === "PROVIDER" && nextParam.startsWith("/provider")) {
    return nextParam;
  }
  if (
    role === "CLIENT" &&
    (nextParam.startsWith("/providers") || nextParam.startsWith("/my-bookings"))
  ) {
    return nextParam;
  }
  return getDefaultRouteForRole(role);
}

export function LoginForm({ nextPath }: { nextPath?: string }) {
  const router = useRouter();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [formError, setFormError] = React.useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string>>(
    {},
  );

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    const localErrors: Record<string, string> = {};
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      localErrors.email = "Enter a valid email address.";
    }
    if (!password) {
      localErrors.password = "Password is required.";
    }
    if (Object.keys(localErrors).length > 0) {
      setFieldErrors(localErrors);
      return;
    }

    setFieldErrors({});
    setSubmitting(true);

    try {
      const response = await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "login",
          email: trimmedEmail,
          password,
        }),
      });

      const payload = (await response.json()) as
        | { user: UserDto }
        | Partial<ApiErrorEnvelope>;

      if (!response.ok || !("user" in payload)) {
        const err = payload as Partial<ApiErrorEnvelope>;
        setFormError(err.message ?? "Invalid email or password.");
        if (err.fieldErrors) {
          setFieldErrors(err.fieldErrors);
        }
        return;
      }

      const target = getSafeRedirectPath(nextPath, payload.user.role);
      router.push(target);
      router.refresh();
    } catch {
      setFormError("Unable to reach the server. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Sign in to QueueBook</CardTitle>
        <CardDescription>
          Enter your credentials to access your provider or client workspace.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          {formError && <AlertBanner tone="error" message={formError} />}

          <Input
            label="Email address"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={fieldErrors.email}
          />

          <Input
            label="Password"
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={fieldErrors.password}
          />

          <Button type="submit" fullWidth loading={submitting} size="lg">
            <LogIn className="h-4 w-4" aria-hidden="true" />
            Sign in
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-completed">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="font-medium text-brand underline-offset-4 hover:underline"
          >
            Create one
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
