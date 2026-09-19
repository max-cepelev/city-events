/**
 * Точка доступа к данным каталога. Сейчас — моки из ./events.ts;
 * интерфейс функций повторяет будущие методы @city-events/api-client,
 * чтобы переход на API свёлся к замене реализаций.
 */

import { mockDateTime, resolveDatePreset } from "$lib/dates";
import type {
  DatePreset,
  EventDetails,
  EventListItem,
  Occurrence,
  Paginated
} from "$lib/types";

import { CATEGORIES, categoryBySlug } from "./categories";
import { EVENTS, type MockEventTemplate } from "./events";
import { VENUES } from "./venues";

export const DEFAULT_PAGE_SIZE = 9;

export type PriceFilter = "free" | "500" | "1000";

export interface ListEventsFilter {
  readonly category?: string;
  readonly date?: DatePreset;
  readonly price?: PriceFilter;
  readonly q?: string;
  readonly page?: number;
  readonly pageSize?: number;
}

interface MaterializedEvent {
  readonly template: MockEventTemplate;
  readonly occurrences: readonly Occurrence[];
}

function materialize(template: MockEventTemplate, now: Date): MaterializedEvent {
  const occurrences = template.occurrences.map((slot, index) => {
    const startsAt = mockDateTime(slot.day, slot.hour, slot.minute ?? 0, now);
    const endsAt =
      slot.durationMinutes === undefined
        ? null
        : new Date(new Date(startsAt).getTime() + slot.durationMinutes * 60_000).toISOString();
    return {
      id: `${template.slug}-${index}`,
      startsAt,
      endsAt,
      status: slot.status ?? "scheduled"
    } satisfies Occurrence;
  });
  return { template, occurrences };
}

function isUpcoming(occurrence: Occurrence, now: Date): boolean {
  if (occurrence.status !== "scheduled") {
    return false;
  }
  const relevantEnd = occurrence.endsAt ?? occurrence.startsAt;
  return new Date(relevantEnd).getTime() >= now.getTime();
}

function nextOccurrenceIn(
  occurrences: readonly Occurrence[],
  from: Date,
  to: Date | null
): Occurrence | null {
  return (
    occurrences.find(
      (occurrence) =>
        isUpcoming(occurrence, from) &&
        (to === null || new Date(occurrence.startsAt).getTime() < to.getTime())
    ) ?? null
  );
}

function toListItem(
  event: MaterializedEvent,
  nextOccurrence: Occurrence | null
): EventListItem {
  const { template, occurrences } = event;
  const category = categoryBySlug(template.categorySlug);
  if (category === null) {
    throw new Error(`Unknown category slug in mock data: ${template.categorySlug}`);
  }
  const scheduled = occurrences.filter((occurrence) => occurrence.status === "scheduled");
  return {
    slug: template.slug,
    title: template.title,
    shortDescription: template.shortDescription,
    category,
    image: { url: `/images/seed/${template.image}`, alt: template.imageAlt },
    price: template.price,
    ageRestriction: template.ageRestriction,
    nextOccurrence,
    finalOccurrenceDate: scheduled.at(-1)?.startsAt ?? null,
    occurrencesCount: scheduled.length,
    venue: template.venueSlug === null ? null : (VENUES[template.venueSlug] ?? null)
  };
}

function matchesPrice(template: MockEventTemplate, price: PriceFilter): boolean {
  switch (price) {
    case "free":
      return template.price.kind === "free";
    case "500":
      return template.price.kind === "paid" && template.price.from <= 500;
    case "1000":
      return template.price.kind === "paid" && template.price.from <= 1000;
  }
}

function matchesSearch(template: MockEventTemplate, query: string): boolean {
  const haystack = [
    template.title,
    template.shortDescription,
    template.venueSlug === null ? "" : (VENUES[template.venueSlug]?.name ?? ""),
    categoryBySlug(template.categorySlug)?.name ?? ""
  ]
    .join(" ")
    .toLowerCase();
  return query
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .every((word) => haystack.includes(word));
}

export function listCategories() {
  return CATEGORIES;
}

export function listEvents(filter: ListEventsFilter = {}): Paginated<EventListItem> {
  const now = new Date();
  const range = filter.date === undefined ? null : resolveDatePreset(filter.date, now);
  const from = range?.from ?? now;
  const to = range?.to ?? null;

  const matched = EVENTS.map((template) => materialize(template, now))
    .filter((event) => {
      if (filter.category !== undefined && event.template.categorySlug !== filter.category) {
        return false;
      }
      if (filter.price !== undefined && !matchesPrice(event.template, filter.price)) {
        return false;
      }
      if (filter.q !== undefined && filter.q.trim() !== "" && !matchesSearch(event.template, filter.q)) {
        return false;
      }
      return nextOccurrenceIn(event.occurrences, from, to) !== null;
    })
    .map((event) => toListItem(event, nextOccurrenceIn(event.occurrences, from, to)))
    .sort((a, b) => {
      const aStarts = a.nextOccurrence?.startsAt ?? "";
      const bStarts = b.nextOccurrence?.startsAt ?? "";
      return aStarts.localeCompare(bStarts);
    });

  const page = Math.max(1, Math.trunc(filter.page ?? 1));
  const pageSize = Math.min(50, Math.max(1, Math.trunc(filter.pageSize ?? DEFAULT_PAGE_SIZE)));
  const totalItems = matched.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(page, totalPages);

  return {
    items: matched.slice((safePage - 1) * pageSize, safePage * pageSize),
    page: safePage,
    pageSize,
    totalItems,
    totalPages
  };
}

export function listFeatured(limit = 3): readonly EventListItem[] {
  return listEvents({ pageSize: limit }).items;
}

export function getEvent(slug: string): EventDetails | null {
  const template = EVENTS.find((event) => event.slug === slug);
  if (template === undefined) {
    return null;
  }
  const now = new Date();
  const { occurrences } = materialize(template, now);
  const category = categoryBySlug(template.categorySlug);
  if (category === null) {
    return null;
  }
  return {
    slug: template.slug,
    title: template.title,
    lead: template.shortDescription,
    description: template.description,
    category,
    image: { url: `/images/seed/${template.image}`, alt: template.imageAlt },
    price: template.price,
    ageRestriction: template.ageRestriction,
    occurrences: occurrences.filter(
      (occurrence) => new Date(occurrence.endsAt ?? occurrence.startsAt).getTime() >= now.getTime()
    ),
    venue: template.venueSlug === null ? null : (VENUES[template.venueSlug] ?? null),
    organizer:
      template.organizerName === null
        ? null
        : { name: template.organizerName, website: template.organizerWebsite },
    tags: template.tags,
    ticketUrl: template.ticketUrl
  };
}
