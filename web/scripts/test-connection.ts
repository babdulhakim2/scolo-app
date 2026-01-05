#!/usr/bin/env tsx

import postgres from "postgres";
import * as dotenv from "dotenv";
import * as fs from "fs";
import { URL } from "url";

// Load environment variables
if (fs.existsSync(".env.local")) {
  dotenv.config({ path: ".env.local" });
  console.log("ℹ️  Loading environment from .env.local");
} else if (fs.existsSync(".env")) {
  dotenv.config({ path: ".env" });
  console.log("ℹ️  Loading environment from .env");
}

async function testConnection() {
  const DATABASE_URL = process.env.DATABASE_URL;

  if (!DATABASE_URL) {
    console.error("❌ DATABASE_URL environment variable is not set");
    process.exit(1);
  }

  // Parse URL for debugging
  try {
    const url = new URL(DATABASE_URL);
    console.log("🔍 Connection Details:");
    console.log(`  Host: ${url.hostname}`);
    console.log(`  Port: ${url.port || "5432"}`);
    console.log(`  Database: ${url.pathname.slice(1)}`);
    console.log(`  SSL: ${DATABASE_URL.includes("supabase") ? "required" : "not required"}`);
  } catch (e) {
    console.error("❌ Invalid DATABASE_URL format");
    process.exit(1);
  }

  console.log("\n🔌 Testing database connection...");

  try {
    // Test with different connection settings
    const configs = [
      {
        name: "Default with SSL",
        options: {
          max: 1,
          connect_timeout: 10,
          ssl: DATABASE_URL.includes("supabase") ? "require" as const : false,
        },
      },
      {
        name: "With pooler mode",
        options: {
          max: 1,
          connect_timeout: 10,
          ssl: "require" as const,
          prepare: false, // Required for transaction pooling
        },
      },
    ];

    for (const config of configs) {
      console.log(`\n📡 Trying ${config.name}...`);
      try {
        const connection = postgres(DATABASE_URL, config.options);
        const result = await connection`SELECT version()`;
        console.log(`✅ Connected successfully!`);
        console.log(`  PostgreSQL: ${result[0].version.split(" ")[1]}`);
        await connection.end();

        // If successful, save the working config
        console.log("\n✨ Working configuration:");
        console.log(`  SSL: ${config.options.ssl}`);
        if (config.options.prepare === false) {
          console.log("  Prepare: false (transaction pooling mode)");
        }
        process.exit(0);
      } catch (error) {
        console.log(`  ❌ Failed: ${error instanceof Error ? error.message : "Unknown error"}`);
      }
    }

    console.error("\n❌ All connection attempts failed");
    console.error("\nPossible issues:");
    console.error("1. Network connectivity (firewall/VPN)");
    console.error("2. Database URL incorrect");
    console.error("3. SSL/TLS configuration mismatch");
    console.error("4. Database not accepting connections from your IP");

    if (DATABASE_URL.includes("supabase")) {
      console.error("\nSupabase specific:");
      console.error("- Use the 'Connection string' from Settings > Database");
      console.error("- For GitHub Actions, use the pooler connection string");
      console.error("- Ensure 'SSL mode' is set to 'Require' in connection settings");
    }

    process.exit(1);
  } catch (error) {
    console.error("❌ Connection test failed:", error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  testConnection();
}

export { testConnection };