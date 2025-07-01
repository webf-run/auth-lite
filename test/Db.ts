import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';

import { makeSQLiteClient } from '../src/Db/SQLite.js';
import { TransactionManager } from '../src/Db/Transaction.js';
import type { Context } from '../src/IAM/Context.js';
import type { Drizzle } from '../src/Type.js';

export function getDb(): Drizzle {
  const sqlite = makeSQLiteClient(':memory:');

  const db = drizzle({
    client: sqlite,
    casing: 'snake_case',
    // logger: true,
  });

  const resolvedPath = import.meta.resolve('#migrations');
  const migrationsFolder = dirname(fileURLToPath(resolvedPath));

  migrate(db, {
    migrationsFolder,
    migrationsTable: 'migration',
  });

  return db;
}

export function getContext(): Context {
  const db = getDb();
  const manager = new TransactionManager(db);

  return {
    db,
    $transaction: manager.$transaction.bind(manager),
  };
}
