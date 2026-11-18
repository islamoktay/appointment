export const DAY_OF_WEEK_LABELS: Record<1 | 2 | 3 | 4 | 5 | 6 | 7, string> = {
  1: "Monday",
  2: "Tuesday",
  3: "Wednesday",
  4: "Thursday",
  5: "Friday",
  6: "Saturday",
  7: "Sunday",
};

export const DAY_OF_WEEK_SHORT: Record<1 | 2 | 3 | 4 | 5 | 6 | 7, string> = {
  1: "Mon",
  2: "Tue",
  3: "Wed",
  4: "Thu",
  5: "Fri",
  6: "Sat",
  7: "Sun",
};

export const COMMON_TIMEZONES: string[] = [
  "UTC",
  "Europe/Istanbul",
  "Europe/London",
  "Europe/Berlin",
  "Europe/Paris",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "Asia/Dubai",
  "Asia/Tokyo",
  "Asia/Singapore",
  "Australia/Sydney",
];

/**
 * Returns YYYY-MM-DD for "today" evaluated in the specified IANA timezone.
 */
export function getTodayInTimezone(timezone: string = "UTC"): string {
  try {
    const formatter = new Intl.DateTimeFormat("en-CA", {
      timeZone: timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    return formatter.format(new Date());
  } catch {
    return new Date().toISOString().slice(0, 10);
  }
}

/**
 * Formats YYYY-MM-DD into a friendly human-readable date string without timezone drift.
 */
export function formatLocalDate(isoDate: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDate);
  if (!match) return isoDate;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const utcDate = new Date(Date.UTC(year, month - 1, day));
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "UTC",
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(utcDate);
}

/**
 * Adds or subtracts whole days from a YYYY-MM-DD date string.
 */
export function shiftIsoDate(isoDate: string, deltaDays: number): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDate);
  if (!match) return isoDate;
  const utcDate = new Date(
    Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])),
  );
  utcDate.setUTCDate(utcDate.getUTCDate() + deltaDays);
  return utcDate.toISOString().slice(0, 10);
}

/**
 * Maps YYYY-MM-DD to ISO dayOfWeek (1=Monday .. 7=Sunday).
 */
export function getIsoDayOfWeek(isoDate: string): 1 | 2 | 3 | 4 | 5 | 6 | 7 {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDate);
  if (!match) return 1;
  const utcDate = new Date(
    Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])),
  );
  const jsDay = utcDate.getUTCDay(); // 0=Sun..6=Sat
  return (jsDay === 0 ? 7 : jsDay) as 1 | 2 | 3 | 4 | 5 | 6 | 7;
}

export function isValidIsoDate(value: string | undefined): value is string {
  return Boolean(value && /^\d{4}-\d{2}-\d{2}$/.test(value));
}

export function getDefaultRouteForRole(role: "PROVIDER" | "CLIENT"): string {
  return role === "PROVIDER" ? "/provider/dashboard" : "/providers";
}
