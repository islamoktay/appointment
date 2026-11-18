"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Briefcase, User, UserPlus } from "lucide-react";
import {
  AlertBanner,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Select,
} from "@/components/ui";
import { COMMON_TIMEZONES, getDefaultRouteForRole } from "@/lib/date-utils";
import type { ApiErrorEnvelope, UserDto, UserRole } from "@/types/api";

const subscribeNoop = () => () => {};

function getBrowserTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
}

export function RegisterForm() {
  const router = useRouter();
  const [fullName, setFullName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [role, setRole] = React.useState<UserRole>("CLIENT");
  const detectedTimezone = React.useSyncExternalStore(
    subscribeNoop,
    getBrowserTimezone,
    () => "UTC",
  );
  const [selectedTimezone, setSelectedTimezone] = React.useState<string | null>(
    null,
  );
  const timezone = selectedTimezone ?? detectedTimezone;
  const timezoneOptions = React.useMemo(() => {
    if (COMMON_TIMEZONES.includes(detectedTimezone)) {
      return COMMON_TIMEZONES;
    }
    return [detectedTimezone, ...COMMON_TIMEZONES];
  }, [detectedTimezone]);
  const [submitting, setSubmitting] = React.useState(false);
  const [formError, setFormError] = React.useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string>>(
    {},
  );

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    const localErrors: Record<string, string> = {};
    const trimmedName = fullName.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName) {
      localErrors.fullName = "Full name is required.";
    } else if (trimmedName.length > 100) {
      localErrors.fullName = "Full name must be 100 characters or fewer.";
    }

    if (!trimmedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      localErrors.email = "Enter a valid email address.";
    }

    if (password.length < 8) {
      localErrors.password = "Password must be at least 8 characters.";
    } else if (password.length > 72) {
      localErrors.password = "Password must be at most 72 characters.";
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
          mode: "register",
          fullName: trimmedName,
          email: trimmedEmail,
          password,
          role,
          timezone,
        }),
      });

      const payload = (await response.json()) as
        | { user: UserDto }
        | Partial<ApiErrorEnvelope>;

      if (!response.ok || !("user" in payload)) {
        const err = payload as Partial<ApiErrorEnvelope>;
        setFormError(err.message ?? "Could not create account.");
        if (err.fieldErrors) {
          setFieldErrors(err.fieldErrors);
        }
        return;
      }

      router.push(getDefaultRouteForRole(payload.user.role));
      router.refresh();
    } catch {
      setFormError("Unable to reach the server. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <CardTitle>Create your QueueBook account</CardTitle>
        <CardDescription>
          Choose whether you are booking appointments or managing a daily
          service queue.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          {formError && <AlertBanner tone="error" message={formError} />}

          <fieldset className="space-y-2">
            <legend className="text-sm font-medium text-brand">
              Account role <span className="text-cancelled">*</span>
            </legend>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole("CLIENT")}
                aria-pressed={role === "CLIENT"}
                className={[
                  "flex flex-col items-start gap-1 rounded-xl border p-3.5 text-left transition-colors cursor-pointer",
                  role === "CLIENT"
                    ? "border-brand bg-brand/5 ring-1 ring-brand"
                    : "border-slate-200 bg-white hover:bg-surface",
                ].join(" ")}
              >
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-confirmed/10 text-confirmed">
                  <User className="h-4 w-4" aria-hidden="true" />
                </span>
                <span className="text-sm font-semibold text-brand">Client</span>
                <span className="text-xs text-completed">
                  Browse providers &amp; book slots
                </span>
              </button>

              <button
                type="button"
                onClick={() => setRole("PROVIDER")}
                aria-pressed={role === "PROVIDER"}
                className={[
                  "flex flex-col items-start gap-1 rounded-xl border p-3.5 text-left transition-colors cursor-pointer",
                  role === "PROVIDER"
                    ? "border-brand bg-brand/5 ring-1 ring-brand"
                    : "border-slate-200 bg-white hover:bg-surface",
                ].join(" ")}
              >
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-brand text-white">
                  <Briefcase className="h-4 w-4" aria-hidden="true" />
                </span>
                <span className="text-sm font-semibold text-brand">
                  Provider
                </span>
                <span className="text-xs text-completed">
                  Set weekly hours &amp; run queue
                </span>
              </button>
            </div>
            {fieldErrors.role && (
              <p role="alert" className="text-xs text-cancelled">
                {fieldErrors.role}
              </p>
            )}
          </fieldset>

          <Input
            label="Full name"
            name="fullName"
            type="text"
            autoComplete="name"
            placeholder={
              role === "PROVIDER" ? "Dr. Jane Smith" : "Alex Morgan"
            }
            maxLength={100}
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            error={fieldErrors.fullName}
          />

          <Input
            label="Email address"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            maxLength={255}
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={fieldErrors.email}
          />

          <Input
            label="Password"
            name="password"
            type="password"
            autoComplete="new-password"
            placeholder="At least 8 characters"
            hint="Use 8 to 72 characters."
            minLength={8}
            maxLength={72}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={fieldErrors.password}
          />

          <Select
            label="IANA Timezone"
            name="timezone"
            value={timezone}
            onChange={(e) => setSelectedTimezone(e.target.value)}
            hint="Used to calculate daily working windows and past-slot cutoffs."
            error={fieldErrors.timezone}
          >
            {timezoneOptions.map((tz) => (
              <option key={tz} value={tz}>
                {tz}
              </option>
            ))}
          </Select>

          <Button type="submit" fullWidth loading={submitting} size="lg">
            <UserPlus className="h-4 w-4" aria-hidden="true" />
            Create {role === "PROVIDER" ? "Provider" : "Client"} Account
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-completed">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-brand underline-offset-4 hover:underline"
          >
            Sign in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
