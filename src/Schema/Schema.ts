import { integer, sqliteTable, text, unique } from 'drizzle-orm/sqlite-core';

import { timestampMS } from './Helper.js';

export const user = sqliteTable('app_user', {
  id: text('id').primaryKey().notNull(),

  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),

  createdAt: timestampMS('created_at').notNull(),
  updatedAt: timestampMS('updated_at').notNull(),
});

export const userEmail = sqliteTable('user_email', {
  id: text('id').primaryKey().notNull(),

  email: text('email').unique().notNull(),
  verified: integer('verified', { mode: 'timestamp_ms' }).notNull(),

  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
});

export const providerLogin = sqliteTable(
  'provider_login',
  {
    id: text('id').primaryKey(),

    providerId: text('provider_id').notNull(),
    subjectId: text('subject_id').notNull(),

    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
  },
  (t) => [unique('provider_unique_id').on(t.providerId, t.subjectId)]
);

export const invitation = sqliteTable('invitation', {
  id: text('id').primaryKey(),
  code: text('code').unique().notNull(),

  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  email: text('email').notNull(),

  /**
   * duration: The validity of invitation in milliseconds
   */
  duration: integer('duration').notNull(),
  expiryAt: timestampMS('expirty_at').notNull(),

  createdAt: timestampMS('created_at').notNull(),
  updatedAt: timestampMS('updated_at').notNull(),
});

export const userToken = sqliteTable('user_token', {
  id: text('id').primaryKey(),

  generatedAt: timestampMS('generated_at').notNull(),

  /**
   *  The `duration` in milliseconds
   */
  duration: integer('duration').notNull(),

  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
});

export const apiKey = sqliteTable('api_key', {
  id: text('id').primaryKey().notNull(),
  description: text('description').notNull(),

  token: text('token').notNull(),
  hashFn: text('hash_fn').notNull(),

  isActive: integer('is_active', { mode: 'boolean' }).notNull(),

  createdAt: timestampMS('created_at').notNull(),
  updatedAt: timestampMS('updated_at').notNull(),
});
