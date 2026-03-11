import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "../shared/schema";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is required");
}

const sql = neon(connectionString);
export const db = drizzle(sql, { schema });

export const pool = {
  query: async (text: string, params?: any[]) => {
    try {
      const result = await sql(text, params || []);
      return { rows: result };
    } catch (error) {
      console.error("Database query error:", error);
      throw error;
    }
  },
  end: () => Promise.resolve(),
  connect: () => Promise.resolve({ release: () => {} }),
  on: () => {},
};
