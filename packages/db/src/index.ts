import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool, type PoolConfig } from "pg";

import * as schema from "./schema/index.js";

export interface DatabaseOptions {
  readonly connectionString: string;
  readonly maxConnections?: number;
}

export interface Database {
  readonly db: NodePgDatabase<typeof schema>;
  readonly pool: Pool;
  close(): Promise<void>;
  ping(): Promise<void>;
}

export function createDatabase(options: DatabaseOptions): Database {
  const poolConfig: PoolConfig = {
    connectionString: options.connectionString,
    max: options.maxConnections ?? 10
  };
  const pool = new Pool(poolConfig);
  const db = drizzle({ client: pool, schema });

  return {
    db,
    pool,
    async close() {
      await pool.end();
    },
    async ping() {
      await pool.query("select 1");
    }
  };
}

export { schema };
export type DatabaseClient = NodePgDatabase<typeof schema>;
