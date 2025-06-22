import { eq } from 'drizzle-orm';
import { email } from 'zod/v4';

import { IAMClient } from '../Client.js';
import { User, UserEmail, UserInput } from '../IAM/Type.js';
import { initIAMClient } from '../Main.js';
import { providerLogin, user, userEmail, userToken } from '../Schema/Schema.js';
import { Nil } from '../Type.js';
import { pk } from '../Util/Code.js';
import { Page } from '../Utility.js';

export async function findUserByToken(token: string): Promise<Nil<User>> {
  const db = await initIAMClient({
    databaseUrl: 'db.sqlite',
    migrations: false,
  });
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
    ...found.app_user,
    emails: result.map((val) => val.user_email),
  };
}

export async function createUser(userInput: UserInput): Promise<User> {
  const db = await initIAMClient({
    databaseUrl: 'db.sqlite',
    migrations: false,
  });
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

export async function getUserById(userId: string): Promise<Nil<User>> {
  const db = await initIAMClient({
    databaseUrl: 'db.sqlite',
    migrations: false,
  });
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
    ...found.app_user,
    emails: userResult.map((val) => val.user_email),
  };
}

export async function getUsers(page: Page): Promise<Nil<User[]>> {
  const db = await initIAMClient({
    databaseUrl: 'db.sqlite',
    migrations: false,
  });
  const fetchResult = await db
    .select()
    .from(user)
    .innerJoin(userEmail, eq(userEmail.userId, user.id))
    .limit(page.size)
    .offset(page.number * page.size);

  const result: Nil<User[]> = fetchResult.map((val) => ({
    id: val.app_user.id,
    firstName: val.app_user.firstName,
    lastName: val.app_user.lastName,
    createdAt: val.app_user.createdAt,
    updatedAt: val.app_user.updatedAt,
    emails: fetchResult
      .filter((value) => value.user_email.userId === val.app_user.id)
      .map((e) => ({
        id: e.user_email.id,
        email: e.user_email.email,
        userId: e.user_email.userId,
        verified: e.user_email.verified,
      })),
  }));

  return result;
}

export async function findUserByEmail(email: string): Promise<Nil<User>> {
  const db = await initIAMClient({
    databaseUrl: 'db.sqlite',
    migrations: false,
  });
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
    ...found.app_user,
    emails: result.map((val) => val.user_email),
  };
}

export async function findUserBySocialId(socialId: string): Promise<Nil<User>> {
  const db = await initIAMClient({
    databaseUrl: 'db.sqlite',
    migrations: false,
  });
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
    ...found.app_user,
    emails: result.map((val) => val.user_email),
  };
}

export async function deleteUser(userId: string): Promise<boolean> {
  throw new Error('Method not implemented.');
}
