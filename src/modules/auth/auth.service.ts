import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { AuthInput, AuthResult, SignInData } from './types/auth.type';

@Injectable()
export class AuthService {
    private readonly logger = new Logger(AuthService.name);
    
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService
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
        const user = await this.usersService.findUserByName(input.username)
        if (user && user.password === input.password) { // [TODO]: return a message if user exists but incorrect password???
            this.logger.verbose(`[validateUser] User ${input.username} found!`)
            return {
                userId: user.userId,
                username: user.username
            };
        }

        this.logger.verbose(`[validateUser] User ${input.username} not found`)
        return null;
    }

    async signIn(user:SignInData): Promise<AuthResult> {
        const tokenPayload = {
            sub: user.userId,
            username: user.username,
        };

        const accessToken = await this.jwtService.signAsync(tokenPayload);
        this.logger.verbose(`[signIn] Sign in Success! Sending Access token to user ${user.username}!`)
        return { accessToken, username: user.username, userId: user.userId}
    }
}
