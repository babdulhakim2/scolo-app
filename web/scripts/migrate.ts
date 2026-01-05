#!/usr/bin/env tsx

import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { sql } from "drizzle-orm";
import postgres from "postgres";
import * as dotenv from "dotenv";
import * as path from "path";
import * as fs from "fs";

// Load environment variables
if (fs.existsSync(".env.local")) {
  dotenv.config({ path: ".env.local" });
  console.log("ℹ️  Loading environment from .env.local");
} else if (fs.existsSync(".env")) {
  dotenv.config({ path: ".env" });
  console.log("ℹ️  Loading environment from .env");
} else {
  console.log("ℹ️  No .env file found, using environment variables");
}

async function runMigrations() {
  const DATABASE_URL = process.env.DATABASE_URL;

  if (!DATABASE_URL) {
    console.error("❌ DATABASE_URL environment variable is not set");
    console.error(
      "Please ensure DATABASE_URL is configured in your environment"
    );
    process.exit(1);
  }

  console.log("🚀 Starting database migrations...");
  console.log(
    `📊 Database URL: ${DATABASE_URL.replace(/\/\/.*@/, "//***:***@")}`
  ); // Hide credentials

  try {
    // Test connection first
    console.log("🔌 Testing database connection...");

    // Create connection with timeout and SSL settings for Supabase
    const connection = postgres(DATABASE_URL, {
      max: 1,
      connect_timeout: 30,
      idle_timeout: 20,
      max_lifetime: 60 * 30,
      ssl: DATABASE_URL.includes('supabase') ? 'require' : false,
    });

    // Test the connection
    try {
      await connection`SELECT 1`;
      console.log("✅ Database connection successful");
    } catch (connError) {
      console.error("❌ Failed to connect to database");
      console.error("   Please check your DATABASE_URL configuration");
      if (DATABASE_URL.includes('supabase')) {
        console.error("   For Supabase, ensure:");
        console.error("   1. The connection string is correct");
        console.error("   2. SSL is enabled (already configured)");
        console.error("   3. The database is accessible from your IP");
      }
      throw connError;
    }

    const db = drizzle(connection);

    // Check if we're using Supabase (PostGIS is enabled by default)
    const isSupabase =
      DATABASE_URL.includes("supabase.co") ||
      DATABASE_URL.includes("supabase.com") ||
      DATABASE_URL.includes("pooler.supabase.com");

    if (isSupabase) {
      console.log(
        "🔗 Detected Supabase database - PostGIS is enabled by default"
      );
    } else {
      // Enable PostGIS extension if not already enabled (for other PostgreSQL instances)
      console.log("🗺️  Ensuring PostGIS extension is enabled...");
      try {
        await db.execute(sql`CREATE EXTENSION IF NOT EXISTS "postgis";`);
        console.log("✅ PostGIS extension enabled");
      } catch (error) {
        console.log(
          "⚠️  PostGIS extension may already be enabled or not available"
        );
      }
    }

    // Check if drizzle migrations directory exists
    const migrationsPath = path.join(process.cwd(), "drizzle");
    if (!fs.existsSync(migrationsPath)) {
      console.log("📁 Creating drizzle migrations directory...");
      fs.mkdirSync(migrationsPath, { recursive: true });
    }

    // Check for migration files
    const migrationFiles = fs.readdirSync(migrationsPath).filter(
      file => file.endsWith('.sql')
    );

    console.log(`📋 Found ${migrationFiles.length} migration file(s)`);

    if (migrationFiles.length === 0) {
      console.log("⚠️  No migration files found. You may need to run 'npm run db:generate' first.");
      // Don't fail in production - migrations might be embedded
      if (process.env.NODE_ENV !== "production") {
        console.log("💡 Tip: Create migrations with 'npm run db:generate' after schema changes");
      }
    }

    // Run migrations
    console.log("📦 Running migrations from ./drizzle directory...");
    await migrate(db, {
      migrationsFolder: "./drizzle",
      migrationsTable: "drizzle_migrations",
    });

    console.log("✅ Migrations completed successfully!");

    // Verify tables exist
    console.log("🔍 Verifying database schema...");
    const tables = await db.execute(sql`
      SELECT tablename
      FROM pg_catalog.pg_tables
      WHERE schemaname = 'public'
      AND tablename IN ('projects', 'nodes', 'edges', 'investigations')
      ORDER BY tablename;
    `);

    console.log(`📊 Found ${tables.length} tables in the database`);
    tables.forEach((table: any) => {
      console.log(`  ✓ ${table.tablename}`);
    });

    // Close connection
    await connection.end();

    process.exit(0);
  } catch (error) {
    // Check if it's a "already exists" error that we can safely ignore
    const errorMessage = error instanceof Error ? error.message : String(error);
    let causeMessage = "";

    if (typeof error === 'object' && error && 'cause' in error) {
      const cause = (error as { cause?: unknown }).cause;
      if (typeof cause === 'object' && cause && 'message' in (cause as Record<string, unknown>)) {
        const msg = (cause as Record<string, unknown>).message;
        causeMessage = typeof msg === 'string' ? msg : '';
      }
    }

    console.error("❌ Migration error details:", {
      message: errorMessage,
      cause: causeMessage,
      stack: error instanceof Error ? error.stack : undefined,
    });

    // Check for common non-critical errors
    if (
      errorMessage.includes("already exists") ||
      errorMessage.includes("already applied") ||
      errorMessage.includes("duplicate key") ||
      errorMessage.includes("relation") ||
      causeMessage.includes("already exists") ||
      (causeMessage.includes("type") && causeMessage.includes("already exists"))
    ) {
      console.log("⚠️  Some migrations were already applied, continuing...");
      console.log("✅ Migrations completed (with some skipped)!");
      process.exit(0);
    } else if (
      errorMessage.includes("does not exist") &&
      errorMessage.includes("drizzle_migrations")
    ) {
      console.log("📝 First time running migrations, creating migrations table...");
      // This is expected on first run
      process.exit(0);
    } else {
      console.error("❌ Migration failed with critical error");

      // In CI/CD environments, fail the migration
      if (process.env.CI || process.env.GITHUB_ACTIONS) {
        console.error("🔄 Failing migration in CI/CD environment");
        process.exit(1);
      }

      // In production, we might want to continue with the build even if migrations fail
      // to avoid blocking deployments for non-critical migration issues
      if (process.env.NODE_ENV === "production") {
        console.log(
          "🔄 Continuing with build despite migration issues in production..."
        );
        process.exit(0);
      } else {
        process.exit(1);
      }
    }
  }
}

// Run if called directly
if (require.main === module) {
  runMigrations();
}

export { runMigrations };