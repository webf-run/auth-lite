import type { ApiKey } from './Type.js';
import type { User } from './User.type.js';

export interface UserAccess {
  readonly type: 'user';
  readonly user: User;
}

export interface ClientAppAccess {
  readonly type: 'client';
  readonly key: ApiKey;
}

export interface PublicAccess {
  readonly type: 'public';
}

export type Access = UserAccess | ClientAppAccess | PublicAccess;
