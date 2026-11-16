import pg from "pg";
const { Pool } = pg;
if (!process.env.DATABASE_URL) throw new Error("Falta configurar DATABASE_URL.");
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : undefined
});
