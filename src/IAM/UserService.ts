import { eq } from 'drizzle-orm';

import { providerLogin, user, userEmail, userToken } from '../Schema/Schema.js';
import type { Nil, SQLite } from '../Type.js';
import { pk } from '../Util/Code.js';
import type { Page } from '../Utility.js';
import type { User, UserEmail, UserInput } from './Type.js';

export async function findUserByToken(
  db: SQLite,
  token: string
): Promise<Nil<User>> {
  const result = await db
    .select()
    .from(userToken)
    .innerJoin(user, eq(userToken.userId, user.id))
    .innerJoin(userEmail, eq(userEmail.userId, user.id))
    .where(eq(userToken.id, token));

  const found = result.at(0);

  if (!found) {
    return null;
  }

  return {
    ...found.appUser,
    emails: result.map((val) => val.userEmail),
  };
}

export async function createUser(
  db: SQLite,
  userInput: UserInput
): Promise<User> {
  const now = new Date();
  const newUser = {
    id: pk(),
    firstName: userInput.firstName,
    lastName: userInput.lastName,

    createdAt: now,
    updatedAt: now,
  };

  const newEmail: UserEmail[] = userInput.emails.map((val, index) => ({
    id: pk(),
    email: val,
    verified: false,
    userId: newUser.id,
  }));

  await db.insert(user).values(newUser);
  await db.insert(userEmail).values(newEmail);

  return { ...newUser, emails: newEmail };
}

export async function getUserById(
  db: SQLite,
  userId: string
): Promise<Nil<User>> {
  const userResult = await db
    .select()
    .from(user)
    .innerJoin(userEmail, eq(userEmail.userId, userId))
    .where(eq(user.id, userId));

  const found = userResult.at(0);

  if (!found) {
    return null;
  }

  return {
    ...found.appUser,
    emails: userResult.map((val) => val.userEmail),
  };
}

export async function getUsers(db: SQLite, page: Page): Promise<Nil<User[]>> {
  const fetchResult = await db
    .select()
    .from(user)
    .innerJoin(userEmail, eq(userEmail.userId, user.id))
    .limit(page.size)
    .offset(page.number * page.size);

  const result: Nil<User[]> = fetchResult.map((val) => ({
    id: val.appUser.id,
    firstName: val.appUser.firstName,
    lastName: val.appUser.lastName,
    createdAt: val.appUser.createdAt,
    updatedAt: val.appUser.updatedAt,
    emails: fetchResult
      .filter((value) => value.userEmail.userId === val.appUser.id)
      .map((e) => ({
        id: e.userEmail.id,
        email: e.userEmail.email,
        userId: e.userEmail.userId,
        verified: e.userEmail.verified,
      })),
  }));

  return result;
}

export async function findUserByEmail(
  db: SQLite,
  email: string
): Promise<Nil<User>> {
  const result = await db
    .select()
    .from(userEmail)
    .innerJoin(user, eq(userEmail.userId, user.id))
    .where(eq(userEmail.email, email));

  const found = result.at(0);

  if (!found) {
    return null;
  }

  return {
    ...found.appUser,
    emails: result.map((val) => val.userEmail),
  };
}

export async function findUserBySocialId(
  db: SQLite,
  socialId: string
): Promise<Nil<User>> {
  const result = await db
    .select()
    .from(providerLogin)
    .innerJoin(user, eq(providerLogin.userId, user.id))
    .innerJoin(userEmail, eq(providerLogin.userId, userEmail.userId))
    .where(eq(providerLogin.subjectId, socialId));

  const found = result.at(0);

  if (!found) {
    return null;
  }

  return {
    ...found.appUser,
    emails: result.map((val) => val.userEmail),
  };
}

export async function deleteUser(db: SQLite, userId: string): Promise<boolean> {
  const result = await db.delete(user).where(eq(user.id, userId)).returning();

  return result.at(0) !== undefined;
}
