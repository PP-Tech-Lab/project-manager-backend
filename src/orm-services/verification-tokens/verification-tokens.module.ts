import { Module } from '@nestjs/common';
import { VerificationTokens } from './verification-tokens.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { VerificationTokenService } from './verification-tokens.service';

@Module({
  imports: [TypeOrmModule.forFeature([VerificationTokens])],
  providers: [VerificationTokenService, ConfigService],
  exports: [VerificationTokenService],
})
export class VerificationTokenModule {}
