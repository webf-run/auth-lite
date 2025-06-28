import type { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';

/**
 * Wraps a value of type T into a nullable type - `null | undefined | T`.
 */
export type Nil<T> = T | null | undefined;

/**
 * Alias name for type BetterSQLite3Database driver.
 */
export type Drizzle = BetterSQLite3Database;
