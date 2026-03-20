import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { TestModule } from './modules/test/test.module';
import { ConfigModule } from '@nestjs/config';
import { validateEnv } from './functions/environment-validator';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './modules/users/entities/user.entity';

@Module({
  imports: [UsersModule, AuthModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env.development',
      validate: validateEnv
    }),
    TestModule,
    TypeOrmModule.forRoot({ // [TODO]: create .env.database file
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'mysecretpassword',
      database: 'my_database',
      entities: [UserEntity],
      synchronize: true,
      retryAttempts: 5,
      retryDelay: 1000
    })
  ],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {
}
