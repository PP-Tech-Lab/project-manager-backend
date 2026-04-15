import { Module } from '@nestjs/common';
import { EmailNotificationService } from './email-notification.service';
import { VerificationTokens } from '../orm-services/verification-tokens/verification-tokens.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VerificationTokenService } from '../orm-services/verification-tokens/verification-tokens.service';
import { UsersModule } from '../orm-services/users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([VerificationTokens]), UsersModule],
  providers: [EmailNotificationService, VerificationTokenService],
  exports: [EmailNotificationService],
})
export class EmailNotificationModule {}
