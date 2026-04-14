import { EmailVerificationTokens } from './email-verification-tokens.entity';

export interface SaveVerificationTokenProps {
  userId: string;
  tokenHash: string;
  expiresAt: Date;
  tokenType: string;
}

export type Token = InstanceType<typeof EmailVerificationTokens>;
