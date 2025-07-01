import { and, eq, gt } from 'drizzle-orm';

import { ONE_DAY_MS } from '../Constant.js';
import { invitation } from '../Schema/Schema.js';
import type { Drizzle, Nil } from '../Type.js';
import { inviteCode, pk } from '../Util/Code.js';
import { isPublic } from './Access.svc.js';
import type { Access } from './Access.type.js';
import type { Context } from './Context.js';
import type { Invitation, InvitationInput } from './Type.js';
import { createUser, findUserByEmail } from './User.svc.js';
import type { User } from './User.type.js';

export async function createInvitation(
  db: Drizzle,
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

  const result = db.insert(invitation).values(newInvitation).returning().all();

  return result.at(0);
}

export async function getInvitationById(
  db: Drizzle,
  invitationId: string
): Promise<Nil<Invitation>> {
  const results = db
    .select()
    .from(invitation)
    .where(eq(invitation.id, invitationId))
    .all();

  return results.at(0) ?? null;
}

export async function findInvitationByCode(
  db: Drizzle,
  code: string
): Promise<Nil<Invitation>> {
  const results = db
    .select()
    .from(invitation)
    .where(and(eq(invitation.code, code), gt(invitation.expiryAt, new Date())))
    .all();

  return results.at(0) ?? null;
}

export async function claimInvitation(
  ctx: Context,
  access: Access,
  code: string,
  password: string
): Promise<User> {
  if (!isPublic(access)) {
    throw new Error('Invalid access');
  }

  const invitation = await findInvitationByCode(ctx.db, code);

  if (!invitation) {
    throw 'Invitation not found';
  }

  const user = await findUserByEmail(ctx.db, invitation.email);

  if (user) {
    throw 'User already exists';
  }

  const userResult = await createUser(ctx, {
    ...invitation,
    emails: [invitation.email],
  });

  // if (password) {
  //   const username = invitation.email;
  //   await createLocalLogin(tx, user.id, username, password);
  // }

  await deleteInvitation(ctx.db, invitation.id);

  return userResult;
}

export async function deleteInvitation(
  db: Drizzle,
  invitationId: string
): Promise<boolean> {
  const results = db
    .delete(invitation)
    .where(eq(invitation.id, invitationId))
    .returning()
    .all();

  return results.length > 0;
}
