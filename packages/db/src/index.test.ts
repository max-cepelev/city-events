import { describe, expect, it } from "vitest";

import { createDatabase } from "./index.js";

describe("createDatabase", () => {
  it("does not open a PostgreSQL connection until the first query", async () => {
    const database = createDatabase({
      connectionString: "postgresql://unused:unused@127.0.0.1:1/unused"
    });

    expect(database.pool.totalCount).toBe(0);
    await database.close();
  });
});
