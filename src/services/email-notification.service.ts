import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { createHash, Hash, randomBytes } from 'crypto';
import { EmailVerificationTokens } from '../orm-services/email-verification-tokens/email-verification-tokens.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { EmailVerificationTokenService } from '../orm-services/email-verification-tokens/email-verification-tokens.service';

export type GeneratedToken = { token: string, hash: string}

@Injectable()
export class EmailNotificationService {
  private transporter: any;

  constructor(
    private configService: ConfigService,
    private emailVerificationTokenService: EmailVerificationTokenService 
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
    await this.emailVerificationTokenService.saveVerificationToken({userId: userId, tokenHash: generatedToken.hash, expiresAt: new Date()})
    // check if token exists

    const opciones = {
      from: this.configService.get<string>('GMAIL_EMAIL'),
      to: ToEmail,
      subject: 'Recuperación de contraseña',
      html: `<h1>Recupera tu cuenta</h1><p>Usa este token: ${'12365468sdf435sd21f32s1df'}</p>`
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
}