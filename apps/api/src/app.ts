import { createAuth } from "@city-events/auth";
import { createDatabase } from "@city-events/db";
import {
  authPlugin,
  createRedisClient,
  healthPlugin,
  infrastructurePlugin,
  platformPlugin
} from "@city-events/fastify-plugins";
import Fastify, { type FastifyInstance } from "fastify";

import type { ApiConfig } from "./config.js";

export interface BuildAppOptions {
  readonly infrastructure?: boolean;
  readonly logger?: boolean;
}

export async function buildApp(
  config: ApiConfig,
  options: BuildAppOptions = {}
): Promise<FastifyInstance> {
  const app = Fastify({
    logger: options.logger ?? true,
    trustProxy: config.production
  });

  await app.register(platformPlugin, {
    corsOrigins: config.trustedOrigins,
    exposeDocumentation: !config.production
  });

  if (options.infrastructure === false) {
    await app.register(healthPlugin, {
      checkPostgres: async () => undefined,
      checkRedis: async () => undefined,
      serviceName: "api"
    });
    return app;
  }

  const database = createDatabase({ connectionString: config.databaseUrl });
  const redis = createRedisClient(config.redisUrl);

  try {
    await app.register(infrastructurePlugin, { database, redis });

    const auth = createAuth({
      baseUrl: config.authUrl,
      database: database.db,
      production: config.production,
      secret: config.authSecret,
      trustedOrigins: config.trustedOrigins
    });

    await app.register(authPlugin, {
      auth,
      publicOrigin: config.authUrl
    });
    await app.register(healthPlugin, {
      checkPostgres: () => database.ping(),
      checkRedis: async () => {
        await redis.ping();
      },
      serviceName: "api"
    });
  } catch (error) {
    await app.close();
    throw error;
  }

  return app;
}
