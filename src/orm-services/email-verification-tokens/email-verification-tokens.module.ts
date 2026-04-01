import { Module } from '@nestjs/common';
import { EmailVerificationTokens } from './email-verification-tokens.entity';
import { TypeOrmModule } from '@nestjs/typeorm';


@Module({
  imports: [TypeOrmModule.forFeature([EmailVerificationTokens])],
  providers: [],
  exports: []
})
export class EmailVerificationModule {}