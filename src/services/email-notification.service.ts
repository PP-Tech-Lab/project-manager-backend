import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailNotificationService {
  private transporter: any;
  private readonly logger = new Logger(EmailNotificationService.name);
  constructor(
    private configService: ConfigService,
  ) {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: this.configService.get<string>('GMAIL_EMAIL'),
        pass: this.configService.get<string>('GMAIL_APP_PASSWORD'),
      },
    });
  }

  async sendPasswordResetEmail(
    toEmail: string,
    token: string,
  ): Promise<boolean> {
    this.configService.get;
    const options = {
      from: this.configService.get<string>('GMAIL_EMAIL'),
      to: toEmail,
      subject: 'Reestablece tu Contraseña',
      html: `<h1>Reestablece tu contraseña</h1><p>Usa este token: ${token}</p>`,
    };

    this.logger.debug(`[sendPasswordResetEmail] Sending email to ${toEmail} with token ${token}`);
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
    token: string,
  ): Promise<boolean> {
    this.configService.get;

    const options = {
      from: this.configService.get<string>('GMAIL_EMAIL'),
      to: toEmail,
      subject: 'Verificacion de correo Electronico',
      html: `<h1>Activa tu cuenta</h1><p>Usa este token: ${token}</p>`,
    };

    this.logger.debug(`[sendPasswordResetEmail] Sending email to ${toEmail} with token ${token}`);
    try {
      await this.transporter.sendMail(options);
      this.logger.verbose('[sendVerificationEmail] Email succesfully sent');
      return true;
    } catch (error) {
      this.logger.error(`[sendVerificationEmail] ERROR: ${error}`);
      return false;
    }
  }


}
