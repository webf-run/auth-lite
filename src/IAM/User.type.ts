export interface UserInput {
  firstName: string;
  lastName: string;

  emails: string[];
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
