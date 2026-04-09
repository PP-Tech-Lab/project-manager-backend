import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './orm-services/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { TestModule } from './modules/test/test.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { validateEnv } from './functions/environment-validator';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './orm-services/users/user.entity';
import { EmailVerificationTokens } from './orm-services/email-verification-tokens/email-verification-tokens.entity';

const configService = new ConfigService();

@Module({
  imports: [
    UsersModule,
    AuthModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env.development',
      validate: validateEnv,
    }),
    TestModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: configService.get<string>('DB_HOST'),
      port: configService.get<number>('DB_PORT'),
      username: configService.get<string>('DB_USERNAME'),
      password: configService.get<string>('DB_PASSWORD'),
      database: configService.get<string>('DB_USER_DATABASE'),
      entities: [UserEntity, EmailVerificationTokens],
      synchronize: true,
      retryAttempts: 5,
      retryDelay: 1000,
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
