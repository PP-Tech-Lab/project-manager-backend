import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt'
import { UsersModule } from '../users/users.module';
import { JWT_SECRET } from '../configs/jwt-secret';

@Module({
  providers: [AuthService],
  controllers: [AuthController],
  imports: [
    UsersModule,
    JwtModule.register({
      global: true,
      secret: JWT_SECRET,
      signOptions: { expiresIn: '1d'}, //[TODO]: Once proper secret var manager is implemented;
                                       // make this an option that can be configured
    }),
  ],
})
export class AuthModule {}
