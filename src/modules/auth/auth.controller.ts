import { Body, Controller, Get, HttpCode, HttpStatus, NotImplementedException, Request, Post, UseGuards, Res, Injectable, Logger } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '../../guards/auth.guard';
import { UsersService } from '../users/users.service';

@Controller('auth')
export class AuthController {
    private readonly logger = new Logger(AuthController.name);
    constructor(
        private authService: AuthService,
        private userService: UsersService
    ) {}

    @HttpCode(HttpStatus.OK)
    @Post('login')
    async login(
        @Body() input: { username: string; password: string},
        @Res() res
    ) {
        if (!input.username || !input.password) {
            this.logger.warn('[login] Bad request! Missing fields!')
            return res.status(HttpStatus.BAD_REQUEST).json({message: `Bad Request. Missing ${!input.username ? 'username' : 'password'}`})
        }
        else {
            this.logger.debug(`[login] User "${input.username}" attempting to login`)
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
            return res.status(HttpStatus.CONFLICT).json({message: 'Email taken'})
        } else {
            this.logger.debug('[register] this means its working!')
            await this.userService.registerNewUser(input.username, input.email, input.password) // [TODO]: Proper error handling
            const data = await this.authService.authenticate({username: input.username, password: input.password});
            return res.status(HttpStatus.CREATED).json({message: 'New User successfuly created!', ...data})
        }
    }
}
