import type { FastifyPluginAsync } from "fastify";
import fp from "fastify-plugin";

export interface HealthPluginOptions {
  readonly checkPostgres: () => Promise<void>;
  readonly checkRedis: () => Promise<void>;
  readonly serviceName: string;
}

const livenessSchema = {
  type: "object",
  additionalProperties: false,
  required: ["service", "status", "timestamp"],
  properties: {
    service: { type: "string" },
    status: { const: "ok" },
    timestamp: { type: "string", format: "date-time" }
  }
} as const;

const readinessSchema = {
  type: "object",
  additionalProperties: false,
  required: ["dependencies", "service", "status", "timestamp"],
  properties: {
    dependencies: {
      type: "object",
      additionalProperties: false,
      required: ["postgres", "redis"],
      properties: {
        postgres: { enum: ["up", "down"] },
        redis: { enum: ["up", "down"] }
      }
    },
    service: { type: "string" },
    status: { enum: ["ok", "degraded"] },
    timestamp: { type: "string", format: "date-time" }
  }
} as const;

const healthPluginImplementation: FastifyPluginAsync<HealthPluginOptions> = async (
  app,
  options
) => {
  app.get(
    "/health/live",
    {
      schema: {
        response: { 200: livenessSchema },
        tags: ["health"]
      }
    },
    async () => ({
      service: options.serviceName,
      status: "ok" as const,
      timestamp: new Date().toISOString()
    })
  );

  app.get(
    "/health/ready",
    {
      schema: {
        response: { 200: readinessSchema, 503: readinessSchema },
        tags: ["health"]
      }
    },
    async (_request, reply) => {
      const [postgres, redis] = await Promise.allSettled([
        options.checkPostgres(),
        options.checkRedis()
      ]);
      const postgresStatus = postgres.status === "fulfilled" ? "up" : "down";
      const redisStatus = redis.status === "fulfilled" ? "up" : "down";
      const healthy = postgresStatus === "up" && redisStatus === "up";

      return reply.code(healthy ? 200 : 503).send({
        dependencies: {
          postgres: postgresStatus,
          redis: redisStatus
        },
        service: options.serviceName,
        status: healthy ? "ok" : "degraded",
        timestamp: new Date().toISOString()
      });
    }
  );
};

export const healthPlugin = fp(healthPluginImplementation, {
  name: "city-events-health"
});
