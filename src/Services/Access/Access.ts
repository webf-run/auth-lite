import { eq } from 'drizzle-orm';

import {
  Access,
  ClientAppAccess,
  PublicAccess,
  UserAccess,
} from '../../IAM/Access.js';
import { AuthToken, User } from '../../IAM/Type.js';
import { userToken } from '../../Schema/Schema.js';
import { Nil, SQLDatabase } from '../../Type.js';
import { bearerToken } from '../../Util/Code.js';
import { findUserByToken } from '../Users/User.js';

export function isPublic(access: Access | null): access is UserAccess {
  return !access || access?.type === 'public';
}

export function isUser(access: Access | null): access is UserAccess {
  return access?.type === 'user';
}

export function isClient(access: Access | null): access is UserAccess {
  return access?.type === 'client';
}

export async function findAccess(
  db: SQLDatabase,
  tokenType: string,
  token: string
): Promise<Nil<Access>> {
  if (tokenType.toLowerCase() === 'bearer') {
    const user = await findUserByToken(db, token);

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

export async function createToken(
  db: SQLDatabase,
  userId: string
): Promise<Nil<AuthToken>> {
  const tokenId = bearerToken();

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

export async function deleteToken(
  db: SQLDatabase,
  token: string
): Promise<Nil<AuthToken>> {
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
