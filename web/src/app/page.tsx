import Link from "next/link";
import {
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  Clock,
  ShieldCheck,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui";
import { getDefaultRouteForRole } from "@/lib/date-utils";
import { getCurrentUser } from "@/lib/session";

export default async function HomePage() {
  const user = await getCurrentUser();
  const dashboardHref = user ? getDefaultRouteForRole(user.role) : "/register";

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center px-4 py-12 sm:px-6 sm:py-16">
      <header className="mb-12 space-y-5">
        <span className="inline-flex items-center gap-2 rounded-md bg-brand px-3 py-1 text-xs font-medium text-white">
          <CalendarClock className="h-4 w-4" aria-hidden="true" />
          Appointment &amp; Queue Booking Portal
        </span>
        <h1 className="text-3xl font-semibold tracking-tight text-brand sm:text-5xl">
          Real-time scheduling without double-bookings.
        </h1>
        <p className="max-w-2xl text-base text-completed sm:text-lg">
          Dual-role workspace connecting service providers and clients with live
          timezone-aware availability calculation and concurrency-safe queue
          management.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          {user ? (
            <Link
              href={dashboardHref}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-brand px-5 text-sm font-medium text-white transition-colors hover:bg-brand/90"
            >
              Open{" "}
              {user.role === "PROVIDER"
                ? "Provider Dashboard"
                : "Provider Directory"}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          ) : (
            <>
              <Link
                href="/register"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-brand px-5 text-sm font-medium text-white transition-colors hover:bg-brand/90"
              >
                Create free account
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link
                href="/login"
                className="inline-flex h-11 items-center justify-center rounded-md border border-slate-300 bg-white px-5 text-sm font-medium text-brand transition-colors hover:bg-surface"
              >
                Sign in
              </Link>
            </>
          )}
        </div>
      </header>

      <section
        aria-label="Platform capabilities"
        className="grid gap-6 md:grid-cols-2"
      >
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-confirmed/10 text-confirmed">
              <Clock className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-brand">
                Provider Workspace
              </h2>
              <p className="mt-1.5 text-sm text-completed">
                Configure weekly working hours, define 15, 30, or 60-minute slot
                durations, and run your daily appointment queue from
                confirmation to completion.
              </p>
            </div>
            <ul className="space-y-1.5 text-xs text-completed">
              <li className="flex items-center gap-2">
                <CheckCircle2
                  className="h-3.5 w-3.5 text-confirmed shrink-0"
                  aria-hidden="true"
                />
                Atomic weekly availability &amp; IANA timezone controls
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2
                  className="h-3.5 w-3.5 text-confirmed shrink-0"
                  aria-hidden="true"
                />
                Live queue transitions: Start, Complete, or Cancel
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-pending/10 text-pending">
              <ShieldCheck className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-brand">
                Client Booking Hub
              </h2>
              <p className="mt-1.5 text-sm text-completed">
                Discover active providers, inspect real-time open slots by date,
                and manage upcoming or past appointments in one place.
              </p>
            </div>
            <ul className="space-y-1.5 text-xs text-completed">
              <li className="flex items-center gap-2">
                <CheckCircle2
                  className="h-3.5 w-3.5 text-confirmed shrink-0"
                  aria-hidden="true"
                />
                Database-enforced slot locking with instant 409 conflict refresh
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2
                  className="h-3.5 w-3.5 text-confirmed shrink-0"
                  aria-hidden="true"
                />
                Self-service upcoming/past history and cancellation
              </li>
            </ul>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
