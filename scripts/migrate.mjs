import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL is required to run migrations");
  process.exit(1);
}

// Parse DATABASE_URL to extract db name and build admin connection
const url = new URL(connectionString);
const dbName = url.pathname.slice(1); // remove leading /
const adminUrl = new URL(connectionString);
adminUrl.pathname = "/postgres"; // connect to default postgres db

// Create database if it doesn't exist
const adminClient = postgres(adminUrl.toString(), { max: 1 });
try {
  const result = await adminClient`
    SELECT 1 FROM pg_database WHERE datname = ${dbName}
  `;
  if (result.length === 0) {
    console.log(`Creating database "${dbName}"...`);
    await adminClient.unsafe(`CREATE DATABASE "${dbName}"`);
    console.log(`Database "${dbName}" created`);
  } else {
    console.log(`Database "${dbName}" already exists`);
  }
} finally {
  await adminClient.end({ timeout: 5 });
}

// Run migrations
const client = postgres(connectionString, { max: 1 });
const db = drizzle(client);

try {
  await migrate(db, { migrationsFolder: "./drizzle" });
  console.log("Migrations applied");
} finally {
  await client.end({ timeout: 5 });
}
