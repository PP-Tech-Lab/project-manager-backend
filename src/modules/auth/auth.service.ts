import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../../orm-services/users/users.service';
import {
  AuthInput,
  AuthResult,
  EmailVerifData,
  GeneratedToken,
  PasswordRequestData,
  PasswordUpdateData,
  SignInData,
  SignUpData,
} from './auth.type';
import * as bcrypt from 'bcrypt';
import { EmailNotificationService } from '../../services/email-notification.service';
import { VerificationTokenService } from '../../orm-services/verification-tokens/verification-tokens.service';
import { VerificationTokens } from '../../orm-services/verification-tokens/verification-tokens.entity';
import dayjs from 'dayjs';
import { createHash, randomBytes } from 'crypto';
import { User } from '../../orm-services/users/users.types';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private saltOrRounds: number = 10;
  constructor(
    private usersService: UsersService,
    private verificationTokenService: VerificationTokenService,
    private jwtService: JwtService,
    private emailNotificationService: EmailNotificationService,
  ) {}

  async authenticate(input: AuthInput): Promise<AuthResult> {
    const user = await this.validateUser(input);

    if (!user) {
      this.logger.warn('[authenticate] Unauthorized User');
      throw new UnauthorizedException();
    }

    this.logger.debug(`[authenticate] User ${user.username} Authenticated`);
    return this.signIn(user);
  }

  async validateUser(input: AuthInput): Promise<SignInData | null> {
    const user = await this.usersService.findUser(input.credential);

    if (user) {
      const isMatch = await bcrypt.compare(input.password, user.password);
      if (isMatch) {
        this.logger.verbose(`[validateUser] User ${input.credential} found!`);
        return {
          username: user.username,
        };
      }
    }

    this.logger.verbose(`[validateUser] User ${input.credential} not found`);
    return null;
  }

  async signIn(user: SignInData): Promise<AuthResult> {
    const tokenPayload = {
      username: user.username,
    };

    const accessToken = await this.jwtService.signAsync(tokenPayload);
    this.logger.verbose(
      `[signIn] Sign in Success! Sending Access token to user ${user.username}!`,
    );
    return { accessToken, username: user.username };
  }

  async createPasswordHash(password: string) {
    return await bcrypt.hash(password, this.saltOrRounds);
  }

  async signUp(newUserData: SignUpData): Promise<AuthResult> {
    const hashedPassword = await this.createPasswordHash(newUserData.password);
    const newToken = await this.generateVerificationToken()
    const newUser = await this.usersService.registerNewUser(
      newUserData.username,
      newUserData.email,
      hashedPassword,
    ); // [TODO]: Proper error handling
    await this.emailNotificationService.sendVerificationEmail(
      newUser.email,
      newToken.token
    );
    await this.verificationTokenService.saveVerificationToken({
      userId: newUser.userId,
      tokenHash: newToken.hash,
      expiresAt: dayjs().add(20, 'minutes').toDate(),
      tokenType: 'passwordReset',
    });
    return await this.authenticate({
      credential: newUserData.username,
      password: newUserData.password,
    });
  }

  async emailExists(email: string): Promise<boolean> {
    if (await this.usersService.findEmail(email)) {
      this.logger.verbose(`[emailExists] WARNING Email exists!`);
      return true;
    }

    return false;
  }

  async userExists(username: string): Promise<User | null> {
    return await this.usersService.findUser(username);
  }

  async emailVerificationHandler(data: EmailVerifData): Promise<boolean> {
    const extistantToken = await this.isTokenValid(data.token);
    if (extistantToken)
      return await this.verifyUser(extistantToken);
    return false
  }

  async passwordResetRequestHandler(data: PasswordRequestData): Promise<boolean> {
    const user = await this.usersService.findEmail(data.userEmail)
    const newToken = await this.generateVerificationToken()
    if (user) { // [TODO] Error handling
      await this.emailNotificationService.sendPasswordResetEmail(
        user.email,
        newToken.token,
      )
      await this.verificationTokenService.saveVerificationToken({
        userId: user.userId,
        tokenHash: newToken.hash,
        expiresAt: dayjs().add(20, 'minutes').toDate(),
        tokenType: 'passwordReset',
      });
      return true  
    }
    return false
  }

  async verifyUser(existantToken: VerificationTokens): Promise<boolean> {
    this.logger.verbose('[validateEmailToken] Verifing token...');
    if (existantToken) {
      if (await this.usersService.updateUserVerified(existantToken.user.username)) {
        await this.verificationTokenService.removeVerificationToken(
          existantToken.id,
        );
        return true;
      }
      this.logger.error(`[validateEmailToken] Could not find user ${existantToken.user.username}`)
      return false
    }
    this.logger.warn('[validateEmailToken] Token non-existant');
    return false;
  }

  async isTokenValid(token: string): Promise<VerificationTokens | null> {
    const existantToken =
      await this.verificationTokenService.getTokenByHash(token);
    if (existantToken) {
      if (dayjs().isBefore(existantToken.expiresAt)) {
        return existantToken;
      } else {
          await this.verificationTokenService.removeVerificationToken(
          existantToken.id,
        );
        return null
      }
    }
      return null;
  }

  async generateVerificationToken(): Promise<GeneratedToken> {
    const token = randomBytes(32).toString('hex');
    const tokenHash = createHash('sha256').update(token).digest('hex');
    return { token: token, hash: tokenHash };
  }
  // [TODO]: Finish this
  async validatePasswordResetToken(token: string) {}

  // [TODO]: Finish this
  async passwordResetUpdateHandler(user: User,data: PasswordUpdateData): Promise<boolean> {
    const newHash = await this.createPasswordHash(
      data.newPassword,
    );
    if (await this.usersService.updateUserPassword(user.email, newHash)) {
        console.log('Success')
      return true }
    return false
  }

}

