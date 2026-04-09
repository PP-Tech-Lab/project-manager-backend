export interface AuthInput {
  credential: string;
  password: string;
}
export interface SignInData {
  userId: string;
  username: string;
}
export interface SignUpData {
  username: string;
  email: string;
  password: string;
}
export interface AuthResult {
  accessToken: string;
  userId: string;
  username: string;
}
