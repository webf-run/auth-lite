import type { RunResult } from 'better-sqlite3';
import type { SQLiteTransaction } from 'drizzle-orm/sqlite-core';
import PQueue from 'p-queue';
import pRetry from 'p-retry';

import type { Drizzle } from '../Type.js';

/** A synchronous transaction function */
export type TransactionFn<R> = (
  tx: SQLiteTransaction<'sync', RunResult, any, any>
) => R extends Promise<any> ? never : R;

export class TransactionManager {
  #db: Drizzle;
  #queue: PQueue;

  constructor(db: Drizzle) {
    this.#db = db;

    this.#queue = new PQueue({
      concurrency: 1,
      autoStart: true,
    });
  }

  async $transaction<R>(callback: TransactionFn<R>): Promise<R> {
    // Push the transaction into a queue to ensure it runs fairly (FIFO)
    // and run in a single thread with co-operation rather than preemption.
    const work = async () => {
      const result = await this.#queue.add(
        () => {
          return this.#db.transaction(callback, {
            behavior: 'immediate',
          });
        },
        {
          throwOnTimeout: true,
        }
      );

      return result;
    };

    // Retry the transaction
    // only on busy or locked errors.
    const result = await pRetry(work, {
      retries: 10,
      minTimeout: 100,
      shouldRetry(error: any) {
        // Retry on specific errors, e.g., database lock errors
        return error.code === 'SQLITE_BUSY' || error.code === 'SQLITE_LOCKED';
      },
    });

    return result;
  }
}
