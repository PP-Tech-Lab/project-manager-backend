import { Module } from '@nestjs/common';
import { EmailNotificationService } from './email-notification.service'
import { EmailVerificationTokens } from '../orm-services/email-verification-tokens/email-verification-tokens.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailVerificationTokenService } from '../orm-services/email-verification-tokens/email-verification-tokens.service';

@Module({
  imports: [TypeOrmModule.forFeature([EmailVerificationTokens])],
  providers: [EmailNotificationService, EmailVerificationTokenService],
  exports: [EmailNotificationService]
})
export class EmailNotificationModule {}