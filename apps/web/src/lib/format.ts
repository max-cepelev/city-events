/**
 * Форматтеры отображения каталога. Чистые функции, таймзона — городская.
 */

import { CITY_TIMEZONE } from "./dates";
import type { EventListItem, EventPrice, Occurrence } from "./types";

const priceFormatter = new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 });

const dayMonthLongFormatter = new Intl.DateTimeFormat("ru-RU", {
  timeZone: CITY_TIMEZONE,
  day: "numeric",
  month: "long"
});

const dayMonthShortFormatter = new Intl.DateTimeFormat("ru-RU", {
  timeZone: CITY_TIMEZONE,
  day: "numeric",
  month: "short"
});

const timeFormatter = new Intl.DateTimeFormat("ru-RU", {
  timeZone: CITY_TIMEZONE,
  hour: "2-digit",
  minute: "2-digit"
});

const weekdayFormatter = new Intl.DateTimeFormat("ru-RU", {
  timeZone: CITY_TIMEZONE,
  weekday: "short"
});

const monthYearFormatter = new Intl.DateTimeFormat("ru-RU", {
  timeZone: CITY_TIMEZONE,
  month: "long",
  year: "numeric"
});

/** «от 700 ₽», «700–1 500 ₽», «Бесплатно», «Цена уточняется». */
export function formatEventPrice(price: EventPrice): string {
  switch (price.kind) {
    case "free":
      return "Бесплатно";
    case "unknown":
      return "Цена уточняется";
    case "paid": {
      const from = priceFormatter.format(price.from);
      if (price.to === null || price.to === price.from) {
        return `от ${from} ₽`;
      }
      return `${from}–${priceFormatter.format(price.to)} ₽`;
    }
  }
}

/** «19 сентября» */
export function formatDayMonth(iso: string): string {
  return dayMonthLongFormatter.format(new Date(iso));
}

/** «19 сен» — короткий месяц без точки. */
export function formatDayMonthShort(date: Date): string {
  return dayMonthShortFormatter.format(date).replace(".", "");
}

/** «19:00» */
export function formatTime(iso: string): string {
  return timeFormatter.format(new Date(iso));
}

/** «СБ» */
export function formatWeekday(iso: string): string {
  return weekdayFormatter.format(new Date(iso)).toUpperCase();
}

/** «сентябрь 2026» */
export function formatMonthYear(date: Date): string {
  return monthYearFormatter.format(date);
}

/**
 * Дата на карточке: «19 сентября · 19:00», а для длинных событий
 * (выставки с сеансом почти каждый день) — «до 30 ноября».
 */
export function formatCardDate(event: EventListItem): string {
  if (event.occurrencesCount >= 5 && event.finalOccurrenceDate !== null) {
    return `до ${formatDayMonth(event.finalOccurrenceDate)}`;
  }
  if (event.nextOccurrence === null) {
    return "Даты уточняются";
  }
  return `${formatDayMonth(event.nextOccurrence.startsAt)} · ${formatTime(event.nextOccurrence.startsAt)}`;
}

/** «2 ч 30 мин» — длительность сеанса, если известно время окончания. */
export function formatDuration(occurrence: Occurrence): string | null {
  if (occurrence.endsAt === null) {
    return null;
  }
  const minutes = Math.round(
    (new Date(occurrence.endsAt).getTime() - new Date(occurrence.startsAt).getTime()) / 60_000
  );
  if (minutes <= 0) {
    return null;
  }
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (hours === 0) {
    return `${rest} мин`;
  }
  return rest === 0 ? `${hours} ч` : `${hours} ч ${rest} мин`;
}

/** «1 событие», «3 события», «14 событий». */
export function pluralizeEvents(count: number): string {
  const mod100 = count % 100;
  const mod10 = count % 10;
  if (mod100 >= 11 && mod100 <= 14) {
    return "событий";
  }
  if (mod10 === 1) {
    return "событие";
  }
  if (mod10 >= 2 && mod10 <= 4) {
    return "события";
  }
  return "событий";
}
