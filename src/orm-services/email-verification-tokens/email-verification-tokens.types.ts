import { UserEntity } from '../users/user.entity';

export interface SaveVerificationTokenProps { 
    userId: string, 
    tokenHash: string, 
    expiresAt: Date
}

export interface Token{
  user: UserEntity,
  tokenHash: string
}