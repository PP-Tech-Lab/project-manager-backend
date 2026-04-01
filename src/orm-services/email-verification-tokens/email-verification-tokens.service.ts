import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { createHash, randomBytes } from 'crypto';
import { EmailVerificationTokens } from './email-verification-tokens.entity'
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SaveVerificationTokenProps } from './email-verification-tokens.types';


@Injectable()
export class EmailVerificationTokenService {
  private transporter: any;

  constructor(
    private configService: ConfigService,
    @InjectRepository(EmailVerificationTokens)
    private emailVerificationTokenRepository: Repository<EmailVerificationTokens>
  ) {}

    async saveVerificationToken( data: SaveVerificationTokenProps  ): Promise<boolean> {
        var result = this.emailVerificationTokenRepository.insert({
            user: { userId: data.userId },
            tokenHash: data.tokenHash,
            expiresAt: data.expiresAt

        })

        
        return true
    }
}
