import {
  AUTH_CLIENT_IP_HEADER,
  type CityEventsAuth
} from "@city-events/auth";
import type { FastifyPluginAsync, FastifyRequest } from "fastify";
import fp from "fastify-plugin";
import { fromNodeHeaders } from "better-auth/node";

declare module "fastify" {
  interface FastifyInstance {
    auth: CityEventsAuth;
  }
}

export interface AuthPluginOptions {
  readonly auth: CityEventsAuth;
  readonly publicOrigin: string;
}

function createAuthHeaders(request: FastifyRequest): Headers {
  const headers = fromNodeHeaders(request.headers);
  headers.set(AUTH_CLIENT_IP_HEADER, request.ip);
  return headers;
}

export async function getSession(
  auth: CityEventsAuth,
  request: FastifyRequest
) {
  return auth.api.getSession({
    headers: createAuthHeaders(request)
  });
}

const authPluginImplementation: FastifyPluginAsync<AuthPluginOptions> = async (
  app,
  options
) => {
  app.decorate("auth", options.auth);

  app.route({
    method: ["GET", "POST"],
    url: "/api/auth/*",
    async handler(request, reply) {
      const url = new URL(request.url, options.publicOrigin);
      const hasBody =
        request.body !== undefined &&
        request.method !== "GET" &&
        request.method !== "HEAD";
      const authRequest = new Request(url, {
        headers: createAuthHeaders(request),
        method: request.method,
        ...(hasBody ? { body: JSON.stringify(request.body) } : {})
      });
      const response = await options.auth.handler(authRequest);

      reply.code(response.status);
      response.headers.forEach((value, key) => {
        if (key !== "set-cookie") {
          reply.header(key, value);
        }
      });

      const cookies = response.headers.getSetCookie();
      if (cookies.length > 0) {
        reply.header("set-cookie", cookies);
      }

      const body = await response.text();
      return reply.send(body.length > 0 ? body : null);
    }
  });
};

export const authPlugin = fp(authPluginImplementation, {
  name: "city-events-auth"
});
