import Link from "next/link";
import { SlidersHorizontal } from "lucide-react";
import { DailyQueueClient } from "@/components/provider/DailyQueueClient";
import { AlertBanner } from "@/components/ui";
import {
  ApiError,
  getProviderSchedule,
  listMyAppointments,
} from "@/lib/backend-api";
import {
  getIsoDayOfWeek,
  getTodayInTimezone,
  isValidIsoDate,
} from "@/lib/date-utils";
import { requireUser } from "@/lib/session";
import type {
  AppointmentResponse,
  ProviderScheduleResponse,
} from "@/types/api";

export default async function ProviderDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const user = await requireUser("PROVIDER");
  const params = await searchParams;
  const todayDate = getTodayInTimezone(user.timezone);
  const selectedDate = isValidIsoDate(params.date) ? params.date : todayDate;

  let appointments: AppointmentResponse[] = [];
  let schedule: ProviderScheduleResponse | null = null;
  let loadError: string | null = null;

  try {
    [appointments, schedule] = await Promise.all([
      listMyAppointments({ date: selectedDate }),
      getProviderSchedule(user.id),
    ]);
  } catch (err) {
    loadError =
      err instanceof ApiError
        ? err.message
        : "Unable to load your daily appointment queue.";
  }

  const dayOfWeek = getIsoDayOfWeek(selectedDate);
  const dayShift =
    schedule?.days.find((d) => d.dayOfWeek === dayOfWeek) ?? null;

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 space-y-6 px-4 py-8 sm:px-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-completed">
            Provider Operational Dashboard
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-brand sm:text-3xl">
            Daily Queue
          </h1>
          <p className="mt-1 text-sm text-completed">
            Track live client bookings and move appointments from confirmation
            through completion.
          </p>
        </div>

        <Link
          href="/provider/schedule"
          className="inline-flex h-10 items-center justify-center gap-2 self-start rounded-md bg-brand px-4 text-sm font-medium text-white transition-colors hover:bg-brand/90"
        >
          <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
          Weekly Schedule
        </Link>
      </div>

      {loadError ? (
        <AlertBanner
          tone="error"
          title="Could not load daily queue"
          message={loadError}
        />
      ) : (
        <DailyQueueClient
          selectedDate={selectedDate}
          todayDate={todayDate}
          providerTimezone={schedule?.timezone ?? user.timezone}
          dayShift={dayShift}
          hasAnySchedule={(schedule?.days.length ?? 0) > 0}
          initialAppointments={appointments}
        />
      )}
    </main>
  );
}
