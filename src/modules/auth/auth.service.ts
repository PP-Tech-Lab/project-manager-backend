import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { AuthInput, AuthResult, SignInData, SignUpData } from './types/auth.type';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    private readonly logger = new Logger(AuthService.name);
    private saltOrRounds: number = 10
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
        
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
        
        if (user) { // [TODO]: return a message if user exists but incorrect password???
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

    async signUp(newUser: SignUpData): Promise<AuthResult> {
        const hashedPassword = await bcrypt.hash(newUser.password, this.saltOrRounds)
        await this.usersService.registerNewUser(newUser.username, newUser.email, hashedPassword) // [TODO]: Proper error handling
        return await this.authenticate({credential: newUser.username, password: newUser.password});
    }

    async emailExists(email: string): Promise<boolean> {
        if (await this.usersService.findEmail(email)){
            this.logger.verbose(`[emailExists] WARNING Email exists!`)
            return true
        }

        return false;
    }
}
