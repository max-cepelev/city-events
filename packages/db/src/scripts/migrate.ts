import { migrate } from "drizzle-orm/node-postgres/migrator";
import { resolve } from "node:path";

import { createDatabase } from "../index.js";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is required to run migrations");
}

const database = createDatabase({ connectionString, maxConnections: 2 });

try {
  await migrate(database.db, {
    migrationsFolder: resolve(import.meta.dirname, "../../drizzle")
  });
} finally {
  await database.close();
}
