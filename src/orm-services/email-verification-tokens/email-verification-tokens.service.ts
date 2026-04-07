import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { createHash, Hash, randomBytes } from 'crypto';
import { EmailVerificationTokens } from './email-verification-tokens.entity'
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SaveVerificationTokenProps, Token } from './email-verification-tokens.types';

@Injectable()
export class EmailVerificationTokenService {
  private transporter: any;
  private readonly logger = new Logger(EmailVerificationTokenService.name);
  constructor(
    private configService: ConfigService,
    @InjectRepository(EmailVerificationTokens)
    private emailVerificationTokenRepository: Repository<EmailVerificationTokens>
  ) {}

    async saveVerificationToken( data: SaveVerificationTokenProps ): Promise<boolean> {
      try {  // [TODO]: Implement Proper error exception handling 
      const result = await this.emailVerificationTokenRepository.save({ 
            user: { userId: data.userId },
            tokenHash: data.tokenHash,
            expiresAt: data.expiresAt
        })}
        catch (error) {
          const errorCode = (error as any).code
          this.logger.error(`[saveVerificationToken] Postgres error ${errorCode}`)
          return false
        }
        return true
    }

    async updateVerificationToken( ): Promise<boolean> {
      return true
    }

    async checkExistingToken(id: string): Promise<Token | null> {
      return this.emailVerificationTokenRepository.findOneBy({id})
    }
}
