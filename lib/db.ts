import { Pool } from "pg";

/**
 * One connection pool for the whole app — Better Auth and our own order queries
 * share it. In dev, Next re-evaluates modules on every edit, so the pool is
 * cached on globalThis to stop each reload opening a new set of connections and
 * eventually exhausting Postgres.
 */
const globalForDb = globalThis as unknown as { pool?: Pool };

export const pool =
  globalForDb.pool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
  });

if (process.env.NODE_ENV !== "production") globalForDb.pool = pool;
