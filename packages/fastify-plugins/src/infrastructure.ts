import type { Database } from "@city-events/db";
import type { FastifyPluginAsync } from "fastify";
import fp from "fastify-plugin";
import { Redis } from "ioredis";

declare module "fastify" {
  interface FastifyInstance {
    database: Database;
    redis: Redis;
  }
}

export interface InfrastructurePluginOptions {
  readonly database: Database;
  readonly redis: Redis;
}

export function createRedisClient(url: string): Redis {
  return new Redis(url, {
    connectionName: "city-events-api",
    lazyConnect: true,
    maxRetriesPerRequest: 1
  });
}

const infrastructurePluginImplementation: FastifyPluginAsync<
  InfrastructurePluginOptions
> = async (app, options) => {
  app.decorate("database", options.database);
  app.decorate("redis", options.redis);

  app.addHook("onClose", async () => {
    await Promise.allSettled([
      options.database.close(),
      options.redis.status === "end"
        ? Promise.resolve()
        : options.redis.quit().then(() => undefined)
    ]);
  });

  if (options.redis.status === "wait") {
    await options.redis.connect();
  }
};

export const infrastructurePlugin = fp(infrastructurePluginImplementation, {
  name: "city-events-infrastructure"
});
