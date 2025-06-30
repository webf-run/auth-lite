import { equal, notEqual, ok } from 'node:assert';
import { describe, it } from 'node:test';

import { faker } from '@faker-js/faker';
import { eq } from 'drizzle-orm';

import { getDb } from '../../test/Db.js';
import { invitation } from '../Schema/Schema.js';
import { publicAccess } from './Access.svc.js';
import {
  claimInvitation,
  createInvitation,
  findInvitationByCode,
  getInvitationById,
} from './Invitation.svc.js';
import type { InvitationInput } from './Type.js';

describe('Invitation Services', async () => {
  const db = getDb();

  it('should create Invitation', async () => {
    /// Setup data
    const invitationInput: InvitationInput = {
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),

      email: faker.internet.email(),
    };

    /// SUT: System Under Test
    const result = await createInvitation(db, invitationInput);

    /// Verify data
    notEqual(result, undefined);
    equal(result?.firstName, invitationInput.firstName);
    equal(result?.lastName, invitationInput.lastName);
    equal(result?.email, invitationInput.email);

    /// Teardown
    await db.delete(invitation).where(eq(invitation.id, result?.id));
  });

  it('should get Invitation by Id', async () => {
    /// Setup data
    const invitationInput: InvitationInput = {
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),

      email: faker.internet.email(),
    };

    const createdInvitation = await createInvitation(db, invitationInput);

    ok(createdInvitation, 'Invitation should be created');

    /// SUT: System Under Test
    const result = await getInvitationById(db, createdInvitation.id);

    /// Verify data
    notEqual(result, null);
    equal(result?.id, result?.id);
    equal(result?.code, result?.code);
    equal(result?.firstName, result?.firstName);
    equal(result?.lastName, result?.lastName);
    equal(result?.email, result?.email);

    /// Teardown
    await db.delete(invitation).where(eq(invitation.id, result!.id));
  });

  it('should find Invitation by Code', async () => {
    /// Setup data
    const invitationInput: InvitationInput = {
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),

      email: faker.internet.email(),
    };

    const createdInvitation = await createInvitation(db, invitationInput);

    /// SUT: System Under Test
    const result = await findInvitationByCode(db, createdInvitation?.code);

    /// Verify data
    notEqual(result, null);
    equal(result?.id, result?.id);
    equal(result?.code, result?.code);
    equal(result?.firstName, result?.firstName);
    equal(result?.lastName, result?.lastName);
    equal(result?.email, result?.email);

    /// Teardown
    await db.delete(invitation).where(eq(invitation.id, result?.id));
  });

  it('should Claim Invitation', async () => {
    /// Setup data
    const invitationInput: InvitationInput = {
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),

      email: faker.internet.email(),
    };

    const createdInvitation = await createInvitation(db, invitationInput);

    const access = publicAccess();

    /// SUT: System Under Test
    const result = await claimInvitation(
      db,
      access,
      createdInvitation?.code,
      ''
    );

    /// Verify data
    notEqual(result, null);
    equal(result?.firstName, result?.firstName);
    equal(result?.lastName, result?.lastName);

    /// Teardown
    await db.delete(invitation).where(eq(invitation.id, result?.id));
  });
});
