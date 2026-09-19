import { describe, expect, it } from "vitest";

import { buildApp } from "../src/app.js";
import type { ApiConfig } from "../src/config.js";

const config: ApiConfig = {
  authSecret: "test-secret-with-more-than-thirty-two-characters",
  authUrl: "http://localhost:3000",
  databaseUrl: "postgresql://unused:unused@localhost:1/unused",
  host: "127.0.0.1",
  port: 3001,
  production: false,
  redisUrl: "redis://localhost:1",
  trustedOrigins: ["http://localhost:3000"]
};

describe("API foundation", () => {
  it("serves liveness without requiring infrastructure", async () => {
    const app = await buildApp(config, {
      infrastructure: false,
      logger: false
    });

    const response = await app.inject({ method: "GET", url: "/health/live" });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({ service: "api", status: "ok" });
    await app.close();
  });
});
