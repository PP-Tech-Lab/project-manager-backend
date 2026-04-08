import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../../orm-services/users/users.service';
import { AuthInput, AuthResult, SignInData, SignUpData } from './types/auth.type';
import * as bcrypt from 'bcrypt';
import { EmailNotificationModule } from '../../services/email-notification.module';
import { EmailNotificationService } from '../../services/email-notification.service';

@Injectable()
export class AuthService {
    private readonly logger = new Logger(AuthService.name);
    private saltOrRounds: number = 10
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
        private emailNotification: EmailNotificationService
    ) {}

    async authenticate(input: AuthInput): Promise<AuthResult> {
        const user = await this.validateUser(input);

        if (!user) {
            this.logger.warn('[authenticate] Unauthorized User')
            throw new UnauthorizedException();
        }

        this.logger.debug(`[authenticate] User ${user.username} Authenticated`)
        return this.signIn(user)
    };

    async validateUser(input: AuthInput): Promise<SignInData | null> {
        const user = await this.usersService.findUser(input.credential)
        
        if (user) {
            const isMatch = await bcrypt.compare(input.password, user.password)
            if (isMatch) {
                this.logger.verbose(`[validateUser] User ${input.credential} found!`)
                return {
                    userId: user.userId,
                    username: user.username
                }
            };
        }

        this.logger.verbose(`[validateUser] User ${input.credential} not found`)
        return null;
    }

    async signIn(user: SignInData): Promise<AuthResult> {
        const tokenPayload = {
            sub: user.userId,
            username: user.username,
        };

        const accessToken = await this.jwtService.signAsync(tokenPayload);
        this.logger.verbose(`[signIn] Sign in Success! Sending Access token to user ${user.username}!`)
        return { accessToken, username: user.username, userId: user.userId}
    }

    async signUp(newUserData: SignUpData): Promise<AuthResult> {
        const hashedPassword = await bcrypt.hash(newUserData.password, this.saltOrRounds)
        const newUser = await this.usersService.registerNewUser(newUserData.username, newUserData.email, hashedPassword) // [TODO]: Proper error handling
        // call user orm to get uuid of new user
        await this.emailNotification.sendVerificationEmail(newUser.email, newUser.userId) // Call to email-verification service (newUser.username and email)
        return await this.authenticate({credential: newUserData.username, password: newUserData.password});
    }

    async emailExists(email: string): Promise<boolean> {
        if (await this.usersService.findEmail(email)){
            this.logger.verbose(`[emailExists] WARNING Email exists!`)
            return true
        }

        return false;
    }
}
