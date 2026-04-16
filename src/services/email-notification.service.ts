import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { createHash, randomBytes } from 'crypto';
import { VerificationTokenService } from '../orm-services/verification-tokens/verification-tokens.service';
import { Token } from '../orm-services/verification-tokens/verification-tokens.types';
import dayjs from 'dayjs';
import { UsersService } from '../orm-services/users/users.service';
import { GeneratedToken } from './email-notification.types';
import { VerificationTokens } from '../orm-services/verification-tokens/verification-tokens.entity';

@Injectable()
export class EmailNotificationService {
  private transporter: any;
  private readonly logger = new Logger(EmailNotificationService.name);
  constructor(
    private configService: ConfigService,
    private verificationTokenService: VerificationTokenService,
    private userService: UsersService,
  ) {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: this.configService.get<string>('GMAIL_EMAIL'),
        pass: this.configService.get<string>('GMAIL_APP_PASSWORD'),
      },
    });
  }

  async generateEmailVerificationToken(): Promise<GeneratedToken> {
    const token = randomBytes(32).toString('hex');
    const tokenHash = createHash('sha256').update(token).digest('hex');
    return { token: token, hash: tokenHash };
  }

  async sendPasswordResetEmail(
    toEmail: string,
    userId: string,
  ): Promise<boolean> {
    this.configService.get;
    const generatedToken = await this.generateEmailVerificationToken();
    await this.verificationTokenService.saveVerificationToken({
      userId: userId,
      tokenHash: generatedToken.hash,
      expiresAt: dayjs().add(20, 'minutes').toDate(),
      tokenType: 'passwordReset',
    });
    // [TODO]: check if token exists. if true, update existing record instead of creating new one

    const options = {
      from: this.configService.get<string>('GMAIL_EMAIL'),
      to: toEmail,
      subject: 'Reestablece de Contraseña',
      html: `<h1>Reestablece tu contraseña</h1><p>Usa este token: ${generatedToken.token}</p>`,
    };

    this.logger.verbose('[sendPasswordResetEmail] Sending email...');
    try {
      await this.transporter.sendMail(options);
      this.logger.verbose('[sendPasswordResetEmail] Email succesfully sent');
      return true;
    } catch (error) {
      this.logger.error(`[sendPasswordResetEmail] ERROR: ${error}`);
      return false;
    }
  }

  async sendVerificationEmail(
    toEmail: string,
    userId: string,
  ): Promise<boolean> {
    this.configService.get;
    const generatedToken = await this.generateEmailVerificationToken();
    await this.verificationTokenService.saveVerificationToken({
      userId: userId,
      tokenHash: generatedToken.hash,
      expiresAt: dayjs().add(3, 'days').toDate(),
      tokenType: 'emailVerification',
    });
    // [TODO]: check if token exists. if true, update existing record instead of creating new one

    const options = {
      from: this.configService.get<string>('GMAIL_EMAIL'),
      to: toEmail,
      subject: 'Verificacion de correo Electronico',
      html: `<h1>Activa tu cuenta</h1><p>Usa este token: ${generatedToken.token}</p>`,
    };

    this.logger.verbose('[sendVerificationEmail] Sending email...');
    try {
      await this.transporter.sendMail(options);
      this.logger.verbose('[sendVerificationEmail] Email succesfully sent');
      return true;
    } catch (error) {
      this.logger.error(`[sendVerificationEmail] ERROR: ${error}`);
      return false;
    }
  }

  async verifyUser(existantToken: VerificationTokens): Promise<boolean> {
    this.logger.verbose('[validateEmailToken] Verifing token...');
    if (existantToken) {
      if (await this.userService.updateUserVerified(existantToken.user.username)) {
        await this.verificationTokenService.removeVerificationToken(
          existantToken.id,
        );
        return true;
      }
      this.logger.error(`[validateEmailToken] Could not find user ${existantToken.user.username}`)
      return false
    }
    this.logger.warn('[validateEmailToken] Token non-existant');
    return false;
  }

  // [TODO]: Fix this
  async validatePasswordResetToken(token: string) {}

  async isTokenValid(token: string): Promise<VerificationTokens | null> {
    const existantToken =
      await this.verificationTokenService.getTokenByHash(token);
    if (existantToken) {
      if (dayjs().isBefore(existantToken.expiresAt)) {
        return existantToken;
      } else {
        await this.verificationTokenService.removeVerificationToken(
        existantToken.id,
      );
      return null
      }
    }
    return null;
  }
}
