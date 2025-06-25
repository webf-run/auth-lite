import type {
  Access,
  ClientAppAccess,
  PublicAccess,
  UserAccess,
} from './IAM/Access.js';
import type {
  ApiKey,
  AuthToken,
  InvitationInput,
  User,
  UserInput,
} from './IAM/Type.js';
import * as accessService from './Services/Access.js';
import * as apiService from './Services/Api.js';
import * as invitationService from './Services/Invitation.js';
import * as userService from './Services/Users/User.js';
import type { Nil, SQLDatabase } from './Type.js';
import type { Page } from './Utility.js';

export class IAMClient {
  #db: SQLDatabase;

  constructor(db: SQLDatabase) {
    this.#db = db;
  }

  /// Authentication
  async findAccess(tokenType: string, token: string): Promise<Nil<Access>> {
    return accessService.findAccess(this.#db, tokenType, token);
  }

  userAccess(user: User): UserAccess {
    return accessService.userAccess(user);
  }

  publicAccess(): PublicAccess {
    return accessService.publicAccess();
  }

  clientAccess(key: ClientAppAccess['key']): ClientAppAccess {
    return accessService.clientAccess(key);
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
  async createInvitation(db: SQLDatabase, invitationInput: InvitationInput) {
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
