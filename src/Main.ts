import Database from 'better-sqlite3';
import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/better-sqlite3';

import { IAMClient } from './Client.js';
import { user } from './Schema/Schema.js';

export interface IAMClientOptions {
  databaseUrl: string;
  migrations: boolean;
}

export async function initIAMClient(
  options: IAMClientOptions
): Promise<IAMClient> {
  const { databaseUrl, migrations } = options;

  const db = drizzle({
    connection: databaseUrl,
    casing: 'snake_case',
  });

  if (migrations) {
    // Initialize migrations if needed
    // This is a placeholder for migration logic
  }

  const iamClient = new IAMClient(db);

  return iamClient;
}
