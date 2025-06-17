export type OAuthLogin = {
  type: 'login';
  redirectUrl?: string;
};

export type OAuthSignup = {
  type: 'signup';
  redirectUrl?: string;
  inviteCode?: string;
};

export type OAuthLink = {
  type: 'link';
  redirectUrl?: string;
};

export type OAuthState = OAuthLogin | OAuthSignup | OAuthLink;

export type OAuthProfile = {
  /**
   * The OAuth 2.0 provider like `google`, `zoho`, etc. to which this user belongs.
   */
  provider: string;
  subjectId: string;
  email: string;
  emailVerified: boolean;

  givenName: string;
  familyName: string;
  name: string;

  accessToken: string;
  tokenType: string;
};
