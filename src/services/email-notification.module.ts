import { Module } from '@nestjs/common';
import { EmailNotificationService } from './email-notification.service'
import { EmailVerificationTokens } from '../orm-services/email-verification-tokens/email-verification-tokens.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [],
  providers: [EmailNotificationService],
  exports: [EmailNotificationService]
})
export class EmailVerificationModule {}