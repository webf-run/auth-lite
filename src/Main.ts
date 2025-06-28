import { drizzle } from 'drizzle-orm/better-sqlite3';

import { IAMClient } from './Client.js';
import { makeSQLiteClient } from './Db/SQLite.js';

export interface IAMClientOptions {
  databaseUrl: string;
  migrations: boolean;
}

export async function initIAMClient(
  options: IAMClientOptions
): Promise<IAMClient> {
  const { databaseUrl, migrations } = options;

  const sqlite = makeSQLiteClient(databaseUrl);

  const db = drizzle({
    client: sqlite,
    casing: 'snake_case',
  });

  if (migrations) {
    // Initialize migrations if needed
    // This is a placeholder for migration logic
  }

  const iamClient = new IAMClient(db);

  return iamClient;
}
