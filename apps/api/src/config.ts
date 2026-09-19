import { z } from "zod";

const apiEnvironmentSchema = z.object({
  API_HOST: z.string().min(1).default("0.0.0.0"),
  API_PORT: z.coerce.number().int().min(1).max(65_535).default(3001),
  BETTER_AUTH_SECRET: z.string().min(32),
  BETTER_AUTH_URL: z.url(),
  DATABASE_URL: z.string().startsWith("postgres"),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  REDIS_URL: z.string().startsWith("redis"),
  TRUSTED_ORIGINS: z.string().min(1)
});

export interface ApiConfig {
  readonly authSecret: string;
  readonly authUrl: string;
  readonly databaseUrl: string;
  readonly host: string;
  readonly port: number;
  readonly production: boolean;
  readonly redisUrl: string;
  readonly trustedOrigins: readonly string[];
}

export function loadApiConfig(
  environment: NodeJS.ProcessEnv = process.env
): ApiConfig {
  const parsed = apiEnvironmentSchema.parse(environment);

  return {
    authSecret: parsed.BETTER_AUTH_SECRET,
    authUrl: parsed.BETTER_AUTH_URL,
    databaseUrl: parsed.DATABASE_URL,
    host: parsed.API_HOST,
    port: parsed.API_PORT,
    production: parsed.NODE_ENV === "production",
    redisUrl: parsed.REDIS_URL,
    trustedOrigins: parsed.TRUSTED_ORIGINS.split(",")
      .map((origin) => origin.trim())
      .filter(Boolean)
  };
}
