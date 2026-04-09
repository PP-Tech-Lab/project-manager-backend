import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class TestService {
  private transporter: any;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: this.configService.get<string>('GMAIL_EMAIL'),
        pass: this.configService.get<string>('GMAIL_APP_PASSWORD'),
      },
    });
  }

  async test() {
    this.configService.get;
    const opciones = {
      from: this.configService.get<string>('GMAIL_EMAIL'),
      to: 'ismael.po@outlook.com',
      subject: 'Recuperación de contraseña',
      html: `<h1>Recupera tu cuenta</h1><p>Usa este token: ${'12365468sdf435sd21f32s1df'}</p>`,
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
