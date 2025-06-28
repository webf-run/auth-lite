import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';

import type { SQLite } from '../src/Type.js';

export function getDb(): SQLite {
  const db = drizzle({
    connection: ':memory:',
    casing: 'snake_case',
    // logger: true,
  });

  const resolvedPath = import.meta.resolve('#migrations')
  const migrationsFolder = dirname(fileURLToPath(resolvedPath));

  migrate(db, {
    migrationsFolder,
    migrationsTable: 'migration',
  });

  return db;
}
