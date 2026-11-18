import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { SlotPickerClient } from "@/components/client/SlotPickerClient";
import { AlertBanner } from "@/components/ui";
import {
  ApiError,
  getAvailableSlots,
  getProviderSchedule,
} from "@/lib/backend-api";
import { getTodayInTimezone, isValidIsoDate } from "@/lib/date-utils";
import { requireUser } from "@/lib/session";
import type {
  AvailableSlotsResponse,
  ProviderScheduleResponse,
} from "@/types/api";

export default async function ProviderDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ date?: string }>;
}) {
  await requireUser("CLIENT");
  const { id } = await params;
  const query = await searchParams;

  let schedule: ProviderScheduleResponse | null = null;
  let initialSlots: AvailableSlotsResponse | null = null;
  let todayInProviderTz = getTodayInTimezone("UTC");
  let loadError: string | null = null;

  try {
    schedule = await getProviderSchedule(id);
    todayInProviderTz = getTodayInTimezone(schedule.timezone);
    const targetDate = isValidIsoDate(query.date)
      ? query.date
      : todayInProviderTz;
    initialSlots = await getAvailableSlots(id, targetDate);
  } catch (err) {
    loadError =
      err instanceof ApiError
        ? err.message
        : "Unable to load this provider's availability right now.";
  }

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 space-y-6 px-4 py-8 sm:px-6">
      <div>
        <Link
          href="/providers"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-completed transition-colors hover:text-brand"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to Providers
        </Link>
      </div>

      {loadError || !schedule || !initialSlots ? (
        <AlertBanner
          tone="error"
          title="Provider unavailable"
          message={loadError ?? "Could not find this provider."}
          action={
            <Link
              href="/providers"
              className="inline-flex h-8 items-center rounded-md bg-brand px-3 text-xs font-medium text-white hover:bg-brand/90"
            >
              Browse Providers
            </Link>
          }
        />
      ) : (
        <SlotPickerClient
          schedule={schedule}
          initialSlots={initialSlots}
          todayInProviderTz={todayInProviderTz}
        />
      )}
    </main>
  );
}
