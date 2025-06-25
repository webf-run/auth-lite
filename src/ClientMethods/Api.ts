import { and, eq } from 'drizzle-orm';
import { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';

import { Access } from '../IAM/Access.js';
import { ApiKey } from '../IAM/Type.js';
import { apiKey } from '../Schema/Schema.js';
import { apiKeyId, apiKeyToken } from '../Util/Code.js';
import { verify } from '../Util/Hash.js';
import { isClient } from './Access.js';

export async function createApiKey(
  db: BetterSQLite3Database,
  access: Access,
  description: string
) {
  if (!isClient(access)) {
    throw 'not authorized';
  }

  const key = await generateApiKey(db, description);

  return key;
}

export async function findApiKeyByToken(
  db: BetterSQLite3Database,
  token: string
): Promise<ApiKey> {
  const [id, ...rest] = token.split('.');
  const secret = rest.join('');

  const result = await db
    .select()
    .from(apiKey)
    .where(and(eq(apiKey.id, id), eq(apiKey.isActive, true)));

  const key = result.at(0);

  if (!key) {
    // TODO: Error handling
    throw 'key not found';
  }

  const valid = await verify(key.token, secret, key.hashFn);

  if (!valid) {
    // TODO: Error handling
    throw 'key not valid';
  }

  return key;
}

export async function generateApiKey(
  db: BetterSQLite3Database,
  description: string
): Promise<string> {
  const id = apiKeyId();
  const token = await apiKeyToken();

  await db.insert(apiKey).values({
    id,
    description,
    token: token.hash,
    hashFn: token.hashFn,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const serialized = `${id}.${token.secret}`;

  return serialized;
}
