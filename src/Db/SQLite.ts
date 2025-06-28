import { type Database, default as DatabaseFn } from 'better-sqlite3';

export function makeSQLiteClient(databaseUrl: string): Database {
  const sqlite = new DatabaseFn(databaseUrl, {
    readonly: false,
    fileMustExist: false,
    timeout: 5000,
    verbose: console.log,
  });

  // Tuning for concurrency and performance.
  sqlite.pragma('journal_mode = WAL');
  sqlite.pragma('synchronous = NORMAL');

  // Set the busy timeout to 5 seconds.
  sqlite.pragma('busy_timeout = 5000');

  // 2000 pages of 4096 bytes each = 8MB cache size.
  sqlite.pragma('cache_size = 2000');

  // Keep 64 MB of WAL data on disk before cleaning up.
  sqlite.pragma('journal_size_limit = 67108864');

  // Keep 128MB of maximum memory-mapped size for the database.
  // Allows to share the database file across multiple processes.
  sqlite.pragma('mmap_size = 134217728');

  sqlite.pragma('foreign_keys = ON');
  sqlite.pragma('temp_store = MEMORY');

  return sqlite;
}
