import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import type { FastifyPluginAsync } from "fastify";
import fp from "fastify-plugin";

export interface PlatformPluginOptions {
  readonly corsOrigins: readonly string[];
  readonly exposeDocumentation?: boolean;
}

const platformPluginImplementation: FastifyPluginAsync<
  PlatformPluginOptions
> = async (app, options) => {
  await app.register(cors, {
    credentials: true,
    origin: [...options.corsOrigins]
  });
  await app.register(helmet, {
    contentSecurityPolicy: false
  });
  await app.register(swagger, {
    openapi: {
      info: {
        title: "City Events API",
        version: "0.1.0"
      }
    }
  });

  if (options.exposeDocumentation ?? true) {
    await app.register(swaggerUi, {
      routePrefix: "/documentation"
    });
  }
};

export const platformPlugin = fp(platformPluginImplementation, {
  name: "city-events-platform"
});
