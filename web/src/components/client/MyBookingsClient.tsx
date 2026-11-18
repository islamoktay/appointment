"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Calendar,
  CalendarPlus,
  Clock,
  Globe,
  History,
  XCircle,
} from "lucide-react";
import { cancelAppointmentAction } from "@/app/actions/appointments";
import {
  AlertBanner,
  AppointmentStatusBadge,
  Badge,
  Button,
  Card,
  CardContent,
  EmptyState,
  Modal,
} from "@/components/ui";
import { formatLocalDate } from "@/lib/date-utils";
import type { AppointmentResponse } from "@/types/api";

type TabKey = "upcoming" | "past";

export function MyBookingsClient({
  initialAppointments,
}: {
  initialAppointments: AppointmentResponse[];
}) {
  const router = useRouter();
  const [optimisticAppointments, applyOptimisticCancel] = React.useOptimistic<
    AppointmentResponse[],
    string
  >(initialAppointments, (state, cancelledId) =>
    state.map((appt) =>
      appt.id === cancelledId ? { ...appt, status: "CANCELLED" } : appt,
    ),
  );
  const [activeTab, setActiveTab] = React.useState<TabKey>("upcoming");
  const [cancelTarget, setCancelTarget] =
    React.useState<AppointmentResponse | null>(null);
  const [cancelling, startTransition] = React.useTransition();
  const [feedback, setFeedback] = React.useState<{
    tone: "success" | "error" | "conflict";
    message: string;
  } | null>(null);

  const upcoming = React.useMemo(
    () =>
      optimisticAppointments.filter(
        (a) => a.status === "CONFIRMED" || a.status === "IN_PROGRESS",
      ),
    [optimisticAppointments],
  );

  const past = React.useMemo(
    () =>
      optimisticAppointments
        .filter((a) => a.status === "COMPLETED" || a.status === "CANCELLED")
        .slice()
        .reverse(),
    [optimisticAppointments],
  );

  const visibleList = activeTab === "upcoming" ? upcoming : past;

  function handleConfirmCancel() {
    if (!cancelTarget) return;
    const target = cancelTarget;
    setFeedback(null);

    startTransition(async () => {
      applyOptimisticCancel(target.id);
      const result = await cancelAppointmentAction(target.id);
      setCancelTarget(null);

      if (!result.ok) {
        setFeedback({
          tone: result.status === 409 ? "conflict" : "error",
          message: result.message,
        });
        router.refresh();
        return;
      }

      setFeedback({
        tone: "success",
        message: `Cancelled your appointment with ${target.providerName} on ${formatLocalDate(target.appointmentDate)} at ${target.startTime.slice(0, 5)}.`,
      });
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      {feedback && (
        <AlertBanner tone={feedback.tone} message={feedback.message} />
      )}

      <div
        role="tablist"
        aria-label="Booking history tabs"
        className="inline-flex rounded-xl border border-slate-200 bg-white p-1 shadow-xs"
      >
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "upcoming"}
          onClick={() => setActiveTab("upcoming")}
          className={[
            "inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors cursor-pointer",
            activeTab === "upcoming"
              ? "bg-brand text-white"
              : "text-completed hover:bg-surface hover:text-brand",
          ].join(" ")}
        >
          <Calendar className="h-4 w-4" aria-hidden="true" />
          Upcoming
          <span
            className={[
              "inline-flex h-5 min-w-5 items-center justify-center rounded-md px-1.5 text-xs font-semibold",
              activeTab === "upcoming"
                ? "bg-white/20 text-white"
                : "bg-surface text-brand",
            ].join(" ")}
          >
            {upcoming.length}
          </span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "past"}
          onClick={() => setActiveTab("past")}
          className={[
            "inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors cursor-pointer",
            activeTab === "past"
              ? "bg-brand text-white"
              : "text-completed hover:bg-surface hover:text-brand",
          ].join(" ")}
        >
          <History className="h-4 w-4" aria-hidden="true" />
          Past
          <span
            className={[
              "inline-flex h-5 min-w-5 items-center justify-center rounded-md px-1.5 text-xs font-semibold",
              activeTab === "past"
                ? "bg-white/20 text-white"
                : "bg-surface text-brand",
            ].join(" ")}
          >
            {past.length}
          </span>
        </button>
      </div>

      {visibleList.length === 0 ? (
        <EmptyState
          icon={
            activeTab === "upcoming" ? (
              <Calendar className="h-6 w-6" aria-hidden="true" />
            ) : (
              <History className="h-6 w-6" aria-hidden="true" />
            )
          }
          title={
            activeTab === "upcoming"
              ? "No upcoming appointments"
              : "No past appointments yet"
          }
          description={
            activeTab === "upcoming"
              ? "Browse active providers and reserve an open time slot in seconds."
              : "Completed and cancelled appointments will appear here for your records."
          }
          action={
            activeTab === "upcoming" ? (
              <Link
                href="/providers"
                className="inline-flex h-9 items-center gap-2 rounded-md bg-brand px-4 text-sm font-medium text-white hover:bg-brand/90"
              >
                <CalendarPlus className="h-4 w-4" aria-hidden="true" />
                Browse Providers
              </Link>
            ) : undefined
          }
        />
      ) : (
        <div className="space-y-3">
          {visibleList.map((appt) => {
            const canCancel =
              appt.status === "CONFIRMED" || appt.status === "IN_PROGRESS";

            return (
              <Card key={appt.id}>
                <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-base font-semibold text-brand">
                        {appt.providerName}
                      </h2>
                      <AppointmentStatusBadge status={appt.status} />
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-completed">
                      <span className="inline-flex items-center gap-1.5">
                        <Calendar className="h-4 w-4" aria-hidden="true" />
                        {formatLocalDate(appt.appointmentDate)}
                      </span>
                      <span className="inline-flex items-center gap-1.5 font-mono font-medium text-brand">
                        <Clock className="h-4 w-4 text-completed" aria-hidden="true" />
                        {appt.startTime.slice(0, 5)} –{" "}
                        {appt.endTime.slice(0, 5)}
                      </span>
                      <Badge variant="neutral">
                        <Globe className="h-3 w-3" aria-hidden="true" />
                        {appt.providerTimezone}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 sm:justify-end">
                    {canCancel ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCancelTarget(appt)}
                        className="text-cancelled hover:border-cancelled/40 hover:bg-cancelled/5"
                      >
                        <XCircle className="h-3.5 w-3.5" aria-hidden="true" />
                        Cancel booking
                      </Button>
                    ) : (
                      <Link
                        href={`/providers/${appt.providerId}`}
                        className="inline-flex h-8 items-center justify-center rounded-md border border-slate-300 bg-white px-3 text-xs font-medium text-brand hover:bg-surface"
                      >
                        Book again
                      </Link>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Modal
        open={cancelTarget !== null}
        onClose={() => {
          if (!cancelling) setCancelTarget(null);
        }}
        title="Cancel this booking?"
        description="Once cancelled, this slot becomes available to other clients if it is still in the future."
        footer={
          <>
            <Button
              variant="outline"
              size="sm"
              disabled={cancelling}
              onClick={() => setCancelTarget(null)}
            >
              Keep booking
            </Button>
            <Button
              variant="danger"
              size="sm"
              loading={cancelling}
              onClick={handleConfirmCancel}
            >
              Yes, cancel booking
            </Button>
          </>
        }
      >
        {cancelTarget && (
          <dl className="space-y-2 rounded-xl border border-slate-200 bg-surface p-4 text-sm">
            <div className="flex items-center justify-between gap-4">
              <dt className="text-completed">Provider</dt>
              <dd className="font-semibold text-brand">
                {cancelTarget.providerName}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="text-completed">Date</dt>
              <dd className="font-medium text-brand">
                {formatLocalDate(cancelTarget.appointmentDate)}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="text-completed">Time</dt>
              <dd className="font-mono font-semibold text-brand">
                {cancelTarget.startTime.slice(0, 5)} –{" "}
                {cancelTarget.endTime.slice(0, 5)}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="text-completed">Timezone</dt>
              <dd className="text-brand">{cancelTarget.providerTimezone}</dd>
            </div>
          </dl>
        )}
      </Modal>
    </div>
  );
}
