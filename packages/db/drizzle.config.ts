import "dotenv/config";

import { defineConfig } from "drizzle-kit";

const url = process.env.DATABASE_URL;

if (!url) {
  throw new Error("DATABASE_URL is required by Drizzle Kit");
}

export default defineConfig({
  dbCredentials: { url },
  dialect: "postgresql",
  out: "./drizzle",
  schema: "./src/schema/index.ts",
  strict: true,
  verbose: true
});
