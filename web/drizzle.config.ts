import { defineConfig } from 'drizzle-kit';
import * as dotenv from 'dotenv';

// Load environment variables
try {
  if (require('fs').existsSync('.env.local')) {
    dotenv.config({ path: '.env.local' });
  } else if (require('fs').existsSync('.env')) {
    dotenv.config({ path: '.env' });
  }
} catch (e) {
  // Ignore errors
}

export default defineConfig({
  schema: './lib/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  verbose: true,
  strict: true,
});
