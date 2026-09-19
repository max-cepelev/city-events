import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { type DatabaseClient, schema } from "@city-events/db";
import { betterAuth } from "better-auth";
import { admin } from "better-auth/plugins";

import { accessControl, roles } from "./permissions.js";

export const AUTH_CLIENT_IP_HEADER = "x-city-events-client-ip";

export interface AuthOptions {
  readonly baseUrl: string;
  readonly database: DatabaseClient;
  readonly production: boolean;
  readonly secret: string;
  readonly trustedOrigins: readonly string[];
}

export function createAuth(options: AuthOptions) {
  return betterAuth({
    advanced: {
      ipAddress: {
        ipAddressHeaders: [AUTH_CLIENT_IP_HEADER]
      },
      useSecureCookies: options.production
    },
    appName: "City Events",
    basePath: "/api/auth",
    baseURL: options.baseUrl,
    database: drizzleAdapter(options.database, {
      provider: "pg",
      schema
    }),
    emailAndPassword: {
      autoSignIn: false,
      disableSignUp: true,
      enabled: true,
      revokeSessionsOnPasswordReset: true
    },
    plugins: [
      admin({
        ac: accessControl,
        defaultRole: "user",
        roles
      })
    ],
    secret: options.secret,
    session: {
      expiresIn: 60 * 60 * 24 * 7,
      updateAge: 60 * 60 * 24
    },
    trustedOrigins: [...options.trustedOrigins]
  });
}

export { accessControl, roles } from "./permissions.js";
export type { AppRole } from "./permissions.js";
export type CityEventsAuth = ReturnType<typeof createAuth>;
