import * as accessService from './IAM/Access.svc.js';
import type { Access } from './IAM/Access.type.js';
import * as apiService from './IAM/Api.svc.js';
import * as invitationService from './IAM/Invitation.svc.js';
import type { ApiKey, AuthToken, InvitationInput } from './IAM/Type.js';
import * as userService from './IAM/User.svc.js';
import type { UserInput } from './IAM/User.type.js';
import type { Drizzle, Nil } from './Type.js';
import type { Page } from './Utility.js';

export class IAMClient {
  #db: Drizzle;

  constructor(db: Drizzle) {
    this.#db = db;
  }

  /// Authentication
  async findAccess(tokenType: string, token: string): Promise<Nil<Access>> {
    return accessService.findAccess(this.#db, tokenType, token);
  }

  async createToken(userId: string): Promise<Nil<AuthToken>> {
    return accessService.createToken(this.#db, userId);
  }

  async deleteToken(token: string): Promise<Nil<AuthToken>> {
    return accessService.deleteToken(this.#db, token);
  }

  /// Users
  createUser(input: UserInput) {
    return userService.createUser(this.#db, input);
  }
  getUserById(id: string) {
    return userService.getUserById(this.#db, id);
  }
  getUsers(page: Page) {
    return userService.getUsers(this.#db, page);
  }

  /// Invitations
  async createInvitation(db: Drizzle, invitationInput: InvitationInput) {
    return invitationService.createInvitation(this.#db, invitationInput);
  }

  async getInvitationById(invitationId: string) {
    return invitationService.getInvitationById(this.#db, invitationId);
  }

  async findInvitationByCode(code: string) {
    return invitationService.findInvitationByCode(this.#db, code);
  }

  async claimInvitation(access: Access, code: string, password: string) {
    return invitationService.claimInvitation(this.#db, access, code, password);
  }

  async deleteInvitation(invitationId: string) {
    return invitationService.deleteInvitation(this.#db, invitationId);
  }

  /// API Keys
  async createApiKey(access: Access, description: string) {
    return apiService.createApiKey(this.#db, access, description);
  }

  async findApiKeyByToken(token: string): Promise<ApiKey> {
    return apiService.findApiKeyByToken(this.#db, token);
  }
}
