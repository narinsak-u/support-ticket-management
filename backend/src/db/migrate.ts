import { resolve } from 'node:path';
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';

async function runMigrations(): Promise<void> {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL is required');
  }

  const pool = new Pool({ connectionString });
  try {
    await migrate(drizzle(pool), { migrationsFolder: resolve(__dirname, '../../drizzle') });
  } finally {
    await pool.end();
  }
}

void runMigrations().catch((error: unknown) => {
  console.error('Database migration failed:', error);
  process.exitCode = 1;
});
