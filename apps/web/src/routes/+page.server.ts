import { listFeatured } from "$lib/data";

import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = () => {
  return {
    featured: listFeatured(3)
  };
};
