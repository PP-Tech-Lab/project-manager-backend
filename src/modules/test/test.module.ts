import { Module } from '@nestjs/common';
import { TestController } from './test.controller';
import { TestService } from './test.service';
import { EmailVerificationModule } from '../../orm-services/email-verification-tokens/email-verification-tokens.module';

@Module({
  controllers: [TestController],
  providers: [TestService],
  imports: [EmailVerificationModule]
})
export class TestModule {
}
