import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { TestModule } from './modules/test/test.module';
import { ConfigModule } from '@nestjs/config';
import { validateEnv } from './functions/environment-validator';

@Module({
  imports: [UsersModule, AuthModule,
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
