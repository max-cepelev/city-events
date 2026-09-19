import {
  boolean,
  char,
  geometry,
  index,
  pgTable,
  timestamp,
  uniqueIndex,
  uuid,
  varchar
} from "drizzle-orm/pg-core";

export const city = pgTable(
  "city",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: varchar("name", { length: 160 }).notNull(),
    slug: varchar("slug", { length: 160 }).notNull(),
    region: varchar("region", { length: 160 }).notNull(),
    countryCode: char("country_code", { length: 2 }).notNull(),
    timezone: varchar("timezone", { length: 64 }).notNull(),
    location: geometry("location", {
      mode: "xy",
      srid: 4326,
      type: "point"
    }),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at", { mode: "date", withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true })
      .defaultNow()
      .notNull()
  },
  (table) => [
    uniqueIndex("city_slug_unique").on(table.slug),
    index("city_location_gist").using("gist", table.location)
  ]
);

export type CityRecord = typeof city.$inferSelect;
export type NewCityRecord = typeof city.$inferInsert;
