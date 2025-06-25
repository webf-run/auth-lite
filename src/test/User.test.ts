import { deepEqual, equal, notEqual } from 'node:assert';
import { describe, it } from 'node:test';

import { faker } from '@faker-js/faker';
import { eq } from 'drizzle-orm';

import { IAMClient } from '../Client.js';
import { UserInput } from '../IAM/Type.js';
import { initIAMClient } from '../Main.js';
import { user, userEmail } from '../Schema/Schema.js';
import { pk } from '../Util/Code.js';
import { Page } from '../Utility.js';

describe('test user service', async () => {
  const db = await initIAMClient({
    databaseUrl: 'db.sqlite',
    migrations: false,
  });
  const iam = new IAMClient(db);

  await it('Get Users', async () => {
    /// Setup data
    const request: Page = {
      number: 0,
      size: 10,
    };

    /// SUT: System Under Test
    const rs = await iam.getUsers(request);

    /// Verify data
    notEqual(rs, null);
    equal(rs?.length > 0, true);
  });

  await it('Create User', async () => {
    /// Setup data
    const newUser: UserInput = {
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),

      emails: [faker.internet.email(), faker.internet.email()],
    };

    /// SUT: System Under Test
    const result = await iam.createUser(newUser);

    /// Verify data
    notEqual(result, undefined);

    const userResult = await db
      .select()
      .from(user)
      .innerJoin(userEmail, eq(userEmail.userId, result.id))
      .where(eq(user.id, result.id));

    const foundUser = {
      ...userResult.at(0)?.app_user,
      emails: userResult.map((val) => val.user_email.email),
    };

    equal(foundUser?.firstName, newUser.firstName);
    equal(foundUser?.lastName, newUser.lastName);
    deepEqual(foundUser?.emails, newUser.emails);

    /// Teardown
    await db.delete(user).where(eq(user.id, result.id));
    await db.delete(userEmail).where(eq(userEmail.userId, result.id));
  });

  await it('Get User by ID', async () => {
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
    const userResult = await iam.getUserById(newUser.id);

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
