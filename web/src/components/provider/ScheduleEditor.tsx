"use client";

import * as React from "react";
import { CalendarClock, Clock, Copy, Save, Sparkles } from "lucide-react";
import { updateScheduleAction } from "@/app/actions/schedule";
import {
  AlertBanner,
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Select,
} from "@/components/ui";
import { COMMON_TIMEZONES, DAY_OF_WEEK_LABELS } from "@/lib/date-utils";
import type { ProviderScheduleResponse, ScheduleDayDto } from "@/types/api";

type DayNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7;
type SlotDuration = 15 | 30 | 60;

interface DayRowState {
  dayOfWeek: DayNumber;
  enabled: boolean;
  startTime: string;
  endTime: string;
  slotDurationMinutes: SlotDuration;
}

const ALL_DAYS: DayNumber[] = [1, 2, 3, 4, 5, 6, 7];
const SLOT_DURATIONS: SlotDuration[] = [15, 30, 60];

function parseMinutes(hhmm: string): number | null {
  const match = /^(\d{2}):(\d{2})$/.exec(hhmm);
  if (!match) return null;
  const h = Number(match[1]);
  const m = Number(match[2]);
  if (h < 0 || h > 23 || m < 0 || m > 59) return null;
  return h * 60 + m;
}

function countSlots(
  startTime: string,
  endTime: string,
  duration: SlotDuration,
): number {
  const start = parseMinutes(startTime);
  const end = parseMinutes(endTime);
  if (start === null || end === null || end <= start) return 0;
  return Math.floor((end - start) / duration);
}

function buildInitialRows(days: ScheduleDayDto[]): DayRowState[] {
  const byDay = new Map<number, ScheduleDayDto>();
  for (const day of days) {
    byDay.set(day.dayOfWeek, day);
  }

  return ALL_DAYS.map((dayOfWeek) => {
    const existing = byDay.get(dayOfWeek);
    if (existing) {
      return {
        dayOfWeek,
        enabled: true,
        startTime: existing.startTime.slice(0, 5),
        endTime: existing.endTime.slice(0, 5),
        slotDurationMinutes: existing.slotDurationMinutes,
      };
    }
    return {
      dayOfWeek,
      enabled: false,
      startTime: "09:00",
      endTime: "17:00",
      slotDurationMinutes: 30,
    };
  });
}

export function ScheduleEditor({
  initialSchedule,
}: {
  initialSchedule: ProviderScheduleResponse;
}) {
  const [rows, setRows] = React.useState<DayRowState[]>(() =>
    buildInitialRows(initialSchedule.days),
  );
  const [timezone, setTimezone] = React.useState(initialSchedule.timezone);
  const [rowErrors, setRowErrors] = React.useState<Record<number, string>>({});
  const [banner, setBanner] = React.useState<{
    tone: "success" | "error";
    message: string;
  } | null>(null);
  const [saving, setSaving] = React.useState(false);

  const timezoneOptions = React.useMemo(() => {
    if (COMMON_TIMEZONES.includes(timezone)) return COMMON_TIMEZONES;
    return [timezone, ...COMMON_TIMEZONES];
  }, [timezone]);

  const enabledCount = rows.filter((r) => r.enabled).length;
  const weeklySlotTotal = rows.reduce(
    (sum, r) =>
      r.enabled
        ? sum + countSlots(r.startTime, r.endTime, r.slotDurationMinutes)
        : sum,
    0,
  );

  function updateRow(dayOfWeek: DayNumber, patch: Partial<DayRowState>) {
    setRows((prev) =>
      prev.map((row) =>
        row.dayOfWeek === dayOfWeek ? { ...row, ...patch } : row,
      ),
    );
    setRowErrors((prev) => {
      if (!(dayOfWeek in prev)) return prev;
      const next = { ...prev };
      delete next[dayOfWeek];
      return next;
    });
    setBanner(null);
  }

  function applyStandardWeekdays() {
    setRows(
      ALL_DAYS.map((dayOfWeek) => ({
        dayOfWeek,
        enabled: dayOfWeek <= 5,
        startTime: "09:00",
        endTime: "17:00",
        slotDurationMinutes: 30,
      })),
    );
    setRowErrors({});
    setBanner(null);
  }

  function copyFirstEnabledToOthers() {
    const template = rows.find((r) => r.enabled);
    if (!template) return;
    setRows((prev) =>
      prev.map((row) =>
        row.enabled
          ? {
              ...row,
              startTime: template.startTime,
              endTime: template.endTime,
              slotDurationMinutes: template.slotDurationMinutes,
            }
          : row,
      ),
    );
    setRowErrors({});
    setBanner(null);
  }

  async function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBanner(null);

    const validationErrors: Record<number, string> = {};
    const activeDays: ScheduleDayDto[] = [];

    for (const row of rows) {
      if (!row.enabled) continue;
      const start = parseMinutes(row.startTime);
      const end = parseMinutes(row.endTime);

      if (start === null || end === null) {
        validationErrors[row.dayOfWeek] = "Enter valid start and end times.";
        continue;
      }
      if (end <= start) {
        validationErrors[row.dayOfWeek] =
          "End time must be after start time.";
        continue;
      }
      if (end - start < row.slotDurationMinutes) {
        validationErrors[row.dayOfWeek] =
          `Shift must be at least ${row.slotDurationMinutes} minutes long.`;
        continue;
      }

      activeDays.push({
        dayOfWeek: row.dayOfWeek,
        startTime: row.startTime,
        endTime: row.endTime,
        slotDurationMinutes: row.slotDurationMinutes,
      });
    }

    if (Object.keys(validationErrors).length > 0) {
      setRowErrors(validationErrors);
      setBanner({
        tone: "error",
        message: "Please fix the highlighted shift windows before saving.",
      });
      return;
    }

    setRowErrors({});
    setSaving(true);

    try {
      const result = await updateScheduleAction({
        timezone,
        days: activeDays,
      });

      if (!result.ok) {
        setBanner({
          tone: "error",
          message: result.message,
        });
        return;
      }

      setRows(buildInitialRows(result.data.days));
      setTimezone(result.data.timezone);
      setBanner({
        tone: "success",
        message:
          activeDays.length === 0
            ? "Schedule saved. All days are currently marked unavailable."
            : `Weekly schedule saved (${activeDays.length} active day${activeDays.length === 1 ? "" : "s"}, ${result.data.timezone}).`,
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {banner && (
        <AlertBanner tone={banner.tone} message={banner.message} />
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs font-medium text-completed">Active Days</p>
            <p className="mt-1 text-2xl font-semibold text-brand">
              {enabledCount}{" "}
              <span className="text-sm font-normal text-completed">/ 7</span>
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs font-medium text-completed">
              Weekly Bookable Slots
            </p>
            <p className="mt-1 text-2xl font-semibold text-confirmed">
              {weeklySlotTotal}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <Select
              label="Schedule Timezone"
              value={timezone}
              onChange={(e) => {
                setTimezone(e.target.value);
                setBanner(null);
              }}
            >
              {timezoneOptions.map((tz) => (
                <option key={tz} value={tz}>
                  {tz}
                </option>
              ))}
            </Select>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <CalendarClock className="h-5 w-5 text-brand" aria-hidden="true" />
              Weekly Availability Grid
            </CardTitle>
            <CardDescription>
              Toggle each working day, set your continuous shift window, and
              choose uniform slot intervals. Trailing remainders shorter than
              the slot length are automatically omitted.
            </CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={applyStandardWeekdays}
            >
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
              Mon–Fri 09:00–17:00
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={enabledCount < 2}
              onClick={copyFirstEnabledToOthers}
            >
              <Copy className="h-3.5 w-3.5" aria-hidden="true" />
              Copy first shift
            </Button>
          </div>
        </CardHeader>

        <CardContent className="divide-y divide-slate-100">
          {rows.map((row) => {
            const slots = row.enabled
              ? countSlots(row.startTime, row.endTime, row.slotDurationMinutes)
              : 0;
            const error = rowErrors[row.dayOfWeek];

            return (
              <div
                key={row.dayOfWeek}
                className={[
                  "py-4 first:pt-2 last:pb-2 transition-opacity",
                  row.enabled ? "opacity-100" : "opacity-75",
                ].join(" ")}
              >
                <div className="grid gap-3 md:grid-cols-[170px_1fr_auto] md:items-center">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      role="switch"
                      aria-checked={row.enabled}
                      aria-label={`Toggle ${DAY_OF_WEEK_LABELS[row.dayOfWeek]}`}
                      onClick={() =>
                        updateRow(row.dayOfWeek, { enabled: !row.enabled })
                      }
                      className={[
                        "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors cursor-pointer",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:ring-offset-2",
                        row.enabled ? "bg-confirmed" : "bg-slate-300",
                      ].join(" ")}
                    >
                      <span
                        className={[
                          "inline-block h-4 w-4 transform rounded-full bg-white shadow-xs transition-transform",
                          row.enabled ? "translate-x-6" : "translate-x-1",
                        ].join(" ")}
                      />
                    </button>
                    <div>
                      <p className="text-sm font-semibold text-brand">
                        {DAY_OF_WEEK_LABELS[row.dayOfWeek]}
                      </p>
                      <p className="text-xs text-completed">
                        {row.enabled ? "Open for booking" : "Day off"}
                      </p>
                    </div>
                  </div>

                  {row.enabled ? (
                    <div className="grid gap-3 sm:grid-cols-3">
                      <div>
                        <label
                          htmlFor={`start-${row.dayOfWeek}`}
                          className="mb-1 block text-xs font-medium text-completed"
                        >
                          Start time
                        </label>
                        <input
                          id={`start-${row.dayOfWeek}`}
                          type="time"
                          value={row.startTime}
                          onChange={(e) =>
                            updateRow(row.dayOfWeek, {
                              startTime: e.target.value,
                            })
                          }
                          className="h-9 w-full rounded-md border border-slate-300 bg-white px-2.5 text-sm font-mono text-brand focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor={`end-${row.dayOfWeek}`}
                          className="mb-1 block text-xs font-medium text-completed"
                        >
                          End time
                        </label>
                        <input
                          id={`end-${row.dayOfWeek}`}
                          type="time"
                          value={row.endTime}
                          onChange={(e) =>
                            updateRow(row.dayOfWeek, {
                              endTime: e.target.value,
                            })
                          }
                          className="h-9 w-full rounded-md border border-slate-300 bg-white px-2.5 text-sm font-mono text-brand focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                        />
                      </div>

                      <div>
                        <span className="mb-1 block text-xs font-medium text-completed">
                          Slot length
                        </span>
                        <div
                          role="group"
                          aria-label={`${DAY_OF_WEEK_LABELS[row.dayOfWeek]} slot length`}
                          className="grid grid-cols-3 gap-1 rounded-md border border-slate-200 bg-surface p-0.5"
                        >
                          {SLOT_DURATIONS.map((duration) => {
                            const selected =
                              row.slotDurationMinutes === duration;
                            return (
                              <button
                                key={duration}
                                type="button"
                                aria-pressed={selected}
                                onClick={() =>
                                  updateRow(row.dayOfWeek, {
                                    slotDurationMinutes: duration,
                                  })
                                }
                                className={[
                                  "h-8 rounded-md text-xs font-medium transition-colors cursor-pointer",
                                  selected
                                    ? "bg-brand text-white shadow-xs"
                                    : "text-completed hover:text-brand",
                                ].join(" ")}
                              >
                                {duration}m
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-xs text-completed">
                      <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                      Unavailable — no slots generated
                    </div>
                  )}

                  <div className="flex md:justify-end">
                    {row.enabled ? (
                      <Badge variant={slots > 0 ? "confirmed" : "cancelled"}>
                        {slots} slot{slots === 1 ? "" : "s"}
                      </Badge>
                    ) : (
                      <Badge variant="neutral">Off</Badge>
                    )}
                  </div>
                </div>

                {error && (
                  <p
                    role="alert"
                    className="mt-2 text-xs font-medium text-cancelled"
                  >
                    {error}
                  </p>
                )}
              </div>
            );
          })}
        </CardContent>

        <CardFooter className="flex-col items-stretch justify-between gap-3 sm:flex-row sm:items-center">
          <p className="text-xs text-completed">
            Saving replaces your weekly template for future slot generation.
            Existing confirmed bookings remain intact on your daily queue.
          </p>
          <Button type="submit" loading={saving} size="md">
            <Save className="h-4 w-4" aria-hidden="true" />
            Save Weekly Schedule
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
