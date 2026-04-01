import { Module } from '@nestjs/common';
import { TestController } from './test.controller';
import { TestService } from './test.service';
import { EmailNotificationService } from '../../services/email-notification.service';

@Module({
  controllers: [TestController],
  providers: [TestService, EmailNotificationService],
})
export class TestModule {
}
