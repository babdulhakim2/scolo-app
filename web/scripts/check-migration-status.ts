#!/usr/bin/env tsx

import { drizzle } from "drizzle-orm/postgres-js";
import { sql } from "drizzle-orm";
import postgres from "postgres";
import * as dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";

// Load environment variables
if (fs.existsSync(".env.local")) {
  dotenv.config({ path: ".env.local" });
} else if (fs.existsSync(".env")) {
  dotenv.config({ path: ".env" });
}

type MigrationRecord = {
  id: number;
  hash: string;
  created_at: Date;
}

async function checkMigrationStatus() {
  const DATABASE_URL = process.env.DATABASE_URL;

  if (!DATABASE_URL) {
    console.error("❌ DATABASE_URL environment variable is not set");
    process.exit(1);
  }

  console.log("🔍 Checking migration status...\n");

  try {
    // Create connection
    const connection = postgres(DATABASE_URL, {
      max: 1,
      connect_timeout: 10,
    });
    const db = drizzle(connection);

    // Check if migrations table exists (can be in 'drizzle' or 'public' schema)
    const migrationTableExists = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM pg_tables
        WHERE tablename = 'drizzle_migrations'
        AND schemaname IN ('public', 'drizzle')
      );
    `);

    const tableExists = migrationTableExists[0]?.exists;

    if (!tableExists) {
      console.log("⚠️  No migrations table found. Migrations have not been run yet.");
      console.log("💡 Run 'npm run db:migrate:deploy' to apply migrations.\n");
      await connection.end();
      process.exit(0);
    }

    // Get applied migrations (check both schemas)
    const appliedMigrations = await db.execute(sql`
      SELECT id, hash, created_at
      FROM drizzle.drizzle_migrations
      ORDER BY created_at DESC;
    `) as MigrationRecord[];

    console.log(`📊 Applied Migrations (${appliedMigrations.length} total):`);
    console.log("─".repeat(60));

    if (appliedMigrations.length === 0) {
      console.log("  No migrations have been applied yet.\n");
    } else {
      appliedMigrations.forEach((migration, index) => {
        const date = new Date(migration.created_at).toLocaleString();
        console.log(`  ${index + 1}. ${migration.hash}`);
        console.log(`     Applied: ${date}`);
      });
      console.log();
    }

    // Check for pending migrations
    const migrationsPath = path.join(process.cwd(), "drizzle");
    let pendingCount = 0;

    if (fs.existsSync(migrationsPath)) {
      const migrationFiles = fs.readdirSync(migrationsPath)
        .filter(file => file.endsWith('.sql'))
        .sort();

      console.log(`📁 Migration Files in ./drizzle:`);
      console.log("─".repeat(60));

      const appliedHashes = new Set(appliedMigrations.map(m => m.hash));

      migrationFiles.forEach(file => {
        const filePath = path.join(migrationsPath, file);
        const content = fs.readFileSync(filePath, 'utf-8');

        // Extract hash from file name (format: 0000_hash.sql)
        const hashMatch = file.match(/^\d+_(.+)\.sql$/);
        const fileHash = hashMatch ? hashMatch[1] : file;

        const isApplied = appliedHashes.has(fileHash) ||
                         appliedMigrations.some(m => file.includes(m.hash));

        if (isApplied) {
          console.log(`  ✅ ${file} (applied)`);
        } else {
          console.log(`  ⏳ ${file} (pending)`);
          pendingCount++;
        }
      });
      console.log();
    }

    // Check database tables
    console.log("📊 Database Tables:");
    console.log("─".repeat(60));

    const tables = await db.execute(sql`
      SELECT
        tablename,
        (SELECT COUNT(*) FROM pg_catalog.pg_attribute
         WHERE attrelid = (quote_ident(schemaname)||'.'||quote_ident(tablename))::regclass
         AND attnum > 0 AND NOT attisdropped) as column_count
      FROM pg_catalog.pg_tables
      WHERE schemaname = 'public'
      AND tablename NOT LIKE 'pg_%'
      AND tablename != 'drizzle_migrations'
      ORDER BY tablename;
    `);

    if (tables.length === 0) {
      console.log("  No tables found in the database.\n");
    } else {
      tables.forEach((table: any) => {
        console.log(`  • ${table.tablename} (${table.column_count} columns)`);
      });
      console.log();
    }

    // Summary
    console.log("📈 Summary:");
    console.log("─".repeat(60));
    console.log(`  Total applied migrations: ${appliedMigrations.length}`);
    console.log(`  Pending migrations: ${pendingCount}`);
    console.log(`  Database tables: ${tables.length}`);

    const lastMigration = appliedMigrations[0];
    if (lastMigration) {
      console.log(`  Last migration: ${new Date(lastMigration.created_at).toLocaleString()}`);
    }
    console.log();

    // Recommendations
    if (pendingCount > 0) {
      console.log("💡 Recommendations:");
      console.log(`  • You have ${pendingCount} pending migration(s).`);
      console.log("  • Run 'npm run db:migrate:deploy' to apply them.");
    } else {
      console.log("✅ All migrations are up to date!");
    }

    await connection.end();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error checking migration status:", error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  checkMigrationStatus();
}

export { checkMigrationStatus };