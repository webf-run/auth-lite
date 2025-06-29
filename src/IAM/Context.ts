import type { TransactionFn } from '../Db/Transaction.js';
import type { Drizzle } from '../Type.js';

export interface Context {
  db: Drizzle;
  $transaction<R>(callback: TransactionFn<R>): Promise<R>;
}
