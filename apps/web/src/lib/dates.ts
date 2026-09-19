/**
 * Работа с датами в таймзоне города.
 *
 * Пермь живёт в Asia/Yekaterinburg с фиксированным смещением UTC+5
 * (переходов на летнее время нет), поэтому смещение задано константой.
 */

import type { DatePreset } from "./types";

export const CITY_TIMEZONE = "Asia/Yekaterinburg";

const UTC_OFFSET_HOURS = 5;

export interface ZonedDateParts {
  readonly year: number;
  readonly month: number;
  readonly day: number;
}

export interface DateRange {
  readonly from: Date;
  readonly to: Date;
}

const partsFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: CITY_TIMEZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit"
});

/** Календарная дата момента `date` в таймзоне города. */
export function zonedDateParts(date: Date): ZonedDateParts {
  const parts = partsFormatter.formatToParts(date);
  const get = (type: string): number =>
    Number(parts.find((part) => part.type === type)?.value);
  return { year: get("year"), month: get("month"), day: get("day") };
}

/** UTC-момент локального времени (YYYY-MM-DD HH:mm) в таймзоне города. */
export function localTimeToUtc(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number
): Date {
  return new Date(Date.UTC(year, month - 1, day, hour - UTC_OFFSET_HOURS, minute));
}

function startOfDay(date: Date): Date {
  const { year, month, day } = zonedDateParts(date);
  return localTimeToUtc(year, month, day, 0, 0);
}

function addDays(date: Date, days: number): Date {
  const { year, month, day } = zonedDateParts(date);
  const shifted = new Date(Date.UTC(year, month - 1, day + days));
  return localTimeToUtc(
    shifted.getUTCFullYear(),
    shifted.getUTCMonth() + 1,
    shifted.getUTCDate(),
    0,
    0
  );
}

/**
 * Диапазон пресета в таймзоне города: `from` включительно, `to` — исключительно.
 * `weekend` — ближайшие суббота–воскресенье (в разгар выходных — от `now`).
 * `week` — ближайшие 7 суток от `now`.
 */
export function resolveDatePreset(preset: DatePreset, now: Date = new Date()): DateRange {
  const todayStart = startOfDay(now);

  switch (preset) {
    case "today":
      return { from: now, to: addDays(todayStart, 1) };
    case "tomorrow":
      return { from: addDays(todayStart, 1), to: addDays(todayStart, 2) };
    case "weekend": {
      const { year, month, day } = zonedDateParts(now);
      const weekday = new Date(Date.UTC(year, month - 1, day)).getUTCDay();
      const daysUntilSaturday = (6 - weekday + 7) % 7;
      const saturday = addDays(todayStart, daysUntilSaturday);
      const monday = addDays(saturday, 2);
      const isWeekendNow = weekday === 0 || weekday === 6;
      return { from: isWeekendNow ? now : saturday, to: monday };
    }
    case "week":
      return { from: now, to: addDays(todayStart, 7) };
  }
}

/** ISO-момент «через `dayOffset` дней в hour:minute» по времени города — для моков. */
export function mockDateTime(
  dayOffset: number,
  hour: number,
  minute = 0,
  now: Date = new Date()
): string {
  const { year, month, day } = zonedDateParts(now);
  const shifted = new Date(Date.UTC(year, month - 1, day + dayOffset));
  return localTimeToUtc(
    shifted.getUTCFullYear(),
    shifted.getUTCMonth() + 1,
    shifted.getUTCDate(),
    hour,
    minute
  ).toISOString();
}
