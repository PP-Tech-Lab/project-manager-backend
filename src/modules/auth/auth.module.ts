import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt'
import { UsersModule } from '../../orm-services/users/users.module';
import { ConfigService, ConfigModule } from '@nestjs/config';
import { StringValue } from 'ms';
import { EmailNotificationModule } from '../../services/email-notification.module';

@Module({
  providers: [AuthService, ConfigService],
  controllers: [AuthController],
  imports: [
    UsersModule,  EmailNotificationModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        global: true,
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: configService.get<StringValue>('JWT_EXPIRATION') },
      }),
    }),
  ],
})
export class AuthModule {}
