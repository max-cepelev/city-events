import { describe, expect, it } from "vitest";

import { readinessResponseSchema } from "../src/index.js";

describe("readinessResponseSchema", () => {
  it("accepts an explicit degraded dependency state", () => {
    const result = readinessResponseSchema.parse({
      dependencies: { postgres: "up", redis: "down" },
      service: "api",
      status: "degraded",
      timestamp: "2026-09-19T10:00:00.000Z"
    });

    expect(result.dependencies.redis).toBe("down");
  });
});
