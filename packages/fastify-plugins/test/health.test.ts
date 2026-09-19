import Fastify from "fastify";
import { describe, expect, it } from "vitest";

import { healthPlugin } from "../src/index.js";

describe("healthPlugin", () => {
  it("reports dependency failure with HTTP 503", async () => {
    const app = Fastify();
    await app.register(healthPlugin, {
      checkPostgres: async () => undefined,
      checkRedis: async () => {
        throw new Error("redis unavailable");
      },
      serviceName: "test"
    });

    const response = await app.inject({ method: "GET", url: "/health/ready" });

    expect(response.statusCode).toBe(503);
    expect(response.json()).toMatchObject({
      dependencies: { postgres: "up", redis: "down" },
      status: "degraded"
    });
    await app.close();
  });
});
