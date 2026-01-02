import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

function createDb() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    console.warn('DATABASE_URL not set - database features will be unavailable');
    return null;
  }

  const client = postgres(connectionString, { prepare: false });
  return drizzle(client, { schema });
}

export const db = createDb();

export function requireDb() {
  if (!db) {
    throw new Error('Database not configured. Set DATABASE_URL environment variable.');
  }
  return db;
}

export * from './schema';
