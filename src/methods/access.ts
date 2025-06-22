import { eq } from 'drizzle-orm';

import {
  Access,
  ClientAppAccess,
  PublicAccess,
  UserAccess,
} from '../IAM/Access.js';
import { AuthToken, User } from '../IAM/Type.js';
import { initIAMClient } from '../Main.js';
import { userToken } from '../Schema/Schema.js';
import { Nil } from '../Type.js';
import { bearerToken } from '../Util/Code.js';
import { findUserByToken } from './user.js';

export async function findAccess(
  tokenType: string,
  token: string
): Promise<Nil<Access>> {
  if (tokenType.toLowerCase() === 'bearer') {
    const user = await findUserByToken(token);

    if (!user) {
      return null;
    }

    return userAccess(user);
  }
  // else if (tokenType.toLowerCase() === 'ApiKey'.toLowerCase()) {
  //   const apiKey = await this.findApiKeyByToken(token);

  //   return this.clientAccess(apiKey);
  // } else if (tokenType) {
  //   return null;
  // }

  return publicAccess();
}

export function userAccess(user: User): UserAccess {
  return { type: 'user', user };
}

export function publicAccess(): PublicAccess {
  return { type: 'public' };
}

export function clientAccess(key: ClientAppAccess['key']): ClientAppAccess {
  return { type: 'client', key };
}

export async function createToken(userId: string): Promise<Nil<AuthToken>> {
  const tokenId = bearerToken();
  const db = await initIAMClient({
    databaseUrl: 'db.sqlite',
    migrations: false,
  });

  const added = await db
    .insert(userToken)
    .values({
      id: tokenId,
      userId,
      duration: 3600 * 1000 * 72,
      generatedAt: new Date(),
    })
    .returning();

  const first = added.at(0);
  if (!first || !first.id) return null;

  return { ...first, type: 'bearer' };
}

export async function deleteToken(token: string): Promise<Nil<AuthToken>> {
  const db = await initIAMClient({
    databaseUrl: 'db.sqlite',
    migrations: false,
  });

  const result = await db
    .delete(userToken)
    .where(eq(userToken.id, token))
    .returning();

  const found = result.at(0);

  if (!found) {
    return null;
  }

  return { ...found, type: 'bearer' };
}
