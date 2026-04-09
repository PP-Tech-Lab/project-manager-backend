import { Module } from '@nestjs/common';
import { EmailNotificationService } from './email-notification.service'
import { EmailVerificationTokens } from '../orm-services/email-verification-tokens/email-verification-tokens.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailVerificationTokenService } from '../orm-services/email-verification-tokens/email-verification-tokens.service';
import { UsersService } from '../orm-services/users/users.service';
import { UsersModule } from '../orm-services/users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([EmailVerificationTokens]), UsersModule],
  providers: [EmailNotificationService, EmailVerificationTokenService],
  exports: [EmailNotificationService]
})
export class EmailNotificationModule {}