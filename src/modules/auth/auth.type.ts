export interface AuthInput {
  credential: string;
  password: string;
}
export interface SignInData {
  username: string;
}
export interface SignUpData {
  username: string;
  email: string;
  password: string;
}
export interface AuthResult {
  accessToken: string;
  username: string;
}

export interface EmailVerifData {
  token: string;
}

export interface PasswordRequestData {
  userEmail: string;
}

export type GeneratedToken = { token: string; hash: string };

export interface PasswordUpdateData {
  credential: string;
  token: string;
  newPassword: string;
}