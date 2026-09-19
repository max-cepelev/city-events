import type { Category } from "$lib/types";

export const CATEGORIES: readonly Category[] = [
  { slug: "concerts", name: "Концерты" },
  { slug: "theatre", name: "Театр" },
  { slug: "exhibitions", name: "Выставки" },
  { slug: "cinema", name: "Кино" },
  { slug: "kids", name: "Детям" },
  { slug: "sport", name: "Спорт" },
  { slug: "lectures", name: "Лекции" },
  { slug: "food", name: "Еда" },
  { slug: "excursions", name: "Экскурсии" }
];

export function categoryBySlug(slug: string): Category | null {
  return CATEGORIES.find((category) => category.slug === slug) ?? null;
}
