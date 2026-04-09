import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { createHash, Hash, randomBytes, verify } from 'crypto';
import { EmailVerificationTokens } from '../orm-services/email-verification-tokens/email-verification-tokens.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { EmailVerificationTokenService } from '../orm-services/email-verification-tokens/email-verification-tokens.service';
import { Token } from '../orm-services/email-verification-tokens/email-verification-tokens.types';
import dayjs from 'dayjs'
import { UsersService } from '../orm-services/users/users.service';

export type GeneratedToken = { token: string, hash: string}

@Injectable()
export class EmailNotificationService {
  private transporter: any;
  private readonly logger = new Logger(EmailNotificationService.name);
  constructor(
    private configService: ConfigService,
    private emailVerificationTokenService: EmailVerificationTokenService,
    private userService: UsersService
  ) {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: this.configService.get<string>('GMAIL_EMAIL'),
        pass: this.configService.get<string>('GMAIL_APP_PASSWORD')
      }
    });
  }

  async generateEmailVerificationToken(): Promise<GeneratedToken>{
    const token = randomBytes(32).toString('hex')
    const tokenHash = createHash('sha256').update(token).digest('hex')
    return { token: token, hash: tokenHash}
  }

  async sendVerificationEmail(ToEmail: string, userId: string) {
    this.configService.get;

    const generatedToken = await this.generateEmailVerificationToken()
    // Call to ORM 
    await this.emailVerificationTokenService.saveVerificationToken(
      {userId: userId, 
      tokenHash: generatedToken.hash,
      expiresAt: dayjs().add(3, 'days').toDate()})
    // check if token exists

    const opciones = {
      from: this.configService.get<string>('GMAIL_EMAIL'),
      to: 'ismael.po@outlook.com',
      subject: 'Recuperación de contraseña',
      html: `<h1>Recupera tu cuenta</h1><p>Usa este token: ${generatedToken.token}</p>`
    };

    console.log('Sending email');
    try {
      await this.transporter.sendMail(opciones);
      console.log('Email sent');
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  async validateEmailConfirmationToken(token: string): Promise<boolean> {
    this.logger.verbose('[validateEmailConfirmationToken] Verifing token...')
    const extistantToken = await this.emailVerificationTokenService.getTokenByHash(token)  
    if (extistantToken) {
        if (await this.isTokenValid(extistantToken)){
          // Remove from token table
          await this.emailVerificationTokenService.removeVerificationToken(extistantToken.id)
          // Update user to verified in user table
          await this.userService.updateUserVerified(extistantToken.user.userId)
          return true
        }
      }
      this.logger.warn('[validateEmailConfirmationToken] Token expired or non-existant')
      return false
  }


    async isTokenValid(token: Token): Promise<boolean> {

      return dayjs().isBefore(token.expiresAt)
    }
}