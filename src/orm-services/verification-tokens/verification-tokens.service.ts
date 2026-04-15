import { Injectable, Logger } from '@nestjs/common';
import { createHash } from 'crypto';
import { VerificationTokens } from './verification-tokens.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  SaveVerificationTokenProps,
  Token,
} from './verification-tokens.types';

@Injectable()
export class VerificationTokenService {
  private readonly logger = new Logger(VerificationTokenService.name);
  constructor(
    @InjectRepository(VerificationTokens)
    private verificationTokenRepository: Repository<VerificationTokens>,
  ) {}

  async saveVerificationToken(
    data: SaveVerificationTokenProps,
  ): Promise<boolean> {
    try {
      // [TODO]: Implement Proper error exception handling
      const result = await this.verificationTokenRepository.save({
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
    return !!(await this.verificationTokenRepository.delete(id));
  }

  async checkExistingToken(id: string): Promise<Token | null> {
    return this.verificationTokenRepository.findOne({
      where: { id },
      relations: { user: true },
    });
  }

  async getTokenByHash(token: string): Promise<Token | null> {
    const tokenHash = createHash('sha256').update(token).digest('hex');
    return await this.verificationTokenRepository.findOneBy({ tokenHash });
  }
}
