import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt'
import { UsersModule } from '../users/users.module';
import { ConfigService, ConfigModule } from '@nestjs/config';
import { StringValue } from 'ms';

@Module({
  providers: [AuthService, ConfigService],
  controllers: [AuthController],
    imports: [
    UsersModule,
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
