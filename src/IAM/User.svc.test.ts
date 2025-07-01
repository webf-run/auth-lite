import { deepEqual, equal, notEqual, ok } from 'node:assert';
import { describe, it } from 'node:test';

import { faker } from '@faker-js/faker';
import { eq } from 'drizzle-orm';

import { getContext, getDb } from '../../test/Db.js';
import { user, userEmail } from '../Schema/Schema.js';
import { pk } from '../Util/Code.js';
import { type Page } from '../Utility.js';
import { createUser, getUserById, getUsers } from './User.svc.js';
import { type UserInput } from './User.type.js';

describe('[Service]: User', async () => {
  const ctx = getContext();
  const { db, $transaction } = ctx;

  describe('createUser', () => {
    it('should create a user', async () => {
      /// Setup data
      const newUser: UserInput = {
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),

        emails: [faker.internet.email(), faker.internet.email()],
      };

      /// SUT: System Under Test
      const result = await createUser(ctx, newUser);

      /// Verify data
      ok(result);

      const userResult = db
        .select()
        .from(user)
        .where(eq(user.id, result.id))
        .all();
      const emailResult = db
        .select()
        .from(userEmail)
        .where(eq(userEmail.userId, result.id))
        .all();

      ok(userResult);

      const foundUser = {
        ...userResult.at(0).appUser,
        emails: emailResult.map((val) => val),
      };

      ok(userResult);
      equal(foundUser.firstName, newUser.firstName);
      equal(foundUser.lastName, newUser.lastName);
      deepEqual(foundUser.emails, newUser.emails);

      /// Teardown
      await $transaction((tx) => {
        tx.delete(user).where(eq(user.id, result.id));
        tx.delete(userEmail).where(eq(userEmail.userId, result.id));
      });
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
    ok(rs);
    ok(rs.length > 0);
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

    await $transaction((tx) => {
      const userR = tx.insert(user).values(newUser);
      const userE = tx.insert(userEmail).values(newEmail);
    });

    /// SUT: System Under Test
    const userResult = await getUserById(db, newUser.id);

    /// Verify data
    ok(userResult, 'failed to get user');
    equal(userResult.firstName, newUser.firstName);
    equal(userResult.lastName, newUser.lastName);
    deepEqual(userResult.emails, newEmail);

    /// Teardown
    await $transaction((tx) => {
      tx.delete(user).where(eq(user.id, newUser.id));
      tx.delete(userEmail).where(eq(userEmail.userId, newUser.id));
    });
  });
});
