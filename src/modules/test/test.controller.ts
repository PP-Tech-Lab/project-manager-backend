import { Controller, Post } from '@nestjs/common';
import { TestService } from './test.service';
import { EmailVerificationTokenService } from '../../orm-services/email-verification-tokens/email-verification-tokens.service';
import { date } from 'joi';

@Controller('test')
export class TestController {
  constructor(private readonly testService: TestService,
    private email: EmailVerificationTokenService
  ) {
  }

  @Post()
  async test() {
    //console.log('Petition received');
    //return this.testService.test();
    this.email.saveVerificationToken({
      userId: '44cd3dd9-59f0-4bf1-a00d-613b3b4ac79b',
      tokenHash: '3A2SD123S1D5ASD321',
      expiresAt: new Date()
    });

  }
}
