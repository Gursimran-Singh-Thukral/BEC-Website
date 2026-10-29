import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { drizzle as drizzlePg, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { migrate as migratePg } from "drizzle-orm/node-postgres/migrator";
import { drizzle as drizzleLite } from "drizzle-orm/pglite";
import { migrate as migrateLite } from "drizzle-orm/pglite/migrator";
import pg from "pg";
import { PGlite } from "@electric-sql/pglite";
import { config } from "../config";
import * as schema from "./schema";

export type DB = NodePgDatabase<typeof schema>;
export let db: DB;

/** Folder with the generated SQL migrations (next to src/ in dev, and next to dist/ when built). */
function migrationsFolder() {
  const here = path.dirname(fileURLToPath(import.meta.url));
  for (const c of [path.resolve(here, "../drizzle"), path.resolve(here, "../../drizzle"), path.resolve(process.cwd(), "drizzle")]) {
    if (fs.existsSync(path.join(c, "meta", "_journal.json"))) return c;
  }
  throw new Error("Could not find the drizzle migrations folder");
}

/** Connects to Postgres (or embedded PGlite for local dev) and applies pending migrations. */
export async function initDb() {
  if (config.databaseUrl) {
    const needsSsl = !/localhost|127\.0\.0\.1/.test(config.databaseUrl) && !/sslmode=disable/.test(config.databaseUrl);
    const pool = new pg.Pool({
      connectionString: config.databaseUrl,
      max: config.poolMax,
      ssl: needsSsl ? { rejectUnauthorized: false } : undefined,
    });
    db = drizzlePg(pool, { schema });
    await migratePg(db, { migrationsFolder: migrationsFolder() });
    console.log("[db] connected to Postgres");
  } else {
    const dir = path.resolve(config.pgliteDir);
    fs.mkdirSync(path.dirname(dir), { recursive: true });
    const lite = drizzleLite(new PGlite(dir), { schema });
    await migrateLite(lite, { migrationsFolder: migrationsFolder() });
    db = lite as unknown as DB; // same query API; only the driver differs
    console.log(`[db] using embedded Postgres (PGlite) at ${dir}`);
  }
}

export { schema };
