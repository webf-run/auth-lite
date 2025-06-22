import { ONE_DAY_MS } from '../Constant.js';
import { Invitation, InvitationInput } from '../IAM/Type.js';
import { inviteCode, pk } from '../Util/Code.js';

export async function createInvitation() {
  throw new Error('Method not implemented.');
}

export async function getInvitationById() {
  throw new Error('Method not implemented.');
}

export async function findInvitationByCode() {
  throw new Error('Method not implemented.');
}

export async function claimInvitation() {
  throw new Error('Method not implemented.');
}

export async function deleteInvitation() {
  throw new Error('Method not implemented.');
}

export function buildInvitation(
  invitation: InvitationInput,
  tenantId: string
): Invitation {
  const duration = invitation.duration ?? 4 * ONE_DAY_MS;
  const now = new Date();
  const expiryAt = new Date(now.getTime() + duration);

  const newInvitation = {
    id: pk(),
    code: inviteCode(),
    firstName: invitation.firstName,
    lastName: invitation.lastName,
    email: invitation.email,
    duration,
    expiryAt,
    tenantId,
    createdAt: now,
    updatedAt: now,
  };

  return newInvitation;
}
