import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { createHash, randomBytes } from 'crypto';
import { EmailVerificationTokens } from '../orm-services/email-verification-tokens/email-verification-tokens.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class EmailNotificationService {
  private transporter: any;

  constructor(
    private configService: ConfigService,
    @InjectRepository(EmailVerificationTokens)
    private usersRepository: Repository<EmailVerificationTokens>
  ) {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: this.configService.get<string>('GMAIL_EMAIL'),
        pass: this.configService.get<string>('GMAIL_APP_PASSWORD')
      }
    });
  }

  async generateEmailVerificationToken() {
    const token = randomBytes(32)
    const tokenHash = createHash('sha256').update(token)
    return { token, tokenHash}
  }

  async sendVerificationEmail(ToEmail: string) {
    this.configService.get;

    // Call to ORM 
    // check if token exists

    const opciones = {
      from: this.configService.get<string>('GMAIL_EMAIL'),
      to: ToEmail,
      subject: 'Recuperación de contraseña',
      html: `<h1>Recupera tu cuenta</h1><p>Usa este token: ${'12365468sdf435sd21f32s1df'}</p>`
    };

     this.generateEmailVerificationToken

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