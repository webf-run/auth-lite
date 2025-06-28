export interface ApiKey {
  id: string;
  description: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
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

  createdAt: Date;
  updatedAt: Date;
};
