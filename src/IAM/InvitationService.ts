import { and, eq, gt } from 'drizzle-orm';

import { ONE_DAY_MS } from '../Constant.js';
import { invitation } from '../Schema/Schema.js';
import type { Nil, SQLite } from '../Type.js';
import { inviteCode, pk } from '../Util/Code.js';
import type { Access } from './Access.js';
import { isPublic } from './AccessService.js';
import type { Invitation, InvitationInput, User } from './Type.js';
import { createUser, findUserByEmail } from './UserService.js';

export async function createInvitation(
  db: SQLite,
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
  db: SQLite,
  invitationId: string
): Promise<Nil<Invitation>> {
  const results = await db
    .select()
    .from(invitation)
    .where(eq(invitation.id, invitationId));

  return results.at(0) ?? null;
}

export async function findInvitationByCode(
  db: SQLite,
  code: string
): Promise<Nil<Invitation>> {
  const results = await db
    .select()
    .from(invitation)
    .where(and(eq(invitation.code, code), gt(invitation.expiryAt, new Date())));

  return results.at(0) ?? null;
}

export async function claimInvitation(
  db: SQLite,
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
  db: SQLite,
  invitationId: string
): Promise<boolean> {
  const results = await db
    .delete(invitation)
    .where(eq(invitation.id, invitationId))
    .returning();

  return results.length > 0;
}
