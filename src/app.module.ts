import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TestModule } from './modules/test/test.module';
import { ConfigModule } from '@nestjs/config';
import { validateEnv } from './functions/environment-validator';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env.development',
      validate: validateEnv
    }),
    TestModule
  ],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {
}
