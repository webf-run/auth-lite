import { BetterSQLite3Database, drizzle } from 'drizzle-orm/better-sqlite3';

import { OAuth2Client } from './OAuth/OAuth2Client.js';

export type IAMClient = BetterSQLite3Database & { __iamClient: symbol };

export interface IAMClientOptions {
  databaseUrl: string;
  migrations: boolean;
}

export async function initIAMClient(
  options: IAMClientOptions
): Promise<IAMClient> {
  const { databaseUrl, migrations } = options;

  const db = drizzle(databaseUrl);

  if (migrations) {
    // Initialize migrations if needed
    // This is a placeholder for migration logic
  }

  return db as any as IAMClient;
}
