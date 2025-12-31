import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL is required to run migrations");
  process.exit(1);
}

const client = postgres(connectionString, { max: 1 });
const db = drizzle(client);

try {
  await migrate(db, { migrationsFolder: "./drizzle" });
  console.log("Migrations applied");
} finally {
  await client.end({ timeout: 5 });
}


