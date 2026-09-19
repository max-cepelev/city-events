/**
 * Типы публичных DTO каталога.
 *
 * Зеркалят контракты будущего публичного API (см. docs/superpowers/specs/
 * 2026-09-19-demo-catalog-design.md). Пока каталог работает на моках,
 * типы живут локально; при подключении API переедут в @city-events/shared.
 */

export type DatePreset = "today" | "tomorrow" | "weekend" | "week";

export type EventPrice =
  | { readonly kind: "free" }
  | {
      readonly kind: "paid";
      readonly from: number;
      readonly to: number | null;
      readonly currency: string;
    }
  | { readonly kind: "unknown" };

export interface Category {
  readonly slug: string;
  readonly name: string;
}

export type OccurrenceStatus = "scheduled" | "cancelled" | "postponed";

export interface Occurrence {
  readonly id: string;
  /** ISO 8601 в UTC; отображение — в таймзоне города. */
  readonly startsAt: string;
  readonly endsAt: string | null;
  readonly status: OccurrenceStatus;
}

export interface EventImage {
  readonly url: string;
  readonly alt: string;
}

export interface VenueSummary {
  readonly name: string;
  readonly address: string;
}

export interface EventListItem {
  readonly slug: string;
  readonly title: string;
  readonly shortDescription: string;
  readonly category: Category;
  readonly image: EventImage;
  readonly price: EventPrice;
  /** Возрастное ограничение 0–21. */
  readonly ageRestriction: number;
  readonly nextOccurrence: Occurrence | null;
  /** Дата последнего сеанса — для формата «до 30 ноября» у длинных событий. */
  readonly finalOccurrenceDate: string | null;
  readonly occurrencesCount: number;
  readonly venue: VenueSummary | null;
}

export interface EventDetails {
  readonly slug: string;
  readonly title: string;
  readonly lead: string;
  readonly description: readonly string[];
  readonly category: Category;
  readonly image: EventImage;
  readonly price: EventPrice;
  readonly ageRestriction: number;
  readonly occurrences: readonly Occurrence[];
  readonly venue: VenueSummary | null;
  readonly organizer: { readonly name: string; readonly website: string | null } | null;
  readonly tags: readonly string[];
  readonly ticketUrl: string | null;
}

export interface Paginated<T> {
  readonly items: readonly T[];
  readonly page: number;
  readonly pageSize: number;
  readonly totalItems: number;
  readonly totalPages: number;
}
