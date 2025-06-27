import { deepEqual, equal, notEqual } from 'node:assert';
import { describe, it } from 'node:test';

import { faker } from '@faker-js/faker';
import { eq } from 'drizzle-orm';

import { getDb } from '../../test/Db.js';
import { user, userEmail, userToken } from '../Schema/Schema.js';
import { createToken, deleteToken, findAccess } from './AccessService.js';
import { UserInput } from './Type.js';
import { createUser } from './UserService.js';

describe('Access Services', async () => {
  const db = getDb();

  it('should create a token', async () => {
    /// Setup data
    const userInput: UserInput = {
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),

      emails: [faker.internet.email(), faker.internet.email()],
    };
    const newUser = await createUser(db, userInput);

    /// SUT: System Under Test
    const result = await createToken(db, newUser.id);

    /// Verify data
    notEqual(result, undefined);

    /// Teardown
    await db.delete(user).where(eq(user.id, newUser.id));
    await db.delete(userEmail).where(eq(userEmail.userId, newUser.id));
    await db.delete(userToken).where(eq(userToken.userId, newUser.id));
  });

  it('should find Access', async () => {
    /// Setup data
    const userInput: UserInput = {
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),

      emails: [faker.internet.email(), faker.internet.email()],
    };
    const newUser = await createUser(db, userInput);

    const resultedToken = await createToken(db, newUser.id);

    /// SUT: System Under Test
    const result = await findAccess(db, 'bearer', resultedToken?.id);

    /// Verify data
    notEqual(result, null);
    equal(result?.type, 'user');

    /// Teardown
    await db.delete(user).where(eq(user.id, newUser.id));
    await db.delete(userEmail).where(eq(userEmail.userId, newUser.id));
    await db.delete(userToken).where(eq(userToken.userId, newUser.id));
  });

  it('should delete Token', async () => {
    /// Setup data
    const userInput: UserInput = {
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),

      emails: [faker.internet.email(), faker.internet.email()],
    };
    const newUser = await createUser(db, userInput);

    const resultedToken = await createToken(db, newUser.id);

    /// SUT: System Under Test
    const result = await deleteToken(db, resultedToken?.id);

    /// Verify data
    notEqual(result, null);
    deepEqual(result?.id, resultedToken?.id);

    /// Teardown
    await db.delete(user).where(eq(user.id, newUser.id));
    await db.delete(userEmail).where(eq(userEmail.userId, newUser.id));
    await db.delete(userToken).where(eq(userToken.userId, newUser.id));
  });
});
