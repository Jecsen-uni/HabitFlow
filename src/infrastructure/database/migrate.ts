import fs from "node:fs/promises";
import path from "node:path";
import { pool } from "./postgresPool";

async function migrate() {
  const migrationPath = path.resolve(__dirname, "../../../migrations/001_init.sql");
  const sql = await fs.readFile(migrationPath, "utf8");

  await pool.query(sql);
  await pool.end();
  console.log("Database migration completed.");
}

migrate().catch(async (error) => {
  console.error(error);
  await pool.end();
  process.exit(1);
});
