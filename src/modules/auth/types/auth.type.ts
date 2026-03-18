export interface AuthInput { username: string; password: string }
export interface SignInData { userId: number; username: string }
export interface AuthResult { accessToken: string; userId: number; username: string };