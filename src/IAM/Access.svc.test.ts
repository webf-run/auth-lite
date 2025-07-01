import { deepEqual, equal, ok } from 'node:assert';
import { describe, it } from 'node:test';

import { faker } from '@faker-js/faker';
import { eq } from 'drizzle-orm';

import { getContext } from '../../test/Db.js';
import { user, userEmail, userToken } from '../Schema/Schema.js';
import { createToken, deleteToken, findAccess } from './Access.svc.js';
import { createUser } from './User.svc.js';
import { type UserInput } from './User.type.js';

describe('Access Services', async () => {
  const ctx = getContext();
  const { db, $transaction } = ctx;

  it('should create a token', async () => {
    /// Setup data
    const userInput: UserInput = {
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),

      emails: [faker.internet.email(), faker.internet.email()],
    };
    const newUser = await createUser(ctx, userInput);

    /// SUT: System Under Test
    const result = await createToken(db, newUser.id);

    /// Verify data
    ok(result, "couldn't create token");

    /// Teardown
    await $transaction((tx) => {
      tx.delete(user).where(eq(user.id, newUser.id));
      tx.delete(userEmail).where(eq(userEmail.userId, newUser.id));
      tx.delete(userToken).where(eq(userToken.userId, newUser.id));
    });
  });

  it('should find Access', async () => {
    /// Setup data
    const userInput: UserInput = {
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),

      emails: [faker.internet.email(), faker.internet.email()],
    };
    const newUser = await createUser(ctx, userInput);
    const resultedToken = await createToken(db, newUser.id);

    ok(resultedToken, "couldn't create token");

    /// SUT: System Under Test
    const result = await findAccess(db, 'bearer', resultedToken.id);

    /// Verify data
    ok(result, 'failed to find Access');
    equal(result.type, 'user');

    /// Teardown
    await $transaction((tx) => {
      tx.delete(user).where(eq(user.id, newUser.id));
      tx.delete(userEmail).where(eq(userEmail.userId, newUser.id));
      tx.delete(userToken).where(eq(userToken.userId, newUser.id));
    });
  });

  it('should delete Token', async () => {
    /// Setup data
    const userInput: UserInput = {
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),

      emails: [faker.internet.email(), faker.internet.email()],
    };
    const newUser = await createUser(ctx, userInput);
    const resultedToken = await createToken(db, newUser.id);

    ok(resultedToken, "couldn't create token");

    /// SUT: System Under Test
    const result = await deleteToken(db, resultedToken.id);

    /// Verify data
    ok(result);
    deepEqual(result.id, resultedToken.id);

    /// Teardown
    await $transaction((tx) => {
      tx.delete(user).where(eq(user.id, newUser.id));
      tx.delete(userEmail).where(eq(userEmail.userId, newUser.id));
      tx.delete(userToken).where(eq(userToken.userId, newUser.id));
    });
  });
});
