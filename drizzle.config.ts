import type { Config } from 'drizzle-kit';

export default {
  dialect: 'sqlite',
  schema: [
    './src/Schema/Schema.ts',
  ],
  out: './migrations',
  dbCredentials: {
    url: 'file:./db.sqlite',
  },
  migrations: {
    table: 'migration',
  },
  verbose: true,
  strict: true,
} satisfies Config;
