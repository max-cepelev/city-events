import { sql } from "drizzle-orm";

import { createDatabase } from "../index.js";
import { city } from "../schema/index.js";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is required to seed the database");
}

const database = createDatabase({ connectionString, maxConnections: 2 });

try {
  await database.db
    .insert(city)
    .values({
      countryCode: "RU",
      isActive: true,
      location: sql`ST_SetSRID(ST_MakePoint(56.2294, 58.0105), 4326)`,
      name: "Пермь",
      region: "Пермский край",
      slug: "perm",
      timezone: "Asia/Yekaterinburg"
    })
    .onConflictDoUpdate({
      target: city.slug,
      set: {
        countryCode: "RU",
        isActive: true,
        location: sql`ST_SetSRID(ST_MakePoint(56.2294, 58.0105), 4326)`,
        name: "Пермь",
        region: "Пермский край",
        timezone: "Asia/Yekaterinburg",
        updatedAt: new Date()
      }
    });
} finally {
  await database.close();
}
