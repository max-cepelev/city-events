import { listCategories, listEvents, listMapEvents, type PriceFilter } from "$lib/data";
import type { DatePreset } from "$lib/types";

import type { PageServerLoad } from "./$types";

const DATE_PRESETS: ReadonlySet<string> = new Set(["today", "tomorrow", "weekend", "week"]);
const PRICE_FILTERS: ReadonlySet<string> = new Set(["free", "500", "1000"]);

export const load: PageServerLoad = ({ url }) => {
  const dateParam = url.searchParams.get("date") ?? "";
  const priceParam = url.searchParams.get("price") ?? "";
  const pageParam = Number(url.searchParams.get("page") ?? "1");
  const view = url.searchParams.get("view") === "map" ? "map" : "list";

  const filter = {
    category: url.searchParams.get("category") ?? "",
    date: DATE_PRESETS.has(dateParam) ? (dateParam as DatePreset) : "",
    price: PRICE_FILTERS.has(priceParam) ? (priceParam as PriceFilter) : "",
    q: url.searchParams.get("q")?.trim() ?? ""
  };

  const query = {
    category: filter.category || undefined,
    date: (filter.date || undefined) as DatePreset | undefined,
    price: (filter.price || undefined) as PriceFilter | undefined,
    q: filter.q || undefined
  };

  const result = listEvents({
    ...query,
    page: Number.isFinite(pageParam) && pageParam > 0 ? Math.trunc(pageParam) : 1
  });

  return {
    categories: listCategories(),
    result,
    filter,
    view,
    mapGroups: view === "map" ? listMapEvents(query) : []
  };
};
