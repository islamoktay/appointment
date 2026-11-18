import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ScheduleEditor } from "@/components/provider/ScheduleEditor";
import { AlertBanner } from "@/components/ui";
import { ApiError, getProviderSchedule } from "@/lib/backend-api";
import { requireUser } from "@/lib/session";
import type { ProviderScheduleResponse } from "@/types/api";

export default async function ProviderSchedulePage() {
  const user = await requireUser("PROVIDER");

  let schedule: ProviderScheduleResponse | null = null;
  let loadError: string | null = null;

  try {
    schedule = await getProviderSchedule(user.id);
  } catch (err) {
    loadError =
      err instanceof ApiError
        ? err.message
        : "Unable to load your weekly schedule.";
  }

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 space-y-6 px-4 py-8 sm:px-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-completed">
            Provider Workspace
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-brand sm:text-3xl">
            Weekly Schedule
          </h1>
          <p className="mt-1 text-sm text-completed">
            Define your working shifts and slot duration so clients can book
            real-time open times.
          </p>
        </div>
        <Link
          href="/provider/dashboard"
          className="inline-flex h-10 items-center justify-center gap-2 self-start rounded-md border border-slate-300 bg-white px-4 text-sm font-medium text-brand transition-colors hover:bg-surface"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to Daily Queue
        </Link>
      </div>

      {loadError || !schedule ? (
        <AlertBanner
          tone="error"
          title="Could not load schedule"
          message={loadError ?? "Schedule data is unavailable right now."}
        />
      ) : (
        <ScheduleEditor initialSchedule={schedule} />
      )}
    </main>
  );
}
