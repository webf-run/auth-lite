import { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';

import type { Access } from './IAM/Access.js';
import type { AuthToken, User, UserInput } from './IAM/Type.js';
import type { Nil } from './Type.js';
import type { Page } from './Utility.js';

export class IAMClient {
  #db: BetterSQLite3Database;

  constructor(db: BetterSQLite3Database) {
    this.#db = db;
  }

  /// Authentication
  async findAccess(tokenType: string, token: string): Promise<Nil<Access>> {
    throw new Error('Method not implemented.');
  }

  async createToken(userId: string): Promise<AuthToken> {
    throw new Error('Method not implemented.');
  }

  async deleteToken(token: string): Promise<boolean> {
    throw new Error('Method not implemented.');
  }

  /// Users
  async createUser(user: UserInput): Promise<User> {
    throw new Error('Method not implemented.');
  }

  async getUserById(userId: string): Promise<User> {
    throw new Error('Method not implemented.');
  }

  async getUsers(page: Page): Promise<Nil<User[]>> {
    throw new Error('Method not implemented.');
  }

  async findUserByEmail(email: string): Promise<Nil<User>> {
    throw new Error('Method not implemented.');
  }

  async findUserBySocialId(socialId: string): Promise<Nil<User>> {
    throw new Error('Method not implemented.');
  }

  async findUserByToken(token: string): Promise<Nil<User>> {
    throw new Error('Method not implemented.');
  }

  async deleteUser(userId: string): Promise<boolean> {
    throw new Error('Method not implemented.');
  }

  /// Invitations
  async createInvitation() {
    throw new Error('Method not implemented.');
  }

  async getInvitationById() {
    throw new Error('Method not implemented.');
  }

  async findInvitationByCode() {
    throw new Error('Method not implemented.');
  }

  async claimInvitation() {
    throw new Error('Method not implemented.');
  }

  async deleteInvitation() {
    throw new Error('Method not implemented.');
  }

  /// API Keys
  async createApiKey() {
    throw new Error('Method not implemented.');
  }

  async findApiKeyByToken(token: string) {
    throw new Error('Method not implemented.');
  }
}
