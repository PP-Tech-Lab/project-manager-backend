import { Body, Controller, Get, HttpCode, HttpStatus, NotImplementedException, Request, Post, UseGuards, Res, Injectable, Logger, Query } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '../../guards/auth.guard';
import { UsersService } from '../../orm-services/users/users.service';
import { EmailNotificationService } from '../../services/email-notification.service';

@Controller('auth')
export class AuthController {
    private readonly logger = new Logger(AuthController.name);
    constructor(
        private authService: AuthService,
        private userService: UsersService,
        private emailNotificationService: EmailNotificationService
    ) {}

    @HttpCode(HttpStatus.OK)
    @Post('login')
    async login(
        @Body() input: { credential: string; password: string},
        @Res() res
    ) {
        if (!input.credential || !input.password) {
            this.logger.warn('[login] Bad request! Missing fields!')
            return res.status(HttpStatus.BAD_REQUEST).json({message: `Bad Request. Missing ${!input.credential? 'username' : 'password'}`})
        }
        else {
            this.logger.debug(`[login] User "${input.credential}" attempting to login`)
            const data = await this.authService.authenticate(input);
            return res.status(HttpStatus.OK).json(data)}
    }

    @UseGuards(AuthGuard)
    @Get('me')
    getUserInfo(@Request() request) {
        this.logger.verbose('[getUserInfo] [GET] Returning request')
        return request.user
    }

    @Post('register')
    async register(
        @Body() input: {username: string; password: string; email: string;},
        @Res() res
    ) {
        if (!input.username || !input.password || !input.email) {
            this.logger.warn('[register] Bad request! Missing fields!')
            return res.status(HttpStatus.BAD_REQUEST).json({message: `Bad Request. Missing fields`})
        } else if (await this.authService.emailExists(input.email)) {
            this.logger.warn('[register] Conflict! Email taken!')
            return res.status(HttpStatus.CONFLICT).json({registrationError: 'email-taken'})
        } else {
            this.logger.debug('[register] this means its working!')
            const data = await this.authService.signUp(input)
            return res.status(HttpStatus.CREATED).json({message: 'New User successfuly created!', ...data})
        }
    }

    @Get('check-username')
    async checkUsername (
        @Query('username') username: string,
        @Res() res
    ) { 
        const result = await this.userService.findUser(username)
        return res.status(HttpStatus.OK).json({usernameExists: `${result ? true : false}`})
    }

    @Post('email-verification')
    async emailVerification (
        @Body() input: { username: string, token: string},
        @Res() res
    ) {
        this.logger.debug('[emailVerification] Email verification request recieved')
        if (!input.token) {
            this.logger.warn('[emailVerification] Bad Request! Missing Token')
            return res.status(HttpStatus.BAD_REQUEST).json({message: 'Bad request. Missing token field'})
        }
        // [TODO]: Validate if token is still valid
        if (await this.emailNotificationService.validateEmailConfirmationToken(input.token))
            return res.status(HttpStatus.OK).json()
        else 
            return res.status(HttpStatus.UNAUTHORIZED).json()
    }
}
