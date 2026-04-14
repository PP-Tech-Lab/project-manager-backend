import { Injectable, Logger } from '@nestjs/common';
import { createHash } from 'crypto';
import { EmailVerificationTokens } from './email-verification-tokens.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  SaveVerificationTokenProps,
  Token,
} from './email-verification-tokens.types';

@Injectable()
export class EmailVerificationTokenService {
  private readonly logger = new Logger(EmailVerificationTokenService.name);
  constructor(
    @InjectRepository(EmailVerificationTokens)
    private emailVerificationTokenRepository: Repository<EmailVerificationTokens>,
  ) {}

  async saveVerificationToken(
    data: SaveVerificationTokenProps,
  ): Promise<boolean> {
    try {
      // [TODO]: Implement Proper error exception handling
      const result = await this.emailVerificationTokenRepository.save({
        user: { userId: data.userId },
        tokenHash: data.tokenHash,
        expiresAt: data.expiresAt,
        tokenType: data.tokenType
      });
    } catch (error) {
      const errorCode = (error as any).code;
      this.logger.error(`[saveVerificationToken] Postgres error ${errorCode}`);
      return false;
    }
    return true;
  }

  async updateVerificationToken(): Promise<boolean> {
    // [TODO]
    return true;
  }

  async removeVerificationToken(id: string): Promise<boolean> {
    return !!(await this.emailVerificationTokenRepository.delete(id));
  }

  async checkExistingToken(id: string): Promise<Token | null> {
    return this.emailVerificationTokenRepository.findOne({
      where: { id },
      relations: { user: true },
    });
  }

  async getTokenByHash(token: string): Promise<Token | null> {
    const tokenHash = createHash('sha256').update(token).digest('hex');
    return await this.emailVerificationTokenRepository.findOneBy({ tokenHash });
  }
}
