import { eq } from 'drizzle-orm';

import { userToken } from '../Schema/Schema.js';
import type { Drizzle, Nil } from '../Type.js';
import { bearerToken } from '../Util/Code.js';
import type {
  Access,
  ClientAppAccess,
  PublicAccess,
  UserAccess,
} from './Access.type.js';
import type { AuthToken } from './Type.js';
import { findUserByToken } from './User.svc.js';
import type { User } from './User.type.js';

export async function findAccess(
  db: Drizzle,
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

export async function createToken(
  db: Drizzle,
  userId: string
): Promise<Nil<AuthToken>> {
  const tokenId = bearerToken();

  const added = db
    .insert(userToken)
    .values({
      id: tokenId,
      userId,
      duration: 3600 * 1000 * 72,
      generatedAt: new Date(),
    })
    .returning()
    .all();

  const first = added.at(0);
  if (!first || !first.id) return null;

  return { ...first, type: 'bearer' };
}

export async function deleteToken(
  db: Drizzle,
  token: string
): Promise<Nil<AuthToken>> {
  const result = db
    .delete(userToken)
    .where(eq(userToken.id, token))
    .returning()
    .all();

  const found = result.at(0);

  if (!found) {
    return null;
  }

  return { ...found, type: 'bearer' };
}

export function isPublic(access: Access | null): access is UserAccess {
  return !access || access?.type === 'public';
}

export function isUser(access: Access | null): access is UserAccess {
  return access?.type === 'user';
}

export function isClient(access: Access | null): access is UserAccess {
  return access?.type === 'client';
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
