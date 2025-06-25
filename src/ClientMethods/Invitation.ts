import { and, eq, gt } from 'drizzle-orm';
import { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';

import { ONE_DAY_MS } from '../Constant.js';
import { Access } from '../IAM/Access.js';
import { Invitation, InvitationInput, User } from '../IAM/Type.js';
import { invitation } from '../Schema/Schema.js';
import { Nil } from '../Type.js';
import { inviteCode, pk } from '../Util/Code.js';
import { isPublic } from './Access.js';
import { createUser, findUserByEmail } from './User.js';

export async function createInvitation(
  db: BetterSQLite3Database,
  invitationInput: InvitationInput
): Promise<Nil<Invitation>> {
  const duration = invitationInput.duration ?? 4 * ONE_DAY_MS;
  const now = new Date();
  const expiryAt = new Date(now.getTime() + duration);

  const newInvitation: Invitation = {
    id: pk(),
    code: inviteCode(),
    firstName: invitationInput.firstName,
    lastName: invitationInput.lastName,
    email: invitationInput.email,
    duration,
    expiryAt,
    createdAt: now,
    updatedAt: now,
  };

  const result = await db.insert(invitation).values(newInvitation).returning();

  return result.at(0);
}

export async function getInvitationById(
  db: BetterSQLite3Database,
  invitationId: string
): Promise<Nil<Invitation>> {
  const results = await db
    .select()
    .from(invitation)
    .where(eq(invitation.id, invitationId));

  return results.at(0) ?? null;
}

export async function findInvitationByCode(
  db: BetterSQLite3Database,
  code: string
): Promise<Nil<Invitation>> {
  const results = await db
    .select()
    .from(invitation)
    .where(and(eq(invitation.code, code), gt(invitation.expiryAt, new Date())));

  return results.at(0) ?? null;
}

export async function claimInvitation(
  db: BetterSQLite3Database,
  access: Access,
  code: string,
  password: string
): Promise<User> {
  if (!isPublic(access)) {
    throw new Error('Invalid access');
  }

  const invitation = await findInvitationByCode(db, code);

  if (!invitation) {
    throw 'Invitation not found';
  }

  const user = await findUserByEmail(db, invitation.email);

  if (user) {
    throw 'User already exists';
  }

  const userResult = await createUser(db, {
    ...invitation,
    emails: [invitation.email],
  });

  // if (password) {
  //   const username = invitation.email;
  //   await createLocalLogin(tx, user.id, username, password);
  // }

  await deleteInvitation(db, invitation.id);

  return userResult;
}

export async function deleteInvitation(
  db: BetterSQLite3Database,
  invitationId: string
): Promise<boolean> {
  const results = await db
    .delete(invitation)
    .where(eq(invitation.id, invitationId))
    .returning();

  return results.length > 0;
}
