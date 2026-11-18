"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Play,
  RefreshCw,
  SlidersHorizontal,
  User,
  XCircle,
} from "lucide-react";
import {
  cancelAppointmentAction,
  completeAppointmentAction,
  startAppointmentAction,
} from "@/app/actions/appointments";
import {
  AlertBanner,
  AppointmentStatusBadge,
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  EmptyState,
  Modal,
} from "@/components/ui";
import { formatLocalDate, shiftIsoDate } from "@/lib/date-utils";
import type {
  AppointmentResponse,
  AppointmentStatus,
  ScheduleDayDto,
} from "@/types/api";

interface DailyQueueClientProps {
  selectedDate: string;
  todayDate: string;
  providerTimezone: string;
  dayShift: ScheduleDayDto | null;
  hasAnySchedule: boolean;
  initialAppointments: AppointmentResponse[];
}

export function DailyQueueClient({
  selectedDate,
  todayDate,
  providerTimezone,
  dayShift,
  hasAnySchedule,
  initialAppointments,
}: DailyQueueClientProps) {
  const router = useRouter();
  const [optimisticAppointments, applyOptimisticStatus] = React.useOptimistic<
    AppointmentResponse[],
    { id: string; status: AppointmentStatus }
  >(initialAppointments, (state, update) =>
    state.map((appt) =>
      appt.id === update.id ? { ...appt, status: update.status } : appt,
    ),
  );

  const [isPending, startTransition] = React.useTransition();
  const [busyId, setBusyId] = React.useState<string | null>(null);
  const [cancelTarget, setCancelTarget] =
    React.useState<AppointmentResponse | null>(null);
  const [feedback, setFeedback] = React.useState<{
    tone: "success" | "error" | "conflict";
    message: string;
  } | null>(null);

  function navigateToDate(nextDate: string) {
    setFeedback(null);
    router.push(`/provider/dashboard?date=${encodeURIComponent(nextDate)}`);
  }

  function runTransition(
    appointment: AppointmentResponse,
    targetStatus: AppointmentStatus,
    action: (id: string) => ReturnType<typeof startAppointmentAction>,
    successMessage: string,
  ) {
    setFeedback(null);
    setBusyId(appointment.id);

    startTransition(async () => {
      applyOptimisticStatus({ id: appointment.id, status: targetStatus });
      const result = await action(appointment.id);
      setBusyId(null);

      if (!result.ok) {
        setFeedback({
          tone: result.status === 409 ? "conflict" : "error",
          message: result.message,
        });
        router.refresh();
        return;
      }

      setFeedback({ tone: "success", message: successMessage });
      router.refresh();
    });
  }

  const confirmedCount = optimisticAppointments.filter(
    (a) => a.status === "CONFIRMED",
  ).length;
  const inProgressCount = optimisticAppointments.filter(
    (a) => a.status === "IN_PROGRESS",
  ).length;
  const completedCount = optimisticAppointments.filter(
    (a) => a.status === "COMPLETED",
  ).length;
  const cancelledCount = optimisticAppointments.filter(
    (a) => a.status === "CANCELLED",
  ).length;

  let activeQueueCounter = 0;

  return (
    <div className="space-y-6">
      {!hasAnySchedule && (
        <AlertBanner
          tone="info"
          title="Set up your weekly availability"
          message="You haven't configured working hours yet. Clients will see open time slots once you publish your weekly schedule."
          action={
            <Link
              href="/provider/schedule"
              className="inline-flex h-8 items-center justify-center rounded-md bg-brand px-3 text-xs font-medium text-white hover:bg-brand/90"
            >
              Configure Schedule
            </Link>
          }
        />
      )}

      <Card>
        <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              aria-label="Previous day"
              onClick={() => navigateToDate(shiftIsoDate(selectedDate, -1))}
            >
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            </Button>

            <label className="relative inline-flex items-center">
              <span className="sr-only">Select queue date</span>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => {
                  if (e.target.value) navigateToDate(e.target.value);
                }}
                className="h-8 rounded-md border border-slate-300 bg-white px-2.5 text-sm font-medium text-brand focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
              />
            </label>

            <Button
              variant="outline"
              size="sm"
              aria-label="Next day"
              onClick={() => navigateToDate(shiftIsoDate(selectedDate, 1))}
            >
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </Button>

            {selectedDate !== todayDate && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => navigateToDate(todayDate)}
              >
                Today
              </Button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs text-completed">
            {dayShift ? (
              <Badge variant="confirmed">
                <Clock className="h-3 w-3" aria-hidden="true" />
                Shift {dayShift.startTime.slice(0, 5)}–
                {dayShift.endTime.slice(0, 5)} ({dayShift.slotDurationMinutes}m
                slots)
              </Badge>
            ) : (
              <Badge variant="neutral">No shift configured on this day</Badge>
            )}
            <Badge variant="neutral">{providerTimezone}</Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.refresh()}
              aria-label="Refresh queue"
            >
              <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs font-medium text-completed">Confirmed</p>
            <p className="mt-1 text-2xl font-semibold text-confirmed">
              {confirmedCount}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs font-medium text-completed">In Progress</p>
            <p className="mt-1 text-2xl font-semibold text-pending">
              {inProgressCount}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs font-medium text-completed">Completed</p>
            <p className="mt-1 text-2xl font-semibold text-completed">
              {completedCount}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs font-medium text-completed">Cancelled</p>
            <p className="mt-1 text-2xl font-semibold text-cancelled">
              {cancelledCount}
            </p>
          </CardContent>
        </Card>
      </div>

      {feedback && (
        <AlertBanner tone={feedback.tone} message={feedback.message} />
      )}

      <Card>
        <CardHeader className="flex-row items-center justify-between gap-4">
          <div>
            <CardTitle>{formatLocalDate(selectedDate)}</CardTitle>
            <CardDescription>
              {optimisticAppointments.length === 0
                ? "No bookings recorded for this date."
                : `${optimisticAppointments.length} appointment${optimisticAppointments.length === 1 ? "" : "s"} ordered chronologically by start time.`}
            </CardDescription>
          </div>
          <Link
            href="/provider/schedule"
            className="hidden sm:inline-flex h-8 items-center gap-1.5 rounded-md border border-slate-200 px-3 text-xs font-medium text-brand hover:bg-surface"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden="true" />
            Edit Hours
          </Link>
        </CardHeader>

        <CardContent>
          {optimisticAppointments.length === 0 ? (
            <EmptyState
              icon={<Calendar className="h-6 w-6" aria-hidden="true" />}
              title="No appointments scheduled for this date"
              description={
                dayShift
                  ? "Your shift is open and ready. Bookings from clients will appear here in chronological queue order."
                  : "No working hours are set for this day of the week. Update your weekly schedule to accept bookings."
              }
              action={
                !dayShift ? (
                  <Link
                    href="/provider/schedule"
                    className="inline-flex h-9 items-center justify-center rounded-md bg-brand px-4 text-sm font-medium text-white hover:bg-brand/90"
                  >
                    Configure Weekly Schedule
                  </Link>
                ) : undefined
              }
            />
          ) : (
            <ol className="divide-y divide-slate-100">
              {optimisticAppointments.map((appt) => {
                const isActive =
                  appt.status === "CONFIRMED" || appt.status === "IN_PROGRESS";
                const queueNumber = isActive ? ++activeQueueCounter : null;
                const rowBusy = isPending && busyId === appt.id;

                return (
                  <li
                    key={appt.id}
                    className={[
                      "flex flex-col gap-3 py-4 first:pt-1 last:pb-1 sm:flex-row sm:items-center sm:justify-between",
                      !isActive ? "opacity-75" : "",
                    ].join(" ")}
                  >
                    <div className="flex items-start gap-3.5">
                      <div
                        className={[
                          "flex h-10 w-10 shrink-0 items-center justify-center rounded-md font-mono text-sm font-semibold",
                          appt.status === "IN_PROGRESS"
                            ? "bg-pending/15 text-pending"
                            : appt.status === "CONFIRMED"
                              ? "bg-brand text-white"
                              : "bg-surface text-completed",
                        ].join(" ")}
                      >
                        {queueNumber !== null ? `#${queueNumber}` : "—"}
                      </div>

                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-sm font-semibold text-brand">
                            {appt.startTime.slice(0, 5)} –{" "}
                            {appt.endTime.slice(0, 5)}
                          </span>
                          <AppointmentStatusBadge status={appt.status} />
                        </div>
                        <p className="flex items-center gap-1.5 text-sm text-completed">
                          <User className="h-3.5 w-3.5" aria-hidden="true" />
                          <span className="font-medium text-brand">
                            {appt.clientName}
                          </span>
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                      {appt.status === "CONFIRMED" && (
                        <Button
                          variant="pending"
                          size="sm"
                          loading={rowBusy}
                          disabled={isPending && !rowBusy}
                          onClick={() =>
                            runTransition(
                              appt,
                              "IN_PROGRESS",
                              startAppointmentAction,
                              `Started ${appt.clientName}'s appointment (${appt.startTime.slice(0, 5)}).`,
                            )
                          }
                        >
                          <Play className="h-3.5 w-3.5" aria-hidden="true" />
                          Start
                        </Button>
                      )}

                      {appt.status === "IN_PROGRESS" && (
                        <Button
                          variant="confirmed"
                          size="sm"
                          loading={rowBusy}
                          disabled={isPending && !rowBusy}
                          onClick={() =>
                            runTransition(
                              appt,
                              "COMPLETED",
                              completeAppointmentAction,
                              `Completed ${appt.clientName}'s appointment.`,
                            )
                          }
                        >
                          <CheckCircle2
                            className="h-3.5 w-3.5"
                            aria-hidden="true"
                          />
                          Complete
                        </Button>
                      )}

                      {isActive && (
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={isPending}
                          onClick={() => setCancelTarget(appt)}
                          className="text-cancelled hover:border-cancelled/40 hover:bg-cancelled/5"
                        >
                          <XCircle className="h-3.5 w-3.5" aria-hidden="true" />
                          Cancel
                        </Button>
                      )}

                      {!isActive && (
                        <span className="text-xs text-completed">
                          {appt.status === "COMPLETED"
                            ? "Archived"
                            : "Slot reopened if in future"}
                        </span>
                      )}
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
        </CardContent>
      </Card>

      <Modal
        open={cancelTarget !== null}
        onClose={() => setCancelTarget(null)}
        title="Cancel appointment?"
        description="Cancelling frees this time slot for other clients if it is still in the future."
        footer={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCancelTarget(null)}
            >
              Keep booking
            </Button>
            <Button
              variant="danger"
              size="sm"
              loading={isPending && busyId === cancelTarget?.id}
              onClick={() => {
                if (!cancelTarget) return;
                const target = cancelTarget;
                setCancelTarget(null);
                runTransition(
                  target,
                  "CANCELLED",
                  cancelAppointmentAction,
                  `Cancelled ${target.clientName}'s appointment (${target.startTime.slice(0, 5)}).`,
                );
              }}
            >
              Confirm cancel
            </Button>
          </>
        }
      >
        {cancelTarget && (
          <div className="rounded-xl border border-slate-200 bg-surface p-3.5 space-y-1">
            <p className="font-semibold text-brand">
              {cancelTarget.clientName}
            </p>
            <p className="text-xs text-completed">
              {formatLocalDate(cancelTarget.appointmentDate)} ·{" "}
              <span className="font-mono">
                {cancelTarget.startTime.slice(0, 5)} –{" "}
                {cancelTarget.endTime.slice(0, 5)}
              </span>
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
}
