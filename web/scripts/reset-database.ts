#!/usr/bin/env tsx

import { drizzle } from "drizzle-orm/postgres-js";
import { sql } from "drizzle-orm";
import postgres from "postgres";
import * as dotenv from "dotenv";
import * as fs from "fs";
import * as readline from "readline";

// Load environment variables
if (fs.existsSync(".env.local")) {
  dotenv.config({ path: ".env.local" });
} else if (fs.existsSync(".env")) {
  dotenv.config({ path: ".env" });
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function confirm(question: string): Promise<boolean> {
  return new Promise((resolve) => {
    rl.question(question + " (yes/no): ", (answer) => {
      resolve(answer.toLowerCase() === "yes" || answer.toLowerCase() === "y");
    });
  });
}

async function resetDatabase() {
  const DATABASE_URL = process.env.DATABASE_URL;

  if (!DATABASE_URL) {
    console.error("❌ DATABASE_URL environment variable is not set");
    process.exit(1);
  }

  console.log("⚠️  WARNING: Database Reset");
  console.log("─".repeat(60));
  console.log("This will:");
  console.log("  1. DROP all existing tables");
  console.log("  2. Remove all data (THIS CANNOT BE UNDONE)");
  console.log("  3. Re-run all migrations from scratch");
  console.log();
  console.log(`📊 Database: ${DATABASE_URL.replace(/\/\/.*@/, "//***:***@")}`);
  console.log();

  // Skip confirmation in CI
  if (!process.env.CI && !process.env.GITHUB_ACTIONS) {
    const confirmed = await confirm("Are you sure you want to reset the database?");
    if (!confirmed) {
      console.log("❌ Reset cancelled");
      rl.close();
      process.exit(0);
    }

    const doubleConfirmed = await confirm("This will DELETE ALL DATA. Are you absolutely sure?");
    if (!doubleConfirmed) {
      console.log("❌ Reset cancelled");
      rl.close();
      process.exit(0);
    }
  }

  rl.close();
  console.log();
  console.log("🔄 Starting database reset...");

  try {
    // Create connection with SSL for Supabase
    const connection = postgres(DATABASE_URL, {
      max: 1,
      connect_timeout: 30,
      ssl: DATABASE_URL.includes('supabase') ? 'require' : false,
    });
    const db = drizzle(connection);

    // Drop tables in correct order (respecting foreign keys)
    console.log("📦 Dropping existing tables...");

    const tables = [
      'investigations',
      'edges',
      'nodes',
      'projects',
      'drizzle_migrations'
    ];

    for (const table of tables) {
      try {
        await db.execute(sql.raw(`DROP TABLE IF EXISTS "${table}" CASCADE`));
        console.log(`  ✓ Dropped table: ${table}`);
      } catch (error) {
        console.log(`  ⚠ Could not drop table ${table}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    // Drop the drizzle schema if it exists
    try {
      await db.execute(sql`DROP SCHEMA IF EXISTS drizzle CASCADE`);
      console.log("  ✓ Dropped drizzle schema");
    } catch (error) {
      console.log(`  ⚠ Could not drop drizzle schema`);
    }

    console.log();
    console.log("✅ All tables dropped successfully");
    console.log();

    // Close connection
    await connection.end();

    // Now run migrations to recreate everything
    console.log("🔄 Running migrations to recreate tables...");
    console.log();

    // Import and run the migration script
    const { runMigrations } = await import("./migrate");
    await runMigrations();

  } catch (error) {
    console.error("❌ Reset failed:", error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  resetDatabase();
}

export { resetDatabase };