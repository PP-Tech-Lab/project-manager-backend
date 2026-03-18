import { Body, Controller, Get, HttpCode, HttpStatus, NotImplementedException, Request, Post, UseGuards, Res, Injectable, Logger } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '../../guards/auth.guard';

@Controller('auth')
export class AuthController {
    private readonly logger = new Logger(AuthController.name);
    constructor(private authService: AuthService) {}

    @HttpCode(HttpStatus.OK)
    @Post('login')
    login(
        @Body() input: { username: string; password: string}, // [TODO]: ```Getting errors using @Res({passthrough: true}) res: Response```
        @Res() res
    ) {
        if (!input.username || !input.password) {
            this.logger.warn('[login] Bad request! Missing fields!')
            return res.status(HttpStatus.BAD_REQUEST).json({message: `Bad Request. Missing ${!input.username ? 'username' : 'password'}`})
        }
        else {
            this.logger.debug(`[login] User "${input.username}" attempting to login`)
            return this.authService.authenticate(input);}
    }

    @UseGuards(AuthGuard)
    @Get('me')
    getUserInfo(@Request() request) {
        this.logger.verbose('[getUserInfo] [GET] Returning request')
        return request.user
    }
}
