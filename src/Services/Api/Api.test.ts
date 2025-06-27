import { deepEqual, equal, notEqual } from 'node:assert';
import { describe, it } from 'node:test';

import { faker } from '@faker-js/faker';
import { eq } from 'drizzle-orm';

import { UserInput } from '../../IAM/Type.js';
import { initIAMClient } from '../../Main.js';
import { apiKey, user, userEmail } from '../../Schema/Schema.js';
import { pk } from '../../Util/Code.js';
import { Page } from '../../Utility.js';
import { publicAccess, userAccess } from '../Access/Access.js';
import { createUser, getUserById } from '../Users/User.js';
import { createApiKey, findApiKeyByToken } from './Api.js';

describe('API Services', async () => {
  const db = await initIAMClient({
    databaseUrl: 'db.sqlite',
    migrations: false,
  });

  it('should create ApiKey', async () => {
    /// Setup data
    const access = publicAccess();

    /// SUT: System Under Test
    const rs = await createApiKey(db, access, 'Lorem_ipsum');

    /// Verify data
    notEqual(rs, null);
    equal(rs?.length > 0, true);

    /// Teardown
    await db.delete(apiKey).where(eq(apiKey.id, rs));
  });

  it('should find ApiKey by Token', async () => {
    /// Setup data
    const access = publicAccess();

    const createdApiKey = await createApiKey(db, access, 'Lorem_ipsum');

    /// SUT: System Under Test
    const result = await findApiKeyByToken(db, createdApiKey);

    /// Verify data
    notEqual(result, undefined);

    equal(result?.description, 'Lorem_ipsum');

    /// Teardown
    await db.delete(apiKey).where(eq(apiKey.id, result.id));
  });
});
