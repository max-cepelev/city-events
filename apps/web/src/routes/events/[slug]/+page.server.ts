import { error } from "@sveltejs/kit";

import { getEvent } from "$lib/data";

import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = ({ params }) => {
  const event = getEvent(params.slug);
  if (event === null) {
    error(404, "Событие не найдено или снято с публикации");
  }
  return { event };
};
