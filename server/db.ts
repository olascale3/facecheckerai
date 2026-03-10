import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "../shared/schema";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("WARNING: DATABASE_URL is not set");
}

const pool = new pg.Pool({
  connectionString: connectionString || "postgresql://localhost/placeholder",
  ssl: connectionString ? { rejectUnauthorized: false } : false,
  max: 1,
  connectionTimeoutMillis: 10000,
  idleTimeoutMillis: 30000,
});

pool.on("error", (err) => {
  console.error("Postgres pool error:", err.message);
});

export const db = drizzle(pool, { schema });
