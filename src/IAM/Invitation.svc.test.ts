import { equal, ok } from 'node:assert';
import { describe, it } from 'node:test';

import { faker } from '@faker-js/faker';
import { eq } from 'drizzle-orm';

import { getContext } from '../../test/Db.js';
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
  const ctx = getContext();
  const { db, $transaction } = ctx;

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
    ok(result);
    equal(result.firstName, invitationInput.firstName);
    equal(result.lastName, invitationInput.lastName);
    equal(result.email, invitationInput.email);

    /// Teardown
    db.delete(invitation).where(eq(invitation.id, result.id)).all();
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
    ok(result);
    equal(result.id, createdInvitation.id, 'Didnt get correct invitation');

    /// Teardown
    db.delete(invitation).where(eq(invitation.id, result!.id)).all();
  });

  it('should find Invitation by Code', async () => {
    /// Setup data
    const invitationInput: InvitationInput = {
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),

      email: faker.internet.email(),
    };

    const createdInvitation = await createInvitation(db, invitationInput);

    ok(createdInvitation, 'Invitation should be created');

    /// SUT: System Under Test
    const result = await findInvitationByCode(db, createdInvitation.code);

    /// Verify data
    ok(result);
    equal(result.firstName, createdInvitation.firstName);
    equal(result.lastName, createdInvitation.lastName);
    equal(result.email, createdInvitation.email);

    /// Teardown
    db.delete(invitation).where(eq(invitation.id, result.id)).all();
  });

  it('should Claim Invitation', async () => {
    /// Setup data
    const invitationInput: InvitationInput = {
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),

      email: faker.internet.email(),
    };
    const access = publicAccess();

    const createdInvitation = await createInvitation(db, invitationInput);

    ok(createdInvitation, 'Invitation should be created');

    /// SUT: System Under Test
    const result = await claimInvitation(
      ctx,
      access,
      createdInvitation.code,
      ''
    );

    /// Verify data
    ok(result);
    equal(result.firstName, createdInvitation.firstName);
    equal(result.lastName, createdInvitation.lastName);

    /// Teardown
    await db.delete(invitation).where(eq(invitation.id, result.id));
  });
});
