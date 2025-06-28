import { deepEqual, equal, notEqual } from 'node:assert';
import { describe, it } from 'node:test';

import { faker } from '@faker-js/faker';
import { eq } from 'drizzle-orm';

import { getDb } from '../../test/Db.js';
import { user, userEmail } from '../Schema/Schema.js';
import { pk } from '../Util/Code.js';
import { type Page } from '../Utility.js';
import { createUser, getUserById, getUsers } from './UserService.js';
import { type UserInput } from './UserType.js';

describe('[Service]: User', async () => {
  const db = getDb();

  describe('createUser', () => {
    it('should create a user', async () => {
      /// Setup data
      const newUser: UserInput = {
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),

        emails: [faker.internet.email(), faker.internet.email()],
      };

      /// SUT: System Under Test
      const result = await createUser(db, newUser);

      /// Verify data
      notEqual(result, undefined);

      const userResult = await db
        .select()
        .from(user)
        .innerJoin(userEmail, eq(userEmail.userId, result.id))
        .where(eq(user.id, result.id));

      const foundUser = {
        ...userResult.at(0)?.appUser,
        emails: userResult.map((val) => val.userEmail.email),
      };

      equal(foundUser?.firstName, newUser.firstName);
      equal(foundUser?.lastName, newUser.lastName);
      deepEqual(foundUser?.emails, newUser.emails);

      /// Teardown
      await db.delete(user).where(eq(user.id, result.id));
      await db.delete(userEmail).where(eq(userEmail.userId, result.id));
    });
  });

  it('should get Users', async () => {
    /// Setup data
    const request: Page = {
      number: 0,
      size: 10,
    };

    console.log('Request:', request);

    /// SUT: System Under Test
    const rs = await getUsers(db, request);

    /// Verify data
    notEqual(rs, null);
    equal(rs?.length > 0, true);
  });

  it('should get User by ID', async () => {
    /// Setup data
    const now = new Date();
    const newUser = {
      id: pk(),
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),

      createdAt: now,
      updatedAt: now,
    };

    const newEmail = [faker.internet.email(), faker.internet.email()].map(
      (val) => ({
        id: pk(),
        email: val,
        verified: false,
        userId: newUser.id,
      })
    );

    await db.insert(user).values(newUser);
    await db.insert(userEmail).values(newEmail);

    /// SUT: System Under Test
    const userResult = await getUserById(db, newUser.id);

    /// Verify data
    notEqual(userResult, null);
    equal(userResult?.firstName, newUser.firstName);
    equal(userResult?.lastName, newUser.lastName);
    deepEqual(userResult?.emails, newEmail);

    /// Teardown
    await db.delete(user).where(eq(user.id, newUser.id));
    await db.delete(userEmail).where(eq(userEmail.userId, newUser.id));
  });
});
