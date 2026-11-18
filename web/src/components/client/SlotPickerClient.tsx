"use client";

import * as React from "react";
import Link from "next/link";
import {
  Calendar,
  CalendarCheck,
  Clock,
  Globe,
  RefreshCw,
} from "lucide-react";
import { bookAppointmentAction } from "@/app/actions/appointments";
import {
  AlertBanner,
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  EmptyState,
  Modal,
  Skeleton,
} from "@/components/ui";
import {
  DAY_OF_WEEK_SHORT,
  formatLocalDate,
  getIsoDayOfWeek,
  shiftIsoDate,
} from "@/lib/date-utils";
import type {
  ApiErrorEnvelope,
  AppointmentResponse,
  AvailableSlotsResponse,
  ProviderScheduleResponse,
  TimeSlotDto,
} from "@/types/api";

interface SlotPickerClientProps {
  schedule: ProviderScheduleResponse;
  initialSlots: AvailableSlotsResponse;
  todayInProviderTz: string;
}

export function SlotPickerClient({
  schedule,
  initialSlots,
  todayInProviderTz,
}: SlotPickerClientProps) {
  const [selectedDate, setSelectedDate] = React.useState(initialSlots.date);
  const [slots, setSlots] = React.useState<TimeSlotDto[]>(initialSlots.slots);
  const [loadingSlots, setLoadingSlots] = React.useState(false);
  const [loadError, setLoadError] = React.useState<string | null>(null);

  const [selectedSlot, setSelectedSlot] = React.useState<TimeSlotDto | null>(
    null,
  );
  const [booking, setBooking] = React.useState(false);
  const [conflictAlert, setConflictAlert] = React.useState<string | null>(null);
  const [bookingError, setBookingError] = React.useState<string | null>(null);
  const [confirmedBooking, setConfirmedBooking] =
    React.useState<AppointmentResponse | null>(null);

  const quickDates = React.useMemo(
    () =>
      Array.from({ length: 7 }, (_, offset) =>
        shiftIsoDate(todayInProviderTz, offset),
      ),
    [todayInProviderTz],
  );

  const scheduledDays = React.useMemo(() => {
    const map = new Map<number, ProviderScheduleResponse["days"][number]>();
    for (const day of schedule.days) {
      map.set(day.dayOfWeek, day);
    }
    return map;
  }, [schedule.days]);

  const fetchSlotsForDate = React.useCallback(
    async (date: string) => {
      setLoadingSlots(true);
      setLoadError(null);
      try {
        const res = await fetch(
          `/api/providers/${encodeURIComponent(schedule.providerId)}/slots?date=${encodeURIComponent(date)}`,
          { cache: "no-store" },
        );
        const data = (await res.json()) as
          | AvailableSlotsResponse
          | Partial<ApiErrorEnvelope>;

        if (!res.ok || !("slots" in data)) {
          const err = data as Partial<ApiErrorEnvelope>;
          setLoadError(err.message ?? "Could not load available slots.");
          setSlots([]);
          return;
        }

        setSlots(data.slots);
      } catch {
        setLoadError(
          "Network error while loading open slots. Please try refreshing.",
        );
        setSlots([]);
      } finally {
        setLoadingSlots(false);
      }
    },
    [schedule.providerId],
  );

  function handleDateChange(nextDate: string) {
    if (!nextDate) return;
    setSelectedDate(nextDate);
    setSelectedSlot(null);
    setConflictAlert(null);
    setBookingError(null);
    setConfirmedBooking(null);
    void fetchSlotsForDate(nextDate);
  }

  async function handleConfirmBooking() {
    if (!selectedSlot) return;
    setBooking(true);
    setConflictAlert(null);
    setBookingError(null);

    try {
      const result = await bookAppointmentAction({
        providerId: schedule.providerId,
        appointmentDate: selectedDate,
        startTime: selectedSlot.startTime.slice(0, 5),
      });

      if (!result.ok) {
        setSelectedSlot(null);
        if (result.status === 409) {
          setConflictAlert(
            result.message ||
              "This slot was just booked by someone else. Available times have been refreshed.",
          );
          await fetchSlotsForDate(selectedDate);
        } else {
          setBookingError(result.message);
        }
        return;
      }

      setConfirmedBooking(result.data);
      setSelectedSlot(null);
      await fetchSlotsForDate(selectedDate);
    } finally {
      setBooking(false);
    }
  }

  const activeDayShift = scheduledDays.get(getIsoDayOfWeek(selectedDate));

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-brand">
                {schedule.providerName}
              </h1>
              <p className="mt-1 text-sm text-completed">
                All slot times are shown in the provider&apos;s local timezone.
              </p>
            </div>
            <Badge variant="brand" className="self-start">
              <Globe className="h-3.5 w-3.5" aria-hidden="true" />
              {schedule.timezone}
            </Badge>
          </div>

          <div className="border-t border-slate-100 pt-4">
            <p className="mb-2 text-xs font-medium uppercase tracking-wider text-completed">
              Weekly working days
            </p>
            {schedule.days.length === 0 ? (
              <p className="text-sm text-completed">
                This provider has not configured weekly hours yet.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {([1, 2, 3, 4, 5, 6, 7] as const).map((dayNum) => {
                  const shift = scheduledDays.get(dayNum);
                  return (
                    <span
                      key={dayNum}
                      className={[
                        "inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs",
                        shift
                          ? "border-confirmed/25 bg-confirmed/5 text-brand"
                          : "border-slate-200 bg-surface text-completed line-through opacity-65",
                      ].join(" ")}
                    >
                      <span className="font-semibold">
                        {DAY_OF_WEEK_SHORT[dayNum]}
                      </span>
                      {shift && (
                        <span className="font-mono text-[11px] text-completed">
                          {shift.startTime.slice(0, 5)}–
                          {shift.endTime.slice(0, 5)}
                        </span>
                      )}
                    </span>
                  );
                })}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {confirmedBooking && (
        <AlertBanner
          tone="success"
          title="Appointment confirmed"
          message={`Booked with ${confirmedBooking.providerName} on ${formatLocalDate(confirmedBooking.appointmentDate)} from ${confirmedBooking.startTime.slice(0, 5)} to ${confirmedBooking.endTime.slice(0, 5)} (${confirmedBooking.providerTimezone}).`}
          action={
            <Link
              href="/my-bookings"
              className="inline-flex h-8 items-center gap-1.5 rounded-md bg-confirmed px-3 text-xs font-medium text-white hover:bg-confirmed/90"
            >
              <CalendarCheck className="h-3.5 w-3.5" aria-hidden="true" />
              My Bookings
            </Link>
          }
        />
      )}

      {conflictAlert && (
        <AlertBanner
          tone="conflict"
          title="Slot no longer available (409 Conflict)"
          message={`${conflictAlert} We automatically refreshed the open slots below.`}
        />
      )}

      {bookingError && <AlertBanner tone="error" message={bookingError} />}

      <Card>
        <CardHeader className="flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <CardTitle>Choose a Date &amp; Time</CardTitle>
            <CardDescription>
              {formatLocalDate(selectedDate)}
              {activeDayShift
                ? ` · ${activeDayShift.slotDurationMinutes}-minute appointments`
                : " · No shift scheduled"}
            </CardDescription>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <label className="inline-flex items-center gap-2">
              <span className="text-xs font-medium text-completed">Date:</span>
              <input
                type="date"
                min={todayInProviderTz}
                value={selectedDate}
                onChange={(e) => handleDateChange(e.target.value)}
                className="h-9 rounded-md border border-slate-300 bg-white px-2.5 text-sm font-medium text-brand focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
              />
            </label>
            <Button
              variant="outline"
              size="sm"
              loading={loadingSlots}
              onClick={() => void fetchSlotsForDate(selectedDate)}
            >
              <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
              Refresh
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div
            role="tablist"
            aria-label="Quick date selector"
            className="grid grid-cols-7 gap-1.5 overflow-x-auto"
          >
            {quickDates.map((isoDate) => {
              const dayNum = getIsoDayOfWeek(isoDate);
              const isSelected = isoDate === selectedDate;
              const isOpenDay = scheduledDays.has(dayNum);
              const dayOfMonth = isoDate.slice(8, 10);

              return (
                <button
                  key={isoDate}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  onClick={() => handleDateChange(isoDate)}
                  className={[
                    "flex flex-col items-center justify-center rounded-md border px-2 py-2 text-center transition-colors cursor-pointer",
                    isSelected
                      ? "border-brand bg-brand text-white"
                      : isOpenDay
                        ? "border-slate-200 bg-white text-brand hover:border-brand/40 hover:bg-surface"
                        : "border-slate-200 bg-surface text-completed opacity-65 hover:opacity-100",
                  ].join(" ")}
                >
                  <span className="text-[11px] font-medium opacity-80">
                    {DAY_OF_WEEK_SHORT[dayNum]}
                  </span>
                  <span className="mt-0.5 text-sm font-semibold">
                    {dayOfMonth}
                  </span>
                </button>
              );
            })}
          </div>

          {loadError ? (
            <AlertBanner tone="error" message={loadError} />
          ) : loadingSlots ? (
            <div
              aria-label="Loading available time slots"
              className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-4"
            >
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full rounded-md" />
              ))}
            </div>
          ) : slots.length === 0 ? (
            <EmptyState
              icon={<Calendar className="h-6 w-6" aria-hidden="true" />}
              title="No available slots on this date"
              description="All times may be booked, already in the past, or outside this provider's working hours. Try picking another date."
            />
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-completed">
                <span>
                  {slots.length} open slot{slots.length === 1 ? "" : "s"}{" "}
                  available
                </span>
                <span>Select a slot to book</span>
              </div>

              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-4">
                {slots.map((slot) => {
                  const label = `${slot.startTime.slice(0, 5)} – ${slot.endTime.slice(0, 5)}`;
                  return (
                    <button
                      key={slot.startTime}
                      type="button"
                      onClick={() => {
                        setBookingError(null);
                        setSelectedSlot(slot);
                      }}
                      className="flex flex-col items-center justify-center rounded-md border border-confirmed/35 bg-confirmed/5 px-3 py-3 text-brand transition-all hover:border-confirmed hover:bg-confirmed hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-confirmed/40 cursor-pointer group"
                    >
                      <span className="flex items-center gap-1.5 font-mono text-sm font-semibold">
                        <Clock
                          className="h-3.5 w-3.5 text-confirmed group-hover:text-white"
                          aria-hidden="true"
                        />
                        {slot.startTime.slice(0, 5)}
                      </span>
                      <span className="mt-0.5 text-[11px] text-completed group-hover:text-white/90">
                        {label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Modal
        open={selectedSlot !== null}
        onClose={() => {
          if (!booking) setSelectedSlot(null);
        }}
        title="Confirm your appointment"
        description="Your reservation is locked atomically once confirmed."
        footer={
          <>
            <Button
              variant="outline"
              size="sm"
              disabled={booking}
              onClick={() => setSelectedSlot(null)}
            >
              Cancel
            </Button>
            <Button
              variant="confirmed"
              size="sm"
              loading={booking}
              onClick={() => void handleConfirmBooking()}
            >
              Confirm Booking
            </Button>
          </>
        }
      >
        {selectedSlot && (
          <dl className="space-y-2.5 rounded-xl border border-slate-200 bg-surface p-4 text-sm">
            <div className="flex items-center justify-between gap-4">
              <dt className="text-completed">Provider</dt>
              <dd className="font-semibold text-brand">
                {schedule.providerName}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="text-completed">Date</dt>
              <dd className="font-medium text-brand">
                {formatLocalDate(selectedDate)}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="text-completed">Time</dt>
              <dd className="font-mono font-semibold text-confirmed">
                {selectedSlot.startTime.slice(0, 5)} –{" "}
                {selectedSlot.endTime.slice(0, 5)}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="text-completed">Timezone</dt>
              <dd className="text-brand">{schedule.timezone}</dd>
            </div>
          </dl>
        )}
      </Modal>
    </div>
  );
}
