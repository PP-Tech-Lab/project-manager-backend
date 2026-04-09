import { Module } from '@nestjs/common';
import { EmailVerificationTokens } from './email-verification-tokens.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { EmailVerificationTokenService } from './email-verification-tokens.service';

@Module({
  imports: [TypeOrmModule.forFeature([EmailVerificationTokens])],
  providers: [EmailVerificationTokenService, ConfigService],
  exports: [EmailVerificationTokenService],
})
export class EmailVerificationModule {}
