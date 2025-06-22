export interface ApiKey {
  id: string;
  description: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;

  createdAt: Date;
  updatedAt: Date;

  emails: UserEmail[];
}

export interface UserEmail {
  id: string;
  email: string;
  verified: boolean;
  userId: string;
}

export type ExternalProfile = {
  provider: string;
  subjectId: string;
  email: string;
  emailVerified: boolean;
};

export type AuthToken = {
  id: string;
  generatedAt: Date;
  duration: number;
  type: 'bearer';
};

export type InvitationInput = {
  firstName: string;
  lastName: string;
  email: string;
  duration?: number;
};

export type Invitation = {
  id: string;
  code: string;

  firstName: string;
  lastName: string;
  email: string;

  duration: number;
  expiryAt: Date;

  tenantId: string;

  createdAt: Date;
  updatedAt: Date;
};

export type UserInput = {
  firstName: string;
  lastName: string;

  emails: string[];
};
