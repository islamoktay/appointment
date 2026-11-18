import Link from "next/link";
import { CalendarPlus } from "lucide-react";
import { MyBookingsClient } from "@/components/client/MyBookingsClient";
import { AlertBanner } from "@/components/ui";
import { ApiError, listMyAppointments } from "@/lib/backend-api";
import { requireUser } from "@/lib/session";
import type { AppointmentResponse } from "@/types/api";

export default async function MyBookingsPage() {
  await requireUser("CLIENT");

  let appointments: AppointmentResponse[] = [];
  let loadError: string | null = null;

  try {
    appointments = await listMyAppointments();
  } catch (err) {
    loadError =
      err instanceof ApiError
        ? err.message
        : "Unable to load your bookings right now.";
  }

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 space-y-6 px-4 py-8 sm:px-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-completed">
            Client Appointment Hub
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-brand sm:text-3xl">
            My Bookings
          </h1>
          <p className="mt-1 text-sm text-completed">
            View upcoming reservations, monitor live session status, or cancel
            bookings.
          </p>
        </div>

        <Link
          href="/providers"
          className="inline-flex h-10 items-center justify-center gap-2 self-start rounded-md bg-brand px-4 text-sm font-medium text-white transition-colors hover:bg-brand/90"
        >
          <CalendarPlus className="h-4 w-4" aria-hidden="true" />
          Book New Appointment
        </Link>
      </div>

      {loadError ? (
        <AlertBanner
          tone="error"
          title="Could not load bookings"
          message={loadError}
        />
      ) : (
        <MyBookingsClient initialAppointments={appointments} />
      )}
    </main>
  );
}
