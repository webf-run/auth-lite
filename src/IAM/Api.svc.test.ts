import { equal, notEqual, ok } from 'node:assert';
import { describe, it } from 'node:test';

import { eq } from 'drizzle-orm';

import { getDb } from '../../test/Db.js';
import { apiKey } from '../Schema/Schema.js';
import { publicAccess } from './Access.svc.js';
import { createApiKey, findApiKeyByToken } from './Api.svc.js';

describe('API Services', async () => {
  const db = getDb();

  it('should create ApiKey', async () => {
    /// Setup data
    const access = publicAccess();

    /// SUT: System Under Test
    const rs = await createApiKey(db, access, 'Lorem_ipsum');

    /// Verify data
    ok(rs, 'failed to create Api key');
    ok(rs.length > 0);

    /// Teardown
    db.delete(apiKey).where(eq(apiKey.id, rs));
  });

  it('should find ApiKey by Token', async () => {
    /// Setup data
    const access = publicAccess();
    const createdApiKey = await createApiKey(db, access, 'Lorem_ipsum');

    /// SUT: System Under Test
    const result = await findApiKeyByToken(db, createdApiKey);

    /// Verify data
    ok(result);

    equal(result.description, 'Lorem_ipsum');

    /// Teardown
    db.delete(apiKey).where(eq(apiKey.id, result.id));
  });
});
